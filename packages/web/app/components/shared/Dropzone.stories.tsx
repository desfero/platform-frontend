import { storiesOf } from "@storybook/react";
import * as React from "react";

import { Dropzone } from "./Dropzone";

storiesOf("Dropzone", module)
  .add("default", () => <Dropzone name="dropzone" isUploading={false} />)
  .add("uploading", () => <Dropzone name="dropzone" isUploading={true} />)
  .add("disabled", () => <Dropzone name="dropzone" isUploading={false} disabled={true} />);
