import * as log4js from "log4js";
import * as mock from "mock-require";
import * as os from "os";
import * as test from "tape";

let readFileCallback = [undefined, new Buffer("")];

mock("fs", {
    readFile: (filename: string, callback: Function) => {
        filename = filename;
        return callback(...readFileCallback);
    }
});

import { ConfigOptions } from "karma";

import { KarmaTypescriptConfig } from "../../api/configuration";
import { Configuration } from "../../shared/configuration";
import { Project } from "../../shared/project";
import { RequiredModule } from "../required-module";
import { Transformer } from "../transformer";
import { SourceReader } from "./source-reader";

let configuration = new Configuration({});
let project = new Project(configuration, log4js.getLogger("project"));
let transformer = new Transformer(configuration, log4js.getLogger("transformer"), project);
let sourceReader = new SourceReader(configuration, transformer);

let karmaTypescriptConfig: KarmaTypescriptConfig = {
    bundlerOptions: {
        ignore: ["ignored"],
        noParse: ["noparse"]
    }
};

let karma: ConfigOptions = {};
(<any> karma).karmaTypescriptConfig = karmaTypescriptConfig;

configuration.initialize(karma);

test("source-reader should return an empty object literal for ignored modules", (t) => {

    t.plan(1);

    let requiredModule = new RequiredModule("ignored", "ignored.js");

    sourceReader.read(requiredModule, () => {
        t.equal(requiredModule.source, "module.exports={};");
    });
});

test("source-reader should read source for module", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer("var x;")];
    let requiredModule = new RequiredModule("dummy", "dummy.js");

    sourceReader.read(requiredModule, () => {
        t.equal(requiredModule.source, "var x;");
    });
});

test("source-reader should create an AST", (t) => {

    t.plan(1);

    let requiredModule = new RequiredModule("dummy", "dummy.js");

    sourceReader.read(requiredModule, () => {
        t.notEqual(requiredModule.ast.body, undefined);
    });
});

test("source-reader should create an empty dummy AST for non-script files (css, JSON...)", (t) => {

    t.plan(1);

    let requiredModule = new RequiredModule("style", "style.css");

    sourceReader.read(requiredModule, () => {
        t.deepEqual(requiredModule.ast, {
            body: undefined,
            sourceType: "script",
            type: "Program"
        });
    });
});

test("source-reader should create an empty dummy AST for modules specified in the bundler option 'noParse'", (t) => {

    t.plan(1);

    let requiredModule = new RequiredModule("noparse", "noparse.js");

    sourceReader.read(requiredModule, () => {
        t.deepEqual(requiredModule.ast, {
            body: undefined,
            sourceType: "script",
            type: "Program"
        });
    });
});

test("source-reader should prepend JSON source with 'module.exports ='", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer(JSON.stringify([1, 2, 3, "a", "b", "c"]))];
    let requiredModule = new RequiredModule("json", "json.json");

    sourceReader.read(requiredModule, () => {
        t.equal(requiredModule.source, os.EOL + "module.exports = [1,2,3,\"a\",\"b\",\"c\"];");
    });
});

test("source-reader should prepend stylesheet source (original CSS) with 'module.exports ='", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer(".color { color: red; }")];
    let requiredModule = new RequiredModule("style", "style.css");

    sourceReader.read(requiredModule, () => {
        t.equal(requiredModule.source, os.EOL + "module.exports = \".color { color: red; }\";");
    });
});

test("source-reader should prepend transformed stylesheet source (now JSON) with 'module.exports ='", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer(JSON.stringify({ color: "_color_xkpkl_5" }))];
    let requiredModule = new RequiredModule("transformed", "transformed.css");

    sourceReader.read(requiredModule, () => {
        t.equal(requiredModule.source, os.EOL + "module.exports = {\"color\":\"_color_xkpkl_5\"};");
    });
});

test("source-reader should not prepend redundant 'module.exports ='", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer("module.exports = '';")];
    let requiredModule = new RequiredModule("redundant", "redundant.css");

    sourceReader.read(requiredModule, () => {
        t.equal(requiredModule.source, "module.exports = '';");
    });
});

test("source-reader should prepend 'module.exports =' to valid javascript with non-script extension", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer("{ color: '_color_xkpkl_5'; }")];
    let requiredModule = new RequiredModule("valid-js", "valid-js.css");

    sourceReader.read(requiredModule, () => {
        t.equal(requiredModule.source, os.EOL + "module.exports = { color: '_color_xkpkl_5'; };");
    });
});
