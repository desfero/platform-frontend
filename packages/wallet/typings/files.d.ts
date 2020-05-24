/* eslint-disable import/no-default-export */

declare module "*.svg" {
  import { SvgProps } from "react-native-svg";

  const content: React.FunctionComponent<SvgProps>;
  export default content;
}

declare module "*.png" {
  const value: number;
  export default value;
}
declare module "*.gif" {
  const value: number;
  export default value;
}
declare module "*.jpg" {
  const value: number;
  export default value;
}
declare module "*.webm" {
  const value: number;
  export default value;
}
declare module "*.mp4" {
  const value: number;
  export default value;
}
