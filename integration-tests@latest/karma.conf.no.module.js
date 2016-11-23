module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/no-module/**/*.ts" }
        ],

        preprocessors: {
            "src/no-module/**/*.ts": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            compilerOptions: {
                module: "none",
                sourceMap: true,
                target: "ES5",
                types : ["jasmine", "node"]
            },
            include: ["src/no-module/*.ts"],
            reports:
            {
                "html": "coverage",
                "text-summary": ""
            }
        },

        reporters: ["progress", "karma-typescript"],

        browsers: ["Chrome"]
    });
};
