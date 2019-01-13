import * as React from "react";

import * as chai from "chai";
import * as chaiEnzyme from "chai-enzyme";

import * as enzyme from "enzyme";
import * as EnzymeAdapterReact16 from "enzyme-adapter-react-16";

import ReactCSSModulesTester from "./react-css-module-tester";

describe("ReactCSSModulesTester", () => {

    enzyme.configure({ adapter: new EnzymeAdapterReact16() })
    chai.use(chaiEnzyme());

    let tester = enzyme.shallow(<ReactCSSModulesTester />);

    it("should render correctly", () => {
        chai.expect(tester).to.have.tagName("div");
    });

    it("should have correct prop values", () => {
        chai.expect(tester).to.have.text("Hello World");
    });
});
