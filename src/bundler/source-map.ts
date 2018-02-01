import * as combineSourceMap from "combine-source-map";
import * as convertSourceMap from "convert-source-map";
import * as fs from "fs";
import * as path from "path";

import { Logger } from "log4js";
import { Configuration } from "../shared/configuration";
import { BundleItem } from "./bundle-item";
import { Queued } from "./queued";

export class SourceMap {

    private combiner: Combiner;
    private line: number = 0;

    constructor(private config: Configuration, private log: Logger) {}

    public initialize(bundle: string) {
        this.combiner = combineSourceMap.create();
        this.line = this.getNumberOfNewlines(bundle);
    }

    public removeSourceMapComment(queued: Queued): string {
        return queued.emitOutput.sourceMapText ?
            combineSourceMap.removeComments(queued.emitOutput.outputText) :
            queued.emitOutput.outputText;
    }

    public getSourceMap(queued: Queued): convertSourceMap.SourceMapConverter {
        if (queued.emitOutput.sourceMapText) {

            let map = convertSourceMap.fromJSON(queued.emitOutput.sourceMapText);
            if (!map.getProperty("sourcesContent")) {
                map.addProperty("sourcesContent", [queued.emitOutput.sourceFile.text]);
            }

            return map;
        }

        return undefined;
    }

    public addFile(bundleItem: BundleItem) {

        if (this.config.bundlerOptions.sourceMap) {

            this.loadFileFromComment(bundleItem);

            let sourceFile = path.relative(this.config.karma.basePath, bundleItem.filename);
            this.combiner.addFile(
                { sourceFile: path.join("/base", sourceFile), source: bundleItem.source },
                { line: this.line }
            );
        }

        bundleItem.source = combineSourceMap.removeComments(bundleItem.source);
    }

    public offsetLineNumber(wrappedSource: string) {
        if (this.config.bundlerOptions.sourceMap) {
            this.line += this.getNumberOfNewlines(wrappedSource);
        }
    }

    public getComment() {
        return this.config.bundlerOptions.sourceMap ? this.combiner.comment() : "";
    }

    public loadFileFromComment(bundleItem: BundleItem) {

        let commentMatch = convertSourceMap.mapFileCommentRegex.exec(bundleItem.source);

        if (commentMatch && commentMatch[1]) {

            let map: convertSourceMap.SourceMapConverter;
            let dirname = path.dirname(bundleItem.filename);

            if (!commentMatch[1].startsWith("data:")) {
                let mapFilename = path.join(dirname, commentMatch[1]);
                try {
                    let mapJson = fs.readFileSync(mapFilename, "utf-8");
                    map = convertSourceMap.fromJSON(mapJson);
                }
                catch (error) {
                    this.log.debug("Source map %s doesn't exist", mapFilename);
                }
            }
            else {
                map = convertSourceMap.fromComment(commentMatch[0]);
            }

            if (!map) {
                this.log.debug("Unable to resolve source map for %s", bundleItem.filename);
                return;
            }

            if (!map.getProperty("sourcesContent")) {

                let sourcesContent: string[] = [];
                map.getProperty("sources").forEach((source: string) => {
                    let sourceFilename = path.join(dirname, source);
                    try {
                        let sourceContent = fs.readFileSync(sourceFilename, "utf-8");
                        sourcesContent.push(sourceContent);
                    }
                    catch (error) {
                        this.log.debug("Source file %s doesn't exist", sourceFilename);
                    }
                });
                map.addProperty("sourcesContent", sourcesContent);
            }

            this.cleanupSources(map);

            bundleItem.source = combineSourceMap.removeComments(bundleItem.source) + map.toComment();
        }
    }

    private cleanupSources(map: convertSourceMap.SourceMapConverter) {
        map.sourcemap.sources.forEach((source: string, index: number) => {
            map.sourcemap.sources[index] = source.replace("webpack:///", "");
        });
    }

    private getNumberOfNewlines(source: any) {
        let newlines = source.match(/\n/g);
        return newlines ? newlines.length : 0;
    }
}
