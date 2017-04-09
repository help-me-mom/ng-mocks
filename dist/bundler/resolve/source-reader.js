"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var acorn = require("acorn");
var fs = require("fs");
var os = require("os");
var validator = require("validator");
var SourceMap = require("../source-map");
var SourceReader = (function () {
    function SourceReader(config, transformer) {
        this.config = config;
        this.transformer = transformer;
    }
    SourceReader.prototype.read = function (requiredModule, onSourceRead) {
        var _this = this;
        this.readFile(requiredModule, function (source) {
            requiredModule.source = SourceMap.deleteComment(source);
            requiredModule.ast = _this.createAbstractSyntaxTree(requiredModule);
            _this.transformer.applyTransforms(requiredModule, function () {
                _this.assertModuleExports(requiredModule);
                onSourceRead();
            });
        });
    };
    SourceReader.prototype.readFile = function (requiredModule, onSourceRead) {
        if (this.config.bundlerOptions.ignore.indexOf(requiredModule.moduleName) !== -1) {
            onSourceRead("module.exports={};");
        }
        else {
            fs.readFile(requiredModule.filename, function (error, data) {
                if (error) {
                    throw error;
                }
                onSourceRead(data.toString());
            });
        }
    };
    SourceReader.prototype.assertModuleExports = function (requiredModule) {
        if (!requiredModule.isScript() &&
            !requiredModule.source.match(/^\s*module\.exports\s*=/)) {
            requiredModule.source = os.EOL +
                "module.exports = " + (validator.isJSON(requiredModule.source) ?
                requiredModule.source :
                JSON.stringify(requiredModule.source)) + ";";
        }
    };
    SourceReader.prototype.createAbstractSyntaxTree = function (requiredModule) {
        if (!requiredModule.isScript() ||
            this.config.bundlerOptions.noParse.indexOf(requiredModule.moduleName) !== -1) {
            return {
                body: undefined,
                sourceType: "script",
                type: "Program"
            };
        }
        return acorn.parse(requiredModule.source, this.config.bundlerOptions.acornOptions);
    };
    return SourceReader;
}());
exports.SourceReader = SourceReader;
