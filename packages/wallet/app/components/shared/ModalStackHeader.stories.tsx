import { DeepPartial } from "@neufund/shared-utils";
import { StackHeaderProps } from "@react-navigation/stack";
import { storiesOf } from "@storybook/react-native";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import * as React from "react";

import { ModalStackHeader } from "./ModalStackHeader";

const defaultProps: DeepPartial<StackHeaderProps> = {
  scene: {
    route: { key: "ImportWallet-2NdnKXXq0" },
    descriptor: {
      options: {
        headerStatusBarHeight: 0,
      },
    },
  },
  insets: { top: 44 },
  previous: {},
};

const withTitleProps: DeepPartial<StackHeaderProps> = set(
  cloneDeep(defaultProps),
  "scene.descriptor.options.title",
  "Import Wallet",
);

storiesOf("Molecules|ModalStackHeader", module)
  .add("without title", () => <ModalStackHeader {...(defaultProps as StackHeaderProps)} />)
  .add("with title", () => {
    return <ModalStackHeader {...(withTitleProps as StackHeaderProps)} />;
  });
