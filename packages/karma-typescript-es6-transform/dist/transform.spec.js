"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var acorn = require("acorn");
var log4js = require("log4js");
var sinon = require("sinon");
var test = require("tape");
var transform = require("./transform");
var logOptions = {
    appenders: [{
            layout: {
                pattern: "%[%d{DATE}:%p [%c]: %]%m",
                type: "pattern"
            },
            type: "console"
        }],
    level: "INFO"
};
var mockLogger = {
    debug: sinon.spy(),
    error: sinon.spy(),
    warn: sinon.spy()
};
var getLoggerSpy = sinon.stub(log4js, "getLogger").returns(mockLogger);
var setGlobalLogLevelSpy = sinon.spy(log4js, "setGlobalLogLevel");
var configureSpy = sinon.spy(log4js, "configure");
transform().initialize(logOptions);
// kt.TransformContext
var createContext = function (source) {
    return {
        config: {},
        filename: "file.js",
        js: {
            ast: acorn.parse(source, { ecmaVersion: 6, sourceType: "module" })
        },
        module: "module",
        source: source
    };
};
test("transformer should initialize log level", function (t) {
    t.isEqual(setGlobalLogLevelSpy.args[0][0], logOptions.level);
    t.end();
});
test("transformer should initialize log appenders", function (t) {
    t.deepEqual(configureSpy.args[0][0], { appenders: logOptions.appenders });
    t.end();
});
test("transformer should initialize log category", function (t) {
    t.deepEqual(getLoggerSpy.args[0][0], "es6-transform.karma-typescript");
    t.end();
});
test("transformer should check js property", function (t) {
    t.plan(1);
    var context = createContext("export * from './foo.js';");
    context.js = undefined;
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.false(dirty);
    });
});
test("transformer should detect es6 wildcard export", function (t) {
    t.plan(1);
    var context = createContext("export * from './foo.js';");
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});
test("transformer should detect es6 default export", function (t) {
    t.plan(1);
    var context = createContext("export default function(){}");
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});
test("transformer should detect es6 named export", function (t) {
    t.plan(1);
    var context = createContext("const x = 1; export { x };");
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});
test("transformer should detect es6 import", function (t) {
    t.plan(1);
    var context = createContext("import foo from './bar.js';");
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});
test("transformer should skip ast without body", function (t) {
    t.plan(1);
    var context = createContext("let x = 0;");
    context.js.ast.body = undefined;
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.false(dirty);
    });
});
test("transformer should skip ast without import/export", function (t) {
    t.plan(1);
    var context = createContext("let x = 0;");
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.false(dirty);
    });
});
test("transformer should log activity with level debug", function (t) {
    t.plan(1);
    var context = createContext("export default function(){}");
    transform()(context, function () {
        t.deepEqual(mockLogger.debug.lastCall.args, ["Transforming %s", "file.js"]);
    });
});
test("transformer should prefer options.filename over context.filename", function (t) {
    t.plan(1);
    var context = createContext("export default function(){}");
    transform({ filename: "xxx.js" })(context, function () {
        t.deepEqual(mockLogger.debug.lastCall.args, ["Transforming %s", "xxx.js"]);
    });
});
test("transformer should compile and set new source", function (t) {
    t.plan(1);
    var context = createContext("let x = 1; export default x");
    transform()(context, function () {
        t.equal(context.source, "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n" +
            "  value: true\n});\nvar x = 1;exports.default = x;");
    });
});
test("transformer should compile and set new ast", function (t) {
    t.plan(1);
    var context = createContext("export default function(){}");
    transform()(context, function () {
        t.equal(context.js.ast.body[0].type, "ExpressionStatement");
    });
});
test("transformer should use custom compiler options", function (t) {
    t.plan(1);
    var source = "let x = 2; x **= 3; export default x;";
    // kt.TransformContext
    var context = {
        config: {},
        filename: "file.js",
        js: {
            ast: acorn.parse(source, { ecmaVersion: 7, sourceType: "module" })
        },
        module: "module",
        source: source
    };
    transform({ presets: ["es2016"] })(context, function () {
        t.equal(context.source, "let x = 2;x = Math.pow(x, 3);\nexport default x;");
    });
});
test("transformer should handle syntax errors", function (t) {
    t.plan(2);
    var context = createContext("export default function(){}");
    context.source = ".x";
    transform()(context, function (error, dirty) {
        t.isEqual(error.message, "file.js: Unexpected token (1:0)");
        t.false(dirty);
    });
});
//# sourceMappingURL=transform.spec.js.map