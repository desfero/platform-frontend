import { noopLogger } from "@neufund/shared-modules";
import { RESULTS } from "react-native-permissions/lib/commonjs/constants";

import { Permissions } from "./Permissions";

describe("Permissions", () => {
  let permissions: Permissions;

  beforeEach(() => {
    permissions = new Permissions(noopLogger);
  });

  it("should ask for push notifications permissions", async () => {
    const notificationsAllowed = await permissions.requestNotificationsPermissions();
    expect(notificationsAllowed.status).toBe(RESULTS.GRANTED);
  });
});
