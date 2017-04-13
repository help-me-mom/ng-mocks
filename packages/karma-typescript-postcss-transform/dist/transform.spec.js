"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var postcss = require("postcss");
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
        filename: "file.css",
        module: "module",
        source: source
    };
};
var stripConsoleColors = function (s) {
    return s.replace(/.\[\d\d*m/g, "");
};
var mockWarningPlugin = postcss.plugin("mock-warning-plugin", function () {
    return function (css, result) {
        css.warn(result, "warning");
    };
});
var mockErrorPlugin = postcss.plugin("mock-error-plugin", function () {
    return function () {
        throw new Error("error");
    };
});
test("transformer should initialize log level", function (t) {
    t.isEqual(setGlobalLogLevelSpy.args[0][0], logOptions.level);
    t.end();
});
test("transformer should initialize log appenders", function (t) {
    t.deepEqual(configureSpy.args[0][0], { appenders: logOptions.appenders });
    t.end();
});
test("transformer should initialize log category", function (t) {
    t.deepEqual(getLoggerSpy.args[0][0], "postcss-transform.karma-typescript");
    t.end();
});
test("transformer should set the dirty flag", function (t) {
    t.plan(1);
    var context = createContext(".box { display: flex; }");
    transform(require("autoprefixer"))(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});
test("transformer should set the source property to the processed value", function (t) {
    t.plan(1);
    var context = createContext(".box { display: flex; }");
    transform(require("autoprefixer"))(context, function () {
        t.isEqual(".box { display: -webkit-box; display: -ms-flexbox; display: flex; }", context.source);
    });
});
test("transformer should use custom options", function (t) {
    t.plan(1);
    var context = createContext(".box { display: flex; }");
    transform(require("autoprefixer"), { map: { inline: true } })(context, function () {
        t.isEqual(".box { display: -webkit-box; display: -ms-flexbox; display: flex; }\n/*# " +
            "sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm" +
            "ZpbGUuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8scUJBQWMsQ0FBZCxxQkFBYyx" +
            "DQUFkLGNBQWMsRUFBRSIsImZpbGUiOiJmaWxlLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5ib3ggeyBka" +
            "XNwbGF5OiBmbGV4OyB9Il19 */", context.source);
    });
});
test("transformer should use default filter on the module filename", function (t) {
    t.plan(1);
    var context = createContext(".box { display: flex; }");
    context.filename = "style.less";
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.false(dirty);
    });
});
test("transformer should use custom filter on the module filename", function (t) {
    t.plan(1);
    var context = createContext(".box { display: flex; }");
    context.filename = "style.cssx";
    transform(require("autoprefixer"), {}, /\.cssx$/)(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});
test("transformer should log warnings", function (t) {
    t.plan(2);
    var context = createContext(".box { display: flex; }");
    context.filename = "style.css";
    transform([mockWarningPlugin])(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.true(dirty);
        t.deepEqual(mockLogger.warn.lastCall.args[0], "mock-warning-plugin: " +
            process.cwd() +
            "/style.css:1:1: warning");
    });
});
test("transformer should catch CssSyntaxError and only log as a warning", function (t) {
    t.plan(2);
    var context = createContext("export *");
    transform(require("autoprefixer"))(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.false(dirty);
        t.deepEqual(stripConsoleColors(mockLogger.warn.lastCall.args[0]), process.cwd() + "/file.css:1:1: Unknown word\n> 1 | export *\n    | ^");
    });
});
test("transformer should handle errors other than CssSyntaxError", function (t) {
    t.plan(2);
    var context = createContext(".box { display: flex; }");
    context.filename = "style.css";
    transform([mockErrorPlugin])(context, function (error, dirty) {
        t.isEqual(error.message, "error");
        t.false(dirty);
    });
});
//# sourceMappingURL=transform.spec.js.map