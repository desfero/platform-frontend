import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { FullscreenProgressLayout } from "./FullscreenProgressLayout";

const buttonProps = {
  buttonText: "Lorem ipsum",
  buttonAction: action("BUTTON_ACTION"),
};

storiesOf("Templates|Layouts/FullscreenProgressLayout", module)
  .add("default", () => <FullscreenProgressLayout>Dummy content</FullscreenProgressLayout>)
  .add("default with progress", () => (
    <FullscreenProgressLayout progress={50}>Dummy content</FullscreenProgressLayout>
  ))
  .add("with action", () => (
    <FullscreenProgressLayout buttonProps={buttonProps}>Dummy content</FullscreenProgressLayout>
  ))
  .add("with action and progress", () => (
    <FullscreenProgressLayout progress={50} buttonProps={buttonProps}>
      Dummy content
    </FullscreenProgressLayout>
  ));
