export interface IItem {
  Name: string;
  Active: boolean;
  FullyQualifiedName: string;
  Taxable: boolean;
  SalesTaxIncluded: boolean;
  UnitPrice: number;
  Type: string;
  IncomeAccountRef: IncomeAccountRef;
  PurchaseTaxIncluded: boolean;
  PurchaseCost: number;
  TrackQtyOnHand: boolean;
  domain: string;
  sparse: boolean;
  Id: string;
  SyncToken: string;
  MetaData: MetaData;
}

export interface IncomeAccountRef {
  value: string;
  name: string;
}

export interface MetaData {
  CreateTime: string;
  LastUpdatedTime: string;
}
