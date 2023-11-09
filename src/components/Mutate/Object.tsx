/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  useDeskproAppEvents,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { Button, H1, H5, Stack } from "@deskpro/deskpro-ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ZodTypeAny, z } from "zod";
import {
  createCustomer,
  createInvoice,
  editCustomer,
  editInvoice,
  getCustomerById,
  getInvoiceByInvoiceNumber,
  getProductsWithSubProducts,
} from "../../api/api";
import { useLinkCustomer } from "../../hooks/hooks";
import {
  useQueryMutationWithClient,
  useQueryWithClient,
} from "../../hooks/useReactQueryWithClient";
import CustomerJson from "../../mapping/customer.json";
import InvoiceJson from "../../mapping/invoice.json";
import { getCustomerSchema, getInvoiceSchema } from "../../schemas";
import { ICustomer } from "../../types/customer";
import { IInvoice } from "../../types/invoice";
import { IJson } from "../../types/json";
import { FieldMappingInput } from "../FieldMappingInput/FieldMappingInput";
import { LoadingSpinnerCenter } from "../LoadingSpinnerCenter/LoadingSpinnerCenter";
import {
  kashflowToNormalObject,
  parseJsonErrorMessage,
} from "../../utils/utils";
import { InputWithTitleRegister } from "../InputWithTitle/InputWithTitleRegister";
import { DropdownSelect } from "../DropdownSelect/DropdownSelect";

const customerInputs = CustomerJson;

const invoiceInputs = InvoiceJson;

type Props = {
  objectId?: string;
  objectName: "Invoice" | "Customer";
};

