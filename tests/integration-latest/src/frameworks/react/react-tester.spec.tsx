import * as React from "react";
import * as TestUtils from "react-addons-test-utils";
import ReactTester from "./react-tester";

describe("ReactTester", () => {

    it("should render", () => {

        let renderer = TestUtils.createRenderer();
        renderer.render(<ReactTester compiler="Typescript" framework="React" />);

        expect(renderer.getRenderOutput().props.children)
            .toEqual(["Hello from ", "Typescript", " and ", "React", "!" ]);
    });
});
