import { adminGenericProxyFetch, IDeskproClient } from "@deskpro/app-sdk";
import { ISettings } from "../types/settings";

export const getAccessAndRefreshTokens = async (
  settings: ISettings,
  accessCode: string,
  callbackUrl: string,
  client: IDeskproClient
) => {
  const fetch = await adminGenericProxyFetch(client);

  return await fetch(
    `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        authorization: `Basic ${btoa(
          `${settings?.client_id}:${settings?.client_secret}`
        )}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: accessCode as string,
        redirect_uri: new URL(callbackUrl as string).toString(),
      }),
    }
  ).then((res) => res.json());
};
