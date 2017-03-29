module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "src/frameworks/react/**/*.tsx" }
        ],

        preprocessors: {
            "src/frameworks/react/**/*.tsx": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            bundlerOptions: {
                entrypoints: /\.spec\.tsx$/,
            },
            compilerOptions: {
                jsx: "react",
                module: "commonjs",
                sourceMap: true,
                target: "ES5",
                lib: ["DOM", "ES2015"]
            },
            include: ["src/frameworks/react/**/*.tsx"],
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
