import * as istanbul from "istanbul";
import { merge } from "lodash";
import { Logger } from "log4js";
import * as minimatch from "minimatch";
import { Configuration } from "../shared/configuration";
import { FileUtils } from "../shared/file-utils";

export class Threshold {

    constructor(private config: Configuration, private log: Logger) {
    }

    public check(browser: any, collector: any) {

        let thresholdConfig = this.config.coverageOptions.threshold;
        let finalCoverage = collector.getFinalCoverage();
        let globalCoverage = this.excludeFiles(finalCoverage, thresholdConfig.global.excludes);
        let globalResults = (<any> istanbul.utils).summarizeCoverage(globalCoverage);
        let passedThreshold = true;

        let checkThresholds = (name: string, thresholds: any, results: any) => {

            ["branches", "functions", "lines", "statements"].forEach((key) => {

                let result = results[key];
                let uncovered = result.total - result.covered;
                let threshold = thresholds[key];

                if (threshold < 0 && threshold * -1 < uncovered) {
                    passedThreshold = false;
                    this.log.error("%s: Expected max %s uncovered %s, got %s (%s)",
                        browser.name, (-1 * threshold), key, uncovered, name);
                }
                else if (result.pct < threshold) {
                    passedThreshold = false;
                    this.log.error("%s: Expected %s% coverage for %s, got %s% (%s)",
                        browser.name, threshold, key, result.pct, name);
                }
            });
        };

        checkThresholds("global", thresholdConfig.global, globalResults);

        Object.keys(finalCoverage).forEach((filename) => {

            let relativeFilename = FileUtils.getRelativePath(filename, this.config.karma.basePath);
            let excludes = this.config.coverageOptions.threshold.file.excludes;

            if (!this.isExcluded(relativeFilename, excludes)) {
                let fileResult = (<any> istanbul.utils).summarizeFileCoverage(finalCoverage[filename]);
                let thresholds = merge(thresholdConfig.file, this.getFileOverrides(relativeFilename));
                checkThresholds(filename, thresholds, fileResult);
            }
        });

        return passedThreshold;
    }

    private excludeFiles(coverage: any, excludes: string[]) {
        let result: { [key: string]: any } = {};
        Object.keys(coverage).forEach((filename) => {
            if (!this.isExcluded(FileUtils.getRelativePath(filename, this.config.karma.basePath), excludes)) {
                result[filename] = coverage[filename];
            }
        });
        return result;
    }

    private isExcluded(relativeFilename: string, excludes: string[]) {
        return excludes.some((pattern) => {
            return minimatch(relativeFilename, pattern, { dot: true });
        });
    }

    private getFileOverrides(relativeFilename: string) {
        let thresholds = {};
        let overrides = this.config.coverageOptions.threshold.file.overrides;
        Object.keys(overrides).forEach((pattern) => {
            if (minimatch(relativeFilename, pattern, { dot: true })) {
                thresholds = overrides[pattern];
            }
        });
        return thresholds;
    }
}
