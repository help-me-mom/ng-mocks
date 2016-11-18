var gulp = require("gulp"),
    tsd = require("gulp-tsd"),
    karma = require("karma"),
    runSequence = require("run-sequence");

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
gulp.task("init:foo", tasks.typings.bar);
gulp.task("init:bar", tasks.typings.foo);
gulp.task("init", function (callback) {
    runSequence("init:foo", "init:bar", callback);
});

gulp.task("karma:foo", tasks.karma.foo);
gulp.task("karma:bar", tasks.karma.bar);
gulp.task("karma:full", function (callback) {
    runSequence("karma:foo", "karma:bar", callback);
});
