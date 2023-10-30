import { lightTheme, ThemeProvider } from "@deskpro/deskpro-ui";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react/";
import * as Api from "../../../src/api/api";
import React from "react";
import { CreateObject } from "../../../src/pages/Create/Object";

const renderPage = () => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <CreateObject />
    </ThemeProvider>
  );
};

jest.mock("../../../src/api/api", () => {
  return {
    createCustomer: jest.fn(),
  };
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useParams: () => ({
    objectName: "Customer",
  }),
}));

describe("Create Customer", () => {
  test("Creating a customer should work correctly", async () => {
    const { getByTestId } = renderPage();

    fireEvent.change(getByTestId("input-Name"), {
      target: { value: "A name" },
    });

    fireEvent.click(getByTestId("button-submit"));

    await waitFor(() => {
      expect(Api.createCustomer).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();

    cleanup();
  });
});
