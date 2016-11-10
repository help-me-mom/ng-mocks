module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/**/*.ts" }
        ],

        preprocessors: {
            "**/*.ts": ["karma-typescript"]
        },

        reporters: ["progress", "karma-typescript"],

        // Uncomment below if you want the default html
        // coverage report + a summary on the console
        /*
        karmaTypescriptConfig: {
            reports:
            {
                "html": "coverage",
                "text-summary": "" // destination "" will redirect output to the console
            }
        },
        //*/

        // Uncomment below if you want to disable code coverage
        // instrumentation during debugging of tests
        /*
        karmaTypescriptConfig: {
            disableCodeCoverageInstrumentation: true
        },
        //*/

        browsers: ["Chrome"]
    });
};
