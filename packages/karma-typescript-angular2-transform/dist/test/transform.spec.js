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
    host.writeFile = function (name, text) {
        transpiled = text;
        return name; // shut up, ts
    };
    program.emit();
    return program.getSourceFile(filename);
};
var filename = path.join(process.cwd(), "./src/test/mock-component.ts");
var transpiled;
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
            transpiled: transpiled,
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
        t.assert(context.ts.transpiled.indexOf("templateUrl: '/custom-root/base/src/test/mock.html'") > 0);
    });
});
test("transformer should transform style urls", function (t) {
    t.plan(1);
    var context = createContext();
    transform(context, function () {
        t.assert(context.ts.transpiled.indexOf("styleUrls: " +
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
        t.assert(context.ts.transpiled.indexOf("templateUrl: \"/custom-root/base/src/test/mock.html\"") > 0);
    });
});
test("transformer should transform style urls when defined with template literals", function (t) {
    t.plan(1);
    filename = path.join(process.cwd(), "./src/test/another-mock-component.ts");
    ast = compile(filename);
    var context = createContext();
    transform(context, function () {
        t.assert(context.ts.transpiled.indexOf("styleUrls: " +
            "[\"/custom-root/base/src/test/style.css\", " +
            "\"/custom-root/base/src/test/style.less\", " +
            "\"/custom-root/base/src/style.scss\"]") > 0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVzdC90cmFuc2Zvcm0uc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVCQUF5QjtBQUV6QiwrQkFBaUM7QUFDakMsMkJBQTZCO0FBQzdCLDZCQUErQjtBQUMvQiwyQkFBNkI7QUFDN0IsK0JBQWlDO0FBRWpDLHdDQUEwQztBQUUxQyxJQUFJLFVBQVUsR0FBcUM7SUFDL0MsU0FBUyxFQUFFLENBQUM7WUFDUixNQUFNLEVBQUU7Z0JBQ0osT0FBTyxFQUFFLDBCQUEwQjtnQkFDbkMsSUFBSSxFQUFFLFNBQVM7YUFDbEI7WUFDRCxJQUFJLEVBQUUsU0FBUztTQUNsQixDQUFDO0lBQ0YsS0FBSyxFQUFFLE1BQU07Q0FDaEIsQ0FBQztBQUVGLElBQUksVUFBVSxHQUFHO0lBQ2IsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUU7Q0FDckIsQ0FBQztBQUVGLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN2RSxJQUFJLG9CQUFvQixHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDbEUsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFFbEQsU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUVqQyxJQUFJLE9BQU8sR0FBRyxVQUFDLFFBQWdCO0lBQzNCLElBQUksT0FBTyxHQUF1QjtRQUM5QixzQkFBc0IsRUFBRSxJQUFJO1FBQzVCLEdBQUcsRUFBRTtZQUNELGNBQWM7WUFDZCxjQUFjO1lBQ2QsaUJBQWlCO1lBQ2pCLHFCQUFxQjtTQUN4QjtLQUNKLENBQUM7SUFDRixJQUFJLElBQUksR0FBRyxFQUFF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