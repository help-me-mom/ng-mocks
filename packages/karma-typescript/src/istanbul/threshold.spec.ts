import * as istanbulCoverage from "istanbul-lib-coverage";
import * as test from "tape";

import { Configuration } from "../shared/configuration";
import { Threshold } from "./threshold";

const karmaConfig: any = { karmaTypescriptConfig: { coverageOptions: { threshold: { file: {} } } } };

const configuration = new Configuration({});
configuration.initialize(karmaConfig);

const fileCoverage = {
    "path/to/coverage": istanbulCoverage.createFileCoverage("path/to/coverage")
};
const coverageMap = istanbulCoverage.createCoverageMap(fileCoverage);

test("threshold should pass", (t) => {

    t.plan(1);

    const threshold = new Threshold(configuration, null);

    const passed = threshold.check(null, coverageMap);

    t.true(passed);
});
