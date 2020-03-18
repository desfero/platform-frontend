import BigNumber from "bignumber.js";
import { expect } from "chai";

import { formatMoney } from "../MoneyUtils";
import {
  formatNumber,
  formatThousands,
  isEmptyValue,
  isValidNumber,
  parseInputToNumber,
  removeZeroDecimals,
  selectDecimalPlaces,
  stripNumberFormatting,
  toFixedPrecision,
} from "./index";
import {
  EAbbreviatedNumberOutputFormat,
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
} from "./types";

describe("formatNumber", () => {
  /* formatNumber only formats numbers (!),
   * invalid input (null/undefined etc) should be handled before calling this fn, this one will only throw.
   * we don't check for strings in a wrong format here,
   * since 99% of input vals is from the store so it should be in the right format already,
   * and user input should handle this on its own before calling this fn
   * */
  it("should handle invalid input", () => {
    expect(() =>
      formatNumber({
        value: "a_string",
        decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
        inputFormat: ENumberInputFormat.FLOAT,
        outputFormat: ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
      }),
    ).to.throw();
    expect(() =>
      formatNumber({
        value: "123,123.67",
        decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
        inputFormat: ENumberInputFormat.FLOAT,
        outputFormat: ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
      }),
    ).to.throw();
    expect(() =>
      formatNumber({
        value: "123 123.67",
        decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
        inputFormat: ENumberInputFormat.FLOAT,
        outputFormat: ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
      }),
    ).to.throw();
    expect(() =>
      formatNumber({
        value: "123.123,67",
        decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
        inputFormat: ENumberInputFormat.FLOAT,
        outputFormat: ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
      }),
    ).to.throw();
    expect(() =>
      formatNumber({
        value: "",
        decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
        inputFormat: ENumberInputFormat.FLOAT,
        outputFormat: ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
      }),
    ).to.throw();
    expect(() =>
      formatNumber({
        value: NaN as any,
        decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
        inputFormat: ENumberInputFormat.FLOAT,
        outputFormat: ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
      }),
    ).to.throw();
    expect(
      /* null, functions and objects/arrays are not allowed by TS typings,
      but everything is possible in JavaScript so I want to guard against them too */
      () =>
        formatNumber({
          value: null as any,
          decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
          inputFormat: ENumberInputFormat.FLOAT,
          outputFormat: ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
        }),
    ).to.throw();
    expect(() =>
      formatNumber({
        value: [] as any,
        decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
        inputFormat: ENumberInputFormat.FLOAT,
        outputFormat: ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
      }),
    ).to.throw();
  });
  it("should accept string in e notation as input", () => {
    expect(
      formatNumber({
        inputFormat: ENumberInputFormat.ULPS,
        value: "7.907018107633946081196003e+24",
      }),
    ).to.eq("7 907 018.107633946081196003");
  });
  it("should accept number as input", () => {
    expect(
      formatNumber({
        inputFormat: ENumberInputFormat.FLOAT,
        value: "12524.002",
      }),
    ).to.eq("12 524.002");
  });
  it("should accept BigNumber as input", () => {
    expect(
      formatNumber({
        inputFormat: ENumberInputFormat.FLOAT,
        value: new BigNumber("123456.9898"),
      }),
    ).to.eq("123 456.9898");
  });
  it("should format number with default settings (ULPS, no rounding, output FULL)", () => {
    expect(
      formatNumber({
        value: "1242035230000000000000",
      }),
    ).to.eq("1 242.03523");
  });
  it("should format number supplied as FLOAT", () => {
    expect(
      formatNumber({
        inputFormat: ENumberInputFormat.FLOAT,
        value: "124203.52300",
      }),
    ).to.eq("124 203.523");
  });
  it("should round number with given settings", () => {
    expect(
      formatNumber({
        inputFormat: ENumberInputFormat.ULPS,
        decimalPlaces: 4,
        roundingMode: ERoundingMode.UP,
        value: "1242035230000000000000",
      }),
    ).to.eq("1 242.0353");
    expect(
      formatNumber({
        inputFormat: ENumberInputFormat.ULPS,
        decimalPlaces: 4,
        roundingMode: ERoundingMode.DOWN,
        value: "1242035230000000000000",
      }),
    ).to.eq("1 242.0352");
    expect(
      formatNumber({
        inputFormat: ENumberInputFormat.ULPS,
        decimalPlaces: 2,
        value: "1242035230000000000000",
      }),
    ).to.eq("1 242.03");
  });
  it("should format output to given settings", () => {
    expect(
      formatNumber({
        outputFormat: ENumberOutputFormat.FULL,
        inputFormat: ENumberInputFormat.ULPS,
        decimalPlaces: 2,
        value: "1242100000000000000000",
      }),
    ).to.eq("1 242.10");
    expect(
      formatNumber({
        outputFormat: ENumberOutputFormat.INTEGER,
        inputFormat: ENumberInputFormat.ULPS,
        decimalPlaces: 2,
        value: "1242100000000000000000",
      }),
    ).to.eq("1 242");
    expect(
      formatNumber({
        outputFormat: ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
        inputFormat: ENumberInputFormat.ULPS,
        decimalPlaces: 2,
        value: "1242000000000000000000",
      }),
    ).to.eq("1 242");
    expect(
      formatNumber({
        outputFormat: ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
        inputFormat: ENumberInputFormat.FLOAT,
        value: "1000000.00",
      }),
    ).to.eq("1 000 000");
    expect(
      formatNumber({
        outputFormat: ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
        inputFormat: ENumberInputFormat.FLOAT,
        value: "1000000",
      }),
    ).to.eq("1 000 000");
    expect(
      formatNumber({
        outputFormat: ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
        inputFormat: ENumberInputFormat.ULPS,
        decimalPlaces: 2,
        value: "1242330000000000000000",
      }),
    ).to.eq("1 242.33");
    /* abbreviated format (SHORT and LONG) is handled in FormatShortNumber
     * this function just converts from ulps to float if needed and returns the value */
    expect(
      formatNumber({
        outputFormat: EAbbreviatedNumberOutputFormat.LONG,
        inputFormat: ENumberInputFormat.FLOAT,
        value: "1242.303",
      }),
    ).to.eq("1 242.303");
    expect(
      formatNumber({
        outputFormat: EAbbreviatedNumberOutputFormat.SHORT,
        inputFormat: ENumberInputFormat.ULPS,
        value: "1242330000000000000000",
      }),
    ).to.eq("1 242.33");
  });
});

