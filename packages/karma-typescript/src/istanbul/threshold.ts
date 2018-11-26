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

        const thresholdConfig = this.config.coverageOptions.threshold;
        const finalCoverage = collector.getFinalCoverage();
        const globalCoverage = this.excludeFiles(finalCoverage, thresholdConfig.global.excludes);
        const globalResults = (istanbul.utils as any).summarizeCoverage(globalCoverage);
        let passedThreshold = true;

        const checkThresholds = (name: string, thresholds: any, results: any) => {

            ["branches", "functions", "lines", "statements"].forEach((key) => {

                const result = results[key];
                const uncovered = result.total - result.covered;
                const threshold = thresholds[key];

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

            const relativeFilename = FileUtils.getRelativePath(filename, this.config.karma.basePath);
            const excludes = this.config.coverageOptions.threshold.file.excludes;

            if (!this.isExcluded(relativeFilename, excludes)) {
                const fileResult = (istanbul.utils as any).summarizeFileCoverage(finalCoverage[filename]);
                const thresholds = merge(thresholdConfig.file, this.getFileOverrides(relativeFilename));
                checkThresholds(filename, thresholds, fileResult);
            }
        });

        return passedThreshold;
    }

    private excludeFiles(coverage: any, excludes: string[]) {
        const result: { [key: string]: any } = {};
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
        const overrides = this.config.coverageOptions.threshold.file.overrides;
        Object.keys(overrides).forEach((pattern) => {
            if (minimatch(relativeFilename, pattern, { dot: true })) {
                thresholds = overrides[pattern];
            }
        });
        return thresholds;
    }
}
