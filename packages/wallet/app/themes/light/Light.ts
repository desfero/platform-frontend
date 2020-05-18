import { EThemeVariant, ITheme } from "../types";
import { lightColorSystem } from "./colorSystem";

const navigationTheme = {
  dark: false,
  colors: {
    primary: lightColorSystem.base.gray,
    background: lightColorSystem.base.white,
    card: lightColorSystem.base.white,
    text: lightColorSystem.base.blueGray,
    border: lightColorSystem.base.iron,
  },
};

const LightTheme: ITheme = {
  variant: EThemeVariant.LIGHT,
  colors: lightColorSystem,
  navigationTheme,
};

export { LightTheme };
