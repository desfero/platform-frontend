const DERIVATION_PATH_PREFIX_REGEX = /^(44'\/60'\/\d+'?\/(?:[0|1]\/)?)(\d+)$/;

export const derivationPathPrefixValidator = (dp: string): boolean =>
  DERIVATION_PATH_PREFIX_REGEX.test(dp);
