import { Logger } from "log4js";

import Configuration = require("./configuration");
import CoverageCallback = require("./coverage-callback");
import EmitOutput = require("./emit-output");
import File = require("./file");
import SourceMap = require("./source-map");

class Coverage {

    private coverage = require("karma-coverage/lib/preprocessor");
    private coveragePreprocessor: any;
    private log: Logger;

    constructor(private config: Configuration) { }

    public initialize(helper: any, logger: any): void {

        this.log = logger.create("coverage.karma-typescript");

        this.coveragePreprocessor = this.coverage(
            logger,
            helper,
            this.config.karma.basePath,
            this.config.reporters,
            this.config.coverageReporter
        );
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
            this.isExcluded(this.config.coverageOptions.exclude, file.originalPath) ||
            this.hasNoOutput(file, emitOutput)) {

            this.log.debug("Excluding file %s from instrumentation", file.originalPath);
            callback(bundled);
            return;
        }

        this.coveragePreprocessor(bundled, file, callback);
    }

    private hasNoOutput(file: File, emitOutput: EmitOutput): boolean {
        return emitOutput.outputText === SourceMap.getComment(file);
    }

    private isExcluded(regex: RegExp | RegExp[], path: string): boolean {
        if (Array.isArray(regex)) {
            for (let r of regex) {
                if (r.test(path)) {
                    return true;
                }
            }
            return false;
        }
        return regex.test(path);
    }
}

export = Coverage;
