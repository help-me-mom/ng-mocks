"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var acorn = require("acorn");
var fs = require("fs");
var os = require("os");
var SourceMap = require("../source-map");
var SourceReader = (function () {
    function SourceReader(config, transformer) {
        this.config = config;
        this.transformer = transformer;
    }
    SourceReader.prototype.read = function (bundleItem, onSourceRead) {
        var _this = this;
        this.readFile(bundleItem, function (source) {
            bundleItem.source = SourceMap.deleteComment(source);
            bundleItem.ast = _this.createAbstractSyntaxTree(bundleItem);
            _this.transformer.applyTransforms(bundleItem, function () {
                _this.assertValidNonScriptSource(bundleItem);
                onSourceRead();
            });
        });
    };
    SourceReader.prototype.readFile = function (bundleItem, onSourceRead) {
        if (this.config.bundlerOptions.ignore.indexOf(bundleItem.moduleName) !== -1) {
            onSourceRead("module.exports={};");
        }
        else {
            fs.readFile(bundleItem.filename, function (error, data) {
                if (error) {
                    throw error;
                }
                onSourceRead(data.toString());
            });
        }
    };
    SourceReader.prototype.assertValidNonScriptSource = function (bundleItem) {
        if (!bundleItem.isScript() &&
            !bundleItem.source.match(/^\s*module\.exports\s*=/)) {
            var source = bundleItem.source;
            try {
                JSON.parse(bundleItem.source);
            }
            catch (jsonError) {
                try {
                    acorn.parse(bundleItem.source, this.config.bundlerOptions.acornOptions);
                }
                catch (acornError) {
                    source = JSON.stringify(bundleItem.source);
                }
            }
            bundleItem.source = os.EOL + "module.exports = " + source + ";";
        }
    };
    SourceReader.prototype.createAbstractSyntaxTree = function (bundleItem) {
        if (!bundleItem.isScript() ||
            this.config.bundlerOptions.noParse.indexOf(bundleItem.moduleName) !== -1) {
            return {
                body: undefined,
                sourceType: "script",
                type: "Program"
            };
        }
        return acorn.parse(bundleItem.source, this.config.bundlerOptions.acornOptions);
    };
    return SourceReader;
}());
exports.SourceReader = SourceReader;
