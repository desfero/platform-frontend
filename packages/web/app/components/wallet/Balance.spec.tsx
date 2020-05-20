import { tid } from "@neufund/shared-utils/tests";
import { expect } from "chai";
import { mount } from "enzyme";
import * as React from "react";

import { wrapWithIntl } from "../../../test/integrationTestUtils.unsafe";
import { EBalanceType } from "../../modules/wallet-view/types";
import { Balance } from "./Balance";
import { createBalanceActions, createBalanceUiData } from "./utils";

/*
 * @see https://github.com/enzymejs/enzyme/issues/1253 for the reason for .hostNodes()
 * */

//TODO add a textContent test util method

const dummyDispatch = () => {};

const actions = createBalanceActions(dummyDispatch);
const ethEmpty = {
  name: EBalanceType.ETH,
  amount: "0",
  euroEquivalentAmount: "0",
};

const ethNotEmpty = {
  name: EBalanceType.ETH,
  amount: "25054421780000000",
  euroEquivalentAmount: "352678976500000000",
};

const neuroEmpty = {
  name: EBalanceType.NEUR,
  amount: "0",
  euroEquivalentAmount: "0",
};

const neuroNotEmpty = {
  name: EBalanceType.NEUR,
  amount: "25054421780000000",
  euroEquivalentAmount: "352678976500000000",
};

const neuroRestricted = {
  name: EBalanceType.RESTRICTED_NEUR,
  amount: "25054421780000000",
  euroEquivalentAmount: "352678976500000000",
};

const icbmEth = {
  name: EBalanceType.ICBM_ETH,
  amount: "25054421780000000",
  euroEquivalentAmount: "352678976500000000",
};

const icbmNeuro = {
  name: EBalanceType.ICBM_NEUR,
  amount: "25054421780000000",
  euroEquivalentAmount: "352678976500000000",
};

const lockedIcbmEth = {
  name: EBalanceType.LOCKED_ICBM_ETH,
  amount: "25054421780000000",
  euroEquivalentAmount: "352678976500000000",
};

const lockedIcbmNeuro = {
  name: EBalanceType.LOCKED_ICBM_NEUR,
  amount: "25054421780000000",
  euroEquivalentAmount: "352678976500000000",
};

