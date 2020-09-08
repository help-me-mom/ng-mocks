import * as fs from "fs";
import * as kt from "karma-typescript";
import * as log4js from "log4js";
import * as path from "path";
import * as sinon from "sinon";
import * as test from "tape";
import * as ts from "typescript";

import * as transform from "../transform";

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
    debug: sinon.spy()
};

const getLoggerSpy = sinon.stub(log4js, "getLogger").returns(mockLogger as any);
const configureSpy = sinon.spy(log4js, "configure");

transform.initialize(logOptions);

const compile = (file: string): ts.SourceFile => {
    const options: ts.CompilerOptions = {
        experimentalDecorators: true,
        lib: [
            "lib.dom.d.ts",
            "lib.es5.d.ts",
            "lib.es2015.d.ts",
            "lib.scripthost.d.ts"
        ]
    };
    const host = ts.createCompilerHost(options);
    const program = ts.createProgram([file], options, host);
    // tslint:disable-next-line: no-console
    console.log(ts.formatDiagnostics(ts.getPreEmitDiagnostics(program), host));
    host.writeFile = (name, text) => {
        transpiled = text;
        return name; // shut up, ts
    };
    program.emit();
    return program.getSourceFile(file);
};

let filename = path.join(process.cwd(), "./src/test/mock-component.ts");
let transpiled: string;
let ast = compile(filename);

// kt.TransformContext...
const createContext = (): any => {
    return {
        config: {
            karma: {
                basePath: process.cwd(),
                urlRoot: "/custom-root/"
            }
        },
        filename,
        module: filename,
        source: fs.readFileSync(filename).toString(),
        ts: {
            ast,
            transpiled,
            version: ts.version
        }
    };
};

test("transformer should initialize log appenders", (t) => {
    t.deepEqual(configureSpy.args[0][0], {
        appenders: logOptions.appenders,
        categories: { default: { appenders: [ "console1" ], level: "INFO" } }
    });
    t.end();
});

test("transformer should initialize log category", (t) => {
    t.deepEqual(getLoggerSpy.args[0][0], "angular2-transform.karma-typescript");
    t.end();
});

test("transformer should check ts property", (t) => {

    t.plan(1);

    const context = createContext();
    context.ts = undefined;

    transform(context, (error: Error, result: kt.TransformResult | boolean) => {
        if (error) {
            t.fail();
        }
        else {
            const dirty = !!result;
            t.false(dirty);
        }
    });
});

test("transformer should set dirty flag to true", (t) => {

    t.plan(1);

    const context = createContext();

    transform(context, (error: Error, result: kt.TransformResult | boolean) => {
        if (error) {
            t.fail();
        }
        const dirty = !!result;
        t.assert(dirty);
    });
});

test("transformer should transform template url", (t) => {

    t.plan(1);

    const context = createContext();

    transform(context, () => {
        t.assert(context.ts.transpiled.indexOf("templateUrl: '/custom-root/base/src/test/mock.html'") > 0);
    });
});

test("transformer should transform style urls", (t) => {

    t.plan(1);

    const context = createContext();

    transform(context, () => {
        t.assert(context.ts.transpiled.indexOf("styleUrls: " +
            "[\"/custom-root/base/src/test/style.css\", " +
            "\"/custom-root/base/src/test/style.less\", " +
            "\"/custom-root/base/src/style.scss\"]") > 0);
    });
});

test("transformer should log activity with level debug", (t) => {

    t.plan(1);

    const context = createContext();

    transform(context, () => {
        t.deepEqual(mockLogger.debug.lastCall.args, [
            "Rewriting %s to %s in %s",
            "mock.html",
            path.normalize("/custom-root/base/src/test/mock.html"),
            path.join(process.cwd(), "/src/test/mock-component.ts")
        ]);
    });
});

test("transformer should skip files without the properties 'templateUrl' and/or 'styleUrls'", (t) => {

    t.plan(1);

    filename = path.join(process.cwd(), "./src/test/mock-service.ts");
    ast = compile(filename);

    const context = createContext();

    transform(context, (error: Error, result: kt.TransformResult | boolean) => {
        if (error) {
            t.fail();
        }
        const dirty = !!result;
        t.false(dirty);
    });
});

test("transformer should transform template url when defined with a template literal", (t) => {

    t.plan(1);

    filename = path.join(process.cwd(), "./src/test/another-mock-component.ts");
    ast = compile(filename);

    const context = createContext();

    transform(context, () => {
        t.assert(context.ts.transpiled.indexOf("templateUrl: \"/custom-root/base/src/test/mock.html\"") > 0);
    });
});

test("transformer should transform style urls when defined with template literals", (t) => {

    t.plan(1);

    filename = path.join(process.cwd(), "./src/test/another-mock-component.ts");
    ast = compile(filename);

    const context = createContext();

    transform(context, () => {
        t.assert(context.ts.transpiled.indexOf("styleUrls: " +
            "[\"/custom-root/base/src/test/style.css\", " +
            "\"/custom-root/base/src/test/style.less\", " +
            "\"/custom-root/base/src/style.scss\"]") > 0);
    });
});
