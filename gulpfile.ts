import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as clean from 'gulp-clean';
import * as runSequence from 'run-sequence';
import * as merge from 'merge2';
import tslintPlugin from 'gulp-tslint';
import * as tslint from 'tslint';

gulp.task('build', function() {
    const tsProject = ts.createProject('tsconfig.json');

    const tsResult = tsProject.src()
        .pipe(tsProject());

    return merge([
        tsResult.dts.pipe(gulp.dest('./definitions')),
        tsResult.js.pipe(gulp.dest(tsProject.config.compilerOptions.outDir))
    ]);
});

gulp.task('clean', function() {
    return gulp.src('dist', { read: false })
        .pipe(clean());
});

gulp.task('lint', function() {
  const program = tslint.Linter.createProgram('./tsconfig.json');
  return gulp.src(['lib/**', 'spec/**'])
    .pipe(tslintPlugin({ formatter: 'stylish', program }))
    .pipe(tslintPlugin.report());
});

gulp.task('default', [], function(cb) {
    runSequence('clean', 'build', cb);
});
