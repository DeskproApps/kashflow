import { adminGenericProxyFetch, IDeskproClient } from "@deskpro/app-sdk";
import { createClientAsync } from "../soap";
import { ISettings } from "../types/settings";
import { ICompany } from "../types/company";
import { IError } from "./types";

export const getCurrentCompany = async (client: IDeskproClient, settings: ISettings): Promise<ICompany> => {
  const fetch = await adminGenericProxyFetch(client);
  const soap = await createClientAsync(fetch, "https://securedwebapp.com/api/service.asmx?WSDL");

  return new Promise((resolve, reject) => {
    soap.GetCompanyDetails(
      { UserName: settings.username, Password: settings.password },
      (err: Error, result: { GetCompanyDetailsResult: ICompany[] } & IError) => {
        if (err) {
          reject(err);
        }

        if (result.Status?.[0] === "NO") {
          reject(result.StatusDetail?.[0]);
        }

        resolve(result.GetCompanyDetailsResult?.[0]);
      },
    );
  });
};
