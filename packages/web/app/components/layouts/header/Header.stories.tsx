import { EUserType } from "@neufund/shared-modules";
import { DeepPartial } from "@neufund/shared-utils";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { TAppGlobalState } from "../../../store";
import { withStore } from "../../../utils/react-connected-components/storeDecorator.unsafe";
import { HeaderAuthorized, HeaderTransitional, HeaderUnauthorized } from "./Header";

const authStoreInvestor = {
  auth: {
    jwt: "asdf",
    user: {
      type: EUserType.INVESTOR,
      verifiedEmail: "asfasdf@asdf.de",
    },
  },
};

const authStoreIssuer = {
  auth: {
    jwt: "asdf",
    user: {
      type: EUserType.ISSUER,
      verifiedEmail: "asfasdf@asdf.de",
    },
  },
};

storiesOf("Layout/Header for investor", module)
  .addDecorator(withStore(authStoreInvestor as DeepPartial<TAppGlobalState>))
  .add("default", () => (
    <>
      <HeaderAuthorized />
    </>
  ));

storiesOf("Layout/Header for issuer", module)
  .addDecorator(withStore(authStoreIssuer as DeepPartial<TAppGlobalState>))
  .add("default", () => (
    <>
      <HeaderAuthorized />
    </>
  ));

storiesOf("Layout/Header unauthorized", module).add("default", () => (
  <>
    <HeaderUnauthorized />
  </>
));

storiesOf("Layout/Header transitional", module)
  .add("login route", () => (
    <>
      <HeaderTransitional isLoginRoute={true} />
    </>
  ))
  .add("register route", () => (
    <>
      <HeaderTransitional isLoginRoute={false} />
    </>
  ));
