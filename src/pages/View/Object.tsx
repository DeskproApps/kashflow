import {
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCustomerById,
  getInvoiceByInvoiceNumber,
  getInvoices,
  getInvoicesByCustomerId,
  getProductsWithSubProducts,
} from "../../api/api";
import { FieldMapping } from "../../components/FieldMapping/FieldMapping";
import { LoadingSpinnerCenter } from "../../components/LoadingSpinnerCenter/LoadingSpinnerCenter";
import { useQueryWithClient } from "../../hooks/useReactQueryWithClient";
import customerJson from "../../mapping/customer.json";
import invoiceJson from "../../mapping/invoice.json";
import { H2 } from "@deskpro/deskpro-ui";
import { makeFirstLetterUppercase } from "../../utils/utils";
import { IInvoice } from "../../types/invoice";
import { ICustomer } from "../../types/customer";
import { Container } from "../../components/Layout";

type AcceptedFunctions =
  | typeof getCustomerById
  | typeof getInvoiceByInvoiceNumber
  | typeof getInvoicesByCustomerId
  | typeof getInvoices;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTitle = (e: any, objectName: string) => {
  switch (objectName) {
    case "Invoice": {
      return e.InvoiceNumber;
    }
    case "Customer": {
      return e.FullyQualifiedName;
    }
  }
};

export const ViewObject = () => {
  const navigate = useNavigate();
  const { objectName, objectId, objectView } = useParams();

  const correctJson = useMemo(() => {
    switch (objectName) {
      case "Customer":
        return customerJson;
      case "Invoice":
        return invoiceJson;
    }
  }, [objectName]);

  const objectQuery = useQueryWithClient<
    Awaited<ReturnType<AcceptedFunctions>>
  >(
    [objectName, objectId, objectView],
    (client) => {
      switch (objectName as "Customer" | "Invoice") {
        case "Customer": {
          return getCustomerById(client, objectId as never);
        }
        case "Invoice": {
          if (objectView === "single") {
            return getInvoiceByInvoiceNumber(client, objectId as never);
          } else {
            return getInvoicesByCustomerId(client, objectId as never);
          }
        }
      }
    },
    {
      enabled: !!objectName && !!objectId,
    }
  );

  const productsWithSubProducts = useQueryWithClient(
    ["productsWithSubProducts"],
    (client) => getProductsWithSubProducts(client),
    {
      enabled: objectName === "Invoice" && objectView === "single",
    }
  );

  useInitialisedDeskproAppClient(
    (client) => {
      if (!objectQuery.isSuccess || !objectName) return;

      if (objectView === "list") {
        client.setTitle(
          `${correctJson?.title}s ${makeFirstLetterUppercase(objectView)}`
        );

        if (objectName === "Invoice") {
          client.registerElement("plusButton", {
            type: "plus_button",
          });
        }
        client.deregisterElement("menuButton");

        return;
      }

      client.deregisterElement("plusButton");

      client.registerElement("editButton", {
        type: "edit_button",
      });

      client.deregisterElement("menuButton");

      if (objectName === "Customer") {
        client.setTitle((objectQuery.data as ICustomer[])[0].Name[0]);

        return;
      }

      client.setTitle(
        (objectQuery.data as IInvoice[])[0].InvoiceNumber?.toString()
      );
    },
    [objectQuery.isSuccess, objectView, objectName]
  );

  useDeskproAppEvents({
    async onElementEvent(id) {
      switch (id) {
        case "homeButton":
          navigate("/redirect");

          break;

        case "editButton":
          navigate(`/edit/${objectName}/${objectId}`);

          break;

        case "plusButton":
          navigate(`/create/${objectName}`);

          break;
      }
    },
  });

  const object = useMemo(() => {
    if (objectView !== "single" || objectName !== "Invoice")
      return objectQuery.data;

    if (!objectQuery.data || !productsWithSubProducts.data)
      return objectQuery.data;

    const invoice = objectQuery.data as IInvoice[];

    for (const line of invoice[0].Lines[0].anyType) {
      const product = productsWithSubProducts.data?.find(
        (e) => e.ProductID === line.ChargeType
      )?.subProducts.SubProduct;

      if (!product) continue;

      const subProduct = Array.isArray(product)
        ? product.find((e) => e.id === line.ProductID)
        : product?.id === line.ProductID
        ? product
        : undefined;

      line.ProductName = subProduct?.Name;
    }

    return invoice;
  }, [objectName, objectQuery.data, objectView, productsWithSubProducts.data]);

  if (!objectView || (objectView !== "list" && objectView !== "single")) {
    return (
      <Container>
        <H2>Please use a accepted Object View</H2>
      </Container>
    );
  }

  if (
    objectName !== "Customer" &&
    objectName !== "Invoice" &&
    objectName !== "Bill" &&
    objectName !== "PurchaseOrder"
  ) {
    return (
      <Container>
        <H2>Please use an accepted Object</H2>
      </Container>
    );
  }

  if (!object || !correctJson) {
    return (
      <Container>
        <LoadingSpinnerCenter />
      </Container>
    );
  }

  return (
    <Container>
      <FieldMapping
        fields={object}
        metadata={correctJson[objectView]}
        childTitleAccessor={
          objectView === "list" ? (e) => getTitle(e, objectName) : undefined
        }
        idKey={correctJson.idKey}
        externalChildUrl={
          objectView === "single" ? undefined : correctJson.externalChildUrl
        }
        internalChildUrl={
          objectView === "single" ? undefined : correctJson.internalChildUrl
        }
      />
    </Container>
  );
};
