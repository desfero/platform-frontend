/**
 * Check in a type-safe way if a given string is in enum
 * @param enumVariable - An enum that value may be included in
 * @param value - A value that may be in `enumVariable`
 *
 * @example
 * enum ECurrency {
 *   ETH = "eth",
 *   N_EUR = "n-eur"
 * }
 *
 * isInEnum(ECurrency, "eth") // true
 * isInEnum(ECurrency, "foo") // false
 */
const isInEnum = <T extends string, TEnumValue extends string>(
  enumVariable: { [key in T]: TEnumValue },
  value: string,
): value is TEnumValue => Object.values(enumVariable).includes(value);

export { isInEnum };
