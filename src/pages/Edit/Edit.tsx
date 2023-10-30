import { useParams } from "react-router-dom";
import { MutateObject } from "../../components/Mutate/Object";
import { H1 } from "@deskpro/deskpro-ui";

export const EditObject = () => {
  const { objectName, objectId } = useParams<{
    objectName: "Customer" | "Invoice";
    objectId: string;
  }>();

  if (!objectName || !objectId)
    return <H1>Object Name and Object Id must be specified</H1>;

  return <MutateObject objectId={objectId} objectName={objectName} />;
};
