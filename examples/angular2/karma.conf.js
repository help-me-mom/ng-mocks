var path = require("path");

module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "base.spec.ts" },
            { pattern: "src/app/**/*.+(ts|html)" }
        ],

        preprocessors: {
            "**/*.ts": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            bundlerOptions: {
                entrypoints: /\.spec\.ts$/,
                transforms: [
                    require("karma-typescript-angular2-transform")
                ]
            },
            compilerOptions: {
                lib: ["ES2015", "DOM"]
            }
        },

        coverageIstanbulReporter: {
            reports: ["html"],
            dir: path.join(__dirname, "coverage"),
        },

        reporters: ["dots", "coverage-istanbul"],

        browsers: ["ChromeHeadless"],

        singleRun: true
    });
};
