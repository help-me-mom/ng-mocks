module.exports = {
    "root": true,
    "ignorePatterns": ["**/dist/**"],
    "parser": "@typescript-eslint/parser",
    "plugins": [
        "@typescript-eslint"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "env": {
        "browser": true,
        "node": true
    },
    "rules": {
        "@typescript-eslint/no-explicit-any": "off"
    }
};
