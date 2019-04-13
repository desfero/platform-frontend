import { compose, includes } from "lodash/fp";
import { reach, Schema } from "yup";

const getSchemaTests = <T>(schema: Schema<T>): string[] => schema.describe().tests;

export const getFieldSchema = <T>(name: string, schema: Schema<T> | undefined) =>
  schema && reach(schema, name);

export const isRequired = compose(
  includes("required"),
  getSchemaTests,
);

// TODO: Refactor to use Yup's `describe` method
const findSchemaConstraint = (constraintName: string, schema: any) => {
  const schemaTest = schema && schema.tests.find((test: any) => test.TEST_NAME === constraintName);

  return schemaTest && schemaTest.TEST.params[constraintName];
};

export const findMin = (schema: any) => {
  return findSchemaConstraint("min", schema);
};

export const findMax = (schema: any) => {
  return findSchemaConstraint("max", schema);
};
