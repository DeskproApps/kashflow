export interface IBill {
  SyncToken: string;
  domain: string;
  APAccountRef: APAccountRefClass;
  VendorRef: APAccountRefClass;
  TxnDate: string;
  TotalAmt: number;
  CurrencyRef: APAccountRefClass;
  LinkedTxn: { [key: string]: string }[];
  SalesTermRef: SalesTermRefClass;
  DueDate: string;
  sparse: boolean;
  Line: Line[];
  Balance: number;
  Id: string;
  MetaData: MetaData;
}

export interface APAccountRefClass {
  name: string;
  value: string;
}

export interface Line {
  DetailType: string;
  Amount: number;
  Id: string;
  AccountBasedExpenseLineDetail: AccountBasedExpenseLineDetail;
  Description: string;
}

export interface AccountBasedExpenseLineDetail {
  TaxCodeRef: SalesTermRefClass;
  AccountRef: APAccountRefClass;
  BillableStatus: string;
  CustomerRef: APAccountRefClass;
}

export interface SalesTermRefClass {
  value: string;
}

export interface MetaData {
  CreateTime: string;
  LastUpdatedTime: string;
}
