import { DeepReadonly, Dictionary } from "@neufund/shared-utils";
import { mapValues } from "lodash";
import * as Yup from "yup";

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

export const YupTS = {
  object,
  string,
  url,
  array,
  number,
  boolean,
  isYTS,
};

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
