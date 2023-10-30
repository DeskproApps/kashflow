import styled from "styled-components";
import type { FC, PropsWithChildren } from "react";

export type Props = PropsWithChildren<{
  marginBottom?: number;
}>;

type RowProps = Pick<Props, "marginBottom"> & {
  count: number;
};

const Row = styled.div<RowProps>`
  display: grid;
  grid-template-columns: repeat(
    ${({ count }) => count},
    ${({ count }) => 100 / count}%
  );
  width: 100%;
`;

const ItemContainer = styled.div`
  &:not(:first-child) {
    padding: 0 6px;
    border-left: 1px solid ${({ theme }) => theme.colors.grey20};
  }
`;

const Item = styled.div`
  overflow: hidden;
  white-space: pre-wrap;
  text-overflow: ellipsis;
  word-wrap: break-word;
`;

export const PropertyRow: FC<Props> = ({ children, marginBottom = 10 }) => {
  return !Array.isArray(children) ? (
    <>{children}</>
  ) : (
    <Row count={children.length} marginBottom={marginBottom}>
      {children.map((child, idx) => (
        <ItemContainer key={idx}>
          <Item>{child}</Item>
        </ItemContainer>
      ))}
    </Row>
  );
};
