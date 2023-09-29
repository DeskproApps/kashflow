import { useState } from "react";
import { H1, Stack } from "@deskpro/deskpro-ui";
import {
  Context,
  Property,
  proxyFetch,
  LoadingSpinner,
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { createClient } from "../soap";

/*
    Note: the following page component contains example code, please remove the contents of this component before you
    develop your app. For more information, please refer to our apps
    guides @see https://support.deskpro.com/en-US/guides/developers/anatomy-of-an-app
*/
export const Main = () => {
  const [ticketContext, setTicketContext] = useState<Context | null>(null);
  const [result, setResult] = useState<null | string>(null);

  // Add a "refresh" button @see https://support.deskpro.com/en-US/guides/developers/app-elements
  useInitialisedDeskproAppClient((client) => {
    client.registerElement("myRefreshButton", { type: "refresh_button" });
  });

  // Listen for the "change" event and store the context data
  // as local state @see https://support.deskpro.com/en-US/guides/developers/app-events
  useDeskproAppEvents({
    onChange: setTicketContext,
  });

  useInitialisedDeskproAppClient((client) => {
    (async () => {
      // Create our proxy fetch client
      const fetch = await proxyFetch(client);

      // pass the proxy fetch into the newly created SOAP client
      createClient(fetch, 'https://securedwebapp.com/api/service.asmx?WSDL', (err, soapClient) => {

        // make a SOAP RPC call, @see https://securedwebapp.com/api/service.asmx
        // note that UserName and Password are always sent as arguments for each RPC, so append any extra RPC arguments after these
        soapClient.GetCustomers({ UserName: "__username__", Password: "__password__" }, (err, result) => {

          // do something  with the error or result
          console.log(err, result);

          // let's send this to the UI too
          setResult(result);

        });

      })

    })();
  }, [createClient, proxyFetch, setResult]);

  // If we don't have a ticket context yet, show a loading spinner
  if (ticketContext === null || result === null) {
    return <LoadingSpinner />;
  }

  // Show some information about a given
  // ticket @see https://support.deskpro.com/en-US/guides/developers/targets and third party API
  return (
    <>
      <H1>Kashflow Customer</H1>
      <pre>
        {JSON.stringify(result, null, 3)}
      </pre>
    </>
  );
};
