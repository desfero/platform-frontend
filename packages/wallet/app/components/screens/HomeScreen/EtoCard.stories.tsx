import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react-native";
import * as React from "react";
import { View } from "react-native";

import nucaoBanner from "../../../assets/images/nucao.png";
import { EtoCard } from "./EtoCard";

storiesOf("Organisms|EtoCard", module)
  .addDecorator((story: () => React.ReactNode) => <View style={{ padding: 20 }}>{story()}</View>)
  .add("default", () => (
    <EtoCard
      etoState="Coming Soon"
      companyName="the nu company (NU+)"
      companyThumbnail={nucaoBanner}
      categories={["Impact", "Food"]}
      onPress={action("onPress")}
    />
  ));
