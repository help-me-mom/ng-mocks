module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/*.tsx" },
            { pattern: "tests/*.tsx" }
        ],

        preprocessors: {
            "**/*.+(ts|tsx)": ["karma-typescript"]
        },

        reporters: ["progress", "karma-typescript"],

        browsers: ["Chrome"]
    });
};
