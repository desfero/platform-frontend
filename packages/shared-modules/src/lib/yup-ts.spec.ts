import { DeepReadonly } from "@neufund/shared-utils";
import { AssertEqual } from "@neufund/shared-utils/tests";
import { expect } from "chai";
import { NumberSchema } from "yup";

import { TypeOfYTS, YupTS } from "./yup-ts.unsafe";

describe("Yup-ts", () => {
  const animalValidator = YupTS.object({
    name: YupTS.string().optional(),
  });

  const personValidatorTemplate = YupTS.object({
    fullName: YupTS.string(),
    middleName: YupTS.string().optional(),
    age: YupTS.number(),
    married: YupTS.boolean().optional(),
    animals: YupTS.array(animalValidator).optional(),
    url: YupTS.url().optional(),
  });

  type TValidatorType = TypeOfYTS<typeof personValidatorTemplate>;
  const personalValidator = personValidatorTemplate.toYup();

  it("should work as Yup", () => {
    const validValue1: TValidatorType = {
      fullName: "Typical Millennial Dev",
      middleName: undefined,
      age: 21,
      married: false,
      animals: undefined,
      url: undefined,
    };
    const validValue2 = { fullName: "Typical Millennial Dev", age: "21" }; // testing coercing
    const validValue3: TValidatorType = {
      fullName: "John Smith",
      middleName: "Peter",
      age: 21,
      married: false,
      animals: [{ name: "kitty" }],
      url: "http://www.foo.de",
    };

    expect(personalValidator.isValidSync(validValue1)).to.be.true;
    expect(personalValidator.isValidSync(validValue2)).to.be.true;
    expect(personalValidator.isValidSync(validValue3)).to.be.true;

    expect(personalValidator.isValidSync(5)).to.be.false;
    expect(personalValidator.isValidSync({ fullName: "test" })).to.be.false; // missing values
    expect(personalValidator.isValidSync({ ...validValue2, url: "fufu" })).to.be.false; // url
  });

  // assertions on types done according to: https://abstract.properties/typescript-compile-assertions.html
  it("should generate correct types", () => {
    type assert<T> = AssertEqual<
      T,
      DeepReadonly<{
        fullName: string;
        middleName: string | undefined;
        age: number;
        married: boolean | undefined;
        animals: Array<{ name: string | undefined }> | undefined;
        url: string | undefined;
      }>
    >;

    const t: assert<TValidatorType> = true;
    return t;
  });

  it("should validate empty arrays", () => {
    const array = YupTS.array(animalValidator).toYup();

    expect(array.isValidSync([])).to.be.true;
    expect(array.isValidSync(null)).to.be.false;
  });

  it("can be enhanced by further validations", () => {
    const validator = YupTS.number()
      .enhance((v: NumberSchema) => v.min(4))
      .toYup();

    expect(validator.isValidSync(2)).to.be.false;
    expect(validator.isValidSync(5)).to.be.true;
  });
});
