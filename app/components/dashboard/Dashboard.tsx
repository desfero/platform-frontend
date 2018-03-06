import * as React from "react";

import { LayoutAuthorized } from "../layouts/LayoutAuthorized";
import { MessageSignModal } from "../modals/SignMessageModal";
import { Menu } from "./Menu";
import { UserInfo } from "./UserInfo";

export const Dashboard = () => (
  <LayoutAuthorized menu={<Menu />}>
    <MessageSignModal />
    <h2>Dashboard</h2>
    <UserInfo />
  </LayoutAuthorized>
);
