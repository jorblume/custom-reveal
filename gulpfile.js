var gulp = require('gulp');
var autoprefixer = require('autoprefixer');
var browserify = require('browserify');
var jshint = require('gulp-jshint');
var postcss = require('gulp-postcss');
var reporter = require('postcss-reporter');
var sassParser = require('postcss-scss');
var sass = require('gulp-sass');
var sorting = require('postcss-sorting');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var stylefmt = require('stylefmt');
var stylelint = require('stylelint');

var SRC_PATH = __dirname + '/src';
var DIST_PATH = __dirname + '/dist';

gulp.task('sass:fixups', function() {
    var processors = [
        sorting({ "sort-order": "default"}),
        stylefmt
    ];
    return gulp.src(SRC_PATH + '/css/**.scss', {base: './'})
        .pipe(postcss(processors, {syntax: sassParser}))
        .pipe(gulp.dest('./'));
});

gulp.task('sass:lint', ['sass:fixups'], function() {
    var processors = [
        stylelint,
        reporter({ clearMessages: true })
    ];
    return gulp.src(SRC_PATH + '/css/reel.scss', {base: './'})
        .pipe(postcss(processors, {syntax: sassParser}))
        .pipe(gulp.dest('./'));
});

gulp.task('sass:parse', ['sass:lint'], function() {
    var processors = [
        autoprefixer({ 
            browsers: ['last 3 versions', '>1%', 'ie >= 8'],
            cascade: false
        })
    ];
    return gulp.src(SRC_PATH + '/css/**.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(DIST_PATH + '/css'));
});

gulp.task('js:lint', function() {
    return gulp.src(SRC_PATH + '/js/custom-reveal.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('browserify', function() {
    return browserify(SRC_PATH + '/js/custom-reveal.js', {paths: [__dirname]})
        .bundle()
        .pipe(source('custom-reveal.js'))
        .pipe(gulp.dest(DIST_PATH + '/js'));
});

function watchReelAndShared(path, commands) {
    gulp.watch(SRC_PATH + path, commands);
}

gulp.task('watch', ['default'], function () {
    watchReelAndShared('/**/*.scss', ['sass:parse']);
    watchReelAndShared('/**/*.js', ['js:lint']);
    watchReelAndShared('/**/*.js', ['browserify']);
});

gulp.task('default', ['browserify', 'sass:parse', 'js:lint']);