"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var test = require("tape");
var ts = require("typescript");
var transform = require("../transform");
var createContext = function () {
    return {
        ast: ast,
        basePath: process.cwd(),
        filename: filename, module: filename,
        source: fs.readFileSync(filename).toString(),
        urlRoot: "/custom-root/"
    };
};
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
