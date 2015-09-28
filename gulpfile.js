var gulp        = require('gulp');
var gutil       = require('gulp-util');
var rename      = require('gulp-rename');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var plumber     = require('gulp-plumber');
var sourcemaps  = require('gulp-sourcemaps');
var cache       = require('gulp-cached');
var watch       = require('gulp-watch');
var cssmin      = require('gulp-cssmin');
var htmlmin     = require('gulp-htmlmin');
var imagemin    = require('gulp-imagemin');
var pngquant    = require('imagemin-pngquant');
var sass        = require('gulp-sass');
var BowerFiles  = require('main-bower-files');

var livereload  = require('gulp-livereload');

var postCSS     = require('gulp-postcss');
var cssnext     = require('cssnext');
var rucksack    = require('rucksack-css');


var sassFile = './builds/development/assets/sass/main.scss';
var sassForWatch = ['./builds/development/assets/sass/*/*.scss'];
var jsSource = [
   './bower_components/jquery/dist/jquery.js',
   './bower_components/prefixfree/prefixfree.min.js',
   './bower_components/pointer_events_polyfill/pointer_events_polyfill.js',
   './bower_components/visibilityjs/lib/visibility.js',
   './builds/development/assets/js/*.*'
];
var htmlSource = './builds/development/*.html';
var imgSource = './builds/development/assets/images/*.*';
var fontSource = './builds/development/assets/fonts/*/*.*';
var server = livereload();


gulp.task('postCSS', function(){
   var processor = [
      cssnext,
      rucksack({
         autoprefixer: false
      })
   ];
   gulp.src(sassFile)
       .pipe(plumber())
       .pipe(watch(sassFile))
       .pipe(sourcemaps.init())
       .pipe(sass(
            {outputStyle: 'expanded'}
          ))
       .pipe(postCSS(processor))
       .pipe(rename('main.css'))
       .pipe(sourcemaps.write())
       .pipe(gulp.dest('./builds/debug/assets/css/'))
       .pipe(cssmin())
       .pipe(rename({
          suffix: '.min'
       }))
       .pipe(gulp.dest('./builds/production/assets/css/'))
       .pipe(livereload());
});


gulp.task('javascript', function(){
   gulp.src(jsSource)
       .pipe(plumber())
       .pipe(sourcemaps.init())
       .pipe(concat('all.js'))
       .pipe(sourcemaps.write())
       .pipe(gulp.dest('./builds/debug/assets/js/'))
       .pipe(uglify())
       .pipe(rename({
          suffix: '.min'
       }))
       .pipe(gulp.dest('./builds/production/assets/js/'))
       .pipe(livereload());
});

gulp.task('html', function(){
   gulp.src(htmlSource)
       .pipe(plumber())
       .pipe(htmlmin({
          removeComments: true,
          removeCommentsFromCDATA: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeScriptTypeAttributes: true,
          collapseWhitespace: true
       }))
       .pipe(gulp.dest('./builds/production/'))
       .pipe(livereload());
});

gulp.task('image', function () {
    gulp.src(imgSource)
        .pipe(plumber())
        .pipe(watch(imgSource))
        .pipe(cache())
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./builds/production/assets/images'))
        .pipe(livereload());
});

gulp.task('fonts', function () {
    gulp.src(fontSource)
        .pipe(plumber())
        .pipe(watch(fontSource))
        .pipe(cache())
        .pipe(gulp.dest('./builds/production/assets/fonts'))
        .pipe(livereload());
});


gulp.task('watch', function(){
   livereload.listen();
   gulp.watch(sassFile, ['postCSS']);
   gulp.watch(sassForWatch, ['postCSS']);
   gulp.watch(jsSource, ['javascript']);
   gulp.watch('./gulpfile.js', ['javascript']);
   gulp.watch(htmlSource, ['html']);
   gulp.watch(imgSource, ['image']);
   gulp.watch(fontSource, ['fonts']);
});

gulp.task('default', [
   'postCSS',
   'javascript',
   'html',
   'image',
   'fonts',
   'watch'
]);
