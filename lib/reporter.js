/*
    This code is HEAVILY based on the code found in the reporter of karma-remap-istanbul v0.2.1!
*/

function Reporter(sharedProcessedFiles) {

    var coverageReporter = require("karma-coverage/lib/reporter"),
        isPlainObject = require("lodash.isplainobject"),
        isString = require("lodash.isstring"),
        istanbul = require("istanbul"),
        path = require("path"),
        remap = require("./remap-istanbul/lib/remap"),
        writeReport = require("./remap-istanbul/lib/writeReport"),
        
        log;

    function hasCoverageReporter(config) {

        return config.reporters.indexOf("coverage") !== -1;
    }

    function getReports(config) {

        return config.karmaTypescriptConfig && config.karmaTypescriptConfig.reports ?
        config.karmaTypescriptConfig.reports :
        {
            html: "coverage"
        };
    }

    function getRemapOptions(config) {

        return config.karmaTypescriptConfig && config.karmaTypescriptConfig.remapOptions ?
            config.karmaTypescriptConfig.remapOptions : {};
    }

    function getReportDestination(browser, reports, reportType) {

        var reportConfig = reports[reportType];

        if(isPlainObject(reportConfig)) {

            if(!reportConfig || !reportConfig.directory || ! reportConfig.filename) {
                log.warn("Invalid report configuration, expected " +
                         "\"reporttype\": { \"directory\": \"path\", \"filename\": \"name.txt\" } " +
                         "but got " + reportType + ":" + JSON.stringify(reportConfig));

                return path.join(reportType);
            }

            return path.join(reportConfig.directory, browser.name, reportConfig.filename);
        }

        if(isString(reportConfig) && reportConfig.length > 0) {
            return path.join(reportConfig, browser.name, reportType);
        }

        return null;
    }

    function create(config, helper, logger, emitter) {

        var coverageMap,
            reports = getReports(config),
            remapOptions = getRemapOptions(config);

        log = logger.create("reporter.karma-typescript");

        if(!hasCoverageReporter(config)) {

            coverageReporter(config, helper, logger, emitter);
        }

        this.onRunStart = function () {

            coverageMap = new WeakMap();
        };

        this.onBrowserComplete = function (browser, result) {

            if (!result || !result.coverage) {
                return;
            }

            coverageMap.set(browser, result.coverage);
        };

        this.onRunComplete = function (browsers) {

            var self = this;

            browsers.forEach(function (browser) {

                var coverage = coverageMap.get(browser),
                    unmappedCollector = new istanbul.Collector();

                if (!coverage) {
                    return;
                }

                unmappedCollector.add(coverage);

                var sourceStore = istanbul.Store.create("memory");
                remapOptions.sources = sourceStore;
                remapOptions.readFile = function(filepath) {
                    return sharedProcessedFiles[filepath];
                };
                var collector = remap(unmappedCollector.getFinalCoverage(), remapOptions);

                Promise
                    .all(Object.keys(reports)
                    .map(function (reportType) {

                        var destination = getReportDestination(browser, reports, reportType);

                        if(destination) {
                            log.debug("Writing coverage to %s", destination);
                        }

                        return writeReport(collector, reportType, {}, destination, sourceStore);
                    }))
                    .catch(function (error) {
                        log.error(error);
                    })
                    .then(function () {

                        collector.dispose();
                        coverageMap = null;
                    }
                    .bind(self));
            });
        };
    }

    this.create = create;

    this.create.$inject = ["config", "helper", "logger", "emitter"];
}

module.exports = Reporter;
