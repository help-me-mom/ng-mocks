import * as React from "react";
import * as TestUtils from "react-addons-test-utils";
import Hello from "../src/hello";

describe("Hello", () => {

    it("should render", () => {

        let renderer = TestUtils.createRenderer();
        let result = renderer.render((<Hello compiler="TypeScript" framework="React" />));

        expect(result.props.children).toEqual(["Hello from ", "TypeScript", " and ", "React", "!" ]);
    });
});
