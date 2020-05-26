import { CommonHtmlProps } from "@neufund/web/app/types";
import * as React from "react";
import {
  Column,
  HeaderGroup,
  Row,
  TableBodyPropGetter,
  TableBodyProps,
  useTable,
} from "react-table";

import * as styles from "./Table.module.scss";

type TExternalProps = {
  columns: Column[];
  data: Array<any>;
  withFooter?: boolean;
  customFooter?: React.ReactElement;
  CustomHeader?: React.FunctionComponent;
};

type TTableHeaderProps = {
  headerGroups: HeaderGroup[];
};

type TTableBodyProps = {
  getTableBodyProps: (propGetter?: TableBodyPropGetter<any>) => TableBodyProps;
  prepareRow: (row: Row<any>) => void;
  rows: Array<Row<any>>;
};

type TTableFooterProps = {
  footerGroups: Array<HeaderGroup<any>>;
};

const TableHeader: React.FunctionComponent<TTableHeaderProps> = ({ headerGroups }) => (
  <thead>
    {headerGroups.map(headerGroup => (
      <tr {...headerGroup.getHeaderGroupProps()}>
        {headerGroup.headers.map(column => (
          <th {...column.getHeaderProps()}>{column.render("Header")}</th>
        ))}
      </tr>
    ))}
  </thead>
);

const TableBody: React.FunctionComponent<TTableBodyProps> = ({
  getTableBodyProps,
  prepareRow,
  rows,
}) => (
  <tbody {...getTableBodyProps()}>
    {rows.map(row => {
      prepareRow(row);
      return (
        <tr {...row.getRowProps()}>
          {row.cells.map(cell => (
            <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
          ))}
        </tr>
      );
    })}
  </tbody>
);

const TableFooter: React.FunctionComponent<TTableFooterProps> = ({ footerGroups }) => (
  <tfoot>
    {footerGroups.map(group => (
      <tr {...group.getFooterGroupProps()}>
        {group.headers.map(column => (
          <td {...column.getFooterProps()}>{column.render("Footer")}</td>
        ))}
      </tr>
    ))}
  </tfoot>
);

const Table: React.FunctionComponent<TExternalProps & CommonHtmlProps> = ({
  columns,
  data,
  withFooter,
  customFooter,
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  });
  return (
    <div className={styles.container}>
      <table className={styles.table} {...getTableProps()}>
        <TableHeader headerGroups={headerGroups} />
        <TableBody rows={rows} getTableBodyProps={getTableBodyProps} prepareRow={prepareRow} />
        {withFooter && !customFooter && <TableFooter footerGroups={footerGroups} />}
        {!!customFooter && customFooter}
      </table>
    </div>
  );
};

export { Table };
