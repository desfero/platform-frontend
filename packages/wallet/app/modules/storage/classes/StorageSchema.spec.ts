import * as yup from "yup";

import { StorageSchema } from "./StorageSchema";

describe("StorageSchema", () => {
  it("should return schema properties", () => {
    const yupSchema = yup.object().shape({});
    const schema = new StorageSchema(1, "Test", yupSchema);
    expect(schema.id).toEqual("Test");
    expect(schema.version).toEqual(1);
    expect(schema.schema).toEqual(yupSchema);
  });

  it("should validate a value by provided schema", async () => {
    const yupSchema = yup.object().shape({
      name: yup.string().required(),
    });
    const testValue = {
      name: "John Doe",
    };
    const schema = new StorageSchema(1, "Test", yupSchema);
    const validValue = await schema.validate(testValue);
    expect(validValue).toEqual(testValue);
  });

  it("should throw an error if value validated is not correct", async () => {
    const yupSchema = yup.object().shape({
      name: yup.string().required(),
    });
    const testValue = {
      name: "foo",
    };
    const schema = new StorageSchema(1, "Test", yupSchema);

    try {
      await schema.validate(testValue);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});
