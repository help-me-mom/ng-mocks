module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/node/core/*.ts" }
        ],

        preprocessors: {
            "src/node/core/*.ts": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            compilerOptions: {
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                module: "commonjs",
                sourceMap: true,
                target: "ES5",
                lib: ["DOM", "ES2015"]
            },
            include: ["src/node/core/*.ts"],
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
