var gulp = require('gulp');
concatCss = require("gulp-concat-css"),
minifyCss = require('gulp-minify-css'),
rename = require('gulp-rename'),
sass = require('gulp-sass'),
uncss = require("gulp-uncss"),
globbing = require('gulp-css-globbing'),
bulkSass = require('gulp-sass-bulk-import'),
browserSync = require("browser-sync"),
imagemin = require('gulp-imagemin'),
pngquant = require('imagemin-pngquant'),
watch = require('gulp-watch'),
autoprefixer = require('gulp-autoprefixer'),
connect = require('gulp-connect'),
notify = require('gulp-notify'),
mainBowerFiles = require('main-bower-files'),
reload = browserSync.reload;

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: '',
        js: 'js/',
        css: 'css/',
        img: 'img/',
        fonts: 'fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/common.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'src/style/main.scss',
        img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    }
};
    var config = {
    	server: {
    		baseDir: "."
    	},
    	tunnel: false,
    	host: 'localhost',
    	port: 9000,
    	logPrefix: "Maniac"
    };

//css
gulp.task('styles', function () {
	gulp.src(path.src.style)
	.pipe(bulkSass())
	.pipe(sass({
        includePaths: require('node-bourbon').includePaths
    }).on('error', sass.logError))
	.pipe(rename({suffix: '.min'}))
	.pipe(autoprefixer({
		browsers: ['last 15 versions'],
		cascade: false
	}))
	.pipe(minifyCss())
	.pipe(gulp.dest(path.build.css))
	.pipe(reload({stream: true}));
	
});


gulp.task('webserver', function () {
    browserSync(config);
});
//html
gulp.task('html', function(){
	gulp.src(path.src.html)
	.pipe(gulp.dest(path.build.html))
	.pipe(reload({stream: true}));
	
});
gulp.task('js', function(){
    gulp.src(path.src.js)
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({stream: true}));
});

// uncss
gulp.task('uncss', function(){
	return gulp.src('app/css/style.min.css')
	.pipe(uncss({
		html:['app/index.html']
	}))
	.pipe(gulp.dest('app/css'));
});

gulp.task('image', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});
gulp.task('fonts', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});
gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('styles');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js');
    })
    watch([path.watch.img], function(event, cb) {
        gulp.start('image');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts');
    });
});
//main bower js files
gulp.task('mainJS', function() {
    return gulp.src(mainBowerFiles('**/*.js',{
        "overrides":{
            "jquery" : {
                "main": [
                    "dist/jquery.min.js"
                ]
            }
        }
    }))
        .pipe(gulp.dest(path.build.libs))
});
// main bower css files
gulp.task('mainCSS', function() {
    return gulp.src(mainBowerFiles('**/*.css'))
        .pipe(gulp.dest(path.build.css))
});

//default
	gulp.task('default', ['html', 'styles', 'js', 'watch', 'image','webserver']);