import { Button, EButtonLayout, EButtonWidth } from "@neufund/design-system";
import { DAY } from "@neufund/shared-utils";
import * as moment from "moment";
import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";
import { FormGroup } from "reactstrap";
import { branch, compose, lifecycle, renderComponent, renderNothing } from "recompose";

import { actions } from "../../../modules/actions";
import {
  selectAreAgreementsSignedByNominee,
  selectCanChangePreEtoStartDate,
  selectIssuerEtoDateToWhitelistMinDuration,
  selectIssuerEtoLoading,
  selectNewEtoDateSaving,
  selectPreEtoStartDateFromContract,
} from "../../../modules/eto-flow/selectors";
import { isValidEtoStartDate } from "../../../modules/eto-flow/utils";
import { selectPlatformPendingTransaction } from "../../../modules/tx/monitor/selectors";
import { ETxSenderState } from "../../../modules/tx/sender/reducer";
import { ETxType } from "../../../modules/tx/types";
import { appConnect } from "../../../store";
import { EColumnSpan } from "../../layouts/Container";
import {
  DashboardLoadingWidget,
  DashboardWidget,
} from "../../shared/dashboard-widget/DashboardWidget";
import { createErrorBoundary } from "../../shared/errorBoundary/ErrorBoundary.unsafe";
import { ErrorBoundaryPanel } from "../../shared/errorBoundary/ErrorBoundaryPanel";
import { DatePickerLayout, FormError } from "../../shared/forms";
import { TimeLeft } from "../../shared/TimeLeft.unsafe";
import { TimeLeftWithUTC } from "../../shared/TimeLeftWithUTC";
import { calculateTimeLeft } from "../../shared/utils";

import * as styles from "./ChooseEtoStartDateWidget.module.scss";

interface IStateProps {
  etoDate?: Date;
  minOffsetPeriod: number;
  newDateSaving: boolean;
  transactionMining: boolean;
  issuerEtoLoading: boolean;
  areAgreementsSignedByNominee: boolean | undefined;
  canChangeEtoStartDate: boolean;
}

interface IChangeDateStateProps {
  etoDate: Date;
  minOffsetPeriod: number;
  canChangeEtoStartDate: boolean;
}

interface IExternalProps {
  columnSpan?: EColumnSpan;
}

interface IDispatchProps {
  uploadDate: (time: moment.Moment) => void;
  cleanup: () => void;
}

interface IDateChooserProps {
  etoDate?: Date;
  minOffsetPeriod: number;
  uploadDate: (time: moment.Moment) => void;
  canChangeEtoStartDate: boolean;
}

interface IDateChooserState {
  isOpen: boolean;
  newEtoDate: moment.Moment;
}

interface IChangeDateCountdown {
  etoDate?: Date;
  minOffsetPeriodInMinutes: number;
}

interface IDateChooserOpenProps {
  etoDate?: Date;
  newEtoDate: moment.Moment | null;
  setNewEtoDate: (newEtoDate: moment.Moment | string) => void;
  newDateIsValid: (date: moment.Moment | null) => boolean;
  onTestInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  minOffsetPeriodInMinutes: number;
  uploadDate: () => void;
  closeDatePicker: () => void;
}

interface IDateChooserClosedProps {
  etoDate?: Date;
  minOffsetPeriodInMinutes: number;
  openDatePicker: () => void;
}

const ChangeDateCountdown: React.ComponentType<IChangeDateCountdown> = ({
  etoDate,
  minOffsetPeriodInMinutes,
}) => {
  if (etoDate) {
    return (
      <p className={styles.timeLeft}>
        <FormattedMessage
          id="eto.status.onchain.change-eto-date-countdown-text"
          values={{
            timeLeft: (
              <TimeLeft
                finalTime={moment(etoDate).subtract(minOffsetPeriodInMinutes, "minutes")}
                asUtc={true}
                refresh={true}
              />
            ),
          }}
        />
      </p>
    );
  } else {
    return null;
  }
};

