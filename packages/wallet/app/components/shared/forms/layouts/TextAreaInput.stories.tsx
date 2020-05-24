import { storiesOf } from "@storybook/react-native";
import * as React from "react";
import { View } from "react-native";

import { LineBreak } from "../../LineBreak";
import { TextAreaInput } from "./TextAreaInput";

storiesOf("Atoms|TextAreaInput", module).add("default", () => (
  <View style={{ padding: 10 }}>
    <TextAreaInput placeholder="Type here..." />

    <LineBreak />

    <TextAreaInput autoFocus={true} placeholder="Type here..." />

    <LineBreak />

    <TextAreaInput defaultValue="Hello world" placeholder="Type here..." />

    <LineBreak />

    <TextAreaInput disabled={true} defaultValue="Hello world" />

    <LineBreak />

    <TextAreaInput invalid={true} defaultValue="Hello world" />
  </View>
));
