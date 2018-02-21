var gulp = require('gulp');
var bump = require('gulp-bump');

gulp.task('bump', function(){
    gulp.src('./src/build-version-display.js')
        .pipe(bump())
        .pipe(gulp.dest('./src'));
});