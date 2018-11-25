const fse = require("fs-extra");

for (const project of ["examples/angular2"]) {
    console.log(`Copying packages/karma-typescript to ${project}`);
    fse.emptyDirSync(`${project}/node_modules/karma-typescript/`);
    fse.copySync("packages/karma-typescript/dist/", `${project}/node_modules/karma-typescript/dist/`);
    fse.copyFileSync("packages/karma-typescript/package.json", `${project}/node_modules/karma-typescript/package.json`);
}

for (const project of ["examples/angular2"]) {
    console.log(`Copying packages/karma-typescript-angular2-transform to ${project}`);
    fse.emptyDirSync(`${project}/node_modules/karma-typescript-angular2-transform/`);
    fse.copySync("packages/karma-typescript-angular2-transform/dist/", `${project}/node_modules/karma-typescript-angular2-transform/dist/`);
    fse.copyFileSync("packages/karma-typescript-angular2-transform/package.json", `${project}/node_modules/karma-typescript-angular2-transform/package.json`);
}
