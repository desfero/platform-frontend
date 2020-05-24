import { DefaultTheme } from "@react-navigation/native";

export enum EThemeVariant {
  DARK = "dark",
  LIGHT = "light",
}

export interface ITheme {
  variant: EThemeVariant;
  colors: IColorSystem;
  navigationTheme: typeof DefaultTheme;
}

export interface IColorSystem {
  base: {
    yellow: string;
    gray: string;
    silver: string;
    orange: string;
    iron: string;
    white: string;
    green: string;
    red: string;
    blueGray: string;
  };
  accent: {
    yellowDarker: string;
    grayLighter: string;
    grayLighter2: string;
    grayLighter4: string;
    silverLighter: string;
    silverLighter2: string;
    blueGrayDarker: string;
    blueGrayDarker2: string;
  };
}
