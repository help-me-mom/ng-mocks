/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/**/*.ts" },
            { pattern: "src/resolve-typings/js-lib.js" }
        ],

        preprocessors: {
            "src/**/*.+(js|ts)": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            bundlerOptions: {
                constants: {
                    __STRING__: JSON.stringify("abc" + 123),
                    __BOOLEAN__: true,
                    "process.env": {
                        "VARIABLE": "value"
                    }
                },
                entrypoints: /\.spec\.(ts|tsx)$/,
                exclude: [
                    "karma-typescript-test-module/excluded"
                ],
                ignore: ["karma-typescript-test-module/ignored"],
                noParse: ["karma-typescript-test-module/no-parse"],
                resolve: {
                    alias: {
                        "kttm-add-alias": "node_modules/karma-typescript-test-module/add/index.js"
                    }
                },
                transforms: [
                    require("karma-typescript-cssmodules-transform")({}, {}, /style-import-tester\.css$/),
                    require("karma-typescript-es6-transform")({presets: [["@babel/preset-env"]]}),
                    function(context, callback) {
                        if(context.ts && context.module.endsWith("es6-transform-tester.ts")) {
                            context.ts.transpiled = "\n/* istanbul ignore next */\n" + context.ts.transpiled;
                            return callback(undefined, true, false);
                        }
                        return callback(undefined, false);
                    }
                ]
            },
            coverageOptions: {
                threshold: {
                    global: {
                        statements: 80,
                        branches: 60,
                        functions: 90,
                        lines: 90
                    }
                },
                watermarks: {
                    lines: [75, 90],
                    functions: [75, 90],
                    branches: [75, 90],
                    statements: [75, 90]
                }
            },
            tsconfig: "./tsconfig.json",
        },

        reporters: ["dots", "karma-typescript"],

        browsers: ["ChromeHeadless"],

        singleRun: true
    });
};
