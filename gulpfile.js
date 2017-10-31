const { exec } = require('child_process');
const babel = require('gulp-babel');
const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const chalk = require('chalk');
const concat = require('gulp-concat');
const declare = require('gulp-declare');
const del = require('del');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const gutil = require('gulp-util');
const handlebars = require('gulp-handlebars');
const less = require('gulp-less');
const mergeStream = require('merge-stream');
const minifyCss = require('gulp-minify-css');
const notify = require('gulp-notify');
const path = require('path');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const wrap = require('gulp-wrap');

let dirtyReload = false;

gulp.task('clean', () => {
  // when server is up after first run
  if (dirtyReload) {
    return gulp.src('').pipe(gutil.noop());
  }

  return del(['dist/**']).then(paths => {
    console.log('Files and folders %s:\n', chalk.black.bgRed('cleaned'));
    console.log(paths.map(p => path.basename(p)).join('\t'));
  });
});

// Lint Task
gulp.task('lint', ['clean'], () => {
  const esl = gulp
    .src('src/es/*.js')
    .pipe(eslint())
    .pipe(eslint.format('stylish'))
    .pipe(
      eslint.format(
        'unix',
        notify({
          title: 'Linter',
          message: '<%= file %>'
        })
      )
    );
  return esl;
});

// LESS Compile
gulp.task('styles', ['clean'], () => {
  return gulp
    .src('src/less/main.less')
    .pipe(
      less({
        paths: [path.join(__dirname, 'less', 'includes')]
      }).on(
        'error',
        notify.onError({
          title: 'LESS compiler',
          message: '<%= error.message %>'
        })
      )
    )
    .pipe(rename('bundle.css'))
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(rename('bundle.min.css'))
    .pipe(
      minifyCss({
        compatibility: 'ie8'
      })
    )
    .pipe(gulp.dest('dist/assets/css'));
});

// Copy Server Scripts
gulp.task('serverjs', ['clean'], () => {
  return gulp
    .src('src/server/**/*')
    .pipe(
      babel({
        only: ['*.js'],
        presets: ['es2015']
      })
    )
    .pipe(gulp.dest('dist/server'));
});

// Concatenate & Minify JS
gulp.task('scripts', ['clean'], () => {
  // set up the browserify instance on a task basis
  const b = browserify({
    entries: 'src/es/main.js',
    debug: true
  });

  return b
    .transform(
      babelify.configure({
        presets: ['es2015']
      })
    )
    .bundle()
    .on(
      'error',
      notify.onError({
        title: 'Babel compiler',
        message: '<%= error.message %>'
      })
    )
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(rename('bundle.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('dist/assets/js'));
});

// Copy res
gulp.task('images', ['clean'], () => {
  return gulp.src('src/res/img/**').pipe(gulp.dest('dist/assets/img'));
});

// Copy html
gulp.task('html', ['clean'], () => {
  return gulp.src('src/html/**/*.html').pipe(gulp.dest('dist'));
});

// Lib
gulp.task('lib', ['clean'], () => {
  const libs = {
    js: [
      'jquery/dist/jquery.js',
      'uikit/dist/js/uikit.js',
      'uikit/dist/js/uikit-icons.js'
    ],
    css: ['uikit/dist/css/uikit.css', 'font-awesome/css/font-awesome.css'],
    fonts: ['../src/fonts/*.ttf', 'font-awesome/fonts/**']
  };

  const jsStream = gulp
    .src(libs.js.map(l => 'node_modules/' + l))
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(rename('vendor.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('dist/assets/js'));

  const cssStream = gulp
    .src(libs.css.map(l => 'node_modules/' + l))
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(rename('vendor.min.css'))
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      })
    )
    .pipe(
      minifyCss({
        compatibility: 'ie8'
      })
    )
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      })
    )
    .pipe(gulp.dest('dist/assets/css'));

  const fontsStream = gulp
    .src(libs.fonts.map(l => 'node_modules/' + l))
    .pipe(gulp.dest('dist/assets/fonts'));

  return mergeStream(jsStream, cssStream, fontsStream);
});

// Watch Files For Changes
gulp.task('watch', ['run'], () => {
  gulp.watch('src/es/**/*.js', ['lint', 'scripts']);
  gulp.watch('src/server/**/*.js', ['serverjs']);
  gulp.watch('src/res/img/**', ['images']);
  gulp.watch('src/html/**/*.html', ['html']);
  gulp.watch('src/less/**/*.less', ['styles']);
});

gulp.task('build', [
  'serverjs',
  'lint',
  'scripts',
  'html',
  'lib',
  'images',
  'styles'
]);

gulp.task('run', ['build'], () => {
  dirtyReload = true;
  console.log(chalk.black.bgGreen('Build finished!'));
  return exec('node dist/server/app.js');
});

// Default Task
gulp.task('default', ['clean', 'build', 'run', 'watch']);
