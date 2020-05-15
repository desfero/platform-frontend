import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import {  NewTableRow, Table } from "./NewTable";

storiesOf("NewTable", module) //fixme remove commented
  // .add("default", () => (
  //   <NewTable titles={["Name", "Surname", "Role"]}>
  //     <NewTableRow>
  //       <>Pawel</>
  //       <>Lula</>
  //       <>Developer</>
  //     </NewTableRow>
  //     <NewTableRow>
  //       <>Wiktor</>
  //       <>Furman</>
  //       <>Developer</>
  //     </NewTableRow>
  //     <NewTableRow>
  //       <>Thomas</>
  //       <>Gorny</>
  //       <>Developer</>
  //     </NewTableRow>
  //   </NewTable>
  // ))
  // .add("clickable", () => (
  //   <NewTable titles={["Name", "Surname", "Role"]}>
  //     <NewTableRow onClick={action("onClick")}>
  //       <>Pawel</>
  //       <>Lula</>
  //       <>Developer</>
  //     </NewTableRow>
  //     <NewTableRow onClick={action("onClick")}>
  //       <>Wiktor</>
  //       <>Furman</>
  //       <>Developer</>
  //     </NewTableRow>
  //     <NewTableRow onClick={action("onClick")}>
  //       <>Thomas</>
  //       <>Gorny</>
  //       <>Developer</>
  //     </NewTableRow>
  //   </NewTable>
  // ))
  // .add("empty", () => <NewTable titles={["Name", "Surname", "Role"]}>{[]}</NewTable>)
  // .add("empty with custom placeholder", () => (
  //   <NewTable
  //     titles={["Name", "Surname", "Role"]}
  //     placeholder="This is custom placeholder when table is empty"
  //   >
  //     {[]}
  //   </NewTable>
  // ))
  // .add("keeps rhytm", () => (
  //   <NewTable titles={["Name", "Surname", "Role"]} keepRhythm>
  //     <NewTableRow>
  //       <>Pawel</>
  //       <>Lula</>
  //       <>Developer</>
  //     </NewTableRow>
  //     <NewTableRow>
  //       <>Wiktor</>
  //       <>Furman</>
  //       <>Developer</>
  //     </NewTableRow>
  //     <NewTableRow>
  //       <>Thomas</>
  //       <>Gorny</>
  //       <>Developer</>
  //     </NewTableRow>
  //   </NewTable>
  // ))
  // .add("empty but keeps rhytm", () => (
  //   <NewTable titles={["Name", "Surname", "Role"]} keepRhythm>
  //     {[]}
  //   </NewTable>
  // ))
  .add("without panel", () => (
    <Table titles={["Name", "Surname", "Role"]}>
      <NewTableRow>
        <>Pawel</>
        <>Lula</>
        <>Developer</>
      </NewTableRow>
      <NewTableRow>
        <>Wiktor</>
        <>Furman</>
        <>Developer</>
      </NewTableRow>
      <NewTableRow>
        <>Thomas</>
        <>Gorny</>
        <>Developer</>
      </NewTableRow>
    </Table>
  ))
  .add("without panel clickable", () => (
    <Table titles={["Name", "Surname", "Role"]}>
      <NewTableRow onClick={action("onClick")}>
        <>Pawel</>
        <>Lula</>
        <>Developer</>
      </NewTableRow>
      <NewTableRow onClick={action("onClick")}>
        <>Wiktor</>
        <>Furman</>
        <>Developer</>
      </NewTableRow>
      <NewTableRow onClick={action("onClick")}>
        <>Thomas</>
        <>Gorny</>
        <>Developer</>
      </NewTableRow>
    </Table>
  ));
