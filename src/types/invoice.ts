export interface IInvoice {
  InvoiceDBID: number;
  InvoiceNumber: number;
  InvoiceDate: string;
  DueDate: string;
  Customer: string[];
  CustomerID: number;
  Paid: number;
  CustomerReference: string[];
  SuppressTotal: number;
  ProjectID: number;
  CurrencyCode: string[];
  ExchangeRate: string;
  ReadableString: string[];
  Lines: Line[];
  NetAmount: string;
  VATAmount: string;
  AmountPaid: string;
  CustomerName: string[];
  PermaLink: string[];
  DeliveryAddress: DeliveryAddress[];
  UseCustomDeliveryAddress: string;
  CISRCNetAmount: string;
  CISRCVatAmount: string;
  IsCISReverseCharge: string;
}

export interface DeliveryAddress {
  Name: string[];
  Line1: string[];
  Line2: string[];
  Line3: string[];
  Line4: string[];
  PostCode: string[];
  CountryName: string[];
  CountryCode: string[];
}

export interface Line {
  anyType: {
    ChargeType?: string;
    Description?: string;
    LineID?: string;
    ProductID?: string;
    ProjID?: string;
    Quantity?: string;
    Rate?: string;
    Sort?: string;
    VatAmount?: string;
    VatRate?: string;
    ProductName?: string;
  }[];
}
