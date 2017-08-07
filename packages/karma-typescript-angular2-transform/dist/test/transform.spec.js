"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var log4js = require("log4js");
var path = require("path");
var sinon = require("sinon");
var test = require("tape");
var ts = require("typescript");
var transform = require("../transform");
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
    debug: sinon.spy()
};
var getLoggerSpy = sinon.stub(log4js, "getLogger").returns(mockLogger);
var setGlobalLogLevelSpy = sinon.spy(log4js, "setGlobalLogLevel");
var configureSpy = sinon.spy(log4js, "configure");
transform.initialize(logOptions);
var compile = function (filename) {
    var options = {
        experimentalDecorators: true,
        lib: [
            "lib.dom.d.ts",
            "lib.es5.d.ts",
            "lib.es2015.d.ts",
            "lib.scripthost.d.ts"
        ]
    };
    var host = ts.createCompilerHost(options);
    var program = ts.createProgram([filename], options, host);
    // tslint:disable-next-line: no-console
    console.log(ts.formatDiagnostics(ts.getPreEmitDiagnostics(program), host));
    return program.getSourceFile(filename);
};
var filename = path.join(process.cwd(), "./src/test/mock-component.ts");
var ast = compile(filename);
// kt.TransformContext...
var createContext = function () {
    return {
        config: {
            karma: {
                basePath: process.cwd(),
                urlRoot: "/custom-root/"
            }
        },
        filename: filename,
        module: filename,
        source: fs.readFileSync(filename).toString(),
        ts: {
            ast: ast,
            version: ts.version
        }
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
    t.deepEqual(getLoggerSpy.args[0][0], "angular2-transform.karma-typescript");
    t.end();
});
test("transformer should check ts property", function (t) {
    t.plan(1);
    var context = createContext();
    context.ts = undefined;
    transform(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        else {
            t.false(dirty);
        }
    });
});
test("transformer should check Typescript version", function (t) {
    t.plan(2);
    var context = createContext();
    context.ts.version = "0.0.0";
    transform(context, function (error, dirty) {
        if (error) {
            t.equal("Typescript version of karma-typescript (0.0.0) does not match " +
                "karma-typescript-angular2-transform Typescript version (" + ts.version + ")", error.message);
            t.false(dirty);
        }
        else {
            t.fail();
        }
    });
});
test("transformer should set dirty flag to true", function (t) {
    t.plan(1);
    var context = createContext();
    transform(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.assert(dirty);
    });
});
test("transformer should transform template url", function (t) {
    t.plan(1);
    var context = createContext();
    transform(context, function () {
        t.assert(context.source.indexOf("templateUrl: \"/custom-root/base/src/test/mock.html\"") > 0);
    });
});
test("transformer should transform style urls", function (t) {
    t.plan(1);
    var context = createContext();
    transform(context, function () {
        t.assert(context.source.indexOf("styleUrls: " +
            "[\"/custom-root/base/src/test/style.css\", " +
            "\"/custom-root/base/src/test/style.less\", " +
            "\"/custom-root/base/src/style.scss\"]") > 0);
    });
});
test("transformer should log activity with level debug", function (t) {
    t.plan(1);
    var context = createContext();
    transform(context, function () {
        t.deepEqual(mockLogger.debug.lastCall.args, [
            "Rewriting %s to %s in %s",
            "mock.html",
            path.normalize("/custom-root/base/src/test/mock.html"),
            path.join(process.cwd(), "/src/test/mock-component.ts")
        ]);
    });
});
test("transformer should skip files without the properties 'templateUrl' and/or 'styleUrls'", function (t) {
    t.plan(1);
    filename = path.join(process.cwd(), "./src/test/mock-service.ts");
    ast = compile(filename);
    var context = createContext();
    transform(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.false(dirty);
    });
});
test("transformer should transform template url when defined with a template literal", function (t) {
    t.plan(1);
    filename = path.join(process.cwd(), "./src/test/another-mock-component.ts");
    ast = compile(filename);
    var context = createContext();
    transform(context, function () {
        t.assert(context.source.indexOf("templateUrl: `/custom-root/base/src/test/mock.html`") > 0);
    });
});
test("transformer should transform style urls when defined with template literals", function (t) {
    t.plan(1);
    filename = path.join(process.cwd(), "./src/test/another-mock-component.ts");
    ast = compile(filename);
    var context = createContext();
    transform(context, function () {
        t.assert(context.source.indexOf("styleUrls: " +
            "[`/custom-root/base/src/test/style.css`, " +
            "`/custom-root/base/src/test/style.less`, " +
            "`/custom-root/base/src/style.scss`]") > 0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVzdC90cmFuc2Zvcm0uc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVCQUF5QjtBQUV6QiwrQkFBaUM7QUFDakMsMkJBQTZCO0FBQzdCLDZCQUErQjtBQUMvQiwyQkFBNkI7QUFDN0IsK0JBQWlDO0FBRWpDLHdDQUEwQztBQUUxQyxJQUFJLFVBQVUsR0FBcUM7SUFDL0MsU0FBUyxFQUFFLENBQUM7WUFDUixNQUFNLEVBQUU7Z0JBQ0osT0FBTyxFQUFFLDBCQUEwQjtnQkFDbkMsSUFBSSxFQUFFLFNBQVM7YUFDbEI7WUFDRCxJQUFJLEVBQUUsU0FBUztTQUNsQixDQUFDO0lBQ0YsS0FBSyxFQUFFLE1BQU07Q0FDaEIsQ0FBQztBQUVGLElBQUksVUFBVSxHQUFHO0lBQ2IsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUU7Q0FDckIsQ0FBQztBQUVGLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN2RSxJQUFJLG9CQUFvQixHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDbEUsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFFbEQsU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUVqQyxJQUFJLE9BQU8sR0FBRyxVQUFDLFFBQWdCO0lBQzNCLElBQUksT0FBTyxHQUF1QjtRQUM5QixzQkFBc0IsRUFBRSxJQUFJO1FBQzVCLEdBQUcsRUFBRTtZQUNELGNBQWM7WUFDZCxjQUFjO1lBQ2QsaUJBQWlCO1lBQ2pCLHFCQUFxQjtTQUN4QjtLQUNKLENBQUM7SUFDRixJQUFJLElBQUksR0FBRyxFQUFF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