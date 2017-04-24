"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var os = require("os");
var path = require("path");
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
test("transformer should initialize log level", function (t) {
    t.isEqual(setGlobalLogLevelSpy.args[0][0], logOptions.level);
    t.end();
});
test("transformer should initialize log appenders", function (t) {
    t.deepEqual(configureSpy.args[0][0], { appenders: logOptions.appenders });
    t.end();
});
test("transformer should initialize log category", function (t) {
    t.deepEqual(getLoggerSpy.args[0][0], "cssmodules-transform.karma-typescript");
    t.end();
});
test("transformer should set the dirty flag", function (t) {
    t.plan(1);
    var context = createContext(".box { color: red; }");
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});
test("transformer should set the source property to the processed value", function (t) {
    t.plan(1);
    var context = createContext(".box { color: red; }");
    transform()(context, function () {
        t.isEqual(context.source, "{\"box\":\"file_box_tFmNy\"}");
    });
});
test("transformer should use custom options", function (t) {
    t.plan(1);
    var context = createContext(".box { color: red; }");
    transform({}, { generateScopedName: "[name]__[local]___[hash:base64:5]" })(context, function () {
        t.isEqual(context.source, "{\"box\":\"file__box___tFmNy\"}");
    });
});
test("transformer should use default filter on the module filename", function (t) {
    t.plan(1);
    var context = createContext(".box { color: red; }");
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
    var context = createContext(".box { color: red; }");
    context.filename = "style.cssx";
    transform({}, {}, /\.cssx$/)(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.true(dirty);
    });
});
test("transformer should log activity with level debug", function (t) {
    t.plan(1);
    var context = createContext(".box { color: red; }");
    transform()(context, function () {
        t.deepEqual(mockLogger.debug.lastCall.args, ["Transforming %s", "file.css"]);
    });
});
test("transformer should not process empty files", function (t) {
    t.plan(2);
    var context = createContext("");
    transform()(context, function (error, dirty) {
        t.isEqual(error.message, "File is empty");
        t.false(dirty);
    });
});
test("transformer should log warnings", function (t) {
    t.plan(2);
    var context = createContext("@value red blue @value green yellow");
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.true(dirty);
        t.deepEqual(mockLogger.warn.lastCall.args[0], "Invalid value definition: red blue @value green yellow");
    });
});
test("transformer should catch CssSyntaxError and only log as a warning", function (t) {
    t.plan(2);
    var context = createContext("export *");
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.false(dirty);
        t.deepEqual(stripConsoleColors(mockLogger.warn.lastCall.args[0]), path.join(process.cwd(), "/file.css") +
            ":1:1: Unknown word" + os.EOL + "> 1 | export *\n    | ^");
    });
});
test("transformer should catch errors other than CssSyntaxError", function (t) {
    t.plan(2);
    var context = createContext(".box > * { composes: x from \"./y.css\"; }");
    transform()(context, function (error, dirty) {
        t.isEqual(error.message, "composition is only allowed when selector is single " +
            ":local class name not in \":local(.box) > *\"");
        t.false(dirty);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdHJhbnNmb3JtLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwrQkFBaUM7QUFDakMsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3Qiw2QkFBK0I7QUFDL0IsMkJBQTZCO0FBRTdCLHVDQUF5QztBQUV6QyxJQUFJLFVBQVUsR0FBcUM7SUFDL0MsU0FBUyxFQUFFLENBQUM7WUFDUixNQUFNLEVBQUU7Z0JBQ0osT0FBTyxFQUFFLDBCQUEwQjtnQkFDbkMsSUFBSSxFQUFFLFNBQVM7YUFDbEI7WUFDRCxJQUFJLEVBQUUsU0FBUztTQUNsQixDQUFDO0lBQ0YsS0FBSyxFQUFFLE1BQU07Q0FDaEIsQ0FBQztBQUVGLElBQUksVUFBVSxHQUFHO0lBQ2IsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUU7SUFDbEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUU7Q0FDcEIsQ0FBQztBQUVGLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN2RSxJQUFJLG9CQUFvQixHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDbEUsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFFbEQsU0FBUyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRW5DLHNCQUFzQjtBQUN0QixJQUFJLGFBQWEsR0FBRyxVQUFDLE1BQWM7SUFDL0IsTUFBTSxDQUFDO1FBQ0gsTUFBTSxFQUFFLEVBQUU7UUFDVixRQUFRLEVBQUUsVUFBVTtRQUNwQixNQUFNLEVBQUUsUUFBUTtRQUNoQixNQUFNLFFBQUE7S0FDVCxDQUFDO0FBQ04sQ0FBQyxD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