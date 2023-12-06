export type RequestMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface IError {
  Status?: string[];
  StatusDetail?: string[];
}

export type ResponseItemKey =
  | "Invoice"
  | "Payments"
  | "Customer"
  | "ProductsFull";
export type ResponseQueryKey =
  | "GetCustomersResult"
  | "GetCustomerByEmailResult"
  | "GetInvoices_RecentResult"
  | "GetInvoice"
  | "GetSubProductByID"
  | "GetInvoiceResult"
  | "GetInvoicesForCustomerResult"
  | "GetProductsWithSubProductsResult"
  | "GetCustomerByIDResult";

export type IQueryResponseMultipleObjects<
  T,
  K extends ResponseItemKey,
  V extends ResponseQueryKey
> = {
  [key in V]: {
    [key in K]: T[];
  }[];
} & IError;

export type IQueryResponseSingleObject<T, K extends ResponseQueryKey> = {
  [key in K]: T[];
} & IError;
