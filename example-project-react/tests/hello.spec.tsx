import * as React from "react";
import * as TestUtils from "react-addons-test-utils";
import Hello from "../src/hello";

describe("Hello", () => {

    it("should render", () => {

        let renderer = TestUtils.createRenderer();
        let result = renderer.render((<Hello compiler="Typescript" framework="React" />));

        expect(result.props.children).toEqual(["Hello from ", "Typescript", " and ", "React", "!" ]);
    });

    it("should keep formatting when run through the ast parser", () => {

        let hello = new Hello();

        expect(hello.oneliner()).toEqual("Hello, I'm a one line function!");
    });
});