const DateChooserOpen = ({
  etoDate,
  newEtoDate,
  setNewEtoDate,
  newDateIsValid,
  onTestInputChange,
  minOffsetPeriodInMinutes,
  uploadDate,
  closeDatePicker,
}: IDateChooserOpenProps) => {
  const newDateIsSet = newEtoDate !== null && newEtoDate.diff(etoDate) !== 0;
  return (
    <>
      <FormGroup className="justify-content-center mb-0">
        <DatePickerLayout
          value={newEtoDate || etoDate}
          onChange={setNewEtoDate}
          onTestInputChange={onTestInputChange}
          dataTestId="eto-settings-start-date-input"
          isValidDate={(currentDate: moment.Moment) =>
            currentDate.isSameOrAfter(moment.utc().add(minOffsetPeriodInMinutes, "minutes"), "days")
          }
        />
        {newDateIsSet && !newDateIsValid(newEtoDate) && (
          <FormError
            name="etoStartDate"
            message={
              <FormattedMessage
                id="eto.settings.error-message.eto-start-date-too-early"
                values={{ days: minOffsetPeriodInMinutes / 60 / 24 }}
              />
            }
          />
        )}
      </FormGroup>
      <div className={styles.widgetButton}>
        <Button
          layout={EButtonLayout.SECONDARY}
          width={EButtonWidth.NO_PADDING}
          onClick={closeDatePicker}
          data-test-id="eto-settings-start-date-cancel"
        >
          <FormattedMessage id="eto.settings.cancel-change-eto-start-date" />
        </Button>
        <Button
          layout={EButtonLayout.PRIMARY}
          width={EButtonWidth.NO_PADDING}
          onClick={uploadDate}
          disabled={!(newDateIsSet && newDateIsValid(newEtoDate))}
          data-test-id="eto-settings-start-date-confirm"
        >
          <FormattedMessage id="eto.settings.confirm-change-eto-start-date" />
        </Button>
      </div>
    </>
  );
};

const DateChooserClosed = ({
  etoDate,
  minOffsetPeriodInMinutes,
  openDatePicker,
}: IDateChooserClosedProps) => (
  <>
    <ChangeDateCountdown etoDate={etoDate} minOffsetPeriodInMinutes={minOffsetPeriodInMinutes} />
    <Button
      layout={EButtonLayout.PRIMARY}
      className="m-auto"
      onClick={openDatePicker}
      data-test-id="eto-settings-start-date-open-date-picker"
    >
      {etoDate ? (
        <FormattedMessage id="eto.settings.change-eto-start-date" />
      ) : (
        <FormattedMessage id="eto.settings.set-eto-start-date" />
      )}
    </Button>
  </>
);

class DateChooser extends React.PureComponent<IDateChooserProps, IDateChooserState> {
  minOffsetPeriodInMinutes = Math.floor(this.props.minOffsetPeriod / 60);
  // dates get rounded down. Add 3 minutes so that it shows "in 14 days" instead of "in 13 days 23 hours"
  defaultOffsetInMinutes = this.minOffsetPeriodInMinutes * 2 + 3;

  state = {
    isOpen: false,

    newEtoDate: this.props.etoDate
      ? moment.utc(this.props.etoDate)
      : moment()
          .utc()
          .add(this.defaultOffsetInMinutes, "minutes")
          .startOf("minute"),
  };

  closeDatePicker = () => {
    this.setState({
      isOpen: false,
    });
  };

  openDatePicker = () => {
    this.setState({
      isOpen: true,
    });
  };

  newDateIsValid = (date: moment.Moment | null) =>
    date === null
      ? false
      : moment.isMoment(date) && isValidEtoStartDate(date.toDate(), this.props.minOffsetPeriod);

  //this is only necessary to validate hidden input for e2e tests
  isMomentOrValidString = (newEtoDate: string | moment.Moment) =>
    newEtoDate &&
    (moment.isMoment(newEtoDate) || moment(newEtoDate).format("MM/DD/YYYY HH:mm") === newEtoDate);

  //this is only necessary to validate hidden input for e2e tests
  onTestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && this.isMomentOrValidString(e.target.value)) {
      this.setNewEtoDate(moment.utc(e.target.value));
    }
  };

  setNewEtoDate = (newEtoDate: moment.Moment | string) =>
    this.setState({
      newEtoDate: moment.utc(newEtoDate),
    });

  uploadDate = () => {
    if (this.state.newEtoDate !== null) {
      this.props.uploadDate(this.state.newEtoDate);
      this.setState({
        isOpen: false,
      });
    }
  };

  render(): React.ReactNode {
    const { etoDate, canChangeEtoStartDate } = this.props;

    {
      if (!canChangeEtoStartDate) {
        return (
          <>
            <p className={styles.changeDisabled}>
              <FormattedMessage id="eto.settings.changing-eto-start-date-not-possible" />
            </p>
            <Button
              layout={EButtonLayout.PRIMARY}
              className="m-auto"
              data-test-id="eto-settings-start-date-open-date-picker"
              disabled={true}
            >
              <FormattedMessage id="eto.settings.change-eto-start-date" />
            </Button>
          </>
        );
      } else if (canChangeEtoStartDate && this.state.isOpen) {
        return (
          <DateChooserOpen
            etoDate={etoDate}
            newEtoDate={this.state.newEtoDate}
            setNewEtoDate={this.setNewEtoDate}
            onTestInputChange={this.onTestInputChange}
            minOffsetPeriodInMinutes={this.minOffsetPeriodInMinutes}
            newDateIsValid={this.newDateIsValid}
            closeDatePicker={this.closeDatePicker}
            uploadDate={this.uploadDate}
          />
        );
      } else {
        return (
          <DateChooserClosed
            etoDate={etoDate}
            minOffsetPeriodInMinutes={this.minOffsetPeriodInMinutes}
            openDatePicker={this.openDatePicker}
          />
        );
      }
    }
  }
}

