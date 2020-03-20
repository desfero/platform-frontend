import { storiesOf } from "@storybook/react";
import * as React from "react";

import { CircleButton, ECircleButtonIconPosition, ECircleButtonLayout } from "./CircleButton";

import icon from "../../assets/img/inline_icons/download.svg";

type TGenerateStoryProps = {
  layout: ECircleButtonLayout;
};

const GenerateStory: React.FunctionComponent<TGenerateStoryProps> = ({ layout }) => (
  <>
    <CircleButton layout={layout}>Normal</CircleButton>
    <br />
    <br />
    <CircleButton layout={layout} isActive={true}>
      Active
    </CircleButton>
    <br />
    <br />
    <CircleButton layout={layout} autoFocus>
      Focused
    </CircleButton>
    <br />
    <br />
    <CircleButton layout={layout} disabled>
      Disabled
    </CircleButton>
    <br />
    <br />
    <CircleButton
      layout={layout}
      svgIcon={icon}
      iconPosition={ECircleButtonIconPosition.ICON_BEFORE}
    >
      icon before text
    </CircleButton>
    <br />
    <br />
    <CircleButton
      layout={layout}
      svgIcon={icon}
      iconPosition={ECircleButtonIconPosition.ICON_AFTER}
    >
      icon after text
    </CircleButton>
    <br />
    <br />
    <CircleButton layout={layout} svgIcon={icon} iconProps={{ alt: "Do something" }} />
  </>
);

storiesOf("NDS|Atoms/CircleButton", module)
  .add("secondary", () => <GenerateStory layout={ECircleButtonLayout.SECONDARY} />)
  .add("danger", () => <GenerateStory layout={ECircleButtonLayout.DANGER} />);
