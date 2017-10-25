var copy = require("copy"),
    clear = require("cli-clear"),
    del = require("del"),
    exec = require("child_process").exec,
    gulp = require("gulp"),
    gutil = require("gulp-util"),
    runSequence = require("run-sequence");

gulp.task("clear", function(cb) {
    clear();
    cb();
});

gulp.task("clean", function(cb) {
    del("./coverage")
    .then(function(files) {
        if(files.length > 0) {
            gutil.log("Deleted %s", files);
        }
        cb();
    });
});

gulp.task("build", function (cb) {
    exec("../../node_modules/.bin/tsc --project ../../tsconfig.json --rootDir ../../src", function (error, stdout, stderr) {
        process.stdout.write(stdout);
        process.stderr.write(stderr);
        cb(error);
    });
});

gulp.task("copy", function(cb) {
    copy("../../*.js", "./node_modules/karma-typescript/", function() {
        copy("../../dist/**/*.js", "./node_modules/karma-typescript/dist/", function() {
            copy("../../lib/*.js", "./node_modules/karma-typescript/lib/", function() {
                copy("../../src/client/*.js", "./node_modules/karma-typescript/src/client/", function() {
                    copy("../../transforms/*.js", "./node_modules/karma-typescript/transforms/", cb);
                });
            });
        });
    });
});

gulp.task("dev", ["clear", "clean"], function(cb) {
    runSequence("build", "copy", cb);
});

gulp.task("dev:ci", ["clean", "copy"]);
