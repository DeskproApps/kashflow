/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICustomer } from "../types/customer";
import { IInvoice } from "../types/invoice";
import { IProduct } from "../types/product";
import {
  IError,
  IQueryResponseMultipleObjects,
  IQueryResponseSingleObject,
} from "./types";

export const getProductsWithSubProducts = async (soapClient: any) => {
  const result = await getResult<
    IQueryResponseMultipleObjects<
      IProduct,
      "ProductsFull",
      "GetProductsWithSubProductsResult"
    >
  >(soapClient.GetProductsWithSubProducts);

  return result.GetProductsWithSubProductsResult[0].ProductsFull;
};

export const getProductsById = (soapClient: any) =>
  getResult<
    IQueryResponseMultipleObjects<ICustomer, "Invoice", "GetSubProductByID">
  >(soapClient.GetSubProductByID);

export const getProducts = (soapClient: any) =>
  getResult<
    IQueryResponseMultipleObjects<ICustomer, "Invoice", "GetSubProductByID">
  >(soapClient.GetSubProducts);

export const editInvoice = (soapClient: any, Invoice: any) =>
  getResult<IQueryResponseSingleObject<ICustomer, "GetInvoice">>(
    soapClient.UpdateInvoice,
    {
      Inv: Invoice,
    }
  );

export const createInvoice = async (soapClient: any, Invoice: any) => {
  const result = await getResult<{ InsertInvoiceResult: number } & IError>(
    soapClient.InsertInvoice,
    {
      Inv: Invoice,
    }
  );

  return result.InsertInvoiceResult;
};

export const getInvoices = async (soapClient: any) => {
  const result = await getResult<
    IQueryResponseMultipleObjects<
      IInvoice,
      "Invoice",
      "GetInvoices_RecentResult"
    >
  >(soapClient.GetInvoices_Recent, {
    NumberOfInvoices: 10,
  });

  return result.GetInvoices_RecentResult[0].Invoice;
};

export const getInvoiceByInvoiceNumber = async (
  soapClient: any,
  InvoiceNumber: number | string
) => {
  const result = await getResult<
    IQueryResponseSingleObject<IInvoice, "GetInvoiceResult">
  >(soapClient.GetInvoice, {
    InvoiceNumber,
  });

  return result.GetInvoiceResult;
};

export const getInvoicesByCustomerId = async (
  soapClient: any,
  CustomerID: number
) => {
  const result = await getResult<
    IQueryResponseMultipleObjects<
      ICustomer,
      "Invoice",
      "GetInvoicesForCustomerResult"
    >
  >(soapClient.GetInvoicesForCustomer, {
    CustID: CustomerID,
  });

  return result.GetInvoicesForCustomerResult[0].Invoice ?? [];
};

export const editCustomer = (soapClient: any, Customer: ICustomer) => {
  return getResult<
    IQueryResponseSingleObject<ICustomer, "GetCustomerByEmailResult">
  >(soapClient.UpdateCustomer, {
    custr: Customer,
  });
};

export const createCustomer = async (soapClient: any, Customer: ICustomer) => {
  Object.keys(Customer).forEach((key) => {
    if (Customer[key as keyof typeof Customer] === undefined) {
      delete Customer[key as keyof typeof Customer];
    }
  });

  const result = await getResult<{ InsertCustomerResult: number } & IError>(
    soapClient.InsertCustomer,
    {
      custr: Customer,
    }
  );
  return result.InsertCustomerResult;
};

export const getCustomerById = async (soapClient: any, CustomerID: string) => {
  const result = await getResult<
    IQueryResponseSingleObject<ICustomer, "GetCustomerByIDResult">
  >(soapClient.GetCustomerByID, {
    CustomerID,
  });

  return result.GetCustomerByIDResult;
};

export const getCustomersByEmail = async (
  soapClient: any,
  CustomerEmail: string
) => {
  const result = await getResult<
    IQueryResponseSingleObject<ICustomer, "GetCustomerByEmailResult"> & {
      Status?: string[];
    }
  >(soapClient.GetCustomerByEmail, {
    CustomerEmail,
  });

  if (result.Status?.[0] === "NO") return null;

  return result.GetCustomerByEmailResult;
};

export const getCustomers = (soapClient: any) =>
  getResult<
    IQueryResponseMultipleObjects<ICustomer, "Customer", "GetCustomersResult">
  >(soapClient.GetCustomers);

const getResult = async <T extends IError>(
  callback: any,
  options = {}
): Promise<T> => {
  return new Promise((resolve, reject) => {
    callback(
      { UserName: "__username__", Password: "__password__", ...options },
      (err: Error, result: T) => {
        if (err) reject(err);

        if (
          result.Status?.[0] === "NO" &&
          !result.StatusDetail?.[0].includes(
            "There is no customer with that email address"
          )
        )
          reject({ message: result.StatusDetail?.[0] });

        resolve(result);
      }
    );
  });
};
