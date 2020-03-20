import { storiesOf } from "@storybook/react";
import * as React from "react";

import { Table } from "./TableLazy";

const columns = [
  {
    Header: "First Name",
    accessor: "firstName",
  },
  {
    Header: "Last Name",
    accessor: "lastName",
  },
  {
    Header: "Age",
    accessor: "age",
  },
  {
    Header: "Visits",
    accessor: "visits",
  },
];

const data = [
  {
    firstName: "Andrzej",
    lastName: "Glowica",
    age: 52,
    visits: 1245,
  },
  {
    firstName: "John",
    lastName: "Doe",
    age: 42,
    visits: 234,
  },
  {
    firstName: "Janet",
    lastName: "Doe",
    age: 38,
    visits: 2425,
  },
];

const columnsWithFooter = [
  {
    Header: "First Name",
    accessor: "firstName",
    Footer: "First Name",
  },
  {
    Header: "Last Name",
    accessor: "lastName",
    Footer: "Last Name",
  },
  {
    Header: "Age",
    accessor: "age",
    Footer: "Age",
  },
  {
    Header: "Visits",
    accessor: "visits",
    Footer: "Visits",
  },
];

storiesOf("NDS|Molecules/Table", module)
  .add("default", () => <Table columns={columns} data={data} />)
  .add("with footer", () => <Table columns={columnsWithFooter} data={data} withFooter={true} />)
  .add("custom footer", () => (
    <Table
      columns={columns}
      data={data}
      customFooter={
        <tr>
          <td colSpan={5}>This is custom footer</td>
        </tr>
      }
    />
  ));
