import * as acorn from "acorn";
import * as ESTree from "estree";
import * as kt from "karma-typescript/src/api/transforms";
import * as log4js from "log4js";
import * as sinon from "sinon";
import * as test from "tape";

import * as transform from "./transform";

let logOptions: kt.TransformInitializeLogOptions = {
    appenders: [{
        layout: {
            pattern: "%[%d{DATE}:%p [%c]: %]%m",
            type: "pattern"
        },
        type: "console"
    }],
    level: "INFO"
};

let mockLogger = {
    debug: sinon.spy()
};

let getLoggerSpy = sinon.stub(log4js, "getLogger").returns(mockLogger);
let setGlobalLogLevelSpy = sinon.spy(log4js, "setGlobalLogLevel");
let configureSpy = sinon.spy(log4js, "configure");

transform().initialize(logOptions);

// kt.TransformContext
let createContext = (source: string): any => {
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

test("transformer should initialize log level", (t) => {
    t.isEqual(setGlobalLogLevelSpy.args[0][0], logOptions.level);
    t.end();
});

test("transformer should initialize log appenders", (t) => {
    t.deepEqual(configureSpy.args[0][0], { appenders: logOptions.appenders });
    t.end();
});

test("transformer should initialize log category", (t) => {
    t.deepEqual(getLoggerSpy.args[0][0], "es6-transform.karma-typescript");
    t.end();
});

test("transformer should check js property", (t) => {

    t.plan(1);

    let context = createContext("export * from './foo.js';");
    context.js = undefined;

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.false(dirty);
    });
});

test("transformer should detect es6 class", (t) => {

    t.plan(1);

    let context = createContext("class Foo {}");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 const", (t) => {

    t.plan(1);

    let context = createContext("const x = 1;");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 let", (t) => {

    t.plan(1);

    let context = createContext("let x = 1;");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 variables mixed with var", (t) => {

    t.plan(1);

    let context = createContext("var a = 1; const x = 1;");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 nested const", (t) => {

    t.plan(1);

    let context = createContext("module.exports = () => { const x = 1; };");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 nested let", (t) => {

    t.plan(1);

    let context = createContext("module.exports = () => { let x = 1; };");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 fat arrow function", (t) => {

    t.plan(1);

    let context = createContext("module.exports = () => { return 'test'; }");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 wildcard export", (t) => {

    t.plan(1);

    let context = createContext("export * from './foo.js';");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 default export", (t) => {

    t.plan(1);

    let context = createContext("export default function(){}");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 named export", (t) => {

    t.plan(1);

    let context = createContext("const x = 1; export { x };");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should detect es6 import", (t) => {

    t.plan(1);

    let context = createContext("import foo from './bar.js';");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should skip ast without body", (t) => {

    t.plan(1);

    let context = createContext("let x = 0;");
    context.js.ast.body = undefined;

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.false(dirty);
    });
});

test("transformer should skip ast without keywords", (t) => {

    t.plan(1);

    let context = createContext("var x = 0;");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.false(dirty);
    });
});

test("transformer should log activity with level debug", (t) => {

    t.plan(1);

    let context = createContext("export default function(){}");

    transform()(context, () => {
        t.deepEqual(mockLogger.debug.lastCall.args, [ "Transforming %s", "file.js" ]);
    });
});

test("transformer should override options.filename with context.filename", (t) => {

    t.plan(1);

    let context = createContext("export default function(){}");

    transform({ filename: "xxx.js" })(context, () => {
        t.deepEqual(mockLogger.debug.lastCall.args, [ "Transforming %s", "file.js" ]);
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
        t.equal((<ESTree.Program> context.js.ast).body[0].type, "ExpressionStatement");
    });
});

test("transformer should use custom compiler options", (t) => {

    t.plan(1);

    let source = "let x = 2; x **= 3; export default x;";
    // kt.TransformContext
    let context: any = {
        config: {},
        filename: "file.js",
        js: {
            ast: acorn.parse(source, { ecmaVersion: 7, sourceType: "module" })
        },
        module: "module",
        source
    };

    transform({ presets: [
        ["env", {
            targets: {
                chrome: "60"
            }
        }]
    ] })(context, () => {
        t.equal(context.source, "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", " +
                                "{\n  value: true\n});\nlet x = 2;x **= 3;exports.default = x;");
    });
});

test("transformer should handle syntax errors", (t) => {

    t.plan(2);

    let context = createContext("export default function(){}");
    context.source = ".x";

    transform()(context, (error, dirty) => {
        t.isEqual(error.message, "file.js: Unexpected token (1:0)");
        t.false(dirty);
    });
});
