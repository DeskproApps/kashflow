import { useParams } from "react-router-dom";
import { MutateObject } from "../../components/Mutate/Object";

export const CreateObject = () => {
  const { objectName } = useParams();

  return <MutateObject objectName={objectName as "Invoice" | "Customer"} />;
};
