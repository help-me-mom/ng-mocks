"use strict";
module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "node_modules/angular/angular.js" },
            { pattern: "node_modules/angular-mocks/angular-mocks.js" },
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
