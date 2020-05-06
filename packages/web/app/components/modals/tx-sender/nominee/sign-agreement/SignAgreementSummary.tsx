import { Button, EButtonLayout } from "@neufund/design-system";
import { RequiredByKeys } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, withProps } from "recompose";

import { IEtoDocument } from "../../../../../lib/api/eto/EtoFileApi.interfaces";
import { IImmutableFileId } from "../../../../../lib/api/immutable-storage/ImmutableStorage.interfaces";
import * as YupTS from "../../../../../lib/yup-ts.unsafe";
import { actions } from "../../../../../modules/actions";
import { TEtoWithCompanyAndContractReadonly } from "../../../../../modules/eto/types";
import { selectActiveNomineeEto } from "../../../../../modules/nominee-flow/selectors";
import { selectTxType } from "../../../../../modules/tx/sender/selectors";
import { ETxType } from "../../../../../modules/tx/types";
import { appConnect } from "../../../../../store";
import { DocumentButton } from "../../../../shared/DocumentLink";
import { Form, FormFieldBoolean } from "../../../../shared/forms";
import { EHeadingSize, Heading } from "../../../../shared/Heading";
import { InlineIcon } from "../../../../shared/icons/InlineIcon";
import { isRAASign, selectDocument } from "./utils";

import link from "../../../../../assets/img/inline_icons/download.svg";

interface IStateProps {
  nomineeEto?: TEtoWithCompanyAndContractReadonly;
  txType?: ETxType;
}

interface IDispatchProps {
  downloadImmutableFile: (fileId: IImmutableFileId, name: string) => void;
  onAccept: () => void;
}

interface IFormikProps {
  acceptAgreement: boolean;
}

interface IAdditionalProps {
  document: IEtoDocument;
}

type TRequiredState = RequiredByKeys<IStateProps, "nomineeEto">;

type TComponentProps = TRequiredState & IDispatchProps & IAdditionalProps;

const SignFormSchema = YupTS.object({
  acceptAgreement: YupTS.onlyTrue(),
});

const SignNomineeAgreementSummaryLayout: React.FunctionComponent<TComponentProps> = ({
  downloadImmutableFile,
  onAccept,
  document,
  txType,
}) => (
  <section
    className="text-center"
    data-test-id={isRAASign(txType) ? "nominee-sign-raaa-modal" : "nominee-sign-tha-modal"}
  >
    <Heading decorator={false} level={2} size={EHeadingSize.HUGE}>
      {isRAASign(txType) ? (
        <FormattedMessage id="nominee.sign-raaa.title" />
      ) : (
        <FormattedMessage id="nominee.sign-tha.title" />
      )}
    </Heading>
    <p className="my-4">
      {isRAASign(txType) ? (
        <FormattedMessage id="nominee.sign-raaa.text" />
      ) : (
        <FormattedMessage id="nominee.sign-tha.text" />
      )}
    </p>
    <DocumentButton
      layout={EButtonLayout.SECONDARY}
      onClick={() =>
        downloadImmutableFile(
          {
            ...{
              ipfsHash: document.ipfsHash,
              mimeType: document.mimeType,
            },
            asPdf: true,
          },
          document.documentType,
        )
      }
      title={
        isRAASign(txType) ? (
          <FormattedMessage id="nominee.sign-raaa.download-raaa" />
        ) : (
          <FormattedMessage id="nominee.sign-tha.download-tha" />
        )
      }
      altIcon={<InlineIcon svgIcon={link} />}
    />

    <Form<IFormikProps>
      initialValues={{ acceptAgreement: false }}
      onSubmit={onAccept}
      validationSchema={SignFormSchema.toYup()}
    >
      {({ isValid }) => (
        <>
          <FormFieldBoolean
            className="my-4"
            label={
              isRAASign(txType) ? (
                <FormattedMessage id="nominee.sign-raaa.accept" />
              ) : (
                <FormattedMessage id="nominee.sign-tha.accept" />
              )
            }
            name="acceptAgreement"
            data-test-id="nominee-sign-agreement-accept"
          />

          <Button
            disabled={!isValid}
            type="submit"
            layout={EButtonLayout.PRIMARY}
            data-test-id="nominee-sign-agreement-sign"
          >
            <FormattedMessage id="nominee.sign-agreement.sign" />
          </Button>
        </>
      )}
    </Form>
  </section>
);

const SignNomineeAgreementSummary = compose<TComponentProps, {}>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      nomineeEto: selectActiveNomineeEto(state),
      txType: selectTxType(state),
    }),
    dispatchToProps: dispatch => ({
      downloadImmutableFile: (fileId, name) =>
        dispatch(actions.immutableStorage.downloadImmutableFile(fileId, name)),
      onAccept: () => dispatch(actions.txSender.txSenderAccept()),
    }),
  }),
  branch<IStateProps>(
    state => !state.nomineeEto || !state.txType,
    () => {
      throw new Error("Nominee ETO or Transaction type cannot be empty");
    },
  ),
  withProps<IAdditionalProps, TRequiredState>(props => ({
    document: selectDocument(props.txType, props.nomineeEto),
  })),
)(SignNomineeAgreementSummaryLayout);

export { SignNomineeAgreementSummaryLayout, SignNomineeAgreementSummary };
