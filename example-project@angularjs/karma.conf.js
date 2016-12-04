"use strict";
module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "app/**/*.ts" }
        ],

        preprocessors: {
            "app/**/*.ts": ["karma-typescript"]
        },

        reporters: ["progress", "karma-typescript"],

        karmaTypescriptConfig: {
            tsconfig: "./tsconfig.json"
        },

        logLevel: config.LOG_INFO,

        browsers: ["Chrome"],
    });
};
