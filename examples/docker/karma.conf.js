module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/**/*.ts" }
        ],

        preprocessors: {
            "**/*.ts": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            reports: {
                "html": {
                    "directory": "coverage",
                    "filename": ".",
                    "subdirectory": "."
                }
            },
            tsconfig: "./tsconfig.json"
        },

        logLevel: config.LOG_INFO,

        reporters: ["dots", "karma-typescript"],

        browsers: ["PhantomJS"]
    });
};
