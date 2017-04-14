import * as kt from "karma-typescript/src/api/transforms";
import * as log4js from "log4js";
import * as os from "os";
import * as path from "path";
import * as postcss from "postcss";
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
    error: sinon.spy(),
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

let mockWarningPlugin = postcss.plugin("mock-warning-plugin", () => {
    return (css, result) => {
        css.warn(result, "warning");
    };
});

let mockErrorPlugin = postcss.plugin("mock-error-plugin", () => {
    return () => {
        throw new Error("error");
    };
});

test("transformer should initialize log level", (t) => {
    t.isEqual(setGlobalLogLevelSpy.args[0][0], logOptions.level);
    t.end();
});

test("transformer should initialize log appenders", (t) => {
    t.deepEqual(configureSpy.args[0][0], { appenders: logOptions.appenders });
    t.end();
});

test("transformer should initialize log category", (t) => {
    t.deepEqual(getLoggerSpy.args[0][0], "postcss-transform.karma-typescript");
    t.end();
});

test("transformer should set the dirty flag", (t) => {
    t.plan(1);

    let context = createContext(".box { display: flex; }");

    transform(require("autoprefixer"))(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should set the source property to the processed value", (t) => {
    t.plan(1);

    let context = createContext(".box { display: flex; }");

    transform(require("autoprefixer"))(context, () => {
        t.isEqual(".box { display: -webkit-box; display: -ms-flexbox; display: flex; }", context.source);
    });
});

test("transformer should use custom options", (t) => {
    t.plan(1);

    let context = createContext(".box { display: flex; }");

    transform(require("autoprefixer"), { map: { inline: true } })(context, () => {
        t.isEqual(".box { display: -webkit-box; display: -ms-flexbox; display: flex; }\n/*# " +
            "sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm" +
            "ZpbGUuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8scUJBQWMsQ0FBZCxxQkFBYyx" +
            "DQUFkLGNBQWMsRUFBRSIsImZpbGUiOiJmaWxlLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5ib3ggeyBka" +
            "XNwbGF5OiBmbGV4OyB9Il19 */", context.source);
    });
});

test("transformer should use default filter on the module filename", (t) => {
    t.plan(1);

    let context = createContext(".box { display: flex; }");
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

    let context = createContext(".box { display: flex; }");
    context.filename = "style.cssx";

    transform(require("autoprefixer"), {}, /\.cssx$/)(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should log activity with level debug", (t) => {
    t.plan(1);

    let context = createContext(".box { display: flex; }");

    transform(require("autoprefixer"))(context, () => {
        t.deepEqual(mockLogger.debug.lastCall.args, [ "Transforming %s", "file.css" ]);
    });
});

test("transformer should log warnings", (t) => {
    t.plan(2);

    let context = createContext(".box { display: flex; }");
    context.filename = "style.css";

    transform([mockWarningPlugin])(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
        t.deepEqual(mockLogger.warn.lastCall.args[0],
            "mock-warning-plugin: " +
            path.join(process.cwd(), "/style.css") +
            ":1:1: warning");
    });
});

test("transformer should catch CssSyntaxError and only log as a warning", (t) => {

    t.plan(2);

    let context = createContext("export *");

    transform(require("autoprefixer"))(context, (error, dirty) => {
        if (error) {
            t.fail();
        }
        t.false(dirty);
        t.deepEqual(stripConsoleColors(mockLogger.warn.lastCall.args[0]),
            path.join(process.cwd(), "/file.css") +
            ":1:1: Unknown word" + os.EOL + "> 1 | export *\n    | ^");
    });
});

test("transformer should handle errors other than CssSyntaxError", (t) => {
    t.plan(2);

    let context = createContext(".box { display: flex; }");
    context.filename = "style.css";

    transform([mockErrorPlugin])(context, (error, dirty) => {
        t.isEqual(error.message, "error");
        t.false(dirty);
    });
});
