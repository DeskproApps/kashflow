import { useDeskproAppTheme, Select } from "@deskpro/app-sdk";
import { H1, Label, Stack } from "@deskpro/deskpro-ui";

import { ReactNode, useMemo } from "react";
type Props = {
  data?: {
    key: string;
    value: string | null | number;
  }[];
  onChange: (key: string) => void;
  title: string;
  value?: string;
  error: boolean;
  required?: boolean;
  multiple?: boolean;
};
export const DropdownSelect = ({
  data,
  title,
  value,
  required,
  onChange,
}: Props) => {
  const { theme } = useDeskproAppTheme();

  const dataOptions = useMemo(() => {
    return data?.map((dataInList) => ({
      key: dataInList.key,
      label: <Label label={dataInList.key}></Label>,
      value: dataInList.value,
      type: "value" as const,
    }));
  }, [data]) as {
    value: string;
    key: string;
    label: ReactNode;
    type: "value";
  }[];

  return (
    <Stack
      vertical
      style={{ marginTop: "5px", color: theme?.colors.grey80, width: "100%" }}
    >
      <Stack>
        <H1>{title}</H1>
        {required && (
          <Stack style={{ color: "red" }}>
            <H1>⠀*</H1>
          </Stack>
        )}
      </Stack>
      <Select
        options={dataOptions}
        value={value}
        initValue={""}
        onChange={(e) => onChange(e as string)}
      />
    </Stack>
  );
};
