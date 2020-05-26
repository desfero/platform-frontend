import { expect } from "chai";
import { mount } from "enzyme";
import * as React from "react";
import { spy } from "sinon";


import { moveFocus, useCycleFocus } from "./useCycleFocus";

/*
* simulate won't work:
* @see https://github.com/enzymejs/enzyme/issues/2173#issuecomment-505551552
* */



const TestComponent: React.FunctionComponent = () => {
  const refFoo = React.useRef(null)
  const refBar = React.useRef(null)
  const refBaz = React.useRef(null)


  const allRefs = [refBaz, refBar, refFoo]
  const cycleFocus = useCycleFocus(allRefs)

  return (<>
    <button id="foo" ref={refFoo} onKeyDown={(e) => cycleFocus(refFoo, e)}>foo</button>
    <button id="bar" ref={refBar} onKeyDown={(e) => cycleFocus(refBar, e)}>bar</button>
    <button id="baz" ref={refBaz} onKeyDown={(e) => cycleFocus(refBaz, e)}>baz</button>
  </>)
}


describe.only("useCycleFocus", () => {


  it("should set focus on first provided element", async () => {
    const component = mount(<TestComponent />,{ attachTo: document.body })
    const focusedElement = document.activeElement;
    // component.simulate("keydown", {which:9, keyCode:9, shiftKey:false});


    expect(focusedElement && focusedElement.matches('#baz')).to.be.true;
    component.unmount()
  })

  it("should set focus on second provided element", async () => {
    const focusSpy = spy(moveFocus)

    const component = mount(<TestComponent />,{ attachTo: document.body })
    console.log()
    component.simulate("keydown", {which:9, keyCode:9, shiftKey:false});


    expect(focusSpy).to.be.calledOnce;
  })
})
