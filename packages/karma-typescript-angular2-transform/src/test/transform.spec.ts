import * as fs from "fs";
import * as kt from "karma-typescript/src/api/transforms";
import * as path from "path";
import * as test from "tape";
import * as ts from "typescript";

import * as transform from "../transform";

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

transform.initialize(logOptions);

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

let createContext = (): kt.TransformContext => {
    return {
        module: filename,
        paths: {
            basepath: process.cwd(),
            filename,
            urlroot: "/custom-root/"
        },
        source: fs.readFileSync(filename).toString(),
        ts: {
            ast,
            version: ts.version
        }
    };
};

test("transformer should check ts property", (t) => {

    t.plan(1);

    let context = createContext();
    context.ts = undefined;

    transform(context, (error: Error, dirty: boolean) => {
        if (error) {
            t.fail();
        }
        else {
            t.false(dirty);
        }
    });
});

test("transformer should check Typescript version", (t) => {

    t.plan(2);

    let context = createContext();
    context.ts.version = "0.0.0";

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