const ChangeDate: React.ComponentType<IChangeDateStateProps & IDispatchProps> = props => (
  <>
    <TimeLeftWithUTC
      countdownDate={props.etoDate}
      label={<FormattedMessage id="eto.settings.set-eto-start-date-time-left" />}
    />
    <DateChooser {...props} />
  </>
);

const EtoStartDateWidgetComponent: React.ComponentType<IStateProps &
  IDispatchProps &
  IExternalProps> = ({ etoDate, columnSpan, ...props }) => (
  <DashboardWidget
    title={<FormattedMessage id="eto.settings.eto-start-date" />}
    text={
      <FormattedHTMLMessage
        tagName="span"
        id="settings.choose-pre-eto-date.book-building-will-stop"
        values={{ minOffsetPeriod: props.minOffsetPeriod / DAY }}
      />
    }
    columnSpan={columnSpan}
    data-test-id="eto-settings-set-start-date"
  >
    {etoDate ? (
      <ChangeDate etoDate={etoDate} {...props} />
    ) : (
      <DateChooser etoDate={etoDate} {...props} />
    )}
  </DashboardWidget>
);

const WidgetLoading: React.ComponentType<IExternalProps> = ({ columnSpan }) => (
  <DashboardLoadingWidget
    columnSpan={columnSpan}
    title={<FormattedMessage id="eto.settings.eto-start-date" />}
  />
);

const ChooseEtoStartDateWidget = compose<
  IStateProps & IDispatchProps & IExternalProps,
  IExternalProps
>(
  createErrorBoundary(ErrorBoundaryPanel),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => {
      const pendingTransaction = selectPlatformPendingTransaction(state);
      const transactionMining =
        !!pendingTransaction &&
        pendingTransaction.transactionType === ETxType.ETO_SET_DATE &&
        pendingTransaction.transactionStatus === ETxSenderState.MINING;

      return {
        etoDate: selectPreEtoStartDateFromContract(state),
        minOffsetPeriod: selectIssuerEtoDateToWhitelistMinDuration(state),
        issuerEtoLoading: selectIssuerEtoLoading(state),
        newDateSaving: selectNewEtoDateSaving(state),
        areAgreementsSignedByNominee: selectAreAgreementsSignedByNominee(state),
        canChangeEtoStartDate: selectCanChangePreEtoStartDate(state),
        transactionMining,
      };
    },
    dispatchToProps: dispatch => ({
      uploadDate: (etoStartDate: moment.Moment) => {
        dispatch(actions.etoFlow.setNewStartDate(moment.utc(etoStartDate).toDate()));
        dispatch(actions.etoFlow.uploadStartDate());
      },
      cleanup: () => {
        dispatch(actions.etoFlow.cleanupStartDate());
        dispatch(actions.etoFlow.setEtoDateStop());
      },
    }),
  }),
  lifecycle<IStateProps & IDispatchProps, {}>({
    componentDidUpdate(prevProps: IStateProps & IDispatchProps): void {
      if (prevProps.newDateSaving && !this.props.newDateSaving) {
        this.props.cleanup();
      } else if (prevProps.transactionMining && !this.props.transactionMining) {
        this.props.cleanup();
      }
    },
  }),
  branch<IStateProps>(
    props =>
      !props.areAgreementsSignedByNominee &&
      !(props.etoDate && calculateTimeLeft(props.etoDate, true) > 0),
    renderNothing,
  ),
  branch<IStateProps>(
    props => !!props.etoDate && calculateTimeLeft(props.etoDate, true) < 0,
    renderNothing,
  ),
  branch<IStateProps>(
    props => props.issuerEtoLoading || props.newDateSaving || props.transactionMining,
    renderComponent(WidgetLoading),
  ),
)(EtoStartDateWidgetComponent);

export { EtoStartDateWidgetComponent, ChooseEtoStartDateWidget };
