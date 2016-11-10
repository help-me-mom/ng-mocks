module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/core-modules/**/*.ts" }
        ],

        preprocessors: {
            "src/core-modules/**/*.ts": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            compilerOptions: {
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                module: "commonjs",
                sourceMap: true,
                target: "ES5"
            },
            include: ["src/core-modules/*.ts"],
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
