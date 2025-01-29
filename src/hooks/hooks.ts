import {
  useDeskproAppClient,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { query } from "../utils/query";

export const useLinkCustomer = () => {
  const { context } = useDeskproLatestAppContext<{ user: { id: number } }, never>();
  const { client } = useDeskproAppClient();
  const [isLinking, setIsLinking] = useState(false);
  const navigate = useNavigate();

  const deskproUser = context?.data?.user;

  const linkCustomer = useCallback(
    async (customerId: string) => {
      const deskproUser = context?.data?.user;
      if (!context || !customerId || !client || !deskproUser) return;

      setIsLinking(true);


      const getEntityAssociationData = (await client
        ?.getEntityAssociation("kashflowCustomers", String(deskproUser.id))
        .list()) as string[];

      if (getEntityAssociationData.length > 0) {
        await client
          ?.getEntityAssociation("kashflowCustomers", String(deskproUser.id))
          .delete(getEntityAssociationData[0]);
      }

      await client
        ?.getEntityAssociation("kashflowCustomers", String(deskproUser.id))
        .set(customerId);

      query.clear();

      navigate("/");

      setIsLinking(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [context, client]
  );

  const getLinkedCustomer = useCallback(async () => {
    if (!client || !deskproUser) return;

    return await client
      .getEntityAssociation("kashflowCustomers", String(deskproUser.id))
      .list();
  }, [client, deskproUser]);

  const unlinkCustomer = useCallback(async () => {
    if (!context || !client) return;

    const id = (await getLinkedCustomer())?.[0];

    if (!id) return;

    await client
      .getEntityAssociation("kashflowCustomers", String(deskproUser?.id))
      .delete(id);
  }, [client, context, deskproUser, getLinkedCustomer]);

  return {
    getLinkedCustomer,
    linkCustomer,
    isLinking,
    unlinkCustomer,
    context,
    client,
  };
};
