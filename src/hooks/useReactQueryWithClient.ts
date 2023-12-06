/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IDeskproClient,
  useDeskproAppClient,
  proxyFetch,
} from "@deskpro/app-sdk";
import { useState, useEffect } from "react";
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { createClientAsync } from "../soap";

export const useQueryWithClient = <
  TQueryFnData = unknown,
  TError = unknown,
  TData extends TQueryFnData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: string | readonly unknown[],
  queryFn: (client: IDeskproClient) => Promise<TQueryFnData>,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<TQueryFnData> => {
  const [soapClient, setSoapClient] = useState<any | null>(null);
  const { client } = useDeskproAppClient();

  const key = Array.isArray(queryKey) ? queryKey : [queryKey];

  useEffect(() => {
    if (!client) {
      return;
    }

    const fetch = async () => {
      const fetch = await proxyFetch(client);

      setSoapClient(
        await createClientAsync(
          fetch,
          "https://securedwebapp.com/api/service.asmx?WSDL"
        )
      );
    };

    fetch();
  }, [client]);

  return useQuery(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    key,
    () => (soapClient && queryFn(soapClient)) as Promise<TQueryFnData>,
    {
      ...(options ?? {}),
      enabled:
        options?.enabled === undefined
          ? !!soapClient
          : true && options?.enabled && !!soapClient,
    }
  );
};

export const useQueryMutationWithClient = <
  TFuncParams = unknown,
  TData = unknown
>(
  queryFn: (client: IDeskproClient, data: TFuncParams) => Promise<TData>,
  options?:
    | Omit<UseMutationOptions<TData, unknown, unknown, unknown>, "mutationFn">
    | undefined
) => {
  const [soapClient, setSoapClient] = useState<any | null>(null);

  const { client } = useDeskproAppClient();

  useEffect(() => {
    if (!client) {
      return;
    }

    const fetch = async () => {
      const fetch = await proxyFetch(client);

      setSoapClient(
        await createClientAsync(
          fetch,
          "https://securedwebapp.com/api/service.asmx?WSDL"
        )
      );
    };

    fetch();
  }, [client]);

  return useMutation<TData, unknown, unknown, unknown>(
    (data) =>
      (!soapClient
        ? null
        : queryFn(soapClient, data as TFuncParams)) as ReturnType<
        typeof queryFn
      >,
    options
  );
};
