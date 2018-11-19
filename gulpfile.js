"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var imageminJpegRecompress = require("imagemin-jpeg-recompress");
var pngquant = require("imagemin-pngquant");
var cheerio = require("gulp-cheerio");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var rename = require("gulp-rename");
var del = require("del");
var server = require("browser-sync").create();
var run = require("run-sequence");

gulp.task("style", function() {
  gulp.src("src/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 2 versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("images",function(){
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      pngquant({quality: '65-70', speed: 5}),
      imageminJpegRecompress({
        loops: 5,
        min: 70,
        max: 80,
        quality:'medium'
      })
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function() {
  return gulp.src("build/img/icons/*.svg")
    .pipe(svgmin())
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("copy",function(){
  return gulp.src([
    "src/fonts/**/*.{woff,woff2}",
    "src/img/**",
    "src/js/**",
    "src/*.html"
  ],{
    base: "src"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("html:copy",function(){
  return gulp.src("src/*.html")
    .pipe(gulp.dest("build"));
});

gulp.task("html:update", ["html:copy"], function(done) {
  server.reload();
  done();
});

gulp.task("serve", function() {
  server.init({
    server: "build"
  });

  gulp.watch("src/sass/**/*.{scss,sass}", ["style"]);
	gulp.watch("src/*.html", ["html:update"]);
});

gulp.task("build", function(fn) {
  run(
    "clean",
    "copy",
    "style",
    // "images",
    // "sprite",
    fn
  );
});

// gulp.task('svgstore', function () {
//   gulp.src('src/img/*.svg')
//     .pipe(svgmin())
//   .pipe(svgstore({ inlineSvg: true }))
//   .pipe(rename('sprites.svg'))
//   .pipe(gulp.dest('buildt/img'));
// });

// gulp.task('svgmin', function () {
//   gulp.src('src/img/*.svg')
//     .pipe(svgmin())
//     .pipe(gulp.dest('build/img'));
// });
