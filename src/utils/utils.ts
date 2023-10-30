import { ICustomer } from "../types/customer";
import { IInvoice } from "../types/invoice";

export const parseJsonErrorMessage = (error: string) => {
  try {
    const parsedError = JSON.parse(error);

    return `Status: ${parsedError.status} \n Message: ${parsedError.message}`;
  } catch {
    return error;
  }
};

export const titleAccessor = (
  field: IInvoice | ICustomer,
  objectName: "Invoice" | "Customer"
) => {
  switch (objectName) {
    case "Invoice":
      return (field as IInvoice).InvoiceNumber.toString();

    case "Customer":
      return (field as ICustomer).Name[0];
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getObjectValue = (obj: any, keyString: string) => {
  const keys = keyString.split(".");

  let value = obj;

  for (const key of keys) {
    value = value[key];

    if (value === undefined) {
      return undefined;
    }
  }

  return value;
};

export const makeFirstLetterUppercase = (str: string) => {
  if (!str) return str;

  if (typeof str === "object") return "-";

  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const substitutePlaceholders = (
  string: string,
  obj: Record<string, string>
) => {
  for (const [key, value] of Object.entries(obj)) {
    string = string.replace(
      new RegExp(`__${key}__`, "g"),
      typeof value === "object" ? value[0] : value
    );
  }
  return string;
};

export const parseStringArray = (
  array: (string | Record<string, unknown>)[]
) => {
  if (!array) return [];

  return array.map((item) => {
    if (typeof item === "string") return item ?? "";

    return "";
  });
};

export const kashflowToNormalObject = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: Record<string, any>,
  acceptedKeys: string[]
) => {
  return Object.keys(obj ?? {}).reduce((acc, curr) => {
    if (!acceptedKeys.includes(curr)) return acc;
    switch (typeof obj?.[curr as keyof ICustomer]) {
      case "string":
        acc[curr] = obj[curr as keyof ICustomer] as string;
        break;
      case "number":
        acc[curr] = obj[curr as keyof ICustomer].toString();
        break;
      case "object":
        if (Array.isArray(obj[curr as keyof ICustomer])) {
          acc[curr] =
            typeof obj[curr as keyof ICustomer][0] === "object"
              ? ""
              : obj[curr as keyof ICustomer][0];
        } else if (obj[curr as keyof ICustomer] instanceof Date) {
          acc[curr] = obj[curr as keyof ICustomer].toISOString();
        }
    }
    return acc;
  }, {} as Record<string, string>);
};
