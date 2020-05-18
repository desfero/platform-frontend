import { toCamelCase } from "@neufund/shared-utils";
import queryString from "query-string";

import { isValidLink } from "./utils";

// TODO: refactor selectUnsubscriptionLinkFromQueryString to get rid of router
type State = any;

const getUnsubscriptionLinkFromQueryString = (query: string) => {
  const { confirmationUrl } = toCamelCase(queryString.parse(query, { decode: true }));

  return confirmationUrl && isValidLink(confirmationUrl) ? confirmationUrl : undefined;
};

export const selectUnsubscriptionLinkFromQueryString = (state: State): string | undefined => {
  const routerState = state.router;

  if (!routerState.location) {
    return undefined;
  }

  return getUnsubscriptionLinkFromQueryString(routerState.location.search);
};
