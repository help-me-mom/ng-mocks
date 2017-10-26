var spawn = require("child_process").spawn;
var wait = require("wait.for");

wait.launchFiber(run);

function run() {
    wait.for(execute, "examples/angular2",          "npm run dev:ci:phantomjs");
    wait.for(execute, "examples/angularjs",         "npm run dev:ci:phantomjs");
    wait.for(execute, "examples/mocha",             "npm run dev:ci:phantomjs");
    wait.for(execute, "examples/typescript-1.6.2",  "npm run dev:ci:phantomjs");
    wait.for(execute, "examples/typescript-latest", "npm run dev:ci:phantomjs");

    wait.for(execute, "tests/integration-1.8.10",   "npm run dev:ci:phantomjs");
    wait.for(execute, "tests/integration-1.8.10",   "npm run dev:ci:phantomjs:angular2");
    wait.for(execute, "tests/integration-1.8.10",   "npm run dev:ci:phantomjs:react");

    wait.for(execute, "tests/integration-latest",   "npm run dev:ci:phantomjs");
    wait.for(execute, "tests/integration-latest",   "npm run dev:ci:phantomjs:angular2");
    wait.for(execute, "tests/integration-latest",   "npm run dev:ci:phantomjs:core");
    wait.for(execute, "tests/integration-latest",   "npm run dev:ci:phantomjs:emptyfile");
    wait.for(execute, "tests/integration-latest",   "npm run dev:ci:phantomjs:no-module");
    wait.for(execute, "tests/integration-latest",   "npm run dev:ci:phantomjs:react");
}

function execute(dir, cmd, callback) {
    
    var x = cmd.split(" ");
    var runner = spawn(x[0], x.splice(1), { cwd: dir, stdio: "inherit" });
        
    runner.on("close", function(code) {
        callback(code);
    });
}