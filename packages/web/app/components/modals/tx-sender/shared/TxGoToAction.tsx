import { ButtonArrowRight, EButtonLayout } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { actions } from "../../../../modules/actions";
import { ETxSenderType } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";

interface IExternalProps {
  type: ETxSenderType;
}

interface IDispatchProps {
  goToWallet: () => void;
}

type TComponentProps = IExternalProps & IDispatchProps;

const TxGoToActionLayout: React.FunctionComponent<TComponentProps> = ({ type, goToWallet }) => {
  switch (type) {
    case ETxSenderType.INVESTOR_REFUND:
      return (
        <ButtonArrowRight
          onClick={goToWallet}
          layout={EButtonLayout.GHOST}
          data-test-id="modals.shared.tx-action.go-to-wallet"
        >
          <FormattedMessage id="modals.shared.tx-action.go-to-wallet" />
        </ButtonArrowRight>
      );
    default:
      return null;
  }
};

const TxGoToAction = compose<TComponentProps, IExternalProps>(
  appConnect<{}, IDispatchProps>({
    dispatchToProps: dispatch => ({
      goToWallet: () => dispatch(actions.routing.goToWallet()),
    }),
  }),
)(TxGoToActionLayout);

export { TxGoToAction, TxGoToActionLayout };
