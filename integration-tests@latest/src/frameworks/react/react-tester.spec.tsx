import * as React from "react";
import * as TestUtils from "react-addons-test-utils";
import ReactComponent from "./react-component";

describe("ReactComponent", () => {

    it("should render", () => {

        let renderer = TestUtils.createRenderer();
        renderer.render(<ReactComponent compiler="Typescript" framework="React" />);

        expect(renderer.getRenderOutput().props.children).toEqual(["Hello from ", "Typescript", " and ", "React", "!" ]);
    });
});
