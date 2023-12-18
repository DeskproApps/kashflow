import {
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
  Search,
} from "@deskpro/app-sdk";
import { Button, Checkbox, Stack } from "@deskpro/deskpro-ui";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hooks/debounce";
import { useLinkCustomer } from "../../hooks/hooks";
import CustomerJson from "../../mapping/customer.json";
import { Title } from "../../styles";
import { FieldMapping } from "../FieldMapping/FieldMapping";
import { HorizontalDivider } from "../HorizontalDivider/HorizontalDivider";
import { LoadingSpinnerCenter } from "../LoadingSpinnerCenter/LoadingSpinnerCenter";
import { getCustomersByEmail } from "../../api/api";
import { useQueryWithClient } from "../../hooks/useReactQueryWithClient";

export const LinkCustomer = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const { linkCustomer } = useLinkCustomer();
  const navigate = useNavigate();

  const { debouncedValue: debouncedText } = useDebounce(prompt, 300);

  useInitialisedDeskproAppClient((client) => {
    client.setTitle("Link Customer");

    client.registerElement("homeButton", {
      type: "home_button",
    });

    client.deregisterElement("plusButton");

    client.deregisterElement("menuButton");
  }, []);

  useDeskproAppEvents({
    async onElementEvent(id) {
      switch (id) {
        case "homeButton":
          navigate("/redirect");
      }
    },
  });

  const customersQuery = useQueryWithClient(
    ["getCustomersByEmail", debouncedText],
    (client) => getCustomersByEmail(client, debouncedText),
    {
      enabled: debouncedText.length > 2,
    }
  );

  const customers = customersQuery.data;

  return (
    <Stack gap={10} style={{ width: "100%" }} vertical>
      <Stack vertical gap={6} style={{ width: "100%" }}>
        <Search
          label="Enter Email Address"
          onChange={(e) => setPrompt(e)}
          marginBottom={0}
        />
        <Stack vertical style={{ width: "100%" }} gap={5}>
          <Stack
            style={{ width: "100%", justifyContent: "space-between" }}
            gap={5}
          >
            <Button
              onClick={() =>
                linkCustomer((selectedCustomer as number)?.toString())
              }
              disabled={selectedCustomer == null}
              text="Link Customer"
            ></Button>
            <Button
              disabled={selectedCustomer == null}
              text="Cancel"
              intent="secondary"
              onClick={() => setSelectedCustomer(null)}
            ></Button>
          </Stack>
          <HorizontalDivider full />
        </Stack>
        {customersQuery.isFetching ? (
          <LoadingSpinnerCenter />
        ) : customersQuery.isSuccess &&
          Array.isArray(customers) &&
          customers?.length !== 0 ? (
          <Stack vertical gap={5} style={{ width: "100%" }}>
            {customers?.map((customer, i) => {
              return (
                <Stack key={i} gap={6} style={{ width: "100%" }}>
                  <Stack style={{ marginTop: "2px" }}>
                    <Checkbox
                      checked={selectedCustomer === customer.CustomerID}
                      onChange={() => {
                        if (selectedCustomer == null) {
                          setSelectedCustomer(customer.CustomerID);
                        } else {
                          setSelectedCustomer(null);
                        }
                      }}
                    ></Checkbox>
                  </Stack>
                  <Stack style={{ width: "92%" }}>
                    <FieldMapping
                      fields={[customer]}
                      hasCheckbox={true}
                      metadata={CustomerJson.list}
                      idKey={CustomerJson.idKey}
                      externalChildUrl={CustomerJson.externalUrl}
                      childTitleAccessor={(e) => e.Name[0]}
                    />
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        ) : (
          customersQuery.isSuccess && <Title>No Customers Found.</Title>
        )}
      </Stack>
    </Stack>
  );
};
