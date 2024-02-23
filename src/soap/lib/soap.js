/*
 * Copyright (c) 2011 Vinay Pulim <vinay@milewise.com>
 * MIT Licensed
 */

import { Client } from "./client";
import { open_wsdl } from "./wsdl";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { WSDL } from "./wsdl";

var _wsdlCache = {};

function _requestWSDL(fetch, url, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  var wsdl = _wsdlCache[url];
  if (wsdl) {
    callback(null, wsdl);
  } else {
    open_wsdl(fetch, url, options, function (err, wsdl) {
      if (err) return callback(err);
      else _wsdlCache[url] = wsdl;
      callback(null, wsdl);
    });
  }
}

function createClient(fetch, url, options, callback, endpoint) {
  if (typeof options === "function") {
    endpoint = callback;
    callback = options;
    options = {};
  }
  endpoint = options.endpoint || endpoint;
  _requestWSDL(fetch, url, options, function (err, wsdl) {
    callback(err, wsdl && new Client(wsdl, endpoint, fetch));
  });
}

function createClientAsync(fetch, url) {
  return new Promise((resolve, reject) => {
    createClient(fetch, url, (err, client) => {
      if (err) reject(err);
      else resolve(client);
    });
  });
}

function BasicAuthSecurity(username, password) {
  this._username = username;
  this._password = password;
}

BasicAuthSecurity.prototype.addHeaders = function (headers) {
  headers["Authorization"] =
    "Basic " +
    new Buffer(this._username + ":" + this._password || "").toString("base64");
};

BasicAuthSecurity.prototype.toXML = function () {
  return "";
};

function WSSecurity(username, password, passwordType) {
  this._username = username;
  this._password = password;
  this._passwordType = passwordType || "PasswordText";
}

var passwordDigest = function (nonce, created, password) {
  // digest = bcrypt ( nonce + created + password )
  var rawNonce = new Buffer(nonce || "", "base64").toString("binary");
  var passwordDigest = bcrypt.hashSync(rawNonce + created + password)
  return passwordDigest;
};

WSSecurity.prototype.toXML = function () {
  // avoid dependency on date formatting libraries

  var now = new Date();
  var created = now.toISOString();
  var expires = new Date(now.getTime() + 1000 * 600).toISOString();

  // nonce = base64 ( sha1 ( created + random ) )
  var nHash = crypto.createHash("sha1");
  nHash.update(created + Math.random());
  var nonce = nHash.digest("base64");

  return (
    '<wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
    '<wsu:Timestamp wsu:Id="Timestamp-' +
    created +
    '">' +
    "<wsu:Created>" +
    created +
    "</wsu:Created>" +
    "<wsu:Expires>" +
    expires +
    "</wsu:Expires>" +
    "</wsu:Timestamp>" +
    '<wsse:UsernameToken xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="SecurityToken-' +
    created +
    '">' +
    "<wsse:Username>" +
    this._username +
    "</wsse:Username>" +
    (this._passwordType === "PasswordText"
      ? "<wsse:Password>" + this._password + "</wsse:Password>"
      : '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">' +
        passwordDigest(nonce, created, this._password) +
        "</wsse:Password>") +
    '<wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">' +
    nonce +
    "</wsse:Nonce>" +
    "<wsu:Created>" +
    created +
    "</wsu:Created>" +
    "</wsse:UsernameToken>" +
    "</wsse:Security>"
  );
};

export {
  BasicAuthSecurity,
  WSSecurity,
  createClient,
  createClientAsync,
  passwordDigest,
  WSDL,
  Client,
};
