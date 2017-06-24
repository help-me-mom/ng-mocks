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
                entrypoints: /\.spec\.ts$/,
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
                target: "ES5",
                lib: ["DOM", "ES2015"]
            },
            include: ["src/frameworks/angular2/**/*.ts"],
            reports:
            {
                "html": "coverage",
                "text-summary": ""
            }
        },

        reporters: ["dots", "karma-typescript"],

        browsers: ["Chrome"]
    });
};
