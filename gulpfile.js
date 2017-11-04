var copy = require("copy"),
    clear = require("cli-clear"),
    del = require("del"),
    gulp = require("gulp"),
    runSequence = require("run-sequence"),
    sourcemaps = require("gulp-sourcemaps"),
    ts = require("gulp-typescript"),
    tsProject = ts.createProject("../../tsconfig.json");

gulp.task("clear", function(cb) {
    clear();
    cb();
});

gulp.task("clean", function() {
    return del("./coverage");
});

gulp.task("build", function() {
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(tsProject.options.outDir));
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
