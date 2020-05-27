import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react-native";
import * as React from "react";
import { View } from "react-native";

import { LineBreak } from "../LineBreak";
import { Button, EButtonLayout } from "./Button";

storiesOf("Atoms|Button", module)
  .addDecorator((story: () => React.ReactNode) => <View style={{ padding: 20 }}>{story()}</View>)
  .add("primary", () => (
    <>
      <Button layout={EButtonLayout.PRIMARY} onPress={action("onPress")}>
        Default
      </Button>

      <LineBreak />

      <Button layout={EButtonLayout.PRIMARY} disabled onPress={action("onPress")}>
        Disabled
      </Button>

      <LineBreak />

      <Button layout={EButtonLayout.PRIMARY} loading onPress={action("onPress")}>
        Default
      </Button>
    </>
  ))
  .add("secondary", () => (
    <>
      <Button layout={EButtonLayout.SECONDARY} onPress={action("onPress")}>
        Default
      </Button>

      <LineBreak />

      <Button layout={EButtonLayout.SECONDARY} disabled onPress={action("onPress")}>
        Disabled
      </Button>

      <LineBreak />

      <Button layout={EButtonLayout.SECONDARY} loading onPress={action("onPress")}>
        Default
      </Button>
    </>
  ))
  .add("text", () => (
    <>
      <Button layout={EButtonLayout.TEXT} onPress={action("onPress")}>
        Default
      </Button>

      <LineBreak />

      <Button layout={EButtonLayout.TEXT} disabled onPress={action("onPress")}>
        Disabled
      </Button>

      <LineBreak />

      <Button layout={EButtonLayout.TEXT} loading onPress={action("onPress")}>
        Default
      </Button>
    </>
  ))
  .add("text dark", () => (
    <>
      <Button layout={EButtonLayout.TEXT_DARK} onPress={action("onPress")}>
        Default
      </Button>

      <LineBreak />

      <Button layout={EButtonLayout.TEXT_DARK} disabled onPress={action("onPress")}>
        Disabled
      </Button>

      <LineBreak />

      <Button layout={EButtonLayout.TEXT_DARK} loading onPress={action("onPress")}>
        Default
      </Button>
    </>
  ));
