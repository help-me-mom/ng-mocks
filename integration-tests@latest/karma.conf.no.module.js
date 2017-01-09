module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/misc/no-module-tester.spec.ts" }
        ],

        preprocessors: {
            "src/misc/no-module-tester.spec.ts": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            compilerOptions: {
                module: "none",
                sourceMap: true,
                target: "ES5",
                types : ["jasmine", "node"]
            },
            include: ["src/misc/no-module-tester.spec.ts"],
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
