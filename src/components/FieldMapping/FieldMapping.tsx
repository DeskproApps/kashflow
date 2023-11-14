import {
  ExternalIconLink,
  Property,
  PropertyRow,
  useDeskproAppTheme,
} from "@deskpro/app-sdk";
import { ReactElement } from "react";
import { StyledLink } from "../../styles";
import { IJson } from "../../types/json";
import { useMapFieldValues } from "../../hooks/mapFieldValues";
import { AppLogo } from "../AppLogo/AppLogo";
import { HorizontalDivider } from "../HorizontalDivider/HorizontalDivider";
import { H1, H2, H3, Icon, P11, P14, P5, Stack } from "@deskpro/deskpro-ui";
import { substitutePlaceholders } from "../../utils/utils";
import lineItemJson from "../../mapping/lineitem.json";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const SpaceBetweenFields = ({
  field: field,
}: {
  field: {
    key: string | number;
    value: string | ReactElement | undefined;
  };
}) => {
  return (
    <Stack
      style={{
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <H1>{field.key}:</H1>
      <H1>{field.value}</H1>
    </Stack>
  );
};

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: any[];
  internalUrl?: string;
  externalUrl?: string;
  metadata: IJson["single"];
  idKey?: string;
  internalChildUrl?: string;
  externalChildUrl?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  childTitleAccessor?: (field: any) => string;
  title?: string;
  hasCheckbox?: boolean;
  createPage?: string;
};

export const FieldMapping = ({
  fields,
  externalUrl,
  internalUrl,
  metadata,
  idKey = "",
  internalChildUrl,
  externalChildUrl,
  childTitleAccessor,
  title,
  createPage,
}: Props) => {
  const { theme } = useDeskproAppTheme();
  const { mapFieldValues } = useMapFieldValues();
  const navigate = useNavigate();

  return (
    <Stack vertical gap={5} style={{ width: "100%" }}>
      {(title || internalUrl || externalUrl) && (
        <Stack
          style={{
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
          }}
        >
          <Stack style={{ textAlign: "center", alignItems: "center" }} gap={3}>
            {title && internalUrl && fields.length > 0 ? (
              <StyledLink title="title" to={internalUrl}>
                {title}
              </StyledLink>
            ) : (
              title && <H1>{title}</H1>
            )}
            {createPage && (
              <div
                style={{
                  cursor: "pointer",
                  ...(fields.length > 0 ? { color: theme.colors.cyan100 } : {}),
                }}
                onClick={() => navigate(createPage)}
              >
                <Icon icon={faPlus} />
              </div>
            )}
          </Stack>
          {externalUrl && (
            <ExternalIconLink
              href={externalUrl}
              icon={<AppLogo />}
            ></ExternalIconLink>
          )}
        </Stack>
      )}
      {fields.map((field, i) => (
        <Stack vertical gap={5} style={{ width: "100%" }} key={i}>
          {(internalChildUrl || childTitleAccessor || externalChildUrl) && (
            <Stack
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              {internalChildUrl && childTitleAccessor && (
                <StyledLink to={internalChildUrl + field[idKey]} replace={true}>
                  {childTitleAccessor(field)}
                </StyledLink>
              )}
              {!internalChildUrl && childTitleAccessor && (
                <H3 style={{ fontSize: "12px", marginLeft: "5px" }}>
                  {childTitleAccessor(field)}
                </H3>
              )}
              {externalChildUrl && (
                <ExternalIconLink
                  href={substitutePlaceholders(externalChildUrl, field)}
                  icon={<AppLogo />}
                ></ExternalIconLink>
              )}
            </Stack>
          )}
          <Stack vertical style={{ width: "100%" }} gap={10}>
            {metadata?.map((metadataFields, i) => {
              const usableFields = mapFieldValues(metadataFields, field).filter(
                (e) => e.value
              );

              if (usableFields.some((e) => e.value === "lineitem")) {
                return (
                  <FieldMapping
                    key={i}
                    fields={(field.Lines[0].anyType ?? []).map(
                      (e: Record<string, string>) => ({
                        ...e,
                        CurrencyCode: field.CurrencyCode,
                      })
                    )}
                    metadata={lineItemJson.single}
                    hasCheckbox={true}
                  ></FieldMapping>
                );
              }

              if (usableFields.length === 0) return;
              switch (usableFields.length) {
                case 1:
                  if (!usableFields[0].value) return;

                  return metadataFields[0].singleLine ? (
                    <Stack
                      justify="space-between"
                      style={{ width: "100%", margin: "5px 0px 5px 0px" }}
                    >
                      <H1
                        style={{
                          fontSize: "12px",
                          color: theme?.colors.grey100,
                          fontWeight: 500,
                        }}
                      >
                        {usableFields[0].key}
                      </H1>
                      <H1
                        style={{
                          fontSize: "12px",
                          color: theme?.colors.grey100,
                          fontWeight: 500,
                        }}
                      >
                        {usableFields[0].value}
                      </H1>
                    </Stack>
                  ) : (
                    <Stack vertical gap={4} key={i} style={{ width: "100%" }}>
                      <H2 style={{ color: theme?.colors.grey80 }}>
                        {usableFields[0].key}
                      </H2>
                      <P5 style={{ whiteSpace: "pre-line", width: "100%" }}>
                        {usableFields[0].value}
                      </P5>
                    </Stack>
                  );

                case 3:
                  return (
                    <Stack
                      style={{ justifyContent: "space-between", width: "100%" }}
                      key={i}
                      vertical
                    >
                      <Stack
                        style={{
                          justifyContent: "space-between",
                          width: "100%",
                          alignItems: "end",
                        }}
                      >
                        <P5 theme={theme}>{usableFields[0].value}</P5>
                        <P14 style={{ fontSize: "12px" }}>
                          {(usableFields[2].value as string).split(" ")[0]}
                        </P14>
                      </Stack>
                      <Stack
                        gap={4}
                        style={{
                          justifyContent: "space-between",
                          width: "100%",
                          alignItems: "end",
                        }}
                      >
                        <P11 style={{ whiteSpace: "pre-line" }}>
                          {usableFields[1].value}
                        </P11>
                        <P14 style={{ fontSize: "12px" }}>
                          {(usableFields[2].value as string).split(" ")[1]}
                        </P14>
                      </Stack>
                    </Stack>
                  );
                case 4:
                case 2:
                  return (
                    <Stack style={{ width: "100%" }} vertical gap={5} key={i}>
                      <PropertyRow key={i}>
                        {usableFields.map((e, ii) => (
                          <Property
                            marginBottom={0}
                            label={e.key as string}
                            text={e.value != null ? e.value : "-"}
                            key={ii}
                          />
                        ))}
                      </PropertyRow>
                    </Stack>
                  );

                default:
                  return (
                    <Stack gap={20} vertical style={{ width: "100%" }} key={i}>
                      {usableFields
                        .filter((e) => e.key)
                        .map((usableField, usableFieldI) => {
                          if (!usableField.value) return;

                          return (
                            <Stack
                              vertical
                              style={{ width: "100%" }}
                              key={usableFieldI}
                            >
                              <SpaceBetweenFields
                                field={usableField}
                              ></SpaceBetweenFields>
                            </Stack>
                          );
                        })}
                    </Stack>
                  );
              }
            })}
          </Stack>
          {<HorizontalDivider full />}
        </Stack>
      ))}
    </Stack>
  );
};
