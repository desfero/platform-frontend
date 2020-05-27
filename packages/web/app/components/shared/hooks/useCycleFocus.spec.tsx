import { expect } from "chai";
import { mount, ReactWrapper } from "enzyme";
import * as React from "react";

import { useCycleFocus } from "./useCycleFocus";

/*
 * simulate() cannot fire a real event due to JSDOM limitations :
 * @see https://github.com/enzymejs/enzyme/issues/2173#issuecomment-505551552
 *
 * a workaround is to find an element by previously focused id
 * and call .simulate on it (E.g. imitating what a real DOM would do - fire an event on the currently focused element).
 * */

const TestComponent: React.FunctionComponent = () => {
  const refFoo = React.useRef(null);
  const refBar = React.useRef(null);
  const refBaz = React.useRef(null);

  const allRefs = [refBar, refBaz, refFoo];
  const cycleFocus = useCycleFocus(allRefs);

  return (
    <>
      <button id="baz" ref={refBaz} onKeyDown={e => cycleFocus(refBaz, e)}>
        baz
      </button>
      <button id="foo" ref={refFoo} onKeyDown={e => cycleFocus(refFoo, e)}>
        foo
      </button>
      <button id="bar" ref={refBar} onKeyDown={e => cycleFocus(refBar, e)}>
        bar
      </button>
    </>
  );
};

const createBase = () => {
  const container = document.createElement("div");
  document.body.append(container);
  return container;
};

const getFocusedElement = (component: ReactWrapper) =>
  component.find(`#${document.activeElement!.id}`).first();

describe("useCycleFocus", () => {
  it("on mount should set focus on first element in the ref list", async () => {
    const component = mount(<TestComponent />, { attachTo: createBase() });
    expect(document.activeElement && document.activeElement.matches("#bar")).to.be.true;
    component.unmount();
  });

  it("should move focus to the next element in the refs list on TAB ", async () => {
    const component = mount(<TestComponent />, { attachTo: createBase() });

    getFocusedElement(component).simulate("keydown", {
      which: 9,
      keyCode: 9,
      shiftKey: false,
      currentTarget: document.activeElement,
    });
    expect(document.activeElement && document.activeElement.matches("#baz")).to.be.true;

    getFocusedElement(component).simulate("keydown", {
      which: 9,
      keyCode: 9,
      shiftKey: false,
      currentTarget: document.activeElement,
    });
    expect(document.activeElement && document.activeElement.matches("#foo")).to.be.true;

    component.unmount();
  });

  it("should move focus to the previous element in the refs list on SHIFT+TAB ", async () => {
    const component = mount(<TestComponent />, { attachTo: createBase() });

    getFocusedElement(component).simulate("keydown", {
      which: 9,
      keyCode: 9,
      shiftKey: true,
      currentTarget: document.activeElement,
    });
    expect(document.activeElement && document.activeElement.matches("#foo")).to.be.true;

    getFocusedElement(component).simulate("keydown", {
      which: 9,
      keyCode: 9,
      shiftKey: true,
      currentTarget: document.activeElement,
    });
    expect(document.activeElement && document.activeElement.matches("#baz")).to.be.true;

    component.unmount();
  });
});
