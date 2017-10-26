var spawn = require("child_process").spawn;

// The pyramid of doom :( If you have a better idea, (which doesn't
// involve wait.for / node-gyp / fibers) please create a pull request,
// but bear in mind that this has to run on windows machines as well...
execute("examples/angular2", "npm run dev:ci:phantomjs", function() {
    execute("examples/angular2", "npm run dev:ci:phantomjs", function() {
        execute("examples/angularjs", "npm run dev:ci:phantomjs", function() {
            execute("examples/mocha", "npm run dev:ci:phantomjs", function() {
                execute("examples/typescript-1.6.2", "npm run dev:ci:phantomjs", function() {
                    execute("examples/typescript-latest", "npm run dev:ci:phantomjs", function() {
                    
                        execute("tests/integration-1.8.10", "npm run dev:ci:phantomjs", function() {
                            execute("tests/integration-1.8.10", "npm run dev:ci:phantomjs:angular2", function() {
                                execute("tests/integration-1.8.10", "npm run dev:ci:phantomjs:react", function() {
                                
                                    execute("tests/integration-latest", "npm run dev:ci:phantomjs", function() {
                                        execute("tests/integration-latest", "npm run dev:ci:phantomjs:angular2", function() {
                                            execute("tests/integration-latest", "npm run dev:ci:phantomjs:core", function() {
                                                execute("tests/integration-latest", "npm run dev:ci:phantomjs:emptyfile", function() {
                                                    execute("tests/integration-latest", "npm run dev:ci:phantomjs:no-module", function() {
                                                        execute("tests/integration-latest", "npm run dev:ci:phantomjs:react", function() {
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