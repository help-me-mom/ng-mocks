var copy = require("copy"),
    clear = require("cli-clear"),
    del = require("del"),
    gulp = require("gulp"),
    gutil = require("gulp-util");

gulp.task("clear", function(cb) {
    clear();
    cb();
});

gulp.task("copy", function(cb) {
    copy("../index.js", "./node_modules/karma-typescript/index.js", function() {
        copy("../lib/*.js", "./node_modules/karma-typescript/lib/", cb);
    });
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

gulp.task("dev", ["clear", "clean", "copy"]);
gulp.task("dev:ci", ["clean", "copy"]);
