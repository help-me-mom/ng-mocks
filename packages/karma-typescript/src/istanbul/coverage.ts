import { Logger } from "log4js";

import * as convertSourceMap from "convert-source-map";
import * as istanbul from "istanbul-lib-instrument";
import * as path from "path";

import { EmitOutput } from "../compiler/emit-output";
import { Configuration } from "../shared/configuration";
import { File } from "../shared/file";
import { CoverageCallback } from "./coverage-callback";

export class Coverage {

    private instrumenter: istanbul.Instrumenter;
    private log: Logger;

    constructor(private config: Configuration) { }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public initialize(logger: any): void {

        this.log = logger.create("coverage.karma-typescript");
        this.log.debug("Initializing");

        this.config.whenReady(() => {
            this.log.debug("Configuring coverage preprocessor");
            this.instrumenter = istanbul.createInstrumenter(this.config.coverageOptions.instrumenterOptions);
        });
    }

    public instrument(file: File, bundled: string, emitOutput: EmitOutput, callback: CoverageCallback): void {

        if (this.config.hasPreprocessor("commonjs")) {
            this.log.debug("karma-commonjs already configured");
            callback(bundled);
            return;
        }

        if (this.config.hasPreprocessor("coverage")) {
            this.log.debug("karma-coverage already configured");
            callback(bundled);
            return;
        }

        if (!this.config.coverageOptions.instrumentation ||
            this.isExcluded(this.config.coverageOptions.exclude, file.relativePath) ||
            this.hasNoOutput(emitOutput)) {

            this.log.debug("Excluding file %s from instrumentation", file.originalPath);
            callback(bundled);
            return;
        }

        this.log.debug("Processing \"%s\".", file.originalPath);

        let sourceMap = convertSourceMap.fromSource(bundled);

        if (!sourceMap) {
            sourceMap = convertSourceMap.fromMapFileSource(bundled, path.dirname(file.originalPath));
        }

        this.instrumenter.instrument(bundled, file.originalPath, (error, instrumentedSource) => {
            if (error) {
                this.log.error("%s\nin %s", error.message, file.originalPath);
                callback(error.message);
            }
            else {
                callback(instrumentedSource);
            }
        }, sourceMap ? sourceMap.sourcemap : undefined);
    }

    private hasNoOutput(emitOutput: EmitOutput): boolean {
        return emitOutput.outputText.startsWith("//# sourceMappingURL=");
    }

    private isExcluded(regex: RegExp | RegExp[], filePath: string): boolean {
        if (Array.isArray(regex)) {
            for (const r of regex) {
                if (r.test(filePath)) {
                    return true;
                }
            }
            return false;
        }
        return regex.test(filePath);
    }
}
