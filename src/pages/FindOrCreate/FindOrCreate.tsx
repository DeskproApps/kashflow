import { TwoButtonGroup } from "@deskpro/app-sdk";
import { useState } from "react";
import { faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";
import { LinkCustomer } from "../../components/Link/Customer";
import { MutateObject } from "../../components/Mutate/Object";
import { Container } from "../../components/Layout";

export const FindOrCreate = ({ pageParam }: { pageParam?: 0 | 1 }) => {
  const [page, setPage] = useState<0 | 1>(pageParam || 0);

  return (
    <Container>
      <TwoButtonGroup
        selected={
          {
            0: "one",
            1: "two",
          }[page] as "one" | "two"
        }
        oneIcon={faMagnifyingGlass}
        twoIcon={faPlus}
        oneLabel="Find Customer"
        twoLabel="Create Customer"
        oneOnClick={() => setPage(0)}
        twoOnClick={() => setPage(1)}
      />
      {
        {
          0: <LinkCustomer />,
          1: <MutateObject objectName="Customer" />,
        }[page]
      }
    </Container>
  );
};
