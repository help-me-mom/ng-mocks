module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/emptyfile/*.ts" }
        ],

        preprocessors: {
            "src/**/*.ts": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            include: ["src/emptyfile/*.ts"]
        },

        reporters: ["progress", "karma-typescript"],

        browsers: ["Chrome"]
    });
};
