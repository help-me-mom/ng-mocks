var spawn = require("cross-spawn");

var command = "npm run dev:ci";

// The pyramid of doom :( If you have a better idea, (which doesn't
// involve wait.for / node-gyp / fibers) please create a pull request,
// but bear in mind that this has to run on windows machines as well...
execute("examples/angular2", command, function() {
    execute("examples/angularjs", command, function() {
        execute("examples/mocha", command, function() {
            execute("examples/typescript-1.6.2", command, function() {
                execute("examples/typescript-latest", command, function() {
                    
                    execute("tests/integration-1.8.10", command, function() {
                        execute("tests/integration-1.8.10", command + ":angular2", function() {
                            execute("tests/integration-1.8.10", command + ":react", function() {
                                
                                execute("tests/integration-latest", command, function() {
                                    execute("tests/integration-latest", command + ":angular2", function() {
                                        execute("tests/integration-latest", command + ":core", function() {
                                            execute("tests/integration-latest", command + ":emptyfile", function() {
                                                execute("tests/integration-latest", command + ":no-module", function() {
                                                    execute("tests/integration-latest", command + ":react", function() {
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

function execute(dir, cmd, callback) {
    
    var x = cmd.split(" ");
    var runner = spawn(x[0], x.splice(1), { cwd: dir, stdio: "inherit" });
        
    runner.on("close", function(code) {
        callback(code);
    });
}