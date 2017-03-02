import * as fs from "fs";
import * as path from "path";
import * as test from "tape";
import * as ts from "typescript";

import * as transform from "../transform";

let createContext = () => {
    return {
        ast,
        basePath: process.cwd(),
        filename, module: filename,
        source: fs.readFileSync(filename).toString(),
        tsVersion: ts.version,
        urlRoot: "/custom-root/"
    };
};

let compile = (filename: string): ts.SourceFile => {
    let options: ts.CompilerOptions = {
        experimentalDecorators: true,
        lib: [
            "lib.dom.d.ts",
            "lib.es5.d.ts",
            "lib.es2015.d.ts",
            "lib.scripthost.d.ts"
        ]
    };
    let host = ts.createCompilerHost(options);
    let program = ts.createProgram([filename], options, host);
    // tslint:disable-next-line: no-console
    console.log(ts.formatDiagnostics(ts.getPreEmitDiagnostics(program), host));
    return program.getSourceFile(filename);
};

let filename = path.join(process.cwd(), "./src/test/mock-component.ts");
let ast = compile(filename);

test("transformer should check Typescript version", (t) => {

    t.plan(2);

    let context = createContext();
    context.tsVersion = "0.0.0";

    transform(context, (error: Error, dirty: boolean) => {
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

test("transformer should set dirty flag to true", (t) => {

    t.plan(1);

    let context = createContext();

    transform(context, (error: Error, dirty: boolean) => {
        if (error) {
            t.fail();
        }
        t.assert(dirty);
    });
});

test("transformer should transform template url", (t) => {

    t.plan(1);

    let context = createContext();

    transform(context, () => {
        t.assert(context.source.indexOf("templateUrl: \"/custom-root/base/src/test/mock.html\"") > 0);
    });
});

test("transformer should transform style urls", (t) => {

    t.plan(1);

    let context = createContext();

    transform(context, () => {
        t.assert(context.source.indexOf("styleUrls: " +
            "[\"/custom-root/base/src/test/style.css\", " +
            "\"/custom-root/base/src/test/style.less\", " +
            "\"/custom-root/base/src/style.scss\"]") > 0);
    });
});
