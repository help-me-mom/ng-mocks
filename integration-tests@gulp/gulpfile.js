var copy = require("copy"),
    clear = require("cli-clear"),
    gulp = require("gulp"),
    karma = require("karma"),
    runSequence = require("run-sequence"),
    tsd = require("gulp-tsd"),
    tasks = {
        typings: {
            foo: function (callback) {
                return tsd({
                    command: "reinstall",
                    config: "typings_foo.json",
                    latest: false
                }, callback);
            },
            bar: function (callback) {
                return tsd({
                    command: "reinstall",
                    config: "typings_bar.json",
                    latest: false
                }, callback);
            }
        },
        karma: {
            foo: function (cb) {
                new karma.Server({
                    configFile: __dirname + "/karma.foo.conf.js"
                }, cb).start();
            },
            bar: function (cb) {
                new karma.Server({
                    configFile: __dirname + "/karma.bar.conf.js"
                }, cb).start();
            }
        }
    };

gulp.task("clear", function(cb) {
    clear();
    cb();
});

gulp.task("copy", function(cb) {
    copy("../index.js", "./node_modules/karma-typescript", function() {
        copy("../lib/*.js", "./node_modules/karma-typescript/lib/", cb);
    });
});

gulp.task("init:foo", tasks.typings.bar);
gulp.task("init:bar", tasks.typings.foo);
gulp.task("init", function (callback) {
    runSequence("init:foo", "init:bar", callback);
});

gulp.task("karma:foo", ["copy"], tasks.karma.foo);
gulp.task("karma:bar", ["copy"], tasks.karma.bar);
gulp.task("karma:full", ["clear", "copy"], function (callback) {
    runSequence("karma:foo", "karma:bar", callback);
});