describe("toFixedPrecision", () => {
  it("should format ULPS values", () => {
    // By default rounded up
    expect(
      toFixedPrecision({
        value: "1242.21621e+18",
        decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
        inputFormat: ENumberInputFormat.ULPS,
      }),
    ).to.eq("1242.2163");
    expect(
      toFixedPrecision({
        value: "346342.235e18",
        decimalPlaces: selectDecimalPlaces(ECurrency.EUR),
        inputFormat: ENumberInputFormat.ULPS,
      }),
    ).to.eq("346342.24");
    expect(
      toFixedPrecision({
        value: new BigNumber("346342.235e18"),
        decimalPlaces: selectDecimalPlaces(ECurrency.EUR_TOKEN),
        inputFormat: ENumberInputFormat.ULPS,
      }),
    ).to.eq("346342.24");
  });

  it("should format float values", () => {
    // By default rounded up
    expect(
      toFixedPrecision({
        value: "1242.21621",
        decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
        inputFormat: ENumberInputFormat.FLOAT,
      }),
    ).to.eq("1242.2163");
    expect(
      toFixedPrecision({
        value: "346342.235",
        decimalPlaces: selectDecimalPlaces(ECurrency.EUR),
        inputFormat: ENumberInputFormat.FLOAT,
      }),
    ).to.eq("346342.24");
    expect(
      toFixedPrecision({
        value: new BigNumber("346342.235"),
        decimalPlaces: selectDecimalPlaces(ECurrency.EUR_TOKEN),
        inputFormat: ENumberInputFormat.FLOAT,
      }),
    ).to.eq("346342.24");
  });

  it("should format to custom number of decimal places", () => {
    expect(
      toFixedPrecision({
        value: "1242.21621134341",
        decimalPlaces: 13,
        inputFormat: ENumberInputFormat.FLOAT,
      }),
    ).to.eq("1242.2162113434100");
  });

  it("should round down values", () => {
    expect(
      toFixedPrecision({
        value: "1242.21621134341",
        decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
        inputFormat: ENumberInputFormat.FLOAT,
        isPrice: false,
        roundingMode: ERoundingMode.DOWN,
      }),
    ).to.eq("1242.2162");
    expect(
      toFixedPrecision({
        value: "346342.235412415",
        decimalPlaces: selectDecimalPlaces(ECurrency.EUR),
        inputFormat: ENumberInputFormat.FLOAT,
        isPrice: false,
        roundingMode: ERoundingMode.DOWN,
      }),
    ).to.eq("346342.23");
    expect(
      toFixedPrecision({
        value: new BigNumber("3.2351251122e18"),
        decimalPlaces: selectDecimalPlaces(ECurrency.EUR_TOKEN),
        inputFormat: ENumberInputFormat.ULPS,
        isPrice: false,
        roundingMode: ERoundingMode.DOWN,
      }),
    ).to.eq("3.23");
  });
});

