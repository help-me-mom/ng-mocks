import * as React from "react";
import * as ReactCSSModules from "react-css-modules";

import * as chai from "chai";
import * as chaiEnzyme from "chai-enzyme"

import { expect } from "chai";
import { shallow } from "enzyme";

import ReactCSSModulesTester from "./react-css-module-tester";

describe("ReactCSSModulesTester", () => {

    chai.use(chaiEnzyme());

    let tester = shallow(<ReactCSSModulesTester />);

    it("should render correctly", () => {
        expect(tester).to.have.tagName("div");
    });

    it("should have correct prop values", () => {
        expect(tester).to.have.text("Hello World");
    });
});