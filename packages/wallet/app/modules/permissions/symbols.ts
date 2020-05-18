import { createLibSymbol } from "@neufund/shared-modules";

import { Permissions } from "./Permissions";

export const symbols = {
  permissions: createLibSymbol<Permissions>("permissions"),
};
