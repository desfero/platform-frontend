import { Eur } from "@neufund/design-system";
import { assertNever, EAbbreviatedNumberOutputFormat, ENumberInputFormat, ERoundingMode } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose, setDisplayName, withProps } from "recompose";

import { selectIsAuthorized, selectIsInvestor } from "../../../../../modules/auth/selectors";
import { selectBookbuildingStatsFromList } from "../../../../../modules/bookbuilding-flow/selectors";
import {
  calculateWhitelistingState,
  EWhitelistingState,
} from "../../../../../modules/bookbuilding-flow/utils";
import { TEtoWithCompanyAndContractReadonly } from "../../../../../modules/eto/types";
import { appConnect } from "../../../../../store";
import { LoadingIndicator } from "../../../../shared/loading-indicator/LoadingIndicator";
import { GreyInfo, Info } from "../Info";
import { WhitelistStatus } from "./WhitelistStatus";

export interface IExternalProps {
  eto: TEtoWithCompanyAndContractReadonly;
}

interface IStateProps {
  pledgedAmount: number | null;
  investorsCount: number;
  isAuthorized: boolean;
  isInvestor: boolean;
}

interface IWithProps {
  whitelistingState: EWhitelistingState;
}

type IProps = IExternalProps & IStateProps & IWithProps;

const WhitelistLayout: React.FunctionComponent<IProps> = ({
  eto,
  pledgedAmount,
  investorsCount,
  whitelistingState,
}) => {
  switch (whitelistingState) {
    case EWhitelistingState.NOT_ACTIVE:
      return (
        <Info>
          <FormattedMessage id="eto-overview-thumbnail.whitelist.is-not-started" />
        </Info>
      );

    case EWhitelistingState.ACTIVE:
      return (
        <>
          <WhitelistStatus
            pledgedAmount={pledgedAmount}
            investorsCount={investorsCount}
            investorsLimit={eto.maxPledges}
          />

          <Info>
            <FormattedMessage id="eto-overview-thumbnail.whitelist.is-open" />
          </Info>
        </>
      );

    case EWhitelistingState.LIMIT_REACHED:
      return (
        <GreyInfo
          upperText={
            <FormattedMessage
              id="eto-overview-thumbnail.whitelist.limit-reached"
              values={{
                maxPledges: eto.maxPledges,
              }}
            />
          }
          lowerText={
            <FormattedMessage
              id="eto-overview-thumbnail.whitelist.committed-amount"
              values={{
                pledgedAmount: (
                  <Eur
                    value={pledgedAmount ? pledgedAmount.toString() : null}
                    inputFormat={ENumberInputFormat.FLOAT}
                    outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
                    roundingMode={ERoundingMode.HALF_UP}
                  />
                ),
              }}
            />
          }
        />
      );

    case EWhitelistingState.STOPPED:
    case EWhitelistingState.SUSPENDED:
      return (
        <GreyInfo
          upperText={
            <FormattedMessage
              id="eto-overview-thumbnail.whitelist.closed"
              values={{
                maxPledges: eto.maxPledges,
                pledgesCount: investorsCount,
              }}
            />
          }
          lowerText={
            <FormattedMessage
              id="eto-overview-thumbnail.whitelist.committed-amount"
              values={{
                pledgedAmount: (
                  <Eur
                    value={pledgedAmount ? pledgedAmount.toString() : null}
                    outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
                    roundingMode={ERoundingMode.HALF_UP}
                  />
                ),
              }}
            />
          }
        />
      );
    case EWhitelistingState.LOADING:
      return <LoadingIndicator />;
    default:
      return assertNever(whitelistingState);
  }
};

const Whitelist = compose<IProps, IExternalProps>(
  appConnect<IStateProps, {}, IExternalProps>({
    stateToProps: (state, props) => {
      const stats = selectBookbuildingStatsFromList(state, props.eto.etoId);

      return {
        pledgedAmount: stats ? stats.pledgedAmount : null,
        investorsCount: stats ? stats.investorsCount : 0,
        isAuthorized: selectIsAuthorized(state),
        isInvestor: selectIsInvestor(state),
      };
    },
  }),
  withProps<IWithProps, IStateProps & IExternalProps>(
    ({ eto, investorsCount, isAuthorized, isInvestor }) => {
      const bookbuildingLimitReached = eto.maxPledges - investorsCount <= 0;

      return {
        whitelistingState: calculateWhitelistingState({
          canEnableBookbuilding: eto.canEnableBookbuilding,
          whitelistingIsActive: eto.isBookbuilding,
          bookbuildingLimitReached,
          investorsCount,
          investmentCalculatedValues: eto.investmentCalculatedValues,
          isAuthorized,
          isInvestor,
        }),
      };
    },
  ),
  setDisplayName("Whitelist"),
)(WhitelistLayout);

export { Whitelist, WhitelistLayout };
