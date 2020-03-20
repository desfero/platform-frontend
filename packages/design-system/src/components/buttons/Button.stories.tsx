import { storiesOf } from "@storybook/react";
import * as React from "react";

import { BlockWrapper, InlineBlockWrapper, PaddedWrapper } from "../../storybook-decorators";
import {
  Button,
  EButtonLayout,
  EButtonSize,
  EButtonWidth,
  EIconPosition,
  TButtonProps,
} from "./Button";
import ButtonReadme from "./Button.md";

import icon from "../../assets/img/inline_icons/download.svg";

type TGenerateStoryProps = {
  title?: string;
};

const GenerateStory: React.FunctionComponent<TGenerateStoryProps & TButtonProps> = ({
  title,
  ...props
}) => {
  const Wrapper = props.width === EButtonWidth.BLOCK ? BlockWrapper : InlineBlockWrapper;

  return (
    <>
      {title && <h6>{title}</h6>}
      <br />
      <Wrapper>
        <Button layout={EButtonLayout.PRIMARY} {...props}>
          Primary
        </Button>
      </Wrapper>
      <Wrapper>
        <Button layout={EButtonLayout.SECONDARY} {...props}>
          Secondary
        </Button>
      </Wrapper>
      <Wrapper>
        <Button layout={EButtonLayout.OUTLINE} {...props}>
          Outline
        </Button>
      </Wrapper>
      <Wrapper>
        <Button layout={EButtonLayout.GHOST} {...props}>
          Ghost
        </Button>
      </Wrapper>
      <br />
      <br />
    </>
  );
};

storiesOf("NDS|Molecules/Button", module)
  .addParameters({
    readme: {
      sidebar: ButtonReadme,
    },
  })
  .add("Types", () => (
    <PaddedWrapper>
      <GenerateStory title="" size={EButtonSize.SMALL} />
    </PaddedWrapper>
  ))
  .add("Sizes", () => (
    <PaddedWrapper>
      <GenerateStory title="Extra small" size={EButtonSize.EXTRA_SMALL} />
      <GenerateStory title="Small" size={EButtonSize.SMALL} />
      <GenerateStory title="Normal" size={EButtonSize.NORMAL} />
      <GenerateStory title="Huge" size={EButtonSize.HUGE} />
      <GenerateStory title="Dynamic" size={EButtonSize.DYNAMIC} />
    </PaddedWrapper>
  ))
  .add("Width", () => (
    <PaddedWrapper>
      <GenerateStory title="Normal" width={EButtonWidth.NORMAL} />
      <GenerateStory title="No padding" width={EButtonWidth.NO_PADDING} />
      <GenerateStory title="Block" width={EButtonWidth.BLOCK} />
    </PaddedWrapper>
  ))
  .add("States", () => (
    <PaddedWrapper>
      <GenerateStory title="Pressed" isActive />
      <GenerateStory title="Focused" autoFocus />
      <GenerateStory title="Disabled" disabled />
      <GenerateStory title="Loading" isLoading />
    </PaddedWrapper>
  ))
  .add("With Icon", () => (
    <PaddedWrapper>
      <GenerateStory title="Before text" svgIcon={icon} iconPosition={EIconPosition.ICON_BEFORE} />
      <GenerateStory title="After text" svgIcon={icon} iconPosition={EIconPosition.ICON_AFTER} />
      <GenerateStory title="Disabled" svgIcon={icon} iconProps={{ alt: "Do something" }} />
      <GenerateStory
        title="Loading"
        svgIcon={icon}
        isLoading={true}
        iconProps={{ alt: "Do something" }}
      />
    </PaddedWrapper>
  ))
  .add("With Icon - no padding", () => (
    <PaddedWrapper>
      <GenerateStory
        title="Before text"
        svgIcon={icon}
        iconPosition={EIconPosition.ICON_BEFORE}
        width={EButtonWidth.NO_PADDING}
      />
      <GenerateStory
        title="After text"
        svgIcon={icon}
        iconPosition={EIconPosition.ICON_AFTER}
        width={EButtonWidth.NO_PADDING}
      />
      <GenerateStory
        title="Disabled"
        svgIcon={icon}
        iconProps={{ alt: "Do something" }}
        width={EButtonWidth.NO_PADDING}
      />
      <GenerateStory
        title="Loading"
        svgIcon={icon}
        isLoading={true}
        iconProps={{ alt: "Do something" }}
        width={EButtonWidth.NO_PADDING}
      />
    </PaddedWrapper>
  ))
  .add("With Icon - block", () => (
    <PaddedWrapper>
      <GenerateStory
        title="Before text"
        svgIcon={icon}
        iconPosition={EIconPosition.ICON_BEFORE}
        width={EButtonWidth.BLOCK}
      />
      <GenerateStory
        title="After text"
        svgIcon={icon}
        iconPosition={EIconPosition.ICON_AFTER}
        width={EButtonWidth.BLOCK}
      />
      <GenerateStory
        title="Disabled"
        svgIcon={icon}
        iconProps={{ alt: "Do something" }}
        width={EButtonWidth.BLOCK}
      />
      <GenerateStory
        title="Loading"
        svgIcon={icon}
        isLoading={true}
        iconProps={{ alt: "Do something" }}
        width={EButtonWidth.BLOCK}
      />
    </PaddedWrapper>
  ));
