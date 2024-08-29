import { useParams } from "react-router-dom";
import { MutateObject } from "../../components/Mutate/Object";
import { H1 } from "@deskpro/deskpro-ui";
import { Container } from "../../components/Layout";

export const EditObject = () => {
  const { objectName, objectId } = useParams<{
    objectName: "Customer" | "Invoice";
    objectId: string;
  }>();

  return (
    <Container>
      {(!objectName || !objectId)
        ? <H1>Object Name and Object Id must be specified</H1>
        : <MutateObject objectId={objectId} objectName={objectName} />
      }
    </Container>
  );
};
