'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin'),
    gulpPath = require('path'),
    reload = browserSync.reload;

// define source & build paths
var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/',
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/main.js',
        style: 'src/style/main.scss',
        img: 'src/img/*.*',
        fonts: 'src/fonts/**/*.*',
        svg: 'src/img/svg_sprite/*.*',
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

// browsersync config
var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 8080
};

// browsersync task
gulp.task('webserver', function () {
    browserSync(config);
});

// clean task
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

// html build task
gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

// js build task
gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

// sass build task
gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(sass({
            includePaths: ['src/style/'],
            outputStyle: 'compressed',
            sourceMap: true,
            errLogToConsole: true
        }))
        .pipe(prefixer({
          browsers: ['last 15 versions'],
          cascade: false
        }))
        .pipe(cssmin())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

// image minfy task
gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

// fonts task
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

// svg sprites task
gulp.task('svgstore', function () {
    return gulp
        .src('src/img/svg_sprite/*.svg')
        .pipe(svgmin(function (file) {
            var prefix = gulpPath.basename(file.relative,  gulpPath.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore())
        .pipe(gulp.dest('src/img'));
});


// default task
gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build',
]);

// watch task
gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
            gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        setTimeout(function(){
            gulp.start('style:build');
        }, 300);
    });
    watch([path.watch.js], function(event, cb) {
        setTimeout(function(){
            gulp.start('js:build');
        }, 300);
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('default', ['build', 'webserver', 'watch']);
