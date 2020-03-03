import { Button, EButtonLayout, EIconPosition } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { StepCard } from "../../shared/StepCard";

import arrowLeft from "../../../assets/img/inline_icons/arrow_left.svg";
import noComputer from "../../../assets/img/seed_backup/no_computer.svg";
import safe from "../../../assets/img/seed_backup/safe.svg";
import write from "../../../assets/img/seed_backup/write.svg";
import * as styles from "./BackupSeed.module.scss";

interface IBackupSeedIntroProps {
  onNext: () => void;
  onBack: () => void;
}

export const BackupSeedIntro: React.FunctionComponent<IBackupSeedIntroProps> = ({
  onBack,
  onNext,
}) => (
  <>
    <div className={styles.stepCardWrapper}>
      <StepCard
        img={write}
        text={<FormattedMessage id="settings.backup-seed-intro.write-all-words" />}
      />
      <StepCard
        img={noComputer}
        text={<FormattedMessage id="settings.backup-seed-intro.words-warning" />}
      />
      <StepCard
        img={safe}
        text={<FormattedMessage id="settings.backup-seed-intro.store-safely" />}
      />
    </div>
    <Button
      onClick={onNext}
      data-test-id="backup-seed-intro-button"
      className={styles.proceedButton}
    >
      <FormattedMessage id="settings.backup-seed-intro.read-instructions" />
    </Button>
    <Button
      layout={EButtonLayout.GHOST}
      iconPosition={EIconPosition.ICON_BEFORE}
      svgIcon={arrowLeft}
      onClick={onBack}
    >
      <FormattedMessage id="form.button.back" />
    </Button>
  </>
);
