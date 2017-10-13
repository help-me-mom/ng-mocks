import { Logger } from "log4js";

import { EmitOutput } from "../compiler/emit-output";
import { Configuration } from "../shared/configuration";
import { File } from "../shared/file";
import { CoverageCallback } from "./coverage-callback";

export class Coverage {

    private coverage = require("karma-coverage/lib/preprocessor");
    private coveragePreprocessor: any;
    private log: Logger;

    constructor(private config: Configuration) {
    }

    public initialize(helper: any, logger: any): void {

        this.log = logger.create("coverage.karma-typescript");
        this.log.debug("Initializing");

        this.config.whenReady(() => {
            this.log.debug("Configuring coverage preprocessor");
            this.coveragePreprocessor = this.coverage(
                logger,
                helper,
                this.config.karma.basePath,
                this.config.reporters,
                this.config.coverageReporter
            );
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

        this.coveragePreprocessor(bundled, file, callback);
    }

    private hasNoOutput(emitOutput: EmitOutput): boolean {
        return emitOutput.outputText.startsWith("//# sourceMappingURL=");
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
