import { createLibSymbol } from "../../utils";
import { GasApi } from "./lib/http/gas-api/GasApi";

export const symbols = {
  gasApi: createLibSymbol<GasApi>("gas-api"),
};
