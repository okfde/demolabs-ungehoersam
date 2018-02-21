'use strict';

const gulp = require('gulp');
const runSequence = require('run-sequence');
const del = require('del');
const vinylPaths = require('vinyl-paths');
const jspm = require('jspm');
const paths = require('../paths');
const bundles = require('../bundles.js');
const resources = require('../export.js');
var manifest = require('gulp-manifest');
var rename = require('gulp-rename');

function getBundles() {
  let bl = [];
  for (let b in bundles.bundles) {
    bl.push(b + '*.js');
  }
  return bl;
}

function getExportList() {
  return resources.list.concat(getBundles());
}

function normalizeExportPaths() {
  const pathsToNormalize = resources.normalize;

  let promises =  pathsToNormalize.map(pathSet => {
    const packageName = pathSet[ 0 ];
    const fileList = pathSet[ 1 ];

    return jspm.normalize(packageName).then((normalized) => {
      const packagePath = normalized.substring(normalized.indexOf('jspm_packages'), normalized.lastIndexOf('.js'));
      return fileList.map(file => packagePath + file);
    });
  });

  return Promise.all(promises)
    .then((normalizedPaths) => {
      return normalizedPaths.reduce((prev, curr) => prev.concat(curr), []);
    });
}

// deletes all files in the output path
gulp.task('clean-export', function() {
  return gulp.src([ paths.exportSrv ])
    .pipe(vinylPaths(del));
});

gulp.task('export-copy', function() {
  return gulp.src(getExportList(), { base: '.' })
    .pipe(gulp.dest(paths.exportSrv));
});

gulp.task('export-normalized-resources', function(done) {
  normalizeExportPaths().then(normalizedPaths => {
    gulp.src(normalizedPaths, { base: '.' })
        .pipe(gulp.dest(paths.exportSrv))
        .on('end', done);
  });
});

gulp.task('manifest', function() {
    gulp.src(['export/**/*'], { base: './export/' })
        .pipe(rename(function(path) {
            if (path.basename === 'fontawesome-webfont') {
              path.extname += '?v=4.6.3';
            }
          }))
        .pipe(manifest({
            hash: true,
            preferOnline: true,
            network: ['*'],
            filename: 'cache.manifest',
            exclude: 'cache.manifest',
            postfix: 'test'
          }))
        .pipe(gulp.dest('export'));
});

// use after prepare-release
gulp.task('export', function(callback) {
  return runSequence(
    'bundle',
    'clean-export',
    'export-normalized-resources',
    'export-copy',
    'manifest',
    callback
  );
});
