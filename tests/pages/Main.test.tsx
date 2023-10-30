import { lightTheme, ThemeProvider } from "@deskpro/deskpro-ui";
import { cleanup, render, waitFor } from "@testing-library/react/";
import React from "react";
import { Main } from "../../src/pages/Main";

const renderPage = () => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <Main />
    </ThemeProvider>
  );
};

jest.mock("../../src/api/api", () => {
  return {
    getCustomerById: () => [
      {
        Code: ["123"],
        Email: ["david@gmail.com"],
        Telephone: ["123456789"],
        Address1: ["123 Fake Street"],
        Address2: ["Highway Patrol"],
        Address3: ["California"],
        Address4: ["XBY123"],
        CountryName: ["United States"],
        CustomerID: "1",
        Name: ["David"],
      },
    ],
    getInvoicesByCustomerId: () => [
      {
        NetAmount: 1235,
        DueDate: "2021-01-01",
        InvoiceNumber: 123,
        CurrencyCode: ["USD"],
      },
    ],
  };
});

describe("Main", () => {
  test("Main page should show all data correctly", async () => {
    const { getByText } = renderPage();

    const email = await waitFor(() => getByText(/david@gmail.com/i));

    const countryName = await waitFor(() => getByText(/United States/i));

    const netAmount = await waitFor(() => getByText(/1235/i));

    await waitFor(() => {
      [email, countryName, netAmount].forEach((el) => {
        expect(el).toBeInTheDocument();
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();

    cleanup();
  });
});
