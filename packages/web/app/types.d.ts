import { FormikContextType } from "formik";
import { CSSProperties, default as React, ReactElement } from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { ToastOptions } from "react-toastify";

// we dont use AllHtmlAttributes because they include many more fields which can collide easily with components props (like data)
export type CommonHtmlProps = {
  className?: string;
  style?: CSSProperties;
};

export type TTranslatedString = string | ReactElement<FormattedMessage.Props>;

export type TDataTestId = {
  "data-test-id"?: string;
};

export type ToastWithTestData = ToastOptions & TDataTestId;

// TODO: Remove `any` and provide correct types everywhere
export type TFormikConnect<Values = any> = {
  formik: FormikContextType<Values>;
};

export type TElementRef<T> = null | T;

/**
 * Returns HOC inner props
 * @note For consistency HOC\s should be always wrapped by function
 * @example
 * import { compose } from "recompose";
 *
 * const withFoo = () => compose<{ foo: string }, { bar: boolean }>(...);
 * THocProps<typeof withFoo> // { foo: string }
 */
export type THocProps<
  H extends () => (component: React.ComponentType<any>) => React.ComponentType<any>
> = H extends () => (component: React.ComponentType<infer R>) => React.ComponentType<any>
  ? R
  : never;

/**
 * Returns HOC outer props
 * @note For consistency HOC\s should be always wrapped by function
 * @example
 * import { compose } from "recompose";
 *
 * const withFoo = () => compose<{ foo: string }, { bar: boolean }>(...);
 * THocOuterProps<typeof withFoo> // { bar: boolean }
 */
export type THocOuterProps<
  H extends () => (component: React.ComponentType<any>) => React.ComponentType<any>
> = H extends () => (component: React.ComponentType<any>) => React.ComponentType<infer R>
  ? R
  : never;
