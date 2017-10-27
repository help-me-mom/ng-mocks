var spawn = require("cross-spawn");
var os = require("os");

var browser = os.platform === "win32" ? "" : ":phantomjs";

// The pyramid of doom :( If you have a better idea, (which doesn't
// involve wait.for / node-gyp / fibers) please create a pull request,
// but bear in mind that this has to run on windows machines as well...
execute("examples/angular2", "npm run dev:ci" + browser, function() {
    execute("examples/angular2", "npm run dev:ci" + browser, function() {
        execute("examples/angularjs", "npm run dev:ci" + browser, function() {
            execute("examples/mocha", "npm run dev:ci" + browser, function() {
                execute("examples/typescript-1.6.2", "npm run dev:ci" + browser, function() {
                    execute("examples/typescript-latest", "npm run dev:ci" + browser, function() {
                    
                        execute("tests/integration-1.8.10", "npm run dev:ci" + browser, function() {
                            execute("tests/integration-1.8.10", "npm run dev:ci" + browser + ":angular2", function() {
                                execute("tests/integration-1.8.10", "npm run dev:ci" + browser + ":react", function() {
                                
                                    execute("tests/integration-latest", "npm run dev:ci" + browser + "", function() {
                                        execute("tests/integration-latest", "npm run dev:ci" + browser + ":angular2", function() {
                                            execute("tests/integration-latest", "npm run dev:ci" + browser + ":core", function() {
                                                execute("tests/integration-latest", "npm run dev:ci" + browser + ":emptyfile", function() {
                                                    execute("tests/integration-latest", "npm run dev:ci" + browser + ":no-module", function() {
                                                        execute("tests/integration-latest", "npm run dev:ci" + browser + ":react", function() {
                                                            //
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

function execute(dir, cmd, callback) {
    
    var x = cmd.split(" ");
    var runner = spawn(x[0], x.splice(1), { cwd: dir, stdio: "inherit" });
        
    runner.on("close", function(code) {
        callback(code);
    });
}