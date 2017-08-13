import * as kt from "karma-typescript/src/api/transforms";
import * as log4js from "log4js";
import * as os from "os";
import * as path from "path";
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
    debug: sinon.spy(),
    warn: sinon.spy()
};

let getLoggerSpy = sinon.stub(log4js, "getLogger").returns(mockLogger);
let setGlobalLogLevelSpy = sinon.spy(log4js, "setGlobalLogLevel");
let configureSpy = sinon.spy(log4js, "configure");

transform().initialize(logOptions);

// kt.TransformContext
let createContext = (source: string): any => {
    return {
        config: {},
        filename: "file.css",
        module: "module",
        source
    };
};

let stripConsoleColors = (s: string) => {
    return s.replace(/.\[\d\d*m/g, "");
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
    t.deepEqual(getLoggerSpy.args[0][0], "cssmodules-transform.karma-typescript");
    t.end();
});

test("transformer should set the dirty flag", (t) => {
    t.plan(1);

    let context = createContext(".box { color: red; }");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should set the source property to the processed value", (t) => {
    t.plan(1);

    let context = createContext(".box { color: red; }");

    transform()(context, () => {
        t.isEqual(context.source, "{\"box\":\"file_box_tFmNy\"}");
    });
});

test("transformer should use custom options", (t) => {
    t.plan(1);

    let context = createContext(".box { color: red; }");

    transform({}, { generateScopedName: "[name]__[local]___[hash:base64:5]"  })(context, () => {
        t.isEqual(context.source, "{\"box\":\"file__box___tFmNy\"}");
    });
});

test("transformer should use default filter on the module filename", (t) => {
    t.plan(1);

    let context = createContext(".box { color: red; }");
    context.filename = "style.less";

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.false(dirty);
    });
});

test("transformer should use custom filter on the module filename", (t) => {
    t.plan(1);

    let context = createContext(".box { color: red; }");
    context.filename = "style.cssx";

    transform({}, {}, /\.cssx$/)(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should log activity with level debug", (t) => {
    t.plan(1);

    let context = createContext(".box { color: red; }");

    transform()(context, () => {
        t.deepEqual(mockLogger.debug.lastCall.args, [ "Transforming %s", "file.css" ]);
    });
});

test("transformer should not process empty files", (t) => {
    t.plan(2);

    let context = createContext("");

    transform()(context, (error, dirty) => {
        t.isEqual(error.message, "File is empty");
        t.false(dirty);
    });
});

test("transformer should log warnings", (t) => {

    t.plan(2);

    let context = createContext("@value red blue @value green yellow");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
        t.deepEqual(mockLogger.warn.lastCall.args[0],
            "postcss-modules-values: Invalid value definition: red blue @value green yellow");
    });
});

test("transformer should catch CssSyntaxError and only log as a warning", (t) => {

    t.plan(2);

    let context = createContext("export *");

    transform()(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.false(dirty);
        t.deepEqual(stripConsoleColors(mockLogger.warn.lastCall.args[0]),
            path.join(process.cwd(), "/file.css") +
            ":1:1: Unknown word" + os.EOL + "> 1 | export *\n    | ^");
    });
});

test("transformer should catch errors other than CssSyntaxError", (t) => {

    t.plan(2);

    let context = createContext(".box > * { composes: x from \"./y.css\"; }");

    transform()(context, (error, dirty) => {
        t.isEqual(error.message, "composition is only allowed when selector is single " +
                                 ":local class name not in \":local(.box) > *\"");
        t.false(dirty);
    });
});
