import { storiesOf } from "@storybook/react-native";
import * as React from "react";
import { View } from "react-native";

import { LineBreak } from "components/shared/LineBreak";

import { TextAreaInput } from "./TextAreaInput";

storiesOf("Atoms|TextAreaInput", module).add("default", () => (
  <View style={{ padding: 10 }}>
    <TextAreaInput placeholder="Type here..." />

    <LineBreak />

    <TextAreaInput autoFocus placeholder="Type here..." />

    <LineBreak />

    <TextAreaInput defaultValue="Hello world" placeholder="Type here..." />

    <LineBreak />

    <TextAreaInput disabled defaultValue="Hello world" />

    <LineBreak />

    <TextAreaInput invalid defaultValue="Hello world" />
  </View>
));
