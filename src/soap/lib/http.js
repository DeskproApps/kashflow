/*
 * Copyright (c) 2011 Vinay Pulim <vinay@milewise.com>
 * MIT Licensed
 */

import url from "./url";

var VERSION = "0.2.0";

const request = function (fetch, rurl, data, callback, exheaders, exoptions) {

  if (typeof window !== 'undefined') {

    headers = {
      "User-Agent": "node-soap/" + VERSION,
        "Accept": "text/html,application/xhtml+xml,application/xml",
        "Accept-Encoding": "none",
        "Accept-Charset": "utf-8",
        "Content-Type" : "application/x-www-form-urlencoded",
        "Connection": "close",
        "Host": host
    };
    exheaders = exheaders || {};

    for (var attr in exheaders) {
      headers[attr] = exheaders[attr];
    }

    const fetchOpts = {
      headers,
      method: data ? "POST" : "GET",
      body: (typeof data === "string" || typeof data === "number") ? data : JSON.stringify(data),
    };

    fetch(rurl, fetchOpts)
      .then((res) => {
        res.text().then((resData) => {
          const resp = { statusCode : 200 };
          callback(null, resp, resData);
        });
      })
      .catch((err) => {
        const resp = {statusCode : 500}
        callback(err, resp, err);
      });

    // $.ajax(rurl, {
    //   headers : headers,
    //   type : data ? "POST" : "GET",
    //   data : data,
    //   dataType: 'text',
    //   success : function(data, status, xhr) {
    //     resp = {statusCode : 200}
    //     callback(null, resp, data);
    //   },
    //   error : function(xhr, status, err) {
    //     resp = {statusCode : xhr.status}
    //     callback(err, resp, xhr.responseText);
    //   }
    // })

  } else {  // nodejs

    var curl = url.parse(rurl);
    var secure = curl.protocol == 'https:';
    var host = curl.hostname;
    var port = parseInt(curl.port || (secure ? 443 : 80));
    var path = [curl.pathname || '/', curl.search || '', curl.hash || ''].join('');
    var method = data ? "POST" : "GET";
    var headers = {
      "User-Agent": "node-soap/" + VERSION,
      "Accept": "text/html,application/xhtml+xml,application/xml",
      "Accept-Encoding": "none",
      "Accept-Charset": "utf-8",
      "Connection": "close",
      "Host": host
    };

    if (typeof data == 'string') {
      headers["Content-Length"] = Buffer.byteLength(data, 'utf8');
      ;
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    exheaders = exheaders || {};
    for (var attr in exheaders) {
      headers[attr] = exheaders[attr];
    }

    var options = curl;
    options.method = method;
    options.headers = headers;

    exoptions = exoptions || {};
    for (var attr in exoptions) {
      options[attr] = exoptions[attr];
    }

    var p;
    if (secure)  p = require('https')
    else p = require("http")
    if(data)
       options.body = data;
    var request = p.request(options, function (res, body) {
      var body = "";
      res.on('data', function (chunk) {
        body += chunk;
      })
      res.on("end", function () {
        callback(null, res, body);
      })
    });
    request.on('error', callback);
    request.end(data);
  }
}

export default {
  request,
};
