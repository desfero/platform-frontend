import { Button, EButtonLayout, EButtonWidth } from "@neufund/design-system";
import { map } from "lodash/fp";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Container } from "reactstrap";

import {
  EEtoDocumentType,
  IEtoDocument,
  immutableDocumentName,
} from "../../../../lib/api/eto/EtoFileApi.interfaces";
import { IImmutableFileId } from "../../../../lib/api/immutable-storage/ImmutableStorage.interfaces";
import { actions } from "../../../../modules/actions";
import { selectPendingDownloads } from "../../../../modules/immutable-file/selectors";
import { selectMyInvestorTicketByEtoId } from "../../../../modules/investor-portfolio/selectors";
import { TETOWithInvestorTicket } from "../../../../modules/investor-portfolio/types";
import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TClaimAdditionalData } from "../../../../modules/tx/transactions/claim/types";
import { ETxType } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";
import { getInvestorDocumentTitles } from "../../../documents/utils";
import { DocumentLabel } from "../../../shared/DocumentLink";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { InfoRow } from "../shared/InfoRow";
import { ClaimTransactionDetails } from "./ClaimTransactionDetails";
import { SummaryForm } from "./SummaryForm.unsafe";

import iconDownload from "../../../../assets/img/inline_icons/download.svg";
import * as styles from "./Summary.module.scss";

interface IStateProps {
  additionalData: TClaimAdditionalData;
  etoData: TETOWithInvestorTicket;
  pendingDownloads: ReturnType<typeof selectPendingDownloads>;
}

interface IDispatchProps {
  onAccept: () => void;
  downloadDocument: (immutableFileId: IImmutableFileId, fileName: string) => void;
  generateTemplateByEtoId: (immutableFileId: IEtoDocument, etoId: string) => void;
}

type TComponentProps = IStateProps & IDispatchProps;

export const UserClaimSummaryComponent: React.FunctionComponent<TComponentProps> = ({
  etoData,
  additionalData,
  onAccept,
  downloadDocument,
  generateTemplateByEtoId,
  pendingDownloads,
}) => (
  <Container>
    <Heading className="mb-4" size={EHeadingSize.SMALL} level={4}>
      <FormattedMessage id="user-claim-flow.summary" />
    </Heading>

    <p className="mb-3">
      <FormattedMessage id="user-claim-flow.summary.explanation" />
    </p>

    <ClaimTransactionDetails additionalData={additionalData} className="mb-4">
      {/* Based on https://github.com/Neufund/platform-frontend/issues/2102#issuecomment-453086304 */}
      {map(
        (document: IEtoDocument) =>
          [EEtoDocumentType.SIGNED_INVESTMENT_AND_SHAREHOLDER_AGREEMENT].includes(
            document.documentType,
          ) ? (
            <InfoRow
              key={document.ipfsHash}
              caption={
                <DocumentLabel
                  title={
                    getInvestorDocumentTitles(etoData.product.offeringDocumentType)[
                      document.documentType
                    ]
                  }
                />
              }
              value={
                <Button
                  className={styles.icon}
                  svgIcon={iconDownload}
                  layout={EButtonLayout.LINK}
                  iconProps={{
                    alt: <FormattedMessage id="common.download" />,
                  }}
                  width={EButtonWidth.NO_PADDING}
                  disabled={pendingDownloads[document.ipfsHash]}
                  data-test-id="token-claim-agreements"
                  onClick={() =>
                    downloadDocument(
                      {
                        ipfsHash: document.ipfsHash,
                        mimeType: document.mimeType,
                        asPdf: true,
                      },
                      immutableDocumentName[document.documentType],
                    )
                  }
                />
              }
            />
          ) : null,
        etoData.documents,
      )}
      {map(
        (template: IEtoDocument) =>
          [
            EEtoDocumentType.COMPANY_TOKEN_HOLDER_AGREEMENT,
            EEtoDocumentType.RESERVATION_AND_ACQUISITION_AGREEMENT,
          ].includes(template.documentType) ? (
            <InfoRow
              key={template.ipfsHash}
              caption={
                <DocumentLabel
                  title={
                    getInvestorDocumentTitles(etoData.product.offeringDocumentType)[
                      template.documentType
                    ]
                  }
                />
              }
              value={
                <Button
                  layout={EButtonLayout.LINK}
                  width={EButtonWidth.NO_PADDING}
                  iconProps={{
                    alt: <FormattedMessage id="common.download" />,
                  }}
                  className={styles.icon}
                  svgIcon={iconDownload}
                  data-test-id="token-claim-agreements"
                  disabled={pendingDownloads[template.ipfsHash]}
                  onClick={() =>
                    generateTemplateByEtoId({ ...template, asPdf: true }, etoData.etoId)
                  }
                />
              }
            />
          ) : null,
        etoData.templates,
      )}
    </ClaimTransactionDetails>

    <SummaryForm onSubmit={onAccept} />
  </Container>
);

export const UserClaimSummary = appConnect<IStateProps, IDispatchProps, {}>({
  stateToProps: state => {
    const additionalData = selectTxAdditionalData<ETxType.USER_CLAIM>(state)!;

    return {
      additionalData,
      etoData: selectMyInvestorTicketByEtoId(state, additionalData.etoId)!,
      pendingDownloads: selectPendingDownloads(state),
    };
  },
  dispatchToProps: d => ({
    onAccept: () => d(actions.txSender.txSenderAccept()),
    downloadDocument: (immutableFileId: IImmutableFileId, fileName: string) => {
      d(actions.immutableStorage.downloadImmutableFile(immutableFileId, fileName));
    },
    generateTemplateByEtoId: (immutableFileId: IEtoDocument, etoId: string) => {
      d(actions.etoDocuments.generateTemplateByEtoId(immutableFileId, etoId));
    },
  }),
})(UserClaimSummaryComponent);
