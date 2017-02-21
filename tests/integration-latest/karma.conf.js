module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/bundling/**/*.ts" },
            { pattern: "src/custom-typings/**/*.ts" },
            { pattern: "src/exports/*.ts" },
            { pattern: "src/frameworks/**/*.ts" },
            { pattern: "src/imports/**/*.+(ts|tsx)" },
            { pattern: "src/misc/no-module-tester.spec.ts" },
            { pattern: "src/misc/!(emptyfile)/**/*.ts" },
            { pattern: "src/node/**/*.ts" },
            { pattern: "src/typescript/**/*.ts" },
            { pattern: "src/x-performance/**/*.ts" }
        ],

        preprocessors: {
            "src/**/*.+(ts|tsx)": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            bundlerOptions: {
                addNodeGlobals: true,
                entrypoints: /\.spec\.(ts|tsx)$/,
                exclude: [
                    "indent-string",
                    "react/addons",
                    "react/lib/ExecutionEnvironment",
                    "react/lib/ReactContext"
                ],
                ignore: ["ws"],
                noParse: ["jquery"],
                resolve: {
                    alias: {
                        "@angular/upgrade/static$": "../bundles/upgrade-static.umd.js"
                    },
                    extensions: [".js", ".json", ".ts"],
                    directories: ["node_modules"]
                },
                transforms: [
                    // transform to make tests for Css Modules work, ReactCSSModulesTester, #66
                    function(context, callback) {
                        if(context.module === "./style-import-tester.css") {
                            context.source = "module.exports = { color: '#f1a' };";
                            return callback(true);
                        }
                        return callback(false);
                    },
                    require("karma-typescript/transforms/es6-transform")({presets: ["es2015"]})
                ],
                validateSyntax: false
            },
            compilerOptions: {
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                jsx: "react",
                noImplicitAny: true,
                module: "commonjs",
                moduleResolution: "node",
                sourceMap: true,
                target: "ES5",
                lib: ["DOM", "ES5", "ScriptHost"]
            },
            coverageOptions: {
                instrumentation: true,
                exclude: [/\.(d|spec|test)\.ts$/i]
            },
            exclude: ["broken"],
            include: ["**/*.ts", "**/*.tsx"],
            reports: {
                "cobertura": {
                    "directory": "coverage",
                    "filename": "coverage.xml",
                    "subdirectory": "cobertura"
                },
                "lcovonly": {
                    "directory": "coverage",
                    "filename": "lcovonly/lcov.info"
                },
                "html": "coverage",
                "text-summary": ""
            },
            transformPath: function(filepath) {
                return filepath.replace(/\.(ts|tsx)$/, ".js");
            },
            tsconfig: "./tsconfig.json"
        },

        reporters: ["progress", "karma-typescript"],

        browsers: ["Chrome"]
    });
};
