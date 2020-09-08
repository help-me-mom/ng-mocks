/* eslint-disable @typescript-eslint/no-var-requires */
import * as kt from "karma-typescript";
import * as log4js from "log4js";
import * as os from "os";
import * as path from "path";
import * as postcss from "postcss";
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
    debug: sinon.spy(),
    warn: sinon.spy()
};

const getLoggerSpy = sinon.stub(log4js, "getLogger").returns(mockLogger as any);
const configureSpy = sinon.spy(log4js, "configure");

transform().initialize(logOptions);

// kt.TransformContext
const createContext = (source: string): any => {
    return {
        config: {},
        filename: "file.css",
        module: "module",
        source
    };
};

const stripConsoleColors = (s: string) => {
    return s.replace(/.\[\d\d*m/g, "");
};

const mockWarningPlugin = postcss.plugin("mock-warning-plugin", () => {
    return (css, result) => {
        css.warn(result, "warning");
    };
});

const mockErrorPlugin = postcss.plugin("mock-error-plugin", () => {
    return () => {
        throw new Error("error");
    };
});

test("transformer should initialize log appenders", (t) => {
    t.deepEqual(configureSpy.args[0][0], {
        appenders: logOptions.appenders,
        categories: { default: { appenders: [ "console1" ], level: "INFO" } }
    });
    t.end();
});

test("transformer should initialize log category", (t) => {
    t.deepEqual(getLoggerSpy.args[0][0], "postcss-transform.karma-typescript");
    t.end();
});

test("transformer should set the dirty flag", (t) => {
    t.plan(1);

    const context = createContext(".box { display: flex; }");

    transform(require("autoprefixer"))(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should set the source property to the processed value", (t) => {
    t.plan(1);

    const context = createContext("::placeholder {}");

    transform(require("autoprefixer"))(context, () => {
        t.isEqual(context.source, "::-moz-placeholder {}\n" +
                                  ":-ms-input-placeholder {}\n" +
                                  "::placeholder {}");
    });
});

test("transformer should use custom options", (t) => {
    t.plan(1);

    const context = createContext("::placeholder {}");

    transform(require("autoprefixer"), { map: { inline: true } })(context, () => {
        t.isEqual(context.source, "::-moz-placeholder {}\n" +
                                  ":-ms-input-placeholder {}\n" +
                                  "::placeholder {}\n" +
                                  "/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGUuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLG9CQUFlO0FBQWYsd0JBQWU7QUFBZixlQUFlIiwiZmlsZSI6ImZpbGUuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiOjpwbGFjZWhvbGRlciB7fSJdfQ== */");
    });
});

test("transformer should use default filter on the module filename", (t) => {
    t.plan(1);

    const context = createContext(".box { display: flex; }");
    context.filename = "style.less";

    transform()(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.false(dirty);
    });
});

test("transformer should use custom filter on the module filename", (t) => {
    t.plan(1);

    const context = createContext(".box { display: flex; }");
    context.filename = "style.cssx";

    transform(require("autoprefixer"), {}, /\.cssx$/)(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});

test("transformer should log activity with level debug", (t) => {
    t.plan(1);

    const context = createContext(".box { display: flex; }");

    transform(require("autoprefixer"))(context, () => {
        t.deepEqual(mockLogger.debug.lastCall.args, [ "Transforming %s", "file.css" ]);
    });
});

test("transformer should not process empty files", (t) => {
    t.plan(2);

    const context = createContext("");

    transform(require("autoprefixer"))(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        t.isEqual(error.message, "File is empty");
        t.false(dirty);
    });
});

test("transformer should log warnings", (t) => {
    t.plan(2);

    const context = createContext(".box { display: flex; }");
    context.filename = "style.css";

    transform([mockWarningPlugin])(context, (error: Error, dirty: boolean | kt.TransformResult) => {
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

    const context = createContext("export *");

    transform(require("autoprefixer"))(context, (error: Error, dirty: boolean | kt.TransformResult) => {
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

    const context = createContext(".box { display: flex; }");
    context.filename = "style.css";

    transform([mockErrorPlugin])(context, (error: Error, dirty: boolean | kt.TransformResult) => {
        t.isEqual(error.message, "error");
        t.false(dirty);
    });
});
