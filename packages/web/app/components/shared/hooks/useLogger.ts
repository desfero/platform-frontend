import { ILogger, noopLogger } from "@neufund/shared-modules";
import { ContainerContext } from "@neufund/shared-utils";
import * as React from "react";

import { symbols } from "../../../di/symbols";

const useLogger = () => {
  const container = React.useContext(ContainerContext);

  // For storybook return noop logger as container is not connected with stories
  if (process.env.STORYBOOK_RUN === "1") {
    return noopLogger;
  }

  if (container === undefined) {
    throw new Error("Inversify container should be defined at this stage");
  }

  return container.get<ILogger>(symbols.logger);
};

export { useLogger };
