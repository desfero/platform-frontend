import { ECurrency } from "@neufund/shared";
import {
  compose,
  lifecycle,
  StateHandler,
  withHandlers,
  withProps,
  withStateHandlers,
} from "recompose";

import { IPledge } from "../../../../../lib/api/eto/EtoPledgeApi.interfaces.unsafe";
import { actions } from "../../../../../modules/actions";
import { appConnect } from "../../../../../store";
import {
  CampaigningActivatedInvestorApprovedWidgetLayout,
  CampaigningFormState,
  ICampaigningActivatedInvestorWidgetLayoutProps,
} from "./CampaigningActivatedInvestorApprovedWidgetLayout";

export interface IExternalProps {
  etoId: string;
  minPledge: number;
  maxPledge?: number;
  pledge?: IPledge;
}

interface IDispatchProps {
  savePledge: (newPledge: IPledge) => void;
  deletePledge: () => void;
}

interface IHandlersProps {
  showMyEmail: (consentToRevealEmail: boolean) => void;
  backNow: (amount: number) => void;
  changePledge: () => void;
}

interface IWithProps {
  pledgedAmount: string;
}

type TLocalStateProps = {
  consentToRevealEmail: boolean;
  formState: CampaigningFormState;
  pledge?: IPledge;
};

type TLocalStateHandlersProps = {
  changeConsentToRevealEmail: StateHandler<TLocalStateProps>;
  moveToEdit: StateHandler<TLocalStateProps>;
  moveToView: StateHandler<TLocalStateProps>;
};

const CampaigningActivatedInvestorApprovedWidget = compose<
  ICampaigningActivatedInvestorWidgetLayoutProps,
  IExternalProps
>(
  appConnect<{}, IDispatchProps, IExternalProps>({
    dispatchToProps: (dispatch, props) => ({
      savePledge: (newPledge: IPledge) => {
        dispatch(actions.bookBuilding.savePledge(props.etoId, newPledge));
      },
      deletePledge: () => {
        dispatch(actions.bookBuilding.deletePledge(props.etoId));
      },
    }),
  }),
  withStateHandlers<
    TLocalStateProps,
    TLocalStateHandlersProps,
    TLocalStateProps & TLocalStateHandlersProps
  >(
    ({ pledge }: TLocalStateProps) => ({
      consentToRevealEmail: false,
      formState: pledge ? CampaigningFormState.VIEW : CampaigningFormState.EDIT,
    }),
    {
      changeConsentToRevealEmail: () => (consentToRevealEmail: boolean) => ({
        consentToRevealEmail,
      }),
      moveToEdit: () => () => ({ formState: CampaigningFormState.EDIT }),
      moveToView: () => () => ({ formState: CampaigningFormState.VIEW }),
    },
  ),
  lifecycle<TLocalStateHandlersProps & IExternalProps, {}>({
    componentDidUpdate(prevProps): void {
      const pledge = this.props.pledge;

      if (prevProps.pledge !== pledge) {
        if (pledge) {
          this.props.moveToView();
          this.props.changeConsentToRevealEmail(pledge.consentToRevealEmail);
        } else {
          this.props.moveToEdit();
          this.props.changeConsentToRevealEmail(false);
        }
      }
    },
  }),
  withProps<IWithProps, IExternalProps>(({ pledge }) => ({
    pledgedAmount: pledge ? pledge.amountEur.toString() : "",
  })),
  withHandlers<
    IExternalProps &
      IDispatchProps &
      TLocalStateProps &
      TLocalStateHandlersProps &
      TLocalStateProps,
    IHandlersProps
  >({
    showMyEmail: ({ pledge, savePledge, changeConsentToRevealEmail }) => (
      consentToRevealEmail: boolean,
    ) => {
      changeConsentToRevealEmail(consentToRevealEmail);

      // only save when already pledged
      if (pledge) {
        const newPledge: IPledge = { ...pledge, consentToRevealEmail };

        savePledge(newPledge);
      }
    },
    backNow: ({ savePledge, consentToRevealEmail }) => (amountEur: number) => {
      const newPledge: IPledge = {
        amountEur,
        consentToRevealEmail,
        currency: ECurrency.EUR_TOKEN,
      };

      savePledge(newPledge);
    },
    changePledge: ({ moveToEdit }) => moveToEdit,
  }),
)(CampaigningActivatedInvestorApprovedWidgetLayout);

export { CampaigningActivatedInvestorApprovedWidget };
