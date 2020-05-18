import { storiesOf } from "@storybook/react";
import * as React from "react";

import { IconWithBadge } from "./IconWithBadge";

import tokenIcon from "../../assets/img/token_icon.svg";

storiesOf("NDS|Atoms/IconWithBadge", module).add("default", () => (
  <IconWithBadge
    icon={tokenIcon}
    badge={tokenIcon}
     />
));

