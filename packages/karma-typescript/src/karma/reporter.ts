import * as istanbulCoverage from "istanbul-lib-coverage";
import * as istanbulReport from "istanbul-lib-report";
import * as istanbulSourceMaps from "istanbul-lib-source-maps";
import * as istanbulReports from "istanbul-reports";

import * as lodash from "lodash";
import * as path from "path";

import { Logger } from "log4js";

import { Threshold } from "../istanbul/threshold";
import { Configuration } from "../shared/configuration";

type BrowserCollection = {
    forEach: any[]['forEach'];
}

const reporterName = "karma-typescript";

export class Reporter {

    public create: (baseReporterDecorator: any, logger: any) => void;

    private log: Logger;
    private coverageMap: WeakMap<any, any>;

    constructor(config: Configuration, threshold: Threshold) {

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;

        // tslint:disable-next-line:only-arrow-functions
        this.create = function(baseReporterDecorator: any, logger: any) {

            baseReporterDecorator(this);

            that.log = logger.create(`reporter.${reporterName}`);

            this.onRunStart = () => {
                that.coverageMap = new WeakMap<any, any>();
            };

            this.onBrowserStart = () => { /**/ };
            this.specFailure = () => { /**/ };

            this.onBrowserComplete = (browser: any, result: any) => {
                if (result && result.coverage) {
                    that.coverageMap.set(browser, result.coverage);
                }
            };

            this.onRunComplete = async (collection: BrowserCollection, results: any) => {
                const browsers: any[] = [];
                collection.forEach((browser) => browsers.push(browser));

                const coverageChecks = browsers.map(async (browser) => {
                    const coverage = that.coverageMap.get(browser);
                    const coverageMap = istanbulCoverage.createCoverageMap();
                    coverageMap.merge(coverage);

                    const sourceMapStore = istanbulSourceMaps.createSourceMapStore();
                    const remappedCoverageMap = await sourceMapStore.transformCoverage(coverageMap);

                    Object.keys(config.reports).forEach((reportType: any) => {

                        const reportConfig = config.reports[reportType] as any;
                        const directory = that.getReportDestination(browser, reportConfig, reportType);

                        if (directory) {
                            that.log.debug("Writing coverage to %s", directory);
                        }

                        const istanbulReportOptions = {
                            coverageMap: remappedCoverageMap,
                            dir: directory,
                            sourceFinder: sourceMapStore.sourceFinder,
                            watermarks: config.coverageOptions.watermarks
                        };
                        const context = istanbulReport.createContext(istanbulReportOptions);

                        istanbulReports
                            .create(reportType, { file: reportConfig ? reportConfig.filename : undefined })
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            .execute(context);

                        });

                    return results
                        && config.hasCoverageThreshold
                        && !threshold.check(browser, remappedCoverageMap);
                });

                const isCoverageCheckFailed = (await Promise.all(coverageChecks))
                    .some(isCheckFailed => isCheckFailed);

                if (isCoverageCheckFailed && config.karma.singleRun) {
                    process.exit(1);
                }
            };
        };

        Object.assign(this.create, { $inject: ["baseReporterDecorator", "logger", "config"] });
    }

    private getReportDestination(browser: any, reportConfig: any, reportType: any) {

        if (lodash.isPlainObject(reportConfig)) {
            let subdirectory = reportConfig.subdirectory ?? browser.name;
            if (typeof subdirectory === "function") {
                subdirectory = subdirectory(browser);
            }

            return path.join(reportConfig.directory ?? "coverage", subdirectory);
        }

        if (lodash.isString(reportConfig) && reportConfig.length > 0) {
            return path.join(reportConfig, browser.name, reportType);
        }

        return null;
    }
}
