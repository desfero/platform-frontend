/* eslint-disable no-template-curly-in-string */
// TODO: When web migrates to the newest formik move `yupSchemas` to the shared

import { Primitive, Tuple } from "@neufund/shared-utils";
import isArray from "lodash/fp/isArray";
import { TestOptionsMessage } from "yup";
import * as yup from "yup";

const isAbsent = <T>(value: T) => value === undefined || value === null;

function transform<T>(schema: yup.Schema<T>, value: T) {
  // for object schemas force no unknown
  if (schema instanceof yup.object) {
    return schema.noUnknown().cast(value);
  }

  return schema.cast(value);
}

/**
 * Infer yup schema data type with proper support for primitive schemas (string, number, boolean)
 * @example
 * const schemaNumber = yup.number()
 * InferTypeWithPrimitive<typeof schemaNumber> // number
 *
 * const schemaObject = yup.object({ foo: yup.string().required() })
 * InferTypeWithPrimitive<typeof schemaObject> // { foo: string }
 */
export type InferTypeWithPrimitive<T> = T extends yup.Schema<infer P>
  ? P extends Primitive
    ? P
    : yup.InferType<T>
  : never;

/**
 * A schema that support multiple schemas under the hood
 *
 * @param schemas - A schemas where at least one should match for a value to be valid
 * @param message - A custom error message
 *
 * @note
 * Yup support `oneOf` to whitelist a set of values but only primitive values are supported
 *
 * @example
 * const schema1 = yup.number();
 * const schema2 = yup.object({ foo: yup.string().required() });
 *
 * const oneOfTypeSchema = oneOfSchema([schema1, schema2]);
 *
 * oneOfTypeSchema.isValidSync(100); // true
 * oneOfTypeSchema.isValidSync({ foo: "bar" }); // true
 */
const oneOfSchema = <T extends yup.Schema<unknown>>(schemas: T[], message?: TestOptionsMessage) =>
  yup
    .mixed<InferTypeWithPrimitive<T>>()
    .test({
      name: "oneOfSchema",
      exclusive: true,
      message: message ?? "${path} must much one of schemas",
      test: value => {
        // always allow undefined and null
        if (isAbsent(value)) {
          return true;
        }

        return schemas.some(schema => schema.isValidSync(value));
      },
    })
    .transform(value => {
      if (isAbsent(value)) {
        return value;
      }

      const validSchema = schemas.find(schema => schema.isValidSync(value));

      return validSchema ? transform(validSchema, value) : value;
    });

type ObjectInferTypeWithPrimitive<T extends object> = {
  [P in keyof T]: InferTypeWithPrimitive<T[P]>;
};

const tupleSchemaTest = <T extends Tuple<yup.Schema<unknown>>>(schemas: T, values: unknown) => {
  // always allow undefined and null
  if (isAbsent(values)) {
    return true;
  }

  // non array items invalid
  if (!isArray(values)) {
    return false;
  }

  // array with more elements than schema requires
  if (values.length > schemas.length) {
    return false;
  }

  return schemas.every((schema, i) => schema.isValidSync(values[i]));
};

/**
 * A tuple schema
 *
 * @param schemas - A schemas where all should match at the given index for a schema to be valid
 *
 * @example
 * const schema1 = yup.number();
 * const schema2 = yup.object({ foo: yup.string().required() });
 *
 * const schema = tupleSchema([schema1, schema2]);
 *
 * schema.isValidSync([100, { foo: "bar" }]); // true
 * schema.isValidSync(["baz", { foo: "bar" }); // false
 * schema.isValidSync([100, 100, 100]); // false
 */
const tupleSchema = <T extends Tuple<yup.Schema<unknown>>>(schemas: T) => {
  return yup
    .mixed<ObjectInferTypeWithPrimitive<T>>()
    .test({
      name: "tupleSchema",
      exclusive: true,
      message: "${path} must be a valid tuple",
      test: values => tupleSchemaTest(schemas, values),
    })
    .transform(values => {
      if (isAbsent(values) || !tupleSchemaTest(schemas, values)) {
        return values;
      }

      return schemas.map((schema, i) => {
        if (!schema.isValidSync(values[i])) {
          return values[i];
        }
        return transform(schema, values[i]);
      });
    });
};

/**
 * A schema that support just single value by reference equality.
 *
 * @param requiredValue - A single valid value
 *
 * @example
 * const singleValueSchema = singleValue("hd_wallet");
 *
 * singleValueSchema.isValidSync("hd_wallet"); // true
 * singleValueSchema.isValidSync("private_key_wallet"); // false
 */
const singleValue = <T>(requiredValue: T) =>
  typedValue((value: unknown): value is T => value === requiredValue);

/**
 * A schema with a proper typescript type inference
 *
 * @param isValid - A predicate (typescript type guard!)
 *
 * @example
 * type ExpectedType = "true" | 1;
 * const typedValueSchema = typedValue((v: {}): v is ExpectedType => v === "true" || v === 1);
 *
 * typedValueSchema.isValidSync("true"); // true
 * typedValueSchema.isValidSync(1); // true
 * typedValueSchema.isValidSync(0); // false
 */
const typedValue = <T>(isValid: (value: unknown) => value is T) =>
  yup.mixed<T>().test({
    name: "typedValue",
    exclusive: true,
    message: "${path} must be a valid typed value",
    test: value => {
      // always allow undefined and null
      if (isAbsent(value)) {
        return true;
      }

      return isValid(value);
    },
  });

export { singleValue, oneOfSchema, typedValue, tupleSchema };
