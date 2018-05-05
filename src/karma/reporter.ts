import * as lodash from "lodash";
import * as path from "path";

import { Collector, Store } from "istanbul";
import { ConfigOptions } from "karma";
import { Logger } from "log4js";

import { Threshold } from "../istanbul/threshold";
import { Configuration } from "../shared/configuration";
import { SharedProcessedFiles } from "../shared/shared-processed-files";

export class Reporter {

    public create: { (karmaConfig: ConfigOptions, helper: any, logger: any, emitter: any): void };

    private log: Logger;
    private remap = require("remap-istanbul/lib/remap");
    private writeReport = require("remap-istanbul/lib/writeReport");

    constructor(config: Configuration, sharedProcessedFiles: SharedProcessedFiles, threshold: Threshold) {

        let self = this;

        // tslint:disable-next-line:only-arrow-functions
        this.create = function (logger: any) {

            let coverageMap: WeakMap<any, any>;

            self.log = logger.create("reporter.karma-typescript");
            this.adapters = [];

            this.onRunStart = () => {
                coverageMap = new WeakMap<any, any>();
            };

            this.onBrowserComplete = (browser: any, result: any) => {
                if (!result || !result.coverage) {
                    return;
                }
                coverageMap.set(browser, result.coverage);
            };

            this.onRunComplete = (browsers: any[], results: any) => {

                browsers.forEach((browser: any) => {

                    let coverage = coverageMap.get(browser);
                    let unmappedCollector = new Collector();

                    if (!coverage) {
                        return;
                    }

                    unmappedCollector.add(coverage);

                    let sourceStore = (<any> Store).create("memory");
                    config.remapOptions.sources = sourceStore;
                    config.remapOptions.readFile = (filepath: string) => {
                        return sharedProcessedFiles[filepath];
                    };
                    let collector = self.remap((<any> unmappedCollector).getFinalCoverage(), config.remapOptions);

                    if (results && config.hasCoverageThreshold && !threshold.check(browser, collector)) {
                        results.exitCode = 1;
                    }

                    Promise
                        .all(Object.keys(config.reports)
                        .map((reportType) => {

                            let destination = self.getReportDestination(browser, config.reports, reportType);

                            if (destination) {
                                self.log.debug("Writing coverage to %s", destination);
                            }

                            return self.writeReport(collector, reportType, {}, destination, sourceStore);
                        }))
                        .catch((error: any) => {
                            self.log.error(error);
                        })
                        .then(() => {
                            collector.dispose();
                            coverageMap = null;
                        });
                });
            };
        };

        (<any> this.create).$inject = ["logger"];
    }

    private getReportDestination(browser: any, reports: any, reportType: any) {

        let reportConfig = reports[reportType];

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
