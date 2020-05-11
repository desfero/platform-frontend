import { Button, EButtonLayout, EButtonSize, EButtonWidth, Input } from "@neufund/design-system";
import { derivationPathPrefixValidator } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import {
  DEFAULT_DERIVATION_PATH_SUB_PREFIX_1,
  DEFAULT_DERIVATION_PATH_SUB_PREFIX_2,
} from "../../../../../../modules/wallet-selector/ledger-wizard/constants";
import { useButtonRole } from "../../../../../shared/hooks/useButtonRole";
import { InlineIcon } from "../../../../../shared/icons/InlineIcon";

import arrowLeft from "../../../../../../assets/img/inline_icons/arrow_left.svg";
import arrowRight from "../../../../../../assets/img/inline_icons/arrow_right.svg";
import magnifyingGlass from "../../../../../../assets/img/inline_icons/magnifying-glass.svg";
import * as styles from "./TableControls.module.scss";

interface ITableControlsProps {
  showNavigation: boolean;
  onSearch: (derivationPathPrefix: string) => void;
  setDerivationPathPrefix: (derivationPathPrefix: string) => void;
  setDerivationPathPrefixValidity: (valid: boolean) => void;
  showPrevAddresses: () => void;
  showNextAddresses: () => void;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  derivationPathPrefix: string;
  hasError: boolean;
}

const ClearSearch = ({ onClick }: { onClick: () => void }) => {
  const props = useButtonRole(onClick);

  return (
    <span className={styles.clearSearch} {...props}>
      <FormattedMessage id="common.clear-search" />
    </span>
  );
};

export class TableControls extends React.Component<ITableControlsProps, {}> {
  onSearch = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const { derivationPathPrefix, setDerivationPathPrefixValidity, onSearch } = this.props;

    const isValid = derivationPathPrefixValidator(
      DEFAULT_DERIVATION_PATH_SUB_PREFIX_1 + derivationPathPrefix,
    );
    if (isValid) {
      setDerivationPathPrefixValidity(true);
      onSearch(derivationPathPrefix);
    } else {
      setDerivationPathPrefixValidity(false);
    }
  };

  onClearSearch = (): void => {
    this.props.setDerivationPathPrefixValidity(true);
    this.props.setDerivationPathPrefix(DEFAULT_DERIVATION_PATH_SUB_PREFIX_2);
    this.props.onSearch(DEFAULT_DERIVATION_PATH_SUB_PREFIX_2);
  };

  render(): React.ReactNode {
    const {
      derivationPathPrefix,
      hasPreviousPage,
      hasNextPage,
      showPrevAddresses,
      showNextAddresses,
      showNavigation,
      setDerivationPathPrefix,
      hasError,
    } = this.props;

    const showClearSearch =
      derivationPathPrefix && derivationPathPrefix !== DEFAULT_DERIVATION_PATH_SUB_PREFIX_2;

    return (
      <div className={styles.wrapper}>
        <form className="d-flex" onSubmit={this.onSearch}>
          <div className={styles.inputWrapper}>
            <span className={styles.prefix}>{DEFAULT_DERIVATION_PATH_SUB_PREFIX_1}</span>
            {/* turn off autoComplete browser makes the background white and covers the placeholder */}
            <Input
              autoComplete="off"
              aria-invalid={hasError}
              className={styles.input}
              name="derivationPathPrefix"
              value={derivationPathPrefix}
              onChange={event => setDerivationPathPrefix(event.target.value)}
            />
          </div>

          <Button
            type="submit"
            layout={EButtonLayout.PRIMARY}
            size={EButtonSize.NORMAL}
            width={EButtonWidth.NO_PADDING}
            className={styles.searchButton}
            svgIcon={magnifyingGlass}
            iconProps={{
              className: styles.searchIcon,
              alt: "Search",
            }}
          />
        </form>

        {showClearSearch && <ClearSearch onClick={this.onClearSearch} />}

        {showNavigation && (
          <div className={styles.navButtons}>
            <button
              className={styles.navButton}
              disabled={!hasPreviousPage}
              onClick={showPrevAddresses}
              data-test-id="btn-previous"
            >
              <InlineIcon svgIcon={arrowLeft} />
            </button>

            <button
              className={styles.navButton}
              disabled={!hasNextPage}
              onClick={showNextAddresses}
              data-test-id="btn-next"
            >
              <InlineIcon svgIcon={arrowRight} />
            </button>
          </div>
        )}
      </div>
    );
  }
}
