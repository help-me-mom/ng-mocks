import * as acorn from "acorn";
import * as ESTree from "estree";
import * as test from "tape";

import { TransformContext } from "karma-typescript/src/api";

import * as transform from "./transform";

let createContext = (source: string): TransformContext => {
    return {
        ast: acorn.parse(source, { ecmaVersion: 6, sourceType: "module" }),
        basePath: process.cwd(),
        filename: "file.js",
        module: "module",
        source,
        tsVersion: "0.0.0",
        urlRoot: "/"
    };
};

test("transformer should detect es6 wildcard export", (t) => {

    t.plan(1);

    let context = createContext("export * from './foo.js';");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.assert(dirty);
    });
});

test("transformer should detect es6 default export", (t) => {

    t.plan(1);

    let context = createContext("export default function(){}");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.assert(dirty);
    });
});

test("transformer should detect es6 named export", (t) => {

    t.plan(1);

    let context = createContext("const x = 1; export { x };");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.assert(dirty);
    });
});

test("transformer should detect es6 import", (t) => {

    t.plan(1);

    let context = createContext("import foo from './bar.js';");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.assert(dirty);
    });
});

test("transformer should compile and set new source", (t) => {

    t.plan(1);

    let context = createContext("let x = 1; export default x");

    transform()(context, () => {
        t.equal(context.source, "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n" +
                                "  value: true\n});\nvar x = 1;exports.default = x;");
    });
});

test("transformer should compile and set new ast", (t) => {

    t.plan(1);

    let context = createContext("export default function(){}");

    transform()(context, () => {
        t.equal((<ESTree.Program> context.ast).body[0].type, "ExpressionStatement");
    });
});

test("transformer should use custom compiler options", (t) => {

    t.plan(1);

    let source = "let x = 2; x **= 3; export default x;";
    let context = {
        ast: acorn.parse(source, { ecmaVersion: 7, sourceType: "module" }),
        basePath: process.cwd(),
        filename: "file.js",
        module: "module",
        source,
        tsVersion: "0.0.0",
        urlRoot: "/"
    };

    transform({ presets: ["es2016"] })(context, () => {
        t.equal(context.source, "let x = 2;x = Math.pow(x, 3);\nexport default x;");
    });
});
