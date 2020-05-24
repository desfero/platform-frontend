import BigNumber from "bignumber.js";

export type TBigNumberVariants = string | BigNumber;

/**
 * Generates a dictionary with `T` values and `R` keys (default string)
 */
export type Dictionary<T, R extends string | number | symbol = string> = Record<R, T>;

/**
 * Generates a dictionary with `T` values and `R` keys (default string) where all properties are marked as partial
 */
export type PartialDictionary<T, R extends string | number | symbol = string> = Partial<
  Dictionary<T, R>
>;

export type TDictionaryValues<T> = T extends Dictionary<infer U> ? U : never;
export type TDictionaryArrayValues<T> = T extends Array<Dictionary<infer U>> ? U : never;

export type Primitive = string | number | boolean | undefined | null;

/**
 * Forces deeply all properties to be marked as partial (undefined)
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer Z>
    ? ReadonlyArray<DeepPartial<Z>>
    : DeepPartial<T[P]>;
};

/**
 * Types allowed to keep as writable
 */
type WhitelistedWritableTypes = Date | BigNumber;
export type DeepReadonly<T> = T extends Primitive | WhitelistedWritableTypes
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<U>
  : T extends Function
  ? T
  : DeepReadonlyObject<T>;

export type DeepReadonlyObject<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };

export type DeepWritable<T> = T extends Primitive | WhitelistedWritableTypes | Function
  ? T
  : T extends any[] | ReadonlyArray<any>
  ? IWritableArray<T[number]>
  : DeepWritableObject<T>;
type DeepWritableObject<T> = { -readonly [P in keyof T]: DeepWritable<T[P]> };
interface IWritableArray<T> extends Array<DeepWritable<T>> {}

export type TDataTestId = {
  "data-test-id"?: string;
};

/**
 * Forces a tuple type over array
 * @example
 * Tuple<[string, number]> // [string, number]
 */
export type Tuple<T = any> = [T] | T[];

/**
 * Allows either T or T[]
 */
export type SingleOrArray<T> = T | Tuple<T>;

/**
 * Forces an array to have at least one member of a given type T
 */
export type ArrayWithAtLeastOneMember<T> = [T, ...T[]];

/**
 * From T, omit a set of properties whose keys are in the union K
 * @example OmitKeys<{ foo: boolean, bar: string }, "foo"> // { bar: string }
 */
export type OmitKeys<T, K> = Pick<T, Exclude<keyof T, K>>;

/**
 * From T, omit a set of properties from K
 * @example OmitKeys<{ foo: boolean, bar: string }, { foo: boolean, }> // { bar: string }
 */
export type Omit<T, K> = OmitKeys<T, keyof K>;

/**
 * Make all properties in T required and non nullable
 */
export type RequiredNonNullable<T> = { [P in keyof T]-?: NonNullable<T[P]> };

/**
 * In T, mark as required and non nullable properties from K
 * Useful for types narrowing after recompose `branch` method
 * @example
 * RequiredByKeys<{ foo?: boolean | null, bar?: string }, "foo"> // { foo: boolean, bar?: string }
 */
export type RequiredByKeys<T, K extends keyof T> = RequiredNonNullable<Pick<T, K>> & OmitKeys<T, K>;

/**
 * In T, mark as partial properties from K
 * @example
 * PartialByKeys<{ foo: boolean, bar: string }, "foo"> // { foo?: boolean, bar: string }
 */
export type PartialByKeys<T, K extends keyof T> = Partial<Pick<T, K>> & OmitKeys<T, K>;

/**
 * Overwrites properties from T1 with one from T2
 * @example
 * Overwrite<{ foo: boolean, bar: string }, { foo: number }> // { foo: number, bar: string }
 */
export type Overwrite<T1, T2> = { [P in Exclude<keyof T1, keyof T2>]: T1[P] } & T2;

/**
 * Change the type of all properties from U in T to `never` and `undefined`
 * @example
 * Without<{ foo: boolean, bar: string }, { foo: boolean }> // { foo?: never }
 */
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

/**
 * Makes union exclusive. Useful in situations when only single prop can be provided at the same time
 * @example
 * XOR<{ foo: boolean}, { bar: number }> // { foo: boolean, bar?: never } | { foo?: never, bar: number }
 */
export type XOR<T extends object, U extends object> = (Without<T, U> & U) | (Without<U, T> & T);

/**
 * Get object value types
 * @example
 * ValueOf<{ foo: boolean, bar: string }> // boolean | string
 */
export type Values<T> = T[keyof T];

/**
 * Get object value types of an union type
 * @example
 * ValuesOfUnion<{ foo: boolean, bar: string } | { baz: number }> // boolean | string | number
 */
export type ValuesOfUnion<T> = T extends any ? Values<T> : never;

/**
 * Get object value type (lookup type). Fallbacks to `Default` when key is not in an object
 * @note If you don't need to get key from an union or if key is always present in an union prefer normal lookup type (`Obj["key"]`)
 * @example
 * Get<{ foo: boolean, bar: string } | { bar: number }, "bar", {}> // string | number
 * Get<{ foo: boolean, bar: string } | { }, "bar", {}> // string | {}
 */
export type Get<Obj, Key extends string | number | symbol, Default> = Obj extends {
  [_ in Key]: infer P;
}
  ? P
  : Default;

/**
 * From T, select a union of property names which values extends R
 * @example
 * SelectPropertyNames<{ foo: boolean, bar: string, baz: string }, string> // "bar" | "baz"
 */
export type SelectPropertyNames<T, R> = { [K in keyof T]: T[K] extends R ? K : never }[keyof T];

/**
 * Stricter version of build in ReturnType. When T is not a function returns never
 * @example
 * ReturnTypeStrict<{}> // never
 * ReturnTypeStrict<() => string> // string
 */
export type ReturnTypeStrict<T> = T extends (...args: any) => infer R ? R : never;

/**
 * Returns a flatten return type for a given T. When T is not a function returns never
 * @example
 * ReturnTypeFlatten<{}> // never
 * ReturnTypeStrict<() => string> // string
 * ReturnTypeStrict<() => [string, boolean]> // string | boolean
 */
export type ReturnTypeFlatten<T> = T extends (...args: any) => infer R
  ? R extends Tuple
    ? R[number]
    : R
  : never;

/**
 * Converts union to intersection by forcing contravariant behaviour
 *
 * @example
 * UnionToIntersection<{ foo: string } | { bar: number }> // { foo: string } & { bar: number }
 */
export type UnionToIntersection<U> = (U extends any
? (k: U) => void
: never) extends (k: infer I) => void
  ? I
  : never;
