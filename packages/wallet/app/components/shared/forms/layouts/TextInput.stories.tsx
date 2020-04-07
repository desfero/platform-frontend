import * as React from "react";
import { storiesOf } from "@storybook/react-native";
import { View } from "react-native";

import { LineBreak } from "../../LineBreak";
import { TextInput } from "./TextInput";

storiesOf("Atoms|TextInput", module).add("default", () => (
  <View style={{ padding: 10 }}>
    <TextInput placeholder="Type here..." />

    <LineBreak />

    <TextInput autoFocus={true} placeholder="Type here..." />

    <LineBreak />

    <TextInput defaultValue="Hello world" />

    <LineBreak />

    <TextInput disabled={true} defaultValue="Hello world" />

    <LineBreak />

    <TextInput invalid={true} defaultValue="Hello world" />
  </View>
));