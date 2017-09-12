"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var combineSourceMap = require("combine-source-map");
var convertSourceMap = require("convert-source-map");
var fs = require("fs");
var path = require("path");
var SourceMap = (function () {
    function SourceMap(config) {
        this.config = config;
        this.line = 0;
    }
    SourceMap.prototype.initialize = function (bundle) {
        this.combiner = combineSourceMap.create();
        this.line = this.getNumberOfNewlines(bundle);
    };
    SourceMap.prototype.createInlineSourceMap = function (queued) {
        var inlined = queued.emitOutput.outputText;
        if (queued.emitOutput.sourceMapText) {
            var map = convertSourceMap
                .fromJSON(queued.emitOutput.sourceMapText)
                .addProperty("sourcesContent", [queued.emitOutput.sourceFile.text]);
            inlined = combineSourceMap.removeComments(queued.emitOutput.outputText) + map.toComment();
            // used by Karma to log errors with original source code line numbers
            queued.file.sourceMap = map.toObject();
        }
        return inlined;
    };
    SourceMap.prototype.addFile = function (bundleItem) {
        if (this.config.bundlerOptions.sourceMap) {
            this.loadFileFromComment(bundleItem);
            var sourceFile = path.relative(this.config.karma.basePath, bundleItem.filename);
            this.combiner.addFile({ sourceFile: path.join("/base", sourceFile), source: bundleItem.source }, { line: this.line });
        }
        bundleItem.source = combineSourceMap.removeComments(bundleItem.source);
    };
    SourceMap.prototype.offsetLineNumber = function (wrappedSource) {
        if (this.config.bundlerOptions.sourceMap) {
            this.line += this.getNumberOfNewlines(wrappedSource);
        }
    };
    SourceMap.prototype.getComment = function () {
        return this.config.bundlerOptions.sourceMap ? this.combiner.comment() : "";
    };
    SourceMap.prototype.loadFileFromComment = function (bundleItem) {
        var commentMatch = convertSourceMap.mapFileCommentRegex.exec(bundleItem.source);
        if (commentMatch && commentMatch[1]) {
            var map = void 0;
            var dirname_1 = path.dirname(bundleItem.filename);
            if (!commentMatch[1].startsWith("data:")) {
                var mapFilename = path.join(dirname_1, commentMatch[1]);
                var mapJson = fs.readFileSync(mapFilename, "utf-8");
                map = convertSourceMap.fromJSON(mapJson);
            }
            else {
                map = convertSourceMap.fromComment(commentMatch[0]);
            }
            if (!map.getProperty("sourcesContent")) {
                var sourcesContent_1 = [];
                map.getProperty("sources").forEach(function (source) {
                    var sourceFilename = path.join(dirname_1, source);
                    var sourceContent = fs.readFileSync(sourceFilename, "utf-8");
                    sourcesContent_1.push(sourceContent);
                });
                map.addProperty("sourcesContent", sourcesContent_1);
            }
            this.cleanupSources(map);
            bundleItem.source = combineSourceMap.removeComments(bundleItem.source) + map.toComment();
        }
    };
    SourceMap.prototype.cleanupSources = function (map) {
        map.sourcemap.sources.forEach(function (source, index) {
            map.sourcemap.sources[index] = source.replace("webpack:///", "");
        });
    };
    SourceMap.prototype.getNumberOfNewlines = function (source) {
        var newlines = source.match(/\n/g);
        return newlines ? newlines.length : 0;
    };
    return SourceMap;
}());
exports.SourceMap = SourceMap;
