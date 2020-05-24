import { createLibSymbol } from "../../utils";
import { AnalyticsApi } from "./lib/http/analytics-api/AnalyticsApi";

export const symbols = {
  analyticsApi: createLibSymbol<AnalyticsApi>("analytics-api"),
};
