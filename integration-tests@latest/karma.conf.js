module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/bundling/**/*.ts" },
            { pattern: "src/compiler-paths/*.ts" },
            { pattern: "src/core-modules/*.ts" },
            { pattern: "src/exports/*.ts" },
            { pattern: "src/formatting/*.ts" },
            { pattern: "src/frameworks/**/*.ts" },
            { pattern: "src/imports/**/*.ts" },
            { pattern: "src/interface-mocking/*.ts" },
            { pattern: "src/module/*.ts" },
            { pattern: "src/no-module/*.ts" },
            { pattern: "src/node-globals/*.ts" },
            { pattern: "src/socket.io/*.ts" },
            { pattern: "src/typescript-language-features/*.ts" },
            { pattern: "src/x-performance/**/*.ts" }
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
                moduleResolution: "node",
                sourceMap: true,
                target: "ES5",
            },
            include: ["**/*.ts", "**/*.tsx"],
            exclude: ["broken"],
            bundlerOptions: {
                ignoredModuleNames: ["ws"]
            },
            disableCodeCoverageInstrumentation: false,
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

        browsers: ["Chrome", "PhantomJS"]
    });
};
