module.exports = {
    "framework:karma-typescript": ["factory", require("./lib/framework").framework],
    "preprocessor:karma-typescript": ["factory", require("./lib/framework").preprocessor],
    "preprocessor:karma-typescript-wideload-preprocessor": ["factory", require("./lib/framework").wideLoadPreprocessor],
    "reporter:karma-typescript": ["type", require("./lib/reporter")]
};
