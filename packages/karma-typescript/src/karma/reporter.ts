import * as istanbulCoverage from "istanbul-lib-coverage";
import * as istanbulReport from "istanbul-lib-report";
import * as istanbulSourceMaps from "istanbul-lib-source-maps";
import * as istanbulReports from "istanbul-reports";

import * as lodash from "lodash";
import * as path from "path";

import { Logger } from "log4js";

import { Threshold } from "../istanbul/threshold";
import { Configuration } from "../shared/configuration";

const reporterName = "karma-typescript";

export class Reporter {

    public create: (baseReporterDecorator: any, logger: any) => void;

    private log: Logger;
    private coverageMap: WeakMap<any, any>;

    constructor(config: Configuration, threshold: Threshold) {

        const that = this;

        // tslint:disable-next-line:only-arrow-functions
        this.create = function(baseReporterDecorator: any, logger: any) {

            baseReporterDecorator(that);

            that.log = logger.create(`reporter.${reporterName}`);

            this.onRunStart = () => {
                that.coverageMap = new WeakMap<any, any>();
            };

            this.onBrowserComplete = (browser: any, result: any) => {
                if (result && result.coverage) {
                    that.coverageMap.set(browser, result.coverage);
                }
            };

            this.onRunComplete = (browsers: any[], results: any) => {

                browsers.forEach(async (browser: any) => {

                    const coverage = that.coverageMap.get(browser);
                    const coverageMap = istanbulCoverage.createCoverageMap();
                    coverageMap.merge(coverage);

                    const sourceMapStore = istanbulSourceMaps.createSourceMapStore();
                    const remappedCoverageMap = await sourceMapStore.transformCoverage(coverageMap);

                    if (results && config.hasCoverageThreshold && !threshold.check(browser, remappedCoverageMap.map)) {
                        results.exitCode = 1;
                    }

                    Object.keys(config.reports).forEach((reportType: any) => {

                        const destination = that.getReportDestination(browser, config.reports, reportType);

                        if (destination) {
                            that.log.debug("Writing coverage to %s", destination);
                        }

                        const context = istanbulReport.createContext({
                            // @ts-ignore
                            coverageMap: remappedCoverageMap,
                            dir: destination,
                            // @ts-ignore
                            sourceFinder: sourceMapStore.sourceFinder
                        });

                        istanbulReports
                            .create(reportType)
                            // @ts-ignore
                            .execute(context);
                    });
                });
            };
        };

        Object.assign(this.create, { $inject: ["baseReporterDecorator", "logger", "config"] });
    }

    private getReportDestination(browser: any, reports: any, reportType: any) {

        const reportConfig = reports[reportType];

        if (lodash.isPlainObject(reportConfig)) {
            let subdirectory = reportConfig.subdirectory || browser.name;
            if (typeof subdirectory === "function") {
                subdirectory = subdirectory(browser);
            }

            return path.join(reportConfig.directory || "coverage",
                             subdirectory,
                             reportConfig.filename || reportType);
        }

        if (lodash.isString(reportConfig) && reportConfig.length > 0) {
            return path.join(reportConfig, browser.name, reportType);
        }

        return null;
    }
}
