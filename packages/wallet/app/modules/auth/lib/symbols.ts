import { createLibSymbol } from "@neufund/shared-modules";

import { AppSingleKeyStorage } from "../../storage";
import { TJWT } from "./schemas";

export const symbols = {};

export const privateSymbols = {
  jwtStorage: createLibSymbol<AppSingleKeyStorage<TJWT>>("jwtStorage"),
};