export const MutateObject = ({ objectId, objectName }: Props) => {
  const navigate = useNavigate();
  const [schema, setSchema] = useState<ZodTypeAny | null>(null);
  const { linkCustomer } = useLinkCustomer();
  const { context } = useDeskproLatestAppContext();

  const { getLinkedCustomer } = useLinkCustomer();

  const correctJson = useMemo<IJson>(() => {
    switch (objectName) {
      case "Customer":
        return customerInputs;
      case "Invoice":
        return invoiceInputs;
    }
  }, [objectName]);

  const isEditMode = !!objectId;

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<Partial<IInvoice>>({
    resolver: zodResolver(schema as ZodTypeAny),
    defaultValues:
      objectName === "Invoice"
        ? ({ Lines: [{ anyType: [{}] }] } as Partial<IInvoice>)
        : ({} as Partial<ICustomer>),
  });

  const lines = watch("Lines.0.anyType");

  const customer = useQueryWithClient(
    ["customer", objectId as string],
    (client) => getCustomerById(client, objectId as string),
    {
      enabled: isEditMode && objectName === "Customer",
    }
  );

  const invoice = useQueryWithClient(
    ["invoice", objectId as string],
    (client) => getInvoiceByInvoiceNumber(client, objectId as string),
    {
      enabled: isEditMode && objectName === "Invoice",
    }
  );

  const productsWithSubProducts = useQueryWithClient(
    ["productsWithSubProducts"],
    (client) => getProductsWithSubProducts(client),
    {
      enabled: objectName === "Invoice",
    }
  );

  const submitMutation = useQueryMutationWithClient<
    ICustomer | IInvoice,
    number
  >(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    (client, data) => {
      switch (
        `${objectName}-${isEditMode}` as
          | "Customer-false"
          | "Customer-true"
          | "Invoice-false"
          | "Invoice-true"
      ) {
        case "Customer-false":
          return createCustomer(client, data as ICustomer);

        case "Customer-true":
          return editCustomer(client, data as ICustomer);

        case "Invoice-false":
          return createInvoice(client, data as IInvoice);

        case "Invoice-true":
          return editInvoice(client, data as IInvoice);
      }
    },
    {
      onError: (error) => {
        throw new Error(error as string);
      },
    }
  );

  useEffect(() => {
    if (isEditMode || objectName !== "Invoice") return;

    getLinkedCustomer().then((e) => setValue("CustomerID", Number(e?.[0])));
  });

  useEffect(() => {
    if (
      !isEditMode ||
      (objectName === "Customer" && !customer.isSuccess) ||
      (objectName === "Invoice" && !invoice.isSuccess)
    )
      return;

    const customerData = customer.data?.[0] as ICustomer;

    const invoiceData = invoice.data?.[0] as IInvoice;

    switch (objectName) {
      case "Customer":
        reset(
          kashflowToNormalObject(customerData, [
            ...correctJson.create.map((e) => e.name),
            "CustomerID",
          ])
        );
        break;

      case "Invoice":
        invoiceData.Lines[0].anyType.forEach((e) => {
          e.Description =
            typeof e.Description === "string" ? e.Description : "";
        });

        reset({
          ...kashflowToNormalObject(invoiceData, [
            ...correctJson.create.map((e) => e.name),
            "InvoiceNumber",
            "CustomerID",
          ]),
          Lines: invoiceData.Lines,
        });
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectName, objectId, customer.isSuccess, invoice.isSuccess]);

  useInitialisedDeskproAppClient(
    (client) => {
      if (!objectName) return;

      client.deregisterElement("plusButton");

      client.setTitle(`${isEditMode ? "Edit" : "Create"} ${objectName}`);

      client.deregisterElement("editButton");
    },
    [objectName, isEditMode]
  );

  useEffect(() => {
    if (isEditMode || objectName !== "Customer" || !context) return;
    reset({
      Name: context.data.user.name,
      Email: context.data.user.primaryEmail,
    } as ICustomer);
  }, [context, isEditMode, objectName, reset]);

  useEffect(() => {
    if (!submitMutation.isSuccess) return;

    if (isEditMode) {
      navigate(`/view/single/${objectName}/${objectId}`);

      return;
    }

    if (objectName === "Invoice") {
      navigate(`/view/single/${objectName}/${submitMutation.data}`);

      return;
    }

    const id = submitMutation.data;

    linkCustomer(id.toString()).then(() => {
      navigate(`/redirect`);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    submitMutation.isSuccess,
    navigate,
    objectId,
    isEditMode,
    linkCustomer,
    objectName,
  ]);

  useEffect(() => {
    if (!correctJson || !objectName) return;

    const newObj: { [key: string]: ZodTypeAny } = {};

    correctJson.create.forEach((field) => {
      if (field.required) {
        newObj[field.name] = z.string().nonempty();
      } else {
        newObj[field.name] = z.string().optional();
      }
    });

    setSchema(
      objectName === "Customer"
        ? getCustomerSchema(correctJson.create, newObj)
        : getInvoiceSchema(correctJson.create, {
            ...newObj,
            Lines: z.array(
              z.object({
                anyType: z.array(
                  z.object({
                    Quantity: z.number(),
                    Rate: z.number(),
                    Description: z.string(),
                    ChargeType: z.string().optional(),
                    ProductID: z.string().optional(),
                  })
                ),
              })
            ),
          })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, objectName]);

  useDeskproAppEvents({
    async onElementEvent(id) {
      switch (id) {
        case "homeButton":
          navigate("/redirect");

          break;
      }
    },
  });

  const getSubProducts = (id: string) => {
    const subp = productsWithSubProducts.data?.find((e) => e.ProductID === id);

    if (Array.isArray(subp?.subProducts.SubProduct)) {
      return (
        subp?.subProducts.SubProduct?.map((e) => ({
          key: e.Name,
          value: e.id,
        })) ?? []
      );
    } else if (subp?.subProducts?.SubProduct) {
      return [
        {
          //@ts-ignore can be an object,
          key: subp?.subProducts.SubProduct.Name,
          //@ts-ignore
          value: subp?.subProducts.SubProduct.id,
        },
      ];
    }

    return [];
  };

  if (
    (!customer.isSuccess && objectName === "Customer" && isEditMode) ||
    (!invoice.isSuccess && objectName === "Invoice" && isEditMode) ||
    !correctJson ||
    (objectName === "Invoice" && !productsWithSubProducts.data)
  )
    return <LoadingSpinnerCenter />;
  return (
    <form
      onSubmit={handleSubmit((data) => submitMutation.mutate(data))}
      style={{ width: "100%" }}
    >
      <Stack vertical style={{ width: "100%" }} gap={6}>
        <FieldMappingInput
          errors={errors}
          fields={correctJson.create}
          register={register}
          setValue={setValue}
          watch={watch}
        />
        {objectName === "Invoice" && (
          <>
            {lines?.map((_, i) => (
              <>
                <H5>Line Item {i + 1}</H5>
                <InputWithTitleRegister
                  register={register(`Lines.0.anyType.${i}.Quantity`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  title="Quantity"
                  required={true}
                  error={
                    !!errors[`Lines.0.anyType.${i}.Quantity` as keyof IInvoice]
                  }
                />
                <InputWithTitleRegister
                  register={register(`Lines.0.anyType.${i}.Rate`, {
                    valueAsNumber: true,
                  })}
                  required={true}
                  type="number"
                  title="Unit Price"
                  error={
                    !!errors[`Lines.0.anyType.${i}.Rate` as keyof IInvoice]
                  }
                />
                <InputWithTitleRegister
                  register={register(`Lines.0.anyType.${i}.Description`)}
                  type="text"
                  title="Description"
                  required={true}
                  error={
                    !!errors[
                      `Lines.0.anyType.${i}.Description` as keyof IInvoice
                    ]
                  }
                />
                <DropdownSelect
                  value={watch(`Lines.0.anyType.${i}.ChargeType`) ?? ""}
                  title="Sales Code"
                  required={true}
                  data={productsWithSubProducts.data?.map((e) => ({
                    key: e.ProductName,
                    value: e.ProductID,
                  }))}
                  onChange={(e) =>
                    setValue(`Lines.0.anyType.${i}.ChargeType`, e)
                  }
                  error={
                    !!errors[
                      `Lines.0.anyType.${i}.ChargeType` as keyof IInvoice
                    ]
                  }
                />
                {watch(`Lines.0.anyType.${i}.ChargeType`) && (
                  <DropdownSelect
                    value={watch(`Lines.0.anyType.${i}.ProductID`) ?? ""}
                    title="Product/Service"
                    required={true}
                    data={getSubProducts(
                      watch(`Lines.0.anyType.${i}.ChargeType`) ?? ""
                    )}
                    onChange={(e) =>
                      setValue(`Lines.0.anyType.${i}.ProductID`, e)
                    }
                    error={
                      !!errors[
                        `Lines.0.anyType.${i}.ProductID` as keyof IInvoice
                      ]
                    }
                  />
                )}
              </>
            ))}
            <Stack justify="space-between" style={{ width: "100%" }}>
              <Button
                onClick={() =>
                  setValue(`Lines.0.anyType.${lines?.length || 0}`, {
                    Quantity: "1",
                    Rate: "0",
                    Description: "",
                  })
                }
                text="Add Line Item"
              ></Button>
              <Button
                onClick={() =>
                  setValue(
                    `Lines.0.anyType`,
                    (lines?.length || 0) > 1 ? lines?.slice(0, -1) : []
                  )
                }
                intent="secondary"
                text="Remove Line Item"
              ></Button>
            </Stack>
          </>
        )}
        <Stack style={{ width: "100%", justifyContent: "space-between" }}>
          <Button
            type="submit"
            data-testid="button-submit"
            text={objectId ? "Save" : "Create"}
            loading={submitMutation.isLoading}
            disabled={submitMutation.isLoading}
            intent="primary"
          ></Button>
          {!!objectId && (
            <Button
              text="Cancel"
              onClick={() => navigate(`/redirect`)}
              intent="secondary"
            ></Button>
          )}
        </Stack>
      </Stack>
      <H1>
        {!!submitMutation.error &&
          parseJsonErrorMessage(
            (submitMutation.error as { message: string }).message
          )}
      </H1>
    </form>
  );
};
