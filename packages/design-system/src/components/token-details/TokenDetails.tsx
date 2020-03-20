import { TDataTestId } from "@neufund/shared";
import * as React from "react";
import { Link } from "react-router-dom";

import { TokenIcon } from "../icons";

import * as styles from "./TokenDetails.module.scss";

type TExternalProps = {
  equityTokenName: string;
  equityTokenSymbol?: string;
  equityTokenImage: string;
  etoLink?: string;
};

const TokenDetails: React.FunctionComponent<TExternalProps & TDataTestId> = ({
  equityTokenName,
  equityTokenSymbol,
  equityTokenImage,
  children,
  etoLink,
  "data-test-id": dataTestId,
}) => (
  <section
    className={styles.container}
    data-test-id={dataTestId || `token-details-${equityTokenName}`}
  >
    <TokenIcon className={styles.icon} srcSet={{ "1x": equityTokenImage }} alt="" />
    <div className={styles.meta}>
      {etoLink ? (
        <Link
          to={etoLink}
          className={styles.link}
          data-test-id={`token-details-${equityTokenName}-view-profile`}
        >
          {equityTokenName} {!!equityTokenSymbol && `(${equityTokenSymbol})`}
        </Link>
      ) : (
        <p className={styles.tokenName}>
          {equityTokenName} {!!equityTokenSymbol && `(${equityTokenSymbol})`}
        </p>
      )}
      <div className={styles.additionalData}>{children}</div>
    </div>
  </section>
);

export { TokenDetails };
