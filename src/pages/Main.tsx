// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import {
  useDeskproAppEvents,
  useDeskproAppClient,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { Stack } from "@deskpro/deskpro-ui";
import { useEffect, useState } from "react";
import { FieldMapping } from "../components/FieldMapping/FieldMapping";
import { LoadingSpinnerCenter } from "../components/LoadingSpinnerCenter/LoadingSpinnerCenter";
import { useNavigate } from "react-router-dom";
import {
  getCustomerById,
  getCustomersByEmail,
  getInvoicesByCustomerId,
} from "../api/api";
import { useLinkCustomer } from "../hooks/hooks";
import { useQueryWithClient } from "../hooks/useReactQueryWithClient";
import customerJson from "../mapping/customer.json";
import invoiceJson from "../mapping/invoice.json";
import { ICustomer } from "../types/customer";
import { IInvoice } from "../types/invoice";
import { Container } from "../components/Layout";

export const Main = () => {
  const navigate = useNavigate();
  const { client } = useDeskproAppClient();
  const { context } = useDeskproLatestAppContext();
  const [customerId, setCustomerId] = useState<string | null | undefined>(undefined);
  const deskproUser = context?.data.user;

  const { getLinkedCustomer, unlinkCustomer } = useLinkCustomer();

  useInitialisedDeskproAppClient((client) => {
    client.setTitle("Kashflow");

    client.registerElement("homeButton", {
      type: "home_button",
    });

    client.deregisterElement("menuButton");

    client.deregisterElement("link");

    client.deregisterElement("plusButton");

    client.registerElement("menuButton", {
      type: "menu",
      items: [
        {
          title: "Unlink Customer",
          payload: {
            type: "changePage",
            page: "/",
          },
        },
      ],
    });

    client.deregisterElement("editButton");

    client.registerElement("refreshButton", {
      type: "refresh_button",
    });
  }, []);

  useDeskproAppEvents(
    {
      async onElementEvent(id) {
        switch (id) {
          case "menuButton":
            unlinkCustomer().then(() => navigate("/findOrCreate"));

            break;
          case "homeButton":
            navigate("/redirect");
            break;
        }
      },
    },
    [unlinkCustomer]
  );

  useInitialisedDeskproAppClient(() => {
    (async () => {
      if (!context) return;

      const linkedCustomer = await getLinkedCustomer();

      if (!linkedCustomer || linkedCustomer.length === 0) {
        setCustomerId(null);

        return;
      }

      setCustomerId(linkedCustomer[0]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  const customerQuery = useQueryWithClient(
    ["customer", customerId],
    (client) =>
      customerId === null
        ? getCustomersByEmail(client, context?.data.user.primaryEmail)
        : getCustomerById(client, customerId as string),
    {
      enabled: customerId !== undefined && !!context?.data.user.primaryEmail,
      onError: () => unlinkCustomer().then(() => navigate("/findOrCreate")),
      onSettled: (customers) => {
        const customerId = customers?.[0].CustomerID;

        if (client && deskproUser?.id) {
          client
            ?.getEntityAssociation("kashflowCustomers", deskproUser.id)
            .set(customerId);
        }
      },
    }
  );

  const invoicesByCustomerIdQuery = useQueryWithClient(
    ["invoicesByCustomerId", customerQuery.isSuccess],
    (client) =>
      getInvoicesByCustomerId(
        client,
        customerQuery.data?.[0].CustomerID as number
      ),
    {
      enabled: !!customerQuery.data?.[0].CustomerID,
    }
  );

  if (!customerQuery.data && (customerQuery.isSuccess || customerQuery.isError))
    navigate("/findOrCreate");

  useEffect(() => {
    if (customerQuery.isError) {
      navigate("/findOrCreate");
    }
  }, [customerQuery, navigate]);

  const invoices = invoicesByCustomerIdQuery.data;

  if (customerQuery.isFetching || invoicesByCustomerIdQuery.isFetching) {
    return <LoadingSpinnerCenter />;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customer = customerQuery.data;

  if (!customerQuery.isSuccess || !invoicesByCustomerIdQuery.isSuccess)
    return <div></div>;

  return (
    <Container>
      <Stack style={{ width: "100%" }} vertical gap={10}>
        <FieldMapping
          fields={customer ?? []}
          metadata={customerJson.single}
          idKey={customerJson.idKey}
          internalChildUrl={customerJson.internalChildUrl}
          externalChildUrl={customerJson.externalUrl}
          childTitleAccessor={(e: ICustomer) => e.Name[0]}
        />
        <FieldMapping
          fields={invoices ?? []}
          metadata={invoiceJson.list}
          idKey={invoiceJson.idKey}
          title={`Invoices (${invoices.length})`}
          externalUrl={invoiceJson.externalUrl}
          internalChildUrl={invoiceJson.internalChildUrl}
          externalChildUrl={invoiceJson.externalChildUrl}
          childTitleAccessor={(e: IInvoice) => e.InvoiceNumber.toString()}
          createPage="/create/Invoice"
        />
      </Stack>
    </Container>
  );
};
