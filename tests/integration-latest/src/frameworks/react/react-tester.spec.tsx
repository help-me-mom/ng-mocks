import * as React from "react";
import * as Shallow from "react-test-renderer/shallow";
import ReactTester from "./react-tester";

describe("ReactTester", () => {

    it("should render", () => {

        const renderer = Shallow.createRenderer();
        renderer.render(<ReactTester compiler="Typescript" framework="React" />);

        expect(renderer.getRenderOutput().props.children)
            .toEqual(["Hello from ", "Typescript", " and ", "React", "!" ]);
    });
});