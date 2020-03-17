import * as React from "react";

export interface IValueProps {
  className?: string;
}

export const Value: React.FunctionComponent<IValueProps> = ({ className, children }) => (
  <span className={className} data-test-id="value">
    {children}
  </span>
);
