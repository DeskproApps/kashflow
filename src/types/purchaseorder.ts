export interface IPurchaseOrder {
  DocNumber: string;
  SyncToken: string;
  POEmail: POEmail;
  APAccountRef: Ref;
  CurrencyRef: Ref;
  TxnDate: string;
  TotalAmt: number;
  ShipAddr: Addr;
  domain: string;
  Id: string;
  POStatus: string;
  sparse: boolean;
  EmailStatus: string;
  VendorRef: Ref;
  Line: Line[];
  CustomField: CustomField[];
  VendorAddr: Addr;
  MetaData: MetaData;
}

export interface Ref {
  name: string;
  value: string;
}

export interface CustomField {
  DefinitionId: string;
  Type: string;
  Name: string;
}

export interface Line {
  DetailType: string;
  Amount: number;
  Id: string;
  ItemBasedExpenseLineDetail: ItemBasedExpenseLineDetail;
}

export interface ItemBasedExpenseLineDetail {
  ItemRef: Ref;
  CustomerRef: Ref;
  Qty: number;
  TaxCodeRef: TaxCodeRef;
  BillableStatus: string;
  UnitPrice: number;
}

export interface TaxCodeRef {
  value: string;
}

export interface MetaData {
  CreateTime: string;
  LastUpdatedTime: string;
}

export interface POEmail {
  Address: string;
}

export interface Addr {
  Line4: string;
  Line3: string;
  Id: string;
  Line1: string;
  Line2: string;
}
