import { storiesOf } from "@storybook/react";
import * as React from "react";

import { withModalBody } from "../../../utils/react-connected-components/storybookHelpers.unsafe";
import { IcbmWalletBalanceComponentInner } from "./IcbmWalletBalanceModal";

export const dummyEthereumAddress = "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359";

const walletMigrationMockData = [
  {
    smartContractAddress: "0xab6916095cd1df60bb79ce92ce3ea74c37c5d359",
    migrationInputData: "0x0000",
    gasLimit: "40000",
    value: "0",
  },
  {
    smartContractAddress: "0xab6916066661df60bb79ce92ce3ea74c37c5d359",
    migrationInputData: "0x1234",
    gasLimit: "40000",
    value: "0",
  },
];

storiesOf("ICBMWalletModalComponent", module)
  .addDecorator(withModalBody())
  .add("Missing Verifications", () => (
    <IcbmWalletBalanceComponentInner
      isOpen={true}
      isUserVerified={false}
      lockedWalletConnected={false}
      onCancel={() => {}}
      onGotoWallet={() => {}}
      ethAddress={dummyEthereumAddress}
      isLoading={false}
      neumarksDue="0.0"
      etherBalance="1.1"
      isEtherMigrationTargetSet={true}
      isWalletMigrating={false}
      isFirstTxDone={false}
      isSecondTxDone={false}
      startWalletMigration={() => {}}
      currentMigrationStep={1}
      goToNextStep={() => {}}
      walletMigrationData={walletMigrationMockData}
      downloadICBMAgreement={() => {}}
    />
  ))
  .add("Missing Migration Target", () => (
    <IcbmWalletBalanceComponentInner
      isOpen={true}
      isUserVerified={true}
      lockedWalletConnected={false}
      onCancel={() => {}}
      onGotoWallet={() => {}}
      ethAddress={dummyEthereumAddress}
      isLoading={false}
      neumarksDue="0.0"
      etherBalance="1.1"
      isEtherMigrationTargetSet={false}
      isWalletMigrating={false}
      isFirstTxDone={false}
      isSecondTxDone={false}
      startWalletMigration={() => {}}
      currentMigrationStep={1}
      walletMigrationData={{ ...walletMigrationMockData }}
      goToNextStep={() => {}}
      downloadICBMAgreement={() => {}}
    />
  ))
  .add("Balance Modal All verifications done", () => (
    <IcbmWalletBalanceComponentInner
      isOpen={true}
      isUserVerified={true}
      lockedWalletConnected={false}
      onCancel={() => {}}
      onGotoWallet={() => {}}
      ethAddress={dummyEthereumAddress}
      isLoading={false}
      neumarksDue="0.0"
      etherBalance="1.1"
      isEtherMigrationTargetSet={true}
      isWalletMigrating={false}
      isFirstTxDone={false}
      isSecondTxDone={false}
      startWalletMigration={() => {}}
      currentMigrationStep={1}
      walletMigrationData={{ ...walletMigrationMockData }}
      goToNextStep={() => {}}
      downloadICBMAgreement={() => {}}
    />
  ))
  .add("With All verifications Step 1", () => (
    <IcbmWalletBalanceComponentInner
      isOpen={true}
      isUserVerified={true}
      lockedWalletConnected={false}
      onCancel={() => {}}
      onGotoWallet={() => {}}
      ethAddress={dummyEthereumAddress}
      isLoading={false}
      neumarksDue="0.0"
      etherBalance="1.1"
      walletMigrationData={{ ...walletMigrationMockData }}
      currentMigrationStep={1}
      isMigrating={true}
      isEtherMigrationTargetSet={true}
      isWalletMigrating={true}
      isFirstTxDone={false}
      isSecondTxDone={false}
      startWalletMigration={() => {}}
      goToNextStep={() => {}}
      downloadICBMAgreement={() => {}}
    />
  ))
  .add("With All verifications Step 1 Success", () => (
    <IcbmWalletBalanceComponentInner
      isOpen={true}
      isUserVerified={true}
      lockedWalletConnected={false}
      onCancel={() => {}}
      onGotoWallet={() => {}}
      ethAddress={dummyEthereumAddress}
      isLoading={false}
      neumarksDue="0.0"
      etherBalance="1.1"
      walletMigrationData={{ ...walletMigrationMockData }}
      currentMigrationStep={1}
      isMigrating={true}
      success={true}
      isEtherMigrationTargetSet={true}
      isWalletMigrating={true}
      isFirstTxDone={true}
      isSecondTxDone={false}
      startWalletMigration={() => {}}
      goToNextStep={() => {}}
      downloadICBMAgreement={() => {}}
    />
  ))
  .add("With All verifications Step 2", () => (
    <IcbmWalletBalanceComponentInner
      isOpen={true}
      isUserVerified={true}
      lockedWalletConnected={false}
      onCancel={() => {}}
      onGotoWallet={() => {}}
      ethAddress={dummyEthereumAddress}
      isLoading={false}
      neumarksDue="0.0"
      etherBalance="1.1"
      walletMigrationData={{ ...walletMigrationMockData }}
      currentMigrationStep={2}
      isMigrating={true}
      isEtherMigrationTargetSet={true}
      isWalletMigrating={true}
      isFirstTxDone={false}
      isSecondTxDone={false}
      startWalletMigration={() => {}}
      goToNextStep={() => {}}
      downloadICBMAgreement={() => {}}
    />
  ))
  .add("With All verifications Success", () => (
    <IcbmWalletBalanceComponentInner
      isOpen={true}
      isUserVerified={true}
      lockedWalletConnected={true}
      onCancel={() => {}}
      onGotoWallet={() => {}}
      ethAddress={dummyEthereumAddress}
      isLoading={false}
      neumarksDue="0.0"
      etherBalance="1.1"
      walletMigrationData={{ ...walletMigrationMockData }}
      currentMigrationStep={2}
      isMigrating={true}
      success={true}
      isEtherMigrationTargetSet={true}
      isWalletMigrating={true}
      isFirstTxDone={false}
      isSecondTxDone={true}
      startWalletMigration={() => {}}
      goToNextStep={() => {}}
      downloadICBMAgreement={() => {}}
    />
  ))
  .add("Wallet Loading", () => (
    <IcbmWalletBalanceComponentInner
      isOpen={true}
      isUserVerified={true}
      lockedWalletConnected={false}
      onCancel={() => {}}
      onGotoWallet={() => {}}
      ethAddress={dummyEthereumAddress}
      isLoading={true}
      neumarksDue="0.0"
      etherBalance="1.1"
      isMigrating={true}
      isEtherMigrationTargetSet={true}
      isWalletMigrating={true}
      isFirstTxDone={false}
      isSecondTxDone={false}
      startWalletMigration={() => {}}
      currentMigrationStep={2}
      goToNextStep={() => {}}
      downloadICBMAgreement={() => {}}
    />
  ));
