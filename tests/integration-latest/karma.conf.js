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
                constants: {
                    __STRING__: JSON.stringify("abc" + 123),
                    __BOOLEAN__: true,
                    "process.env": {
                        "VARIABLE": "value"
                    }
                },
                entrypoints: /\.spec\.(ts|tsx)$/,
                exclude: [
                    "indent-string",
                    "react/addons",
                    "react/lib/ExecutionEnvironment",
                    "react/lib/ReactContext"
                ],
                ignore: ["ws"],
                noParse: ["clear"],
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
                            return callback(undefined, true);
                        }
                        return callback(undefined, false);
                    },
                    require("karma-typescript-es6-transform")({presets: ["es2015"]})
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
                exclude: [/\.(d|spec|test)\.ts$/i],
                threshold: {
                    global: {
                        statements: 100,
                        branches: 100,
                        functions: 100,
                        lines: 100,
                        excludes: [
                            "src/bundling/exclude/exclude-tester.ts"
                        ]
                    },
                    file: {
                        statements: 100,
                        branches: 100,
                        functions: 100,
                        lines: 100,
                        overrides: {
                            "src/bundling/exclude/exclude-tester.ts": {
                                lines: 85,
                                statements: 85
                            }
                        }
                    }
                },
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

        browserNoActivityTimeout : 60000,

        browsers: ["Chrome"]
    });
};
