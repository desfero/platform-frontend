import { DeepPartial } from "@neufund/shared-utils";
import { StackHeaderProps } from "@react-navigation/stack";
import { storiesOf } from "@storybook/react-native";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import * as React from "react";

import { ModalStackHeaderLevel2 } from "./ModalStackHeaderLevel2";

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

storiesOf("Molecules|ModalStackHeaderLevel2", module)
  .add("without title", () => <ModalStackHeaderLevel2 {...(defaultProps as StackHeaderProps)} />)
  .add("with title", () => <ModalStackHeaderLevel2 {...(withTitleProps as StackHeaderProps)} />);
