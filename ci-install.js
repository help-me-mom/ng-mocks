const fse = require("fs-extra");

const packages = [
    "karma-typescript",
    "karma-typescript-angular2-transform",
    "karma-typescript-cssmodules-transform",
    "karma-typescript-es6-transform",
    "karma-typescript-postcss-transform"
];

const projects = [
    "examples/angular2",
    "examples/typescript-1.6.2",
    "examples/typescript-1.8.10",
    "examples/typescript-latest",
    "tests/integration-latest"
];

for (const package of packages) {
    for (const project of projects) {
        console.log(`Copying ${package} to ${project}`);
        fse.emptyDirSync(`${project}/node_modules/${package}`);
        fse.copySync(`packages/${package}/dist/`, `${project}/node_modules/${package}/dist/`);
        fse.copyFileSync(`packages/${package}/package.json`, `${project}/node_modules/${package}/package.json`);
    }
}

fse.copySync("tests/integration-latest/karma-typescript-test-module/", "tests/integration-latest/node_modules/karma-typescript-test-module/");
fse.copySync("tests/integration-latest/karma-typescript-test-module-commonjs-a/", "tests/integration-latest/node_modules/karma-typescript-test-module-commonjs-a/");
fse.copySync("tests/integration-latest/karma-typescript-test-module-commonjs-b/", "tests/integration-latest/node_modules/karma-typescript-test-module-commonjs-b/");
