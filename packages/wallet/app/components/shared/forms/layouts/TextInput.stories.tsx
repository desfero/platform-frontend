import { storiesOf } from "@storybook/react-native";
import * as React from "react";
import { View } from "react-native";

import { LineBreak } from "components/shared/LineBreak";

import { TextInput } from "./TextInput";

storiesOf("Atoms|TextInput", module).add("default", () => (
  <View style={{ padding: 10 }}>
    <TextInput placeholder="Type here..." />

    <LineBreak />

    <TextInput autoFocus placeholder="Type here..." />

    <LineBreak />

    <TextInput defaultValue="Hello world" />

    <LineBreak />

    <TextInput disabled defaultValue="Hello world" />

    <LineBreak />

    <TextInput invalid defaultValue="Hello world" />
  </View>
));
