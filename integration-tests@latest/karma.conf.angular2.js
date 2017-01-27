module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/frameworks/angular2/**/*.ts" }
        ],

        preprocessors: {
            "src/frameworks/angular2/**/*.ts": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            bundlerOptions: {
                addNodeGlobals: false,
                resolve: {
                    alias: {
                        "@angular/upgrade/static$": "../bundles/upgrade-static.umd.js"
                    }
                }
            },
            compilerOptions: {
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                module: "commonjs",
                sourceMap: true,
                target: "ES5"
            },
            include: ["src/frameworks/angular2/**/*.ts"],
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