describe("<Balance />", () => {
  it("empty eth", () => {
    const balanceData = createBalanceUiData(ethEmpty, actions);
    const component = mount(wrapWithIntl(<Balance {...balanceData} />));

    expect(component.exists(tid("eth-icon"))).to.be.true;
    expect(component.find(tid("balance-name")).text()).to.eq("Ether");
    expect(component.exists(tid("balance.info"))).to.be.false;
    expect(
      component
        .find(tid("wallet-balance.eth.balance-value"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0");
    expect(
      component
        .find(tid("wallet-balance.eth.balance-value-euro-equivalent"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0");
    expect(
      component
        .find(tid("wallet-balance.eth.balance-value-euro-equivalent"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0");
    expect(component.exists(tid("wallet.eth.withdraw.button"))).to.be.true;
    expect(
      component
        .find(tid("wallet.eth.withdraw.button"))
        .hostNodes()
        .prop("disabled"),
    ).to.exist;
    expect(component.exists(tid("wallet-balance.eth.transfer-button"))).to.be.true;
    expect(
      component
        .find(tid("wallet-balance.eth.transfer-button"))
        .hostNodes()
        .prop("disabled"),
    ).to.not.exist;
  });
  it("eth not empty", () => {
    const balanceData = createBalanceUiData(ethNotEmpty, actions);
    const component = mount(wrapWithIntl(<Balance {...balanceData} />));

    expect(component.exists(tid("eth-icon"))).to.be.true;
    expect(component.find(tid("balance-name")).text()).to.eq("Ether");
    expect(component.exists(tid("balance.info"))).to.be.false;
    expect(
      component
        .find(tid("wallet-balance.eth.balance-value"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0.0250");
    expect(
      component
        .find(tid("wallet-balance.eth.balance-value-euro-equivalent"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0.35");
    expect(component.exists(tid("wallet.eth.withdraw.button"))).to.be.true;
    expect(
      component
        .find(tid("wallet.eth.withdraw.button"))
        .hostNodes()
        .prop("disabled"),
    ).to.not.exist;
    expect(component.exists(tid("wallet-balance.eth.transfer-button"))).to.be.true;
    expect(
      component
        .find(tid("wallet-balance.eth.transfer-button"))
        .hostNodes()
        .prop("disabled"),
    ).to.not.exist;
  });
  it("neuro empty", () => {
    const balanceData = createBalanceUiData(neuroEmpty, actions);
    const component = mount(wrapWithIntl(<Balance {...balanceData} />));

    expect(component.exists(tid("neuro-icon"))).to.be.true;
    expect(component.find(tid("balance-name")).text()).to.eq("nEUR");
    expect(component.exists(tid("balance.info"))).to.be.false;
    expect(
      component
        .find(tid("wallet-balance.neur.balance-value"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0");
    expect(
      component
        .find(tid("wallet-balance.neur.balance-value-euro-equivalent"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0");
    expect(component.exists(tid("wallet-balance.neur.redeem-button"))).to.be.true;
    expect(
      component
        .find(tid("wallet-balance.neur.redeem-button"))
        .hostNodes()
        .prop("disabled"),
    ).to.exist;
    expect(component.exists(tid("wallet-balance.neur.purchase-button"))).to.be.true;
    expect(
      component
        .find(tid("wallet-balance.neur.purchase-button"))
        .hostNodes()
        .prop("disabled"),
    ).to.not.exist;
  });

  it("neuro not empty", () => {
    const balanceData = createBalanceUiData(neuroNotEmpty, actions);
    const component = mount(wrapWithIntl(<Balance {...balanceData} />));

    expect(component.exists(tid("neuro-icon"))).to.be.true;
    expect(component.find(tid("balance-name")).text()).to.eq("nEUR");
    expect(component.exists(tid("balance.info"))).to.be.false;
    expect(
      component
        .find(tid("wallet-balance.neur.balance-value"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0.02");
    expect(
      component
        .find(tid("wallet-balance.neur.balance-value-euro-equivalent"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0.35");
    expect(component.exists(tid("wallet-balance.neur.redeem-button"))).to.be.true;
    expect(
      component
        .find(tid("wallet-balance.neur.redeem-button"))
        .hostNodes()
        .prop("disabled"),
    ).to.not.exist;
    expect(component.exists(tid("wallet-balance.neur.purchase-button"))).to.be.true;
    expect(
      component
        .find(tid("wallet-balance.neur.purchase-button"))
        .hostNodes()
        .prop("disabled"),
    ).to.not.exist;
  });

  it("neuro not empty", () => {
    const balanceData = createBalanceUiData(neuroRestricted, actions);
    const component = mount(wrapWithIntl(<Balance {...balanceData} />));

    expect(component.exists(tid("neuro-lock-icon"))).to.be.true;
    expect(
      component
        .find(tid("balance-name"))
        .text()
        .includes("nEUR"),
    ).to.be.true;
    expect(component.exists(tid("balance.info"))).to.be.true;
    expect(
      component
        .find(tid("wallet-balance.restricted-neur.balance-value"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0.02");
    expect(
      component
        .find(tid("wallet-balance.restricted-neur.balance-value-euro-equivalent"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0.35");
    expect(component.exists(tid("wallet-balance.neur.redeem-button"))).to.be.true;
    expect(
      component
        .find(tid("wallet-balance.neur.redeem-button"))
        .hostNodes()
        .prop("disabled"),
    ).to.exist;
    expect(component.exists(tid("wallet-balance.neur.purchase-button"))).to.be.true;
    expect(
      component
        .find(tid("wallet-balance.neur.purchase-button"))
        .hostNodes()
        .prop("disabled"),
    ).to.exist;
  });

  it("icbm eth", () => {
    const balanceData = createBalanceUiData(icbmEth, actions);
    const component = mount(wrapWithIntl(<Balance {...balanceData} />));

    expect(component.exists(tid("eth-lock-icon"))).to.be.true;
    expect(
      component
        .find(tid("balance-name"))
        .text()
        .includes("Icbm Ether"),
    ).to.be.true;
    expect(component.exists(tid("balance.info"))).to.be.true;
    expect(
      component
        .find(tid("icbm-wallet.eth.balance-value"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0.0250");
    expect(
      component
        .find(tid("icbm-wallet.eth.balance-value-euro-equivalent"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0.35");
    expect(component.exists("button")).to.be.false;
  });

  it("icbm neuro", () => {
    const balanceData = createBalanceUiData(icbmNeuro, actions);
    const component = mount(wrapWithIntl(<Balance {...balanceData} />));

    expect(component.exists(tid("neuro-lock-icon"))).to.be.true;
    expect(
      component
        .find(tid("balance-name"))
        .text()
        .includes("Icbm nEUR"),
    ).to.be.true;
    expect(component.exists(tid("balance.info"))).to.be.true;
    expect(
      component
        .find(tid("icbm-wallet.neur.balance-value"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0.02");
    expect(
      component
        .find(tid("icbm-wallet.neur.balance-value-euro-equivalent"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0.35");
    expect(component.exists("button")).to.be.false;
  });

  it("locked icbm eth", () => {
    const balanceData = createBalanceUiData(lockedIcbmEth, actions);
    const component = mount(wrapWithIntl(<Balance {...balanceData} />));

    expect(component.exists(tid("eth-lock-icon"))).to.be.true;
    expect(
      component
        .find(tid("balance-name"))
        .text()
        .includes("Icbm Ether"),
    ).to.be.true;
    expect(component.exists(tid("balance.info"))).to.be.true;
    expect(
      component
        .find(tid("locked-icbm-wallet.eth.balance-value"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0.0250");
    expect(
      component
        .find(tid("locked-icbm-wallet.eth.balance-value-euro-equivalent"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0.35");
    expect(component.exists(tid("wallet.icbm-eth.upgrade-button"))).to.be.true;
    expect(
      component
        .find(tid("wallet.icbm-eth.upgrade-button"))
        .hostNodes()
        .prop("disabled"),
    ).to.not.exist;
  });

  it("locked icbm neuro", () => {
    const balanceData = createBalanceUiData(lockedIcbmNeuro, actions);
    const component = mount(wrapWithIntl(<Balance {...balanceData} />));

    expect(component.exists(tid("neuro-lock-icon"))).to.be.true;
    expect(
      component
        .find(tid("balance-name"))
        .text()
        .includes("Icbm nEUR"),
    ).to.be.true;
    expect(component.exists(tid("balance.info"))).to.be.true;
    expect(
      component
        .find(tid("locked-icbm-wallet.neur.balance-value"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0.02");
    expect(
      component
        .find(tid("locked-icbm-wallet.neur.balance-value-euro-equivalent"))
        .hostNodes()
        .find(tid("value"))
        .text(),
    ).to.eq("0.35");
    expect(component.exists(tid("wallet.icbm-euro.upgrade-button"))).to.be.true;
    expect(
      component
        .find(tid("wallet.icbm-euro.upgrade-button"))
        .hostNodes()
        .prop("disabled"),
    ).to.not.exist;
  });
});
