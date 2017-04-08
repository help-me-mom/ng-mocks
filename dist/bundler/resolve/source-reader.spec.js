"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var mock = require("mock-require");
var os = require("os");
var test = require("tape");
mock("fs", {
    readFile: function (filename, callback) {
        switch (filename) {
            case "dummy.js":
                callback(undefined, new Buffer("var x;"));
                break;
            case "json.json":
                callback(undefined, new Buffer(JSON.stringify([1, 2, 3, "a", "b", "c"])));
                break;
            default: callback(undefined, new Buffer(""));
        }
    }
});
var configuration_1 = require("../../shared/configuration");
var project_1 = require("../../shared/project");
var required_module_1 = require("../required-module");
var transformer_1 = require("../transformer");
var source_reader_1 = require("./source-reader");
var configuration = new configuration_1.Configuration({});
var project = new project_1.Project(configuration, log4js.getLogger("project"));
var transformer = new transformer_1.Transformer(configuration, log4js.getLogger("transformer"), project);
var sourceReader = new source_reader_1.SourceReader(configuration, transformer);
var karmaTypescriptConfig = {
    bundlerOptions: {
        ignore: ["ignored"],
        noParse: ["noparse"]
    }
};
var karma = {};
karma.karmaTypescriptConfig = karmaTypescriptConfig;
configuration.initialize(karma);
test("source-reader should return an empty object literal for ignored modules", function (t) {
    t.plan(1);
    var requiredModule = new required_module_1.RequiredModule("ignored", "ignored.js");
    sourceReader.read(requiredModule, function () {
        t.equal(requiredModule.source, "module.exports={};");
    });
});
test("source-reader should read source for module", function (t) {
    t.plan(1);
    var requiredModule = new required_module_1.RequiredModule("dummy", "dummy.js");
    sourceReader.read(requiredModule, function () {
        t.equal(requiredModule.source, "var x;");
    });
});
test("source-reader should create an AST", function (t) {
    t.plan(1);
    var requiredModule = new required_module_1.RequiredModule("dummy", "dummy.js");
    sourceReader.read(requiredModule, function () {
        t.notEqual(requiredModule.ast.body, undefined);
    });
});
test("source-reader should create an empty dummy AST for non-script files (css, JSON...)", function (t) {
    t.plan(1);
    var requiredModule = new required_module_1.RequiredModule("style", "style.css");
    sourceReader.read(requiredModule, function () {
        t.deepEqual(requiredModule.ast, {
            body: undefined,
            sourceType: "script",
            type: "Program"
        });
    });
});
test("source-reader should create an empty dummy AST for modules specified in the bundler option 'noParse'", function (t) {
    t.plan(1);
    var requiredModule = new required_module_1.RequiredModule("noparse", "noparse.js");
    sourceReader.read(requiredModule, function () {
        t.deepEqual(requiredModule.ast, {
            body: undefined,
            sourceType: "script",
            type: "Program"
        });
    });
});
test("source-reader should prepend JSON source with 'module.exports ='", function (t) {
    t.plan(1);
    var requiredModule = new required_module_1.RequiredModule("json", "json.json");
    sourceReader.read(requiredModule, function () {
        t.equal(requiredModule.source, os.EOL + "module.exports = [1,2,3,\"a\",\"b\",\"c\"]");
    });
});
