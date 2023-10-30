import { ReactElement } from "react";
import { IJson } from "../types/json";
import { formatDate } from "../utils/dateUtils";
import {
  getObjectValue,
  makeFirstLetterUppercase,
  parseStringArray,
} from "../utils/utils";

export const useMapFieldValues = () => {
  const mapFieldValues = (
    metadataFields: IJson["list"][0] | IJson["single"][0],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: any
  ) => {
    return metadataFields.map((metadataField) => {
      let value: string | ReactElement;

      switch (metadataField.type) {
        case "date":
          value = field[metadataField.name]
            ? formatDate(new Date(field[metadataField.name] as string))
            : "-";

          break;

        case "key":
          value = getObjectValue(field, metadataField.name);

          break;

        case "address":
          value = parseStringArray([
            ...field.Address1,
            ...field.Address2,
            ...field.Address3,
            ...field.Address4,
            ...field.CountryName,
          ])
            .filter((e) => e)
            .reduce((a, c) => a + c + " ", "");

          break;

        case "address-invoice":
          value = parseStringArray([
            ...field.DeliveryAddress[0].Line1,
            ...field.DeliveryAddress[0].Line2,
            ...field.DeliveryAddress[0].Line3,
            ...field.DeliveryAddress[0].Line4,
            ...field.DeliveryAddress[0].CountryName,
          ])
            .filter((e) => e)
            .reduce((a, c) => a + c + " ", "");

          break;

        case "percentage":
          value = `${Number(field[metadataField.name])}%`;

          break;

        case "amount-lineitem":
          value = `${Number(field.Rate) + Number(field.VatAmount)} ${
            field.CurrencyCode[0]
          }`;

          break;

        case "number":
          value = Number(field[metadataField.name]).toString();

          break;

        case "number-array":
          value = field[metadataField.name][0] as string;

          break;

        case "total":
          (() => {
            const fields = metadataField.name.split("-");

            const total = fields.reduce((a, c) => a + Number(field[c]), 0);

            value = `${total.toFixed(2)} ${field.CurrencyCode[0]}`;
          })();
          break;

        case "text":
          value = makeFirstLetterUppercase(field[metadataField.name] as string);

          break;

        case "text-array":
          value = makeFirstLetterUppercase(
            field[metadataField.name][0] as string
          );

          break;

        case "currency":
          value = `${Number(field[metadataField.name]).toFixed(2)} ${
            field.CurrencyCode[0]
          }`;

          break;

        case "lineitem":
          value = "lineitem";

          break;

        default:
          if (metadataField.name in field) {
            value = field[metadataField.name] as string;
          } else {
            value = "-";
          }
      }

      return {
        key: metadataField.label,
        value: value || "-",
      };
    });
  };

  return { mapFieldValues };
};
