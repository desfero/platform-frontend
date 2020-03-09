// TODO: When web migrates to the newest formik move `yupSchemas` to the shared

import { Primitive } from "@neufund/shared";
import * as yup from "yup";

const isAbsent = <T>(value: T) => value === undefined || value === null;

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
const oneOfSchema = <T extends yup.Schema<any>>(schemas: T[]) =>
  yup.mixed<InferTypeWithPrimitive<T>>().test({
    name: "oneOfSchema",
    exclusive: true,
    message: "${path} must much one of schemas",
    test: value => {
      // always allow undefined and null
      if (isAbsent(value)) {
        return true;
      }

      return schemas.some(schema => schema.isValidSync(value));
    },
  });

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
    message: "${path} must much one a valid typed value",
    test: value => {
      // always allow undefined and null
      if (isAbsent(value)) {
        return true;
      }

      return isValid(value);
    },
  });

export { singleValue, oneOfSchema, typedValue };