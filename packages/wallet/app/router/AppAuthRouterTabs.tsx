import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import { HomeScreen } from "components/screens/HomeScreen/HomeScreen";
import { PortfolioScreen } from "components/screens/PortfolioScreen/PortfolioScreen";
import { ProfileScreen } from "components/screens/ProfileScreen/ProfileScreen";
import { WalletScreen } from "components/screens/WalletScreen/WalletScreen";
import { EIconType, Icon } from "components/shared/Icon";
import { MenuLabel } from "components/shared/typography/MenuLabel";

import { useTheme } from "themes/ThemeProvider";

import { EAppRoutes } from "./appRoutes";

const Tab = createBottomTabNavigator();

type TBarProps = { color?: string };

const tabConfig = [
  {
    name: "Home",
    route: EAppRoutes.home,
    component: HomeScreen,
    icon: EIconType.HOME,
  },
  {
    name: "Portfolio",
    route: EAppRoutes.portfolio,
    component: PortfolioScreen,
    icon: EIconType.PORTFOLIO,
  },
  {
    name: "Wallet",
    route: EAppRoutes.wallet,
    component: WalletScreen,
    icon: EIconType.WALLET,
  },
  {
    name: "Profile",
    route: EAppRoutes.profile,
    component: ProfileScreen,
    icon: EIconType.PROFILE,
  },
];

const AppAuthRouterTabs: React.FunctionComponent = () => {
  const { navigationTheme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName={EAppRoutes.home}
      tabBarOptions={{
        inactiveTintColor: navigationTheme.colors.text,
      }}
    >
      {tabConfig.map(({ route, name, component, icon }) => (
        <Tab.Screen
          key={route}
          name={name}
          component={component}
          options={{
            tabBarLabel: ({ color }: TBarProps) => <MenuLabel style={{ color }}>{name}</MenuLabel>,
            tabBarIcon: ({ color }: TBarProps) => <Icon style={{ color }} type={icon} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export { AppAuthRouterTabs };
