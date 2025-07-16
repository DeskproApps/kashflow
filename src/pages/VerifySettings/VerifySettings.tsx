import { useState, useCallback } from "react";
import styled from "styled-components";
import { P1, TSpan, Stack, Button } from "@deskpro/deskpro-ui";
import { useDeskproAppEvents, useDeskproAppClient, DeskproAppTheme } from "@deskpro/app-sdk";
import { getCurrentCompany } from "../../api/preInstallApi";
import type { FC } from "react";
import type { ICompany } from "../../types/company";

const Invalid = styled(TSpan)<DeskproAppTheme>`
  color: ${({ theme }) => theme.colors.red100};
`;

const Valid = styled.span<DeskproAppTheme>`
  color: ${({ theme }) => theme.colors.grey100};
`;

const VerifySettings: FC = () => {
  const { client } = useDeskproAppClient();
  const [company, setCompany] = useState<ICompany|null>(null);
  const [settings, setSettings] = useState<object>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const onVerifySettings = useCallback(() => {
    if (!client || !settings) {
      return;
    }

    setIsLoading(true);
    setError("");
    setCompany(null);

    return getCurrentCompany(client, settings)
      .then(setCompany)
      .catch((err) => setError((typeof err === "string") ? err : "An error occurred"))
      .finally(() => setIsLoading(false));
  }, [client, settings]);

  useDeskproAppEvents({
    onAdminSettingsChange: setSettings,
  }, [client]);

  return (
    <>
      <Stack align="baseline">
        <Button
          text="Verify Settings"
          intent="secondary"
          onClick={onVerifySettings}
          loading={isLoading}
          disabled={false || isLoading}
        />
        {"\u00A0"}
        {company && (
          <P1>Verified as <Valid>{`<${company?.CompanyName?.[0]}>`}</Valid></P1>
        )}
      </Stack>
      {error && <Invalid type="p1">{error}</Invalid> || ""}
    </>
  );
};

export { VerifySettings };
