const gulp = require('gulp');
const ts = require('gulp-typescript');
const jasmine = require('gulp-jasmine');
const istanbul = require('gulp-istanbul');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const merge = require('merge2');
const tslint = require('gulp-tslint');

gulp.task('build', function() {
    const tsProject = ts.createProject('tsconfig.json');

    var tsResult = tsProject.src()
        .pipe(tsProject());

    return merge([
        tsResult.dts.pipe(gulp.dest('./definitions')),
        tsResult.js.pipe(gulp.dest(tsProject.config.compilerOptions.outDir))
    ]);
});

gulp.task('clean', function () {
    return gulp.src('dist', { read: false })
        .pipe(clean());
});

gulp.task('lint', function() {
  return gulp.src(['lib/**', 'spec/**'])
    .pipe(tslint({ formatter: 'stylish' }))
    .pipe(tslint.report());
});

gulp.task('pre-test', function () {
  return gulp.src(['dist/lib/**/*.ts'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('test:run', ['pre-test'], function() {
  return gulp.src('dist/lib/**/*.spec.js')
    .pipe(jasmine())
    .pipe(istanbul.writeReports({ reporters: ['lcov', 'html'] }))
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task('watch', ['default'], function() {
    gulp.watch('src/*.ts', ['default']);
});

gulp.task('test', [], function(cb) {
  runSequence('clean', 'build', 'test:run', cb);
});

gulp.task('default', [], function(cb) {
    runSequence('clean', 'build', cb);
});
