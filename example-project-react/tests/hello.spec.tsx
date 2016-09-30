import * as React from "react";
import * as TestUtils from "react-addons-test-utils";
import Hello from "../src/hello";

describe("Hello", () => {

    it("should render", () => {

        let renderer = TestUtils.createRenderer();
        renderer.render(<Hello compiler="Typescript" framework="React" />);

        expect(renderer.getRenderOutput().props.children).toEqual(["Hello from ", "Typescript", " and ", "React", "!" ]);
    });

    it("should keep formatting when run through the ast parser", () => {

        let hello = new Hello();

        expect(hello.oneliner()).toEqual("Hello, I'm a one line function!");
    });
});
