import * as React from "react";

/*
 * A hook that returns a function to trap focus within a set of html elements
 * and cycle it in a predefined order on TAB/SHIFT-TAB keypress
 *
 * @param refs : an array of React.RefObject objects that will get the focus on
 * each TAB/SHIFT-TAB.
 * The first element in the array gets focus on component mount.
 *
 * @return function that should be provided onKeyDown to the elements that should get
 * the focus
 * this function takes the ref of the element it's provided to and the keyDown event
 *
 * @example:
 * const FriendlyButtons:React.FunctionComponent = () => {
 *   const refFoo = useRef(null)
 *   const refBar = useRef(null)
 *   const refBaz = useRef(null)
 *
 *   //button BAZ gets the focus on component mount
 *   //after that focus cycles in the order of the array
 *   const allRefs = [refBaz,refBar,refFoo]
 *   const cycleFocus = useCycleFocus(allRefs)
 *
 *   return (<>
 *     <button ref={refFoo} onKeyDown={(e) => cycleFocus(refFoo, e)}>foo</button>
 *     <button ref={refBar} onKeyDown={(e) => cycleFocus(refBar, e)}>bar</button>
 *     <button ref={refBaz} onKeyDown={(e) => cycleFocus(refBaz, e)}>baz</button>
 *   </>)
 * }
 *
 * */

const useCycleFocus = (refs: React.RefObject<HTMLElement>[]) => {
  React.useEffect(() => {
    if (refs[0] && refs[0].current !== null) {
      refs[0].current.focus();
    }
  }, []);

  const next = (i: number) => (i + 1 >= refs.length ? 0 : i + 1);
  const prev = (i: number) => (i - 1 >= 0 ? i - 1 : refs.length - 1);

  const moveFocus = (
    ref: React.RefObject<HTMLElement>,
    e: React.KeyboardEvent,
    nextFn: (i: number) => number,
  ) => {
    const currentFocusIndex = refs.indexOf(ref);
    if (currentFocusIndex !== -1) {
      const nextFocusIndex = nextFn(currentFocusIndex);
      e.preventDefault();
      if (refs[nextFocusIndex].current !== null) {
        refs[nextFocusIndex].current !== null && refs[nextFocusIndex].current!.focus();
      }
    }
  };

  return (ref: React.RefObject<HTMLElement>, e: React.KeyboardEvent) => {
    if (e.which === 9 && !e.shiftKey) {
      moveFocus(ref, e, next);
    } else if (e.which === 9 && e.shiftKey) {
      moveFocus(ref, e, prev);
    }
  };
};

export { useCycleFocus };
