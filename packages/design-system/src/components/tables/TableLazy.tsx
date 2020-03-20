import * as React from "react";

import { LoadingIndicator } from "../loading-indicator";

const TableLazy = React.lazy(() =>
  import("./Table.unsafe").then(module => ({ default: module.Table })),
);

const Table: React.FunctionComponent<React.ComponentProps<typeof TableLazy>> = props => (
  <React.Suspense fallback={<LoadingIndicator />}>
    <TableLazy {...props} />
  </React.Suspense>
);

export { Table };
