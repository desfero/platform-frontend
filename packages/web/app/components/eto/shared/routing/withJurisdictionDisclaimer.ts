import { actions } from "../../../../modules/actions";
import { onEnterAction } from "../../../../utils/react-connected-components/OnEnterAction";

export const withJurisdictionDisclaimer = <P extends object>(
  getPreviewCode: (props: P) => string,
) =>
  onEnterAction<P>({
    actionCreator: (dispatch, props) => {
      dispatch(actions.eto.verifyEtoAccess(getPreviewCode(props)));
    },
  });
