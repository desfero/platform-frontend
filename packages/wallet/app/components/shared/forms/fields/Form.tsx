import { Formik, FormikConfig } from "formik";
import * as React from "react";

export type TFormProps<Values = {}> = FormikConfig<Values>;

/**
 * Wraps formik usage under single component.
 * Will make it easier to add custom form behaviour (for eg. scroll to first invalid)
 */
const Form = <Values extends {}>({
  children,
  initialValues,
  validationSchema,
  validate,
  ...props
}: TFormProps<Values>) => (
  <Formik<Values>
    {...props}
    validate={validate}
    validationSchema={validationSchema}
    initialValues={initialValues}
    enableReinitialize={true}
    validateOnMount={true}
  >
    {formikProps => (typeof children === "function" ? children(formikProps) : children)}
  </Formik>
);

export { Form };
