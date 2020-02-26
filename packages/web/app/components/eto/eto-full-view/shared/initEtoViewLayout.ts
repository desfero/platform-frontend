import { withContainer } from "@neufund/shared";
import * as React from "react";
import { compose } from "recompose";

import { TEtoViewData } from "../../../../modules/eto-view/shared/types";
import { withMetaTags } from "../../../../utils/withMetaTags.unsafe";
import { Layout } from "../../../layouts/Layout";
import { createErrorBoundary } from "../../../shared/errorBoundary/ErrorBoundary.unsafe";
import { ErrorBoundaryLayout } from "../../../shared/errorBoundary/ErrorBoundaryLayout";

export const initEtoViewLayout = (WrappedComponent: React.ComponentType<TEtoViewData>) =>
  compose<TEtoViewData, TEtoViewData>(
    createErrorBoundary(ErrorBoundaryLayout),
    withContainer(Layout),
    withMetaTags<TEtoViewData>(({ eto }) => ({
      title: `${eto.company.brandName} - ${eto.equityTokenName} (${eto.equityTokenSymbol})`,
    })),
  )(WrappedComponent);
