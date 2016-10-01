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

        karmaTypescriptConfig: {
            reports:
            {
                "html": "coverage",
                "text-summary": "" // destination "" will redirect output to the console
            }
        },

        browsers: ["Chrome"]
    });
};
