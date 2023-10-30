import {
  useDeskproAppClient,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useLinkCustomer = () => {
  const { context } = useDeskproLatestAppContext();
  const { client } = useDeskproAppClient();
  const [isLinking, setIsLinking] = useState(false);
  const navigate = useNavigate();

  const deskproUser = context?.data.user;

  const linkCustomer = useCallback(
    async (customerId: string) => {
      if (!context || !customerId || !client) return;

      setIsLinking(true);

      const deskproUser = context?.data.user;

      const getEntityAssociationData = (await client
        ?.getEntityAssociation("kashflowCustomers", deskproUser.id)
        .list()) as string[];

      if (getEntityAssociationData.length > 0) {
        await client
          ?.getEntityAssociation("kashflowCustomers", deskproUser.id)
          .delete(getEntityAssociationData[0]);
      }

      await client
        ?.getEntityAssociation("kashflowCustomers", deskproUser.id)
        .set(customerId);

      navigate("/");

      setIsLinking(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [context, client]
  );

  const unlinkCustomer = useCallback(async () => {
    if (!context || !client) return;

    (async () => {
      const id = (
        await client
          .getEntityAssociation("kashflowCustomers", deskproUser.id)
          .list()
      )[0];

      if (!id) return;

      await client
        .getEntityAssociation("kashflowCustomers", deskproUser.id)
        .delete(id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, context]);

  const getLinkedCustomer = useCallback(async () => {
    if (!client || !deskproUser) return;

    return await client
      .getEntityAssociation("kashflowCustomers", deskproUser?.id)
      .list();
  }, [client, deskproUser]);

  return {
    getLinkedCustomer,
    linkCustomer,
    isLinking,
    unlinkCustomer,
    context,
    client,
  };
};
