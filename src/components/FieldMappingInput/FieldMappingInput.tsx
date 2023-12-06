/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef } from "react";
import { FieldErrorsImpl } from "react-hook-form";
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form/dist/types";

import { DropdownData, FieldMappingInputs } from "../../types/types";
import { DateField } from "../DateField/DateField";
import { DropdownSelect } from "../DropdownSelect/DropdownSelect";
import { InputWithTitleRegister } from "../InputWithTitle/InputWithTitleRegister";
import { H1, Stack, TextArea } from "@deskpro/deskpro-ui";
import { useDeskproAppTheme } from "@deskpro/app-sdk";

type Props = {
  errors: Partial<FieldErrorsImpl<any>>;
  fields: FieldMappingInputs;
  dropdownData?: DropdownData;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  register: UseFormRegister<any>;
  onDropdownChange?: (
    key: string,
    value: string,
    action: "add" | "remove"
  ) => void;
};
export const FieldMappingInput = forwardRef(
  ({
    fields,
    errors,
    watch,
    setValue,
    register,
    dropdownData,
    onDropdownChange,
    ...attributes
  }: Props) => {
    const { theme } = useDeskproAppTheme();

    return (
      <Stack vertical style={{ width: "100%" }} gap={5}>
        {fields.map((field) => {
          if (field.label === "Type") return <div />;

          switch (field.type) {
            case "text":
            case "number":
            case "tel":
              return (
                <InputWithTitleRegister
                  register={register(field.name, {
                    setValueAs: (value) => {
                      if (value === "") return undefined;

                      if (field.type === "numeric") return Number(value);

                      return value;
                    },
                  })}
                  title={field.label}
                  error={!!errors[field.name]}
                  type={field.type}
                  required={field.required}
                  data-testid={`input-${field.name}`}
                  {...attributes}
                ></InputWithTitleRegister>
              );

            case "textarea":
              return (
                <Stack
                  vertical
                  gap={4}
                  style={{
                    width: "100%",
                    color: theme.colors.grey80,
                    marginTop: "4px",
                  }}
                >
                  <H1>{field.label}</H1>
                  <TextArea
                    variant="inline"
                    value={watch(field.name)}
                    error={!!errors[field.name]}
                    onChange={(e) => setValue(field.name, e.target.value)}
                    placeholder="Enter text here..."
                    title={field.label}
                    {...attributes}
                    style={{
                      resize: "none",
                      minHeight: "5em",
                      maxHeight: "100%",
                      height: "auto",
                      width: "100%",
                      overflow: "hidden",
                    }}
                  />
                </Stack>
              );

            case "dropdown": {
              if (!dropdownData) return <div />;

              return (
                <DropdownSelect
                  title={field.label}
                  error={!!errors[field.name]}
                  required={field.required}
                  data={dropdownData[field.name]}
                  onChange={(e) => setValue(field.name, e)}
                  value={watch(field.name)}
                  multiple={field.multiple}
                />
              );
            }
            case "date":
              return (
                <DateField
                  style={
                    errors?.[field.name]
                      ? {
                          borderBottomColor: "red",
                        }
                      : undefined
                  }
                  value={watch(field.name)}
                  label={field.label}
                  error={!!errors[field.name]}
                  onChange={(e: Date[]) =>
                    setValue(field.name, e[0].toISOString().split("T")[0])
                  }
                />
              );
          }
          return <div />;
        })}
      </Stack>
    );
  }
);
