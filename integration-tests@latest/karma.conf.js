module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "node_modules/reflect-metadata/Reflect.js" },
            { pattern: "node_modules/zone.js/dist/zone.js" },
            { pattern: "node_modules/zone.js/dist/long-stack-trace-zone.js" },
            { pattern: "node_modules/zone.js/dist/proxy.js" },
            { pattern: "node_modules/zone.js/dist/sync-test.js" },
            { pattern: "node_modules/zone.js/dist/jasmine-patch.js" },
            { pattern: "node_modules/zone.js/dist/async-test.js" },
            { pattern: "node_modules/zone.js/dist/fake-async-test.js" },
            { pattern: "src/**/*.+(ts|tsx)" }
        ],

        preprocessors: {
            "src/**/*.+(ts|tsx)": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            tsconfig: "./tsconfig.json",
            compilerOptions: {
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                jsx: "react",
                noImplicitAny: true,
                module: "commonjs",
                sourceMap: true,
                target: "ES5",
            },
            excludeFromCoverage: /\.(d|spec|test)\.ts/,
            reports:
            {
                "html": "coverage",
                "text-summary": ""
            },
            transformPath: function(filepath) {
                return filepath.replace(/\.(ts|tsx)$/, ".js");
            }
        },

        reporters: ["progress", "karma-typescript"],

        browsers: ["Chrome"]
    });
};
