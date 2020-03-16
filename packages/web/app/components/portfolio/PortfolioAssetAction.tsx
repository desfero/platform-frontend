import { Button, EButtonLayout } from "@neufund/design-system";
import { ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedRelative } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";

import { nonNullable } from "../../../../shared/dist/utils/nonNullable";
import { actions } from "../../modules/actions";
import { selectEtoWithCompanyAndContractById } from "../../modules/eto/selectors";
import { EETOStateOnChain, TEtoWithCompanyAndContractReadonly } from "../../modules/eto/types";
import { getInvestmentCalculatedPercentage } from "../../modules/eto/utils";
import { appConnect } from "../../store";
import { FormatNumber } from "../shared/formatters/FormatNumber";

type TExternalProps = {
  state: EETOStateOnChain;
  etoId: string;
};

interface IDispatchProps {
  onClaim: (etoId: string) => void;
  onRefund: (etoId: string) => void;
}

interface IStateProps {
  eto: TEtoWithCompanyAndContractReadonly;
}

const PortfolioAssetActionComponent: React.FunctionComponent<TExternalProps &
  IDispatchProps &
  IStateProps> = ({ state, etoId, onClaim, eto, onRefund }) => {
  switch (state) {
    case EETOStateOnChain.Claim:
    case EETOStateOnChain.Payout:
      return (
        <Button
          onClick={() => onClaim(etoId)}
          layout={EButtonLayout.PRIMARY}
          data-test-id={"modals.portfolio.portfolio-asset-action.claim-" + etoId}
        >
          <FormattedMessage id="portfolio.section.reserved-assets.claim-tokens" />
        </Button>
      );
    case EETOStateOnChain.Refund:
      return (
        <Button onClick={() => onRefund(etoId)} layout={EButtonLayout.PRIMARY}>
          <FormattedMessage id="portfolio.section.reserved-assets.refund" />
        </Button>
      );
    case EETOStateOnChain.Signing:
      return (
        <Button layout={EButtonLayout.OUTLINE} disabled>
          <FormattedMessage id="portfolio.section.reserved-assets.wait-for-update" />
        </Button>
      );

    case EETOStateOnChain.Public:
    case EETOStateOnChain.Whitelist:
      const currentInvestmentProgressPercentage = nonNullable(
        getInvestmentCalculatedPercentage(eto),
      );

      return (
        <FormattedMessage
          id="portfolio.section.reserved-assets.ends-in"
          values={{
            percentageFunded: (
              <strong>
                <FormatNumber
                  value={currentInvestmentProgressPercentage}
                  inputFormat={ENumberInputFormat.FLOAT}
                  outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
                  decimalPlaces={2}
                />
                %
              </strong>
            ),
            endsIn: (
              <FormattedRelative
                value={eto.contract!.startOfStates[EETOStateOnChain.Signing]!}
                style="numeric"
                initialNow={new Date()}
              />
            ),
          }}
        />
      );

    default:
      return null;
  }
};

const PortfolioAssetAction = appConnect<IStateProps, IDispatchProps, TExternalProps>({
  stateToProps: (state, props) => ({
    eto: selectEtoWithCompanyAndContractById(state, props.etoId)!,
  }),
  dispatchToProps: dispatch => ({
    onClaim: (etoId: string) => dispatch(actions.txTransactions.startUserClaim(etoId)),
    onRefund: (etoId: string) => dispatch(actions.txTransactions.startInvestorRefund(etoId)),
  }),
})(PortfolioAssetActionComponent);

export { PortfolioAssetAction };
