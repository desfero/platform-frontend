import { Button, EButtonLayout } from "@neufund/design-system";
import { nonNullable, withParams } from "@neufund/shared-utils";
import { find } from "lodash";
import * as moment from "moment";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Container } from "reactstrap";
import { compose, setDisplayName } from "recompose";

import { externalRoutes } from "../../../../config/externalRoutes";
import { EEtoState } from "../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import {
  EEtoDocumentType,
  immutableDocumentName,
  TEtoDocumentTemplates,
} from "../../../../lib/api/eto/EtoFileApi.interfaces";
import { actions } from "../../../../modules/actions";
import {
  selectIssuerEtoDateToWhitelistMinDuration,
  selectIssuerEtoWithCompanyAndContract,
} from "../../../../modules/eto-flow/selectors";
import { InvalidETOStateError } from "../../../../modules/eto/errors";
import { isOnChain } from "../../../../modules/eto/utils";
import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TEtoSetDateAdditionalData } from "../../../../modules/tx/transactions/eto-flow/types";
import { ETxType } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { EtherscanAddressLink, ExternalLink } from "../../../shared/links";
import { TimeLeft } from "../../../shared/TimeLeft.unsafe";
import { InfoList } from "../shared/InfoList";
import { InfoRow } from "../shared/InfoRow";
import { SetDateDetails } from "./SetDateDetails";

interface IStateProps {
  additionalData: TEtoSetDateAdditionalData;
  changeableTill: moment.Moment;
  etoTermsAddress: string;
  etoCommitmentAddress: string;
  termsAgreementIPFSLink: string;
  equityTokenAddress: string;
  offeringAgreementIPFSLink: string;
}

interface IDispatchProps {
  onAccept: () => void;
}

type IProps = IStateProps & IDispatchProps;

const SetEtoDateSummaryComponent: React.FunctionComponent<IProps> = ({
  onAccept,
  etoTermsAddress,
  equityTokenAddress,
  offeringAgreementIPFSLink,
  etoCommitmentAddress,
  termsAgreementIPFSLink,
  additionalData,
  changeableTill,
}) => (
  <Container>
    <Heading className="mb-4" size={EHeadingSize.SMALL} level={4}>
      <FormattedMessage id="eto.settings.eto-start-date-summary.dates-title" />
    </Heading>

    <p className="mb-4">
      <FormattedMessage
        id="eto.status.onchain.change-eto-date-countdown-text"
        values={{
          timeLeft: (
            <i>
              <TimeLeft refresh={false} asUtc={true} finalTime={changeableTill.utc().toDate()} />
            </i>
          ),
        }}
      />
    </p>

    <SetDateDetails additionalData={additionalData} className="mb-4" />

    <Heading size={EHeadingSize.SMALL} level={4} className="mb-4">
      <FormattedMessage id="eto.settings.eto-start-date-summary.contracts-title" />
    </Heading>

    <p className="mb-4">
      <FormattedMessage id="eto.settings.eto-start-date-summary.contracts-description" />
    </p>

    <InfoList className="mb-4">
      <InfoRow
        caption={
          <FormattedMessage id="eto.settings.eto-start-date-summary.eto-commitment-contract-address" />
        }
        value={<EtherscanAddressLink address={etoCommitmentAddress} />}
      />
      <InfoRow
        caption={
          <FormattedMessage id="eto.settings.eto-start-date-summary.eto-terms-contract-address" />
        }
        value={
          <EtherscanAddressLink address={etoTermsAddress}>{etoTermsAddress}</EtherscanAddressLink>
        }
      />
      <InfoRow
        caption={<FormattedMessage id="eto.settings.eto-start-date-summary.equity-token-address" />}
        value={<EtherscanAddressLink address={equityTokenAddress} />}
      />
      <InfoRow
        caption={immutableDocumentName[EEtoDocumentType.APPROVED_INVESTOR_OFFERING_DOCUMENT]}
        value={
          <ExternalLink href={offeringAgreementIPFSLink}>{offeringAgreementIPFSLink}</ExternalLink>
        }
      />
      <InfoRow
        caption={immutableDocumentName[EEtoDocumentType.SIGNED_TERMSHEET]}
        value={<ExternalLink href={termsAgreementIPFSLink}>{termsAgreementIPFSLink}</ExternalLink>}
      />
    </InfoList>

    <div className="text-center">
      <Button
        layout={EButtonLayout.SECONDARY}
        type="button"
        onClick={onAccept}
        data-test-id="set-eto-date-summary-confirm-button"
      >
        <FormattedMessage id="eto.settings.confirm" />
      </Button>
    </div>
  </Container>
);

const SetEtoDateSummary = compose<IProps, {}>(
  setDisplayName("SetEtoDateSummary"),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => {
      const additionalData = nonNullable(selectTxAdditionalData<ETxType.ETO_SET_DATE>(state));

      const minDuration = selectIssuerEtoDateToWhitelistMinDuration(state);
      const changeableTill = moment(additionalData.newStartDate).subtract(minDuration, "seconds");

      const eto = nonNullable(selectIssuerEtoWithCompanyAndContract(state));
      const termsDoc = nonNullable(
        find<TEtoDocumentTemplates>(eto.documents, [
          "documentType",
          EEtoDocumentType.SIGNED_TERMSHEET,
        ]),
      );
      const offeringDoc = nonNullable(
        find<TEtoDocumentTemplates>(eto.documents, [
          "documentType",
          EEtoDocumentType.APPROVED_INVESTOR_OFFERING_DOCUMENT,
        ]),
      );
      const offeringAgreementIPFSLink = withParams(externalRoutes.ipfsDocument, {
        ipfsHash: offeringDoc.ipfsHash,
      });
      const termsAgreementIPFSLink = withParams(externalRoutes.ipfsDocument, {
        ipfsHash: termsDoc.ipfsHash,
      });

      if (!isOnChain(eto)) {
        throw new InvalidETOStateError(eto.state, EEtoState.ON_CHAIN);
      }

      return {
        etoTermsAddress: eto.contract.etoTermsAddress,
        equityTokenAddress: eto.contract.equityTokenAddress,
        etoCommitmentAddress: eto.etoId,
        additionalData,
        offeringAgreementIPFSLink,
        termsAgreementIPFSLink,
        changeableTill,
      };
    },
    dispatchToProps: d => ({
      onAccept: () => d(actions.txSender.txSenderAccept()),
    }),
  }),
)(SetEtoDateSummaryComponent);

export { SetEtoDateSummaryComponent, SetEtoDateSummary };
