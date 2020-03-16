import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  selectDecimalPlaces,
  toFixedPrecision,
} from "@neufund/shared";
import * as jstz from "jstimezonedetect";
import * as moment from "moment";

const calculateTimeLeftUnits = (timeLeft: number): [number, number, number, number] => {
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(timeLeft / day);
  const hours = Math.floor((timeLeft % day) / hour);
  const minutes = Math.floor(((timeLeft % day) % hour) / minute);
  const seconds = Math.floor(((timeLeft % day) % hour) % minute);

  return [days, hours, minutes, seconds];
};

const calculateTimeLeft = (
  value: moment.Moment | Date,
  asUtc: boolean,
  unit: moment.unitOfTime.Diff = "seconds",
) => (asUtc ? moment.utc(value).diff(moment().utc(), unit) : moment(value).diff(moment(), unit));

const getTomorrowsDate = () =>
  moment()
    .utc()
    .add(1, "day")
    .startOf("day")
    .toDate();

const utcTime = (value: moment.MomentInput) => moment.utc(value).format("MMMM Do YYYY, HH:mm");
const localTime = (value: moment.MomentInput) => moment(value).format("MMMM Do YYYY, HH:mm");
const timeZone = () => jstz.determine().name();
const weekdayLocal = (date: moment.MomentInput) => moment(date).format("ddd");
const weekdayUTC = (date: moment.MomentInput) => moment.utc(date).format("ddd");

const formatEuroValueToString = (value: string) =>
  toFixedPrecision({
    value: value,
    roundingMode: ERoundingMode.DOWN,
    inputFormat: ENumberInputFormat.ULPS,
    decimalPlaces: selectDecimalPlaces(
      ECurrency.EUR_TOKEN,
      ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
    ),
  });

export {
  calculateTimeLeftUnits,
  utcTime,
  localTime,
  timeZone,
  weekdayLocal,
  weekdayUTC,
  calculateTimeLeft,
  formatEuroValueToString,
  getTomorrowsDate,
};

// TODO: Move whole file to general app utils folder
