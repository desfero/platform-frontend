import { DeepReadonly, Dictionary } from "@neufund/shared-utils";
import { mapValues } from "lodash";
import * as moment from "moment";
import * as Yup from "yup";

import {
  createMessage,
  getMessageTranslation,
  TMessage,
  ValidationMessage,
  YupMessage,
} from "../messages";

const object = <T extends {}>(objectShape: T) => new ObjectYTS(objectShape);
const string = <T extends string>() => new StringYTS<T>();
const url = () => new StringYTS().enhance((v: Yup.StringSchema) => v.url());
const array = <T extends YTS<any>>(shape: T) => new ArrayYTS(shape);
const number = () => new NumberYTS();
const boolean = () => new BooleanYTS();

export type TypeOfYTS<T extends YTS<any>> = DeepReadonly<T["_T"]>;

export type SchemaYTS<T> = ObjectYTS<T>;

export function isYTS(schema: any): schema is SchemaYTS<any> {
  return schema instanceof YTS;
}

type TypeOfProps<P extends Dictionary<any>> = { [K in keyof P]: TypeOfYTS<P[K]> };

export class YTS<T> {
  _T!: T;

  constructor(protected validator: Yup.Schema<any>, protected isRequired = true) {}

  toYup(): Yup.Schema<any> {
    // TODO: should be moved to constructor as each time creating new object is bad for performance
    return this.isRequired ? this.validator.required() : this.validator;
  }

  enhance(updateValidator: (validator: Yup.NumberSchema) => Yup.NumberSchema): YTS<T>;
  enhance(updateValidator: (validator: Yup.StringSchema) => Yup.StringSchema): YTS<T>;
  enhance(updateValidator: (validator: Yup.ArraySchema<T>) => Yup.ArraySchema<T>): YTS<T>;
  enhance(updateValidator: (validator: Yup.ObjectSchema<T>) => Yup.ObjectSchema<T>): YTS<T>;
  enhance(updateValidator: (validator: SchemaYTS<T>) => Yup.Schema<T>): YTS<T>;
  enhance(updateValidator: (validator: any) => any): YTS<T> {
    return new YTS<T>(updateValidator(this.validator), this.isRequired);
  }

  optional(): YTS<T | undefined> {
    return new YTS(this.validator, false);
  }
}

export class ObjectYTS<T> extends YTS<TypeOfProps<T>> {
  shape: T;
  constructor(shape: T) {
    const validator = Yup.object(mapValues(shape as any, s => s.toYup()));
    super(validator as any);
    this.shape = shape;
  }
}

export class StringYTS<T extends string = string> extends YTS<T> {
  constructor() {
    super(Yup.string());
  }
}

export class NumberYTS extends YTS<number> {
  constructor() {
    super(Yup.number());
  }
}

export class BooleanYTS extends YTS<boolean> {
  constructor() {
    super(Yup.boolean());
  }
}

export class ArrayYTS<T extends YTS<any>> extends YTS<Array<TypeOfYTS<T>>> {
  shape: T;
  constructor(shape: T) {
    const validator = Yup.array().of(shape.toYup());
    super(validator);
    this.shape = shape;
  }

  // override toYup
  toYup(): Yup.Schema<any> {
    if (this.isRequired) {
      // we can't use here .required() since it will throw on empty array. See: https://github.com/jquense/yup/issues/189
      return this.validator.test(
        "required",
        "This field is required",
        val => val !== undefined && val !== null,
      );
    }
    return this.validator;
  }
}

const wysiwygString = () => new WysiwygStringYTS();
const onlyTrue = (message?: TMessage) =>
  new BooleanYTS().enhance(v =>
    v.test(
      "isTrue",
      getMessageTranslation(message || createMessage(YupMessage.DEFAULT_ONLY_TRUE_MESSAGE)),
      value => value === undefined || value === true,
    ),
  );

export class WysiwygStringYTS extends YTS<string> {
  constructor() {
    super(Yup.string().meta({ isWysiwyg: true }));
  }

  max(limit: number): YTS<string> {
    return this.enhance(v =>
      v.max(limit, getMessageTranslation(createMessage(YupMessage.WYSIWYG_MAX_EXCEEDED_MESSAGE))),
    );
  }
}

/**
 * Custom schemas
 */

export const DATE_SCHEME = "YYYY-M-D";
export const parseStringToMomentDate = (s: string) => moment(s, DATE_SCHEME, true);

const currencyCodeSchema = (v: Yup.StringSchema) =>
  v.matches(/^[A-Z]{3}$/, {
    message: getMessageTranslation(
      createMessage(ValidationMessage.VALIDATION_CURRENCY_CODE),
    ) as string,
  });

const dateSchema = (v: Yup.StringSchema) =>
  v
    .transform((_value: unknown, originalValue: string): string | undefined => {
      if (originalValue === undefined) {
        return undefined;
      }
      const date = parseStringToMomentDate(originalValue);
      if (!date.isValid()) {
        return undefined;
      }
      return date.format(DATE_SCHEME);
    })
    .test(
      "is-valid",
      getMessageTranslation(createMessage(ValidationMessage.VALIDATION_INVALID_DATE)),
      s => (s !== undefined ? parseStringToMomentDate(s).isValid() : true),
    );

// TODO: fix error message
const percentage = Yup.number()
  .max(100, "Number too large")

  //   (values: unknown) =>
  //   getMessageTranslation(createMessage(ValidationMessage.VALIDATION_PECENTAGE_MAX, values)),
  // )
  .min(0, "Number too small");

//   (values: unknown) =>
//   getMessageTranslation(createMessage(ValidationMessage.VALIDATION_PERCENTAGE_MIN, values)),
// );

export const YupTS = {
  object,
  string,
  url,
  array,
  number,
  boolean,
  isYTS,
  wysiwygString,
  onlyTrue,
  percentage,
  currencyCodeSchema,
  dateSchema,
};
