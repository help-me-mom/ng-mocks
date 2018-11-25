const fse = require("fs-extra");

const packages = [
    "packages/karma-typescript",
    "packages/karma-typescript-angular2-transform",
    "packages/karma-typescript-cssmodules-transform",
    "packages/karma-typescript-es6-transform",
    "packages/karma-typescript-postcss-transform"
];

const projects = [
    "examples/angular2",
    "tests/integration-latest"
];

for (const package of packages) {
    for (const project of projects) {
        console.log(`Copying ${package} to ${project}`);
        fse.emptyDirSync(`${project}/node_modules/${package}`);
        fse.copySync(`${package}/dist/`, `${project}/node_modules/${package}/dist/`);
        fse.copyFileSync(`${package}/package.json`, `${project}/node_modules/${package}/package.json`);
    }
}
