import * as React from "react";

const usePrevious = <V>(value: V) => {
  const ref = React.useRef<V>();

  // Store current value in ref
  React.useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
};

export { usePrevious };
