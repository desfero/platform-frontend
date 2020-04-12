import { storiesOf } from "@storybook/react";
import * as React from "react";

import { dummyEthereumAddressWithChecksum } from "../../../test/fixtures";
import { EUserType } from "../../lib/api/users/interfaces";
import { TAppGlobalState } from "../../store";
import { DeepPartial } from "../../types";
import { withStore } from "../../utils/react-connected-components/storeDecorator.unsafe";
import { EContentWidth } from "./Content";
import { LayoutComponent, TransitionalLayout } from "./Layout";

const FakeContent = () => (
  <div style={{ height: "20rem", backgroundColor: "gray" }}>dummy content</div>
);

const authStore: DeepPartial<TAppGlobalState> = {
  auth: {
    jwt: "asdf",
    user: {
      type: EUserType.ISSUER,
      verifiedEmail: "asfasdf@asdf.de",
    },
  },
  kyc: {
    claims: {
      isVerified: true,
    },
  },
  web3: {
    connected: true,
    wallet: {
      address: dummyEthereumAddressWithChecksum,
    },
  },
};

const unauthStore: DeepPartial<TAppGlobalState> = {
  auth: {
    user: {
      type: EUserType.ISSUER,
      verifiedEmail: "asfasdf@asdf.de",
    },
  },
  kyc: {
    claims: {
      isVerified: true,
    },
  },
  web3: {
    connected: true,
    wallet: {
      address: dummyEthereumAddressWithChecksum,
    },
  },
};

storiesOf("Templates|Layouts/Layout", module)
  .add(
    "LayoutAuthorized",
    () => (
      <LayoutComponent userIsAuthorized={true}>
        <FakeContent />
      </LayoutComponent>
    ),
    {
      decorators: [withStore(authStore)],
    },
  )
  .add(
    "LayoutAuthorized with full width content",
    () => (
      <LayoutComponent userIsAuthorized={true} width={EContentWidth.FULL}>
        <FakeContent />
      </LayoutComponent>
    ),
    {
      decorators: [withStore(authStore)],
    },
  )
  .add(
    "LayoutUnauthorized",
    () => (
      <LayoutComponent userIsAuthorized={false}>
        <FakeContent />
      </LayoutComponent>
    ),
    {
      decorators: [withStore(unauthStore)],
    },
  )
  .add(
    "TransitionalLayout",
    () => (
      <TransitionalLayout isLoginRoute={true} showLogoutReason={false}>
        <FakeContent />
      </TransitionalLayout>
    ),
    {
      decorators: [withStore(unauthStore)],
    },
  );
