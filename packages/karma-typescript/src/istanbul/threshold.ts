import * as istanbulCoverage from "istanbul-lib-coverage";
import { merge } from "lodash";
import { Logger } from "log4js";
import * as minimatch from "minimatch";
import { Configuration } from "../shared/configuration";
import { FileUtils } from "../shared/file-utils";

export class Threshold {

    constructor(private config: Configuration, private log: Logger) { }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public check(browser: any, coverageMap: istanbulCoverage.CoverageMap) : boolean {

        let passedThreshold = true;

        const checkThresholds = (name: string, thresholds: any, coverageSummary: istanbulCoverage.CoverageSummary) => {

            ["branches", "functions", "lines", "statements"].forEach((key) => {

                const result = (coverageSummary as any)[key];
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

        const thresholdConfig = this.config.coverageOptions.threshold;
        const globalSummary = istanbulCoverage.createCoverageSummary();
        const globalSummaries = this.toSummaries(coverageMap, thresholdConfig.global.excludes);
        const fileSummaries = this.toSummaries(coverageMap, thresholdConfig.file.excludes);

        Object.keys(globalSummaries).forEach((filename) => {
            globalSummary.merge(globalSummaries[filename]);
        });

        checkThresholds("global", thresholdConfig.global, globalSummary);

        Object.keys(fileSummaries).forEach((filename) => {
            const relativeFilename = FileUtils.getRelativePath(filename, this.config.karma.basePath);
            const thresholds = merge(thresholdConfig.file, this.getFileOverrides(relativeFilename));
            checkThresholds(filename, thresholds, fileSummaries[filename]);
        });

        return passedThreshold;
    }

    private toSummaries(coverageMap: istanbulCoverage.CoverageMap, excludes: string[]) {
        const result: { [key: string]: istanbulCoverage.CoverageSummary } = {};
        coverageMap.files().forEach((filename) => {
            const relativeFilename = FileUtils.getRelativePath(filename, this.config.karma.basePath);
            if (!this.isExcluded(relativeFilename, excludes)) {
                const fileCoverage = coverageMap.fileCoverageFor(filename);
                result[filename] = fileCoverage.toSummary();
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
