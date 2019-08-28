import * as acorn from "acorn";
import * as kt from "karma-typescript";
import * as log4js from "log4js";
import * as sinon from "sinon";
import * as test from "tape";

import * as transform from "./transform";

const logOptions: kt.TransformInitializeLogOptions = {
    appenders: {
        console1: {
            layout: {
                pattern: "%[%d{DATE}:%p [%c]: %]%m",
                type: "pattern"
            },
            type: "console"
        }
    },
    level: "INFO"
};

const mockLogger = {
    debug: sinon.spy()
};

const getLoggerSpy = sinon.stub(log4js, "getLogger").returns(mockLogger as any);
const configureSpy = sinon.spy(log4js, "configure");

transform().initialize(logOptions);

// kt.TransformContext
const createContext = (source: string): any => {
    return {
        config: {},
        filename: "file.js",
        js: {
            ast: acorn.parse(source, { ecmaVersion: 6, sourceType: "module" })
        },
        module: "module",
        source
    };
};

test("transformer should initialize log appenders", (t) => {
    t.deepEqual(configureSpy.args[0][0], {
        appenders: logOptions.appenders,
        categories: { default: { appenders: [ "console1" ], level: "INFO" } }
    });
    t.end();
});

test("transformer should initialize log category", (t) => {
    t.deepEqual(getLoggerSpy.args[0][0], "es6-transform.karma-typescript");
    t.end();
});

test("transformer should check js property", (t) => {

    t.plan(1);

    const context = createContext("export * from './foo.js';");
    context.js = undefined;

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.false(dirty);
    });
});

test("transformer should detect es6 class", (t) => {

    t.plan(1);

    const context = createContext("class Foo {}");

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 const", (t) => {

    t.plan(1);

    const context = createContext("const x = 1;");

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 let", (t) => {

    t.plan(1);

    const context = createContext("let x = 1;");

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 variables mixed with var", (t) => {

    t.plan(1);

    const context = createContext("var a = 1; const x = 1;");

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 nested const", (t) => {

    t.plan(1);

    const context = createContext("module.exports = () => { const x = 1; };");

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 nested let", (t) => {

    t.plan(1);

    const context = createContext("module.exports = () => { let x = 1; };");

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 fat arrow function", (t) => {

    t.plan(1);

    const context = createContext("module.exports = () => { return 'test'; }");

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 wildcard export", (t) => {

    t.plan(1);

    const context = createContext("export * from './foo.js';");

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 default export", (t) => {

    t.plan(1);

    const context = createContext("export default function(){}");

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 named export", (t) => {

    t.plan(1);

    const context = createContext("const x = 1; export { x };");

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 import", (t) => {

    t.plan(1);

    const context = createContext("import foo from './bar.js';");

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should skip ast without body", (t) => {

    t.plan(1);

    const context = createContext("let x = 0;");
    context.js.ast.body = undefined;

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.false(dirty);
    });
});

test("transformer should skip ast without keywords", (t) => {

    t.plan(1);

    const context = createContext("var x = 0;");

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.false(dirty);
    });
});

test("transformer should log activity with level debug", (t) => {

    t.plan(1);

    const context = createContext("export default function(){}");

    transform()(context, () => {
        t.deepEqual(mockLogger.debug.lastCall.args, [ "Transforming %s", "file.js" ]);
    });
});

test("transformer should override options.filename with context.filename", (t) => {

    t.plan(1);

    const context = createContext("export default function(){}");

    transform({ filename: "xxx.js" })(context, () => {
        t.deepEqual(mockLogger.debug.lastCall.args, [ "Transforming %s", "file.js" ]);
    });
});

test("transformer should compile and set new source", (t) => {

    t.plan(1);

    const context = createContext("let x = 1; export default x");

    transform()(context, () => {
        t.equal(context.source, "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n" +
                                "  value: true\n});\nexports[\"default\"] = void 0;\nvar x = 1;\n" +
                                "var _default = x;\nexports[\"default\"] = _default;");
    });
});

test("transformer should compile and set new ast", (t) => {

    t.plan(1);

    const context = createContext("export default function(){}");

    transform()(context, () => {
        t.equal((context.js.ast as any).body[0].type, "ExpressionStatement");
    });
});

test("transformer should use custom compiler options", (t) => {

    t.plan(1);

    const source = "let x = 2; x **= 3; export default x;";
    // kt.TransformContext
    const context: any = {
        config: {},
        filename: "file.js",
        js: {
            ast: acorn.parse(source, { ecmaVersion: 7, sourceType: "module" })
        },
        module: "module",
        source
    };

    transform({ presets: [
        ["@babel/preset-env", {
            targets: {
                chrome: "60"
            }
        }]
    ] })(context, () => {
        t.equal(context.source, "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", " +
                                "{\n  value: true\n});\nexports.default = void 0;\nlet x = 2;\nx **= 3;\n" +
                                "var _default = x;\nexports.default = _default;");
    });
});

test("transformer should handle syntax errors", (t) => {

    t.plan(2);

    const context = createContext("export default function(){}");
    context.source = ".x";

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        t.true(error.message.endsWith("file.js: Unexpected token (1:0)\n\n> 1 | .x\n    | ^"));
        t.false(dirty);
    });
});
