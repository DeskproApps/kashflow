import { useParams } from "react-router-dom";
import { MutateObject } from "../../components/Mutate/Object";
import { Container } from "../../components/Layout";

export const CreateObject = () => {
  const { objectName } = useParams();

  return (
    <Container>
      <MutateObject objectName={objectName as "Invoice" | "Customer"} />
    </Container>
  );
};
