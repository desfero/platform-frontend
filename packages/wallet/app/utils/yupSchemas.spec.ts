import { AssertEqual, assertType } from "@neufund/shared-utils/tests";
import * as yup from "yup";

import { singleValue, typedValue, oneOfSchema, tupleSchema } from "./yupSchemas";

type YupPrimitiveInfer<T> = T extends yup.Schema<infer T> ? T : never;

describe("yup custom schemas", () => {
  describe("singleValue", () => {
    it("should allow only single value", () => {
      type ExpectedType = "true";
      const value: ExpectedType = "true";

      const singleValueSchema = singleValue(value);

      // assert proper type inference
      type Type = YupPrimitiveInfer<typeof singleValueSchema>;
      assertType<AssertEqual<Type, ExpectedType>>(true);

      expect(singleValueSchema.isValidSync(undefined)).toBeTruthy();
      expect(singleValueSchema.isValidSync(null)).toBeTruthy();

      expect(singleValueSchema.isValidSync("true")).toBeTruthy();

      expect(singleValueSchema.isValidSync("false")).toBeFalsy();
    });
  });

  describe("typedValue", () => {
    it("should allow only value from type guard", () => {
      type ExpectedType = "true" | 1;

      const typedValueSchema = typedValue(
        (v: unknown): v is ExpectedType => v === "true" || v === 1,
      );

      // assert proper type inference
      type Type = YupPrimitiveInfer<typeof typedValueSchema>;
      assertType<AssertEqual<Type, ExpectedType>>(true);

      expect(typedValueSchema.isValidSync(undefined)).toBeTruthy();
      expect(typedValueSchema.isValidSync(null)).toBeTruthy();

      expect(typedValueSchema.isValidSync("true")).toBeTruthy();
      expect(typedValueSchema.isValidSync(1)).toBeTruthy();

      expect(typedValueSchema.isValidSync("false")).toBeFalsy();
    });
  });

  describe("oneOfSchema", () => {
    it("should allow any of schema values", () => {
      const schema1 = yup.number();
      const schema2 = yup.object({ foo: yup.string().required() });
      const schema3 = yup.object({ bar: yup.boolean().required() });

      const oneOfTypeSchema = oneOfSchema([schema1, schema2, schema3]);

      // assert proper type inference
      type Type = YupPrimitiveInfer<typeof oneOfTypeSchema>;
      assertType<
        AssertEqual<Type, number | yup.InferType<typeof schema2> | yup.InferType<typeof schema3>>
      >(true);

      expect(oneOfTypeSchema.isValidSync(undefined)).toBeTruthy();
      expect(oneOfTypeSchema.isValidSync(null)).toBeTruthy();

      expect(oneOfTypeSchema.isValidSync(100)).toBeTruthy();
      expect(oneOfTypeSchema.isValidSync({ foo: "bar" })).toBeTruthy();
      expect(oneOfTypeSchema.isValidSync({ bar: false })).toBeTruthy();

      expect(oneOfTypeSchema.isValidSync({})).toBeFalsy();
      expect(oneOfTypeSchema.isValidSync({ bar: "foo" })).toBeFalsy();
      expect(oneOfTypeSchema.isValidSync("some string")).toBeFalsy();
    });

    it("should cast values with the valid schema transforms", () => {
      const schema1 = yup.number();
      const schema2 = yup.object({ foo: yup.string().required() });
      const schema3 = yup.object({ bar: yup.boolean().required() });

      const oneOfTypeSchema = oneOfSchema([schema1, schema2, schema3]);

      // should cast the value during validation phase
      expect(oneOfTypeSchema.validateSync(100)).toEqual(100);
      expect(oneOfTypeSchema.validateSync({ bar: true, unknown: "quz" })).toEqual({ bar: true });

      // should forward the same value if it's invalid
      expect(oneOfTypeSchema.cast("foo")).toEqual("foo");
      expect(oneOfTypeSchema.cast(undefined)).toEqual(undefined);
    });
  });

  describe("tupleSchema", () => {
    it("should allow all of schema values", () => {
      const schema1 = yup.number();
      const schema2 = yup.object({ foo: yup.string().required() });
      const schema3 = yup.object({ bar: yup.boolean().required() });

      const schema = tupleSchema([schema1, schema2, schema3]);

      // assert proper type inference
      type Type = YupPrimitiveInfer<typeof schema>;
      assertType<
        AssertEqual<Type, [number, yup.InferType<typeof schema2>, yup.InferType<typeof schema3>]>
      >(true);

      expect(schema.isValidSync(undefined)).toBeTruthy();
      expect(schema.isValidSync(null)).toBeTruthy();

      expect(schema.isValidSync([100, { foo: "foo" }, { bar: false }])).toBeTruthy();

      // non array values
      expect(schema.isValidSync(100)).toBeFalsy();
      expect(schema.isValidSync("some string")).toBeFalsy();
      expect(schema.isValidSync({ foo: "foo" })).toBeFalsy();

      // invalid array values
      expect(schema.isValidSync([])).toBeFalsy();
      expect(schema.isValidSync([100])).toBeFalsy();
      expect(schema.isValidSync([100, { foo: "foo" }])).toBeFalsy();
      expect(
        schema.isValidSync([
          100,
          { foo: "foo" },
          { bar: false },
          100,
          { foo: "foo" },
          { bar: false },
        ]),
      ).toBeFalsy();
      expect(schema.isValidSync([{ foo: "foo" }, 100, { bar: false }])).toBeFalsy();
    });

    it("should cast values with the given schemas transforms", () => {
      const schema1 = yup.number();
      const schema2 = yup.object({ foo: yup.string().required() });
      const schema3 = yup.object({ bar: yup.boolean().required() });

      const schema = tupleSchema([schema1, schema2, schema3]);

      // should cast the value during validation phase
      expect(schema.validateSync([100, { foo: "baz" }, { bar: false }])).toEqual([
        100,
        { foo: "baz" },
        { bar: false },
      ]);

      // should forward the same value if it's invalid
      expect(schema.cast("foo")).toEqual("foo");
      expect(schema.cast(undefined)).toEqual(undefined);
    });
  });
});
