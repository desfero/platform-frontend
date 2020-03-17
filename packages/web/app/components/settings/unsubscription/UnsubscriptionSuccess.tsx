import { Button, EButtonLayout } from "@neufund/design-system";
import { withContainer } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose, withProps } from "recompose";

import { actions } from "../../../modules/actions";
import { appConnect } from "../../../store";
import { EContentWidth } from "../../layouts/Content";
import { Layout } from "../../layouts/Layout";
import { createErrorBoundary } from "../../shared/errorBoundary/ErrorBoundary.unsafe";
import { ErrorBoundaryLayout } from "../../shared/errorBoundary/ErrorBoundaryLayout";
import { Heading } from "../../shared/Heading";

import * as styles from "./UnsubscriptionModule.module.scss";

interface IDispatchProps {
  goToHome: () => void;
}

const UnsubscriptionSuccessLayout: React.FunctionComponent<IDispatchProps> = ({ goToHome }) => (
  <section className={styles.container} data-test-id="unsubscription.success">
    <Heading level={1} titleClassName={styles.header} decorator={false}>
      <FormattedMessage id="settings.unsubscription.success" />
    </Heading>

    <p className={styles.description}>
      <FormattedMessage id="settings.unsubscription.success.description" />
    </p>

    <Button onClick={goToHome} layout={EButtonLayout.PRIMARY}>
      <FormattedMessage id="settings.unsubscription.visit" />
    </Button>
  </section>
);

const UnsubscriptionSuccess = compose<IDispatchProps, {}>(
  appConnect<{}, IDispatchProps>({
    dispatchToProps: dispatch => ({
      goToHome: () => dispatch(actions.routing.goHome()),
    }),
  }),
  createErrorBoundary(ErrorBoundaryLayout),
  withContainer(
    withProps<React.ComponentProps<typeof Layout>, {}>({
      width: EContentWidth.FULL,
    })(Layout),
  ),
)(UnsubscriptionSuccessLayout);

export { UnsubscriptionSuccessLayout, UnsubscriptionSuccess };
