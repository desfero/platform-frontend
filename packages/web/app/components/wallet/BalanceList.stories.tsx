import { EthIcon, EthIconWithLock } from "@neufund/design-system";
import { ECurrency } from "@neufund/shared-utils";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { hasBalance } from "../../modules/investment-flow/utils";
import { EBalanceActionLevel, EBalanceViewType, TBalance } from "../../modules/wallet-view/types";
import { BalanceList } from "./BalanceList";

const balances: TBalance[] = [
  {
    amount: "2000312217000000000",
    balanceAdditionalInfo: undefined,
    balanceName: EBalanceViewType.ETH,
    currency: ECurrency.ETH,
    euroEquivalentAmount: "389864625857099778516.40584",
    logo: EthIcon,
    walletActions: [
      {
        dispatchAction: action("send"),
        disableIf: data => !hasBalance(data.amount),
        text: <FormattedMessage id="shared-component.account-balance.send" />,
        level: EBalanceActionLevel.PRIMARY,
      },
      {
        dispatchAction: action("deposit"),
        disableIf: () => false,
        text: <FormattedMessage id="shared-component.account-balance.receive" />,
        level: EBalanceActionLevel.PRIMARY,
      },
    ],
  },
  {
    amount: "100000000000000000000",
    balanceAdditionalInfo: <FormattedMessage id="wallet.icbm-balance-unlocked.tooltip" />,
    balanceName: EBalanceViewType.ICBM_ETH,
    currency: ECurrency.ETH,
    euroEquivalentAmount: "1.9490188708730952e+22",
    logo: EthIconWithLock,
    walletActions: [],
  },
];

storiesOf("BalanceList", module).add("default", () => <BalanceList balances={balances} />);
