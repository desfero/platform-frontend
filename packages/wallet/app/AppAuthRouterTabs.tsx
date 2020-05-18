import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Text } from "react-native";

import { EAppRoutes } from "./appRoutes";
import { HomeScreen } from "./components/home/HomeScreen";
import { PortfolioScreen } from "./components/portfolio/PortfolioScreen";
import { ProfileScreen } from "./components/profile/ProfileScreen";
import { EIconType, Icon } from "./components/shared/Icon";
import { WalletScreen } from "./components/wallet/WalletScreen";
import { typographyStyles } from "./styles/typography";
import { useTheme } from "./themes/ThemeProvider";

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
            tabBarLabel: ({ color }: TBarProps) => (
              <Text style={{ ...typographyStyles.menuLabel, color }}>{name}</Text>
            ),
            tabBarIcon: ({ color }: TBarProps) => <Icon style={{ color }} type={icon} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export { AppAuthRouterTabs };
