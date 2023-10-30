import { lightTheme, ThemeProvider } from "@deskpro/deskpro-ui";
import { cleanup, render, waitFor } from "@testing-library/react/";
import React from "react";
import { ViewObject } from "../../../src/pages/View/Object";

const renderPage = () => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <ViewObject />
    </ThemeProvider>
  );
};

jest.mock("../../../src/api/api", () => {
  return {
    getInvoiceByInvoiceNumber: () => [
      {
        NetAmount: 123,
        DueDate: "2021-01-01",
        VATAmount: 123,
        AmountPaid: 101,
        CurrencyCode: "USD",
        CustomerName: ["David"],
        DeliveryAddress: [
          {
            Line1: ["123 Fake Street"],
            Line2: ["Highway Patrol"],
            Line3: ["California"],
            Line4: ["XBY123"],
            CountryName: ["United States"],
          },
        ],
        Lines: [
          {
            anyType: [
              {
                Description: ["Item 1"],
                LineID: "1",
                Quantity: 1,
                Rate: 123,
                ChargeType: "112",
                ProductID: "113",
              },
            ],
          },
        ],
      },
    ],
    getProductsWithSubProducts: () => [
      {
        ProductID: "112",
        subProducts: { SubProduct: [{ id: "113", Name: "Epic Product" }] },
      },
    ],
  };
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useParams: () => ({
    objectName: "Invoice",
    objectId: "123",
    objectView: "single",
  }),
}));

describe("View", () => {
  test("View page should show a contact correctly", async () => {
    const { getByText } = renderPage();

    const amountPaid = await waitFor(() => getByText(/101/i));

    const customerName = await waitFor(() => getByText(/David/i));

    const product = await waitFor(() => getByText(/Epic Product/i));

    await waitFor(() => {
      [amountPaid, customerName, product].forEach((el) => {
        expect(el).toBeInTheDocument();
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();

    cleanup();
  });
});
