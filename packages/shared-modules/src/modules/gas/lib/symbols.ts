import { createLibSymbol } from "../../../utils";
import { GasApi } from "./http/gas-api/GasApi";

export const symbols = {
  gasApi: createLibSymbol<GasApi>("gas-api"),
};
