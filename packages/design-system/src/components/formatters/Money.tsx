import { TDataTestId } from "@neufund/shared";
import * as React from "react";

export interface IMoneyProps {
  className?: string;
}

export const Money: React.FunctionComponent<IMoneyProps & TDataTestId> = ({
  className,
  children,
  "data-test-id": dataTestId,
}) => (
  <span className={className} data-test-id={dataTestId}>
    {children}
  </span>
);