describe("removeZeroDecimals", () => {
  it("removes trailing zeroes and decimal dot from numeric string", () => {
    expect(removeZeroDecimals("1.00")).to.eq("1");
  });
  it("leaves numeric string as is if decimal part is not zero", () => {
    expect(removeZeroDecimals("1.002")).to.eq("1.002");
    expect(removeZeroDecimals("1.0020")).to.eq("1.0020");
  });
});

describe("formatThousands", () => {
  it("should format thousands", () => {
    expect(formatThousands("1000.0")).to.be.eq("1 000.0");
    expect(formatThousands("1000")).to.be.eq("1 000");
  });

  it("should not format decimal places", () => {
    expect(formatThousands("1000.0000")).to.be.eq("1 000.0000");
  });

  it("should handle undefined", () => {
    expect(formatThousands()).to.be.eq("");
    expect(formatThousands("")).to.be.eq("");
  });
});

describe("Money utils", () => {
  describe("formatMoney", () => {
    it("should format money", () => {
      expect(formatMoney("10000", 2, 2)).to.be.eq("100.00");
      expect(formatMoney("10000", 5, 2)).to.be.eq("0.10");
      expect(formatMoney("100000000000000000000", 1, 1)).to.be.eq("10000000000000000000.0");
    });

    it("should correctly round", () => {
      expect(formatMoney("10.888", 0, 2, ERoundingMode.UP)).to.be.eq("10.89");
      expect(formatMoney("10.882", 0, 2, ERoundingMode.UP)).to.be.eq("10.89");
      expect(formatMoney("10.888", 0, 2, ERoundingMode.DOWN)).to.be.eq("10.88");
      expect(formatMoney("10.888", 0, 2, ERoundingMode.HALF_UP)).to.be.eq("10.89");
      expect(formatMoney("10.882", 0, 2, ERoundingMode.HALF_UP)).to.be.eq("10.88");
      expect(formatMoney("10.888", 0, 2, ERoundingMode.HALF_DOWN)).to.be.eq("10.89");
      expect(formatMoney("10.882", 0, 2, ERoundingMode.HALF_DOWN)).to.be.eq("10.88");
    });
  });

  describe("parseInputToNumber", () => {
    it("returns an empty string if input is empty", () => {
      expect(parseInputToNumber("")).to.eq("");
      expect(parseInputToNumber(undefined)).to.eq("");
    });
    it("returns null if input value is not a valid number", () => {
      expect(parseInputToNumber("12a3")).to.be.null;
      expect(parseInputToNumber("123.")).to.be.null;
      expect(parseInputToNumber("123,")).to.be.null;
      expect(parseInputToNumber(",123")).to.be.null;
      expect(parseInputToNumber(".123")).to.be.null;
      expect(parseInputToNumber("123..123")).to.be.null;
      expect(parseInputToNumber("123,,123")).to.be.null;
      expect(parseInputToNumber("123.,123")).to.be.null;
      expect(parseInputToNumber("123.123,123.123")).to.be.null;
      expect(parseInputToNumber("123,123.123,123")).to.be.null;
      expect(parseInputToNumber("123.123,123,123")).to.be.null;
      expect(parseInputToNumber("123,123.123.123")).to.be.null;
    });
    it("returns a number string in correct format if input value is a parseable number", () => {
      expect(parseInputToNumber("12334")).to.eq("12334");
      expect(parseInputToNumber("123 342.66")).to.eq("123342.66");
      expect(parseInputToNumber("12334.22")).to.eq("12334.22");
      expect(parseInputToNumber("12334,22")).to.eq("12334.22");
      expect(parseInputToNumber("222,222,222.22")).to.eq("222222222.22");
      expect(parseInputToNumber("222.222.222,22")).to.eq("222222222.22");
      expect(parseInputToNumber("213.213.44")).to.eq("21321344");
      expect(parseInputToNumber("222.22")).to.eq("222.22");
      expect(parseInputToNumber("213,213,44")).to.eq("21321344");
      expect(parseInputToNumber("222,22")).to.eq("222.22");
      expect(parseInputToNumber("222.222,22")).to.eq("222222.22");
      expect(parseInputToNumber("222,222.22")).to.eq("222222.22");
    });
  });

  describe("stripNumberFormatting", () => {
    it("should pass through invalid input", () => {
      expect(stripNumberFormatting(".")).to.be.eq(".");
      expect(stripNumberFormatting("")).to.be.eq("");
    });
    it("should strip thousand formatting and trailing zeroes from decimal part", () => {
      expect(stripNumberFormatting("0")).to.be.eq("0");
      expect(stripNumberFormatting("33")).to.be.eq("33");
      expect(stripNumberFormatting("2 221")).to.be.eq("2221");
      expect(stripNumberFormatting("2 2210")).to.be.eq("22210");
      expect(stripNumberFormatting("1 221 222.00000")).to.be.eq("1221222");
      expect(stripNumberFormatting("1 221 222.000010")).to.be.eq("1221222.00001");
      expect(stripNumberFormatting("1 221 222.02010")).to.be.eq("1221222.0201");
    });
  });

  describe("isEmptyValue", () => {
    it('should return true if value is undefined or ""', () => {
      expect(isEmptyValue("")).to.be.true;
      expect(isEmptyValue(undefined)).to.be.true;
    });
    it("should return false if it's not undefined or non-empty string", () => {
      expect(isEmptyValue("abc")).to.be.false;
      expect(isEmptyValue("123")).to.be.false;
    });
    it("should throw if it's not a string and not undefined", () => {
      expect(() => isEmptyValue(1234 as any)).to.throw();
      expect(() => isEmptyValue([] as any)).to.throw();
      expect(() => isEmptyValue(null as any)).to.throw();
    });
  });

  describe("isValidNumber", () => {
    it("should allow valid input", () => {
      expect(isValidNumber("0")).to.be.true;
      expect(isValidNumber("10")).to.be.true;
      expect(isValidNumber("1.011")).to.be.true;
      expect(isValidNumber("1,011")).to.be.true;
      expect(isValidNumber("1 221.011")).to.be.true;
      expect(isValidNumber("1 221,011")).to.be.true;
    });
    it("should disallow invalid input", () => {
      expect(isValidNumber("")).to.be.false;
      expect(isValidNumber(undefined)).to.be.false;
      expect(isValidNumber(",")).to.be.false;
      expect(isValidNumber(".")).to.be.false;
      expect(isValidNumber("x")).to.be.false;
      expect(isValidNumber("1,.1")).to.be.false;
      expect(isValidNumber("11,")).to.be.false;
      expect(isValidNumber("11.")).to.be.false;
      expect(isValidNumber(",11")).to.be.false;
      expect(isValidNumber(".11")).to.be.false;
      expect(isValidNumber("1,520.25")).to.be.false;
      expect(isValidNumber("1.520,25")).to.be.false;
      expect(isValidNumber("1a")).to.be.false;
    });
  });
});
