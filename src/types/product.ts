export interface IProduct {
  ProductID: string;
  ProductName: string;
  ProductCode: string;
  ProductDescription: string;
  ManageStockLevels: string;
  QtyInStock: string;
  ProductPrice: string;
  subProducts: ISubProduct;
}

export interface ISubProduct {
  SubProduct:
    | {
        id: string;
        ParentID: string;
        Name: string;
        Description: string;
        Price: string;
        Code: string;
        VatRate: string;
        QtyInStock: string;
        WholesalePrice: string;
        StockWarnQty: string;
      }[]
    | {
        id: string;
        ParentID: string;
        Name: string;
        Description: string;
        Price: string;
        Code: string;
        VatRate: string;
        QtyInStock: string;
        WholesalePrice: string;
        StockWarnQty: string;
      };
}
