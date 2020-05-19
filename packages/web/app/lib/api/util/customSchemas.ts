import { ECountries } from "@neufund/shared-utils";
import { includes } from "lodash";
import * as moment from "moment";
import * as Yup from "yup";

import {
  getMessageTranslation,
  ValidationMessage,
} from "../../../components/translatedMessages/messages";
import { createMessage } from "../../../components/translatedMessages/utils";

/**
 * Date schema
 */


export const date = dateSchema(Yup.string());

export const personBirthDate = date
  .test(
    "is-old-enough",
    getMessageTranslation(createMessage(ValidationMessage.VALIDATION_MIN_AGE)),
    s => {
      if (s === undefined) {
        return true;
      } else {
        const d = parseStringToMomentDate(s);
        return d.isValid() && d.isBefore(moment().subtract(18, "years"));
      }
    },
  )
  .test(
    "is-young-enough",
    getMessageTranslation(createMessage(ValidationMessage.VALIDATION_MAX_AGE)),
    s => {
      if (s === undefined) {
        return true;
      } else {
        const d = parseStringToMomentDate(s);
        return d.isValid() && d.isAfter(moment().subtract(125, "years"));
      }
    },
  );

export const foundingDate = date.test(
  "is-old-enough",
  getMessageTranslation(createMessage(ValidationMessage.VALIDATION_DATE_IN_THE_FUTURE)),
  s => {
    const d = parseStringToMomentDate(s);
    return d.isValid() && d.isBefore(moment());
  },
);

export const countryCode = Yup.string();

export const RESTRICTED_COUNTRIES = [
  ECountries.AFGHANISTAN,
  ECountries.BAHAMAS,
  ECountries.BOTSWANA,
  ECountries.CAMBODIA,
  ECountries.ETHIOPIA,
  ECountries.GHANA,
  ECountries.GUAM,
  ECountries.IRAN,
  ECountries.IRAQ,
  ECountries.LIBYAN_ARAB_JAMAHIRIYA,
  ECountries.NIGERIA,
  ECountries.NORTH_KOREA,
  ECountries.PAKISTAN,
  ECountries.PANAMA,
  ECountries.PUERTO_RICO,
  ECountries.SERBIA,
  ECountries.SRI_LANKA,
  ECountries.SYRIAN_ARAB_REPUBLIC,
  ECountries.TRINIDAD_AND_TOBAGO,
  ECountries.TUNISIA,
  ECountries.YEMEN,
];

export const restrictedCountry = countryCode.test(
  "country",
  getMessageTranslation(createMessage(ValidationMessage.VALIDATION_RESTRICTED_COUNTRY)),
  response => !includes(RESTRICTED_COUNTRIES, response),
);
