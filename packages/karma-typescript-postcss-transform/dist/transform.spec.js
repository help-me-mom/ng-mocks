"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var os = require("os");
var path = require("path");
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
test("transformer should log activity with level debug", function (t) {
    t.plan(1);
    var context = createContext(".box { display: flex; }");
    transform(require("autoprefixer"))(context, function () {
        t.deepEqual(mockLogger.debug.lastCall.args, ["Transforming %s", "file.css"]);
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
            path.join(process.cwd(), "/style.css") +
            ":1:1: warning");
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
        t.deepEqual(stripConsoleColors(mockLogger.warn.lastCall.args[0]), path.join(process.cwd(), "/file.css") +
            ":1:1: Unknown word" + os.EOL + "> 1 | export *\n    | ^");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdHJhbnNmb3JtLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwrQkFBaUM7QUFDakMsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3QixpQ0FBbUM7QUFDbkMsNkJBQStCO0FBQy9CLDJCQUE2QjtBQUU3Qix1Q0FBeUM7QUFFekMsSUFBSSxVQUFVLEdBQXFDO0lBQy9DLFNBQVMsRUFBRSxDQUFDO1lBQ1IsTUFBTSxFQUFFO2dCQUNKLE9BQU8sRUFBRSwwQkFBMEI7Z0JBQ25DLElBQUksRUFBRSxTQUFTO2FBQ2xCO1lBQ0QsSUFBSSxFQUFFLFNBQVM7U0FDbEIsQ0FBQztJQUNGLEtBQUssRUFBRSxNQUFNO0NBQ2hCLENBQUM7QUFFRixJQUFJLFVBQVUsR0FBRztJQUNiLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO0lBQ2xCLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO0NBQ3BCLENBQUM7QUFFRixJQUFJLFlBQVksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdkUsSUFBSSxvQkFBb0IsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FBQ2xFLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBRWxELFNBQVMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUVuQyxzQkFBc0I7QUFDdEIsSUFBSSxhQUFhLEdBQUcsVUFBQyxNQUFjO0lBQy9CLE1BQU0sQ0FBQztRQUNILE1BQU0sRUFBRSxFQUFFO1FBQ1YsUUFBUSxFQUFFLFVBQVU7UUFDcEIsTUFBTSxFQUFFLFFBQVE7UUFDaEIsTUFBTSxRQUFBO0tBQ1QsQ0FB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Q0FBQyxDQUFDLEVBQ3hDLHVCQUF1QjtZQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxZQUFZLENBQUM7WUFDdEMsZUFBZSxDQUFDLENBQUM7SUFDekIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxtRUFBbUUsRUFBRSxVQUFDLENBQUM7SUFFeEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVWLElBQUksT0FBTyxHQUFHLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUV4QyxTQUFTLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBSyxFQUFFLEtBQUs7UUFDckQsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNSLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNiLENBQUM7UUFDRCxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDNUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsV0FBVyxDQUFDO1lBQ3JDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcseUJBQXlCLENBQUMsQ0FBQztJQUNuRSxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLDREQUE0RCxFQUFFLFVBQUMsQ0FBQztJQUNqRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRVYsSUFBSSxPQUFPLEdBQUcsYUFBYSxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDdkQsT0FBTyxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUM7SUFFL0IsU0FBUyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsVUFBQyxLQUFLLEVBQUUsS0FBSztRQUMvQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=