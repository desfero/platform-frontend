import * as React from "react";

import * as styles from "./TwitterTimeline.module.scss";

interface IProps {
  url: string;
  userName: string;
}

export class TwitterTimelineEmbed extends React.Component<IProps> {
  render(): React.ReactNode {
    return (
      <iframe
        src={`/external/twitter-iframe.html?user=${this.props.userName}&url=${this.props.url}`}
        className={styles.twitter}
        width="100%"
        height="100%"
        frameBorder={0}
        // allowFullScreen={false}
        title="Twitter Timeline"
        // sandbox="allow-scripts"
      />
    );
  }
}
