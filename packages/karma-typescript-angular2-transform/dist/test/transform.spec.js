"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
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
var createContext = function () {
    return {
        module: filename,
        paths: {
            basepath: process.cwd(),
            filename: filename,
            urlroot: "/custom-root/"
        },
        source: fs.readFileSync(filename).toString(),
        ts: {
            ast: ast,
            version: ts.version
        }
    };
};
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
