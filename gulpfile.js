const gulp = require('gulp');
const browsersync = require("browser-sync").create();
const sass = require('gulp-sass');
const minifyCSS = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');
const newer = require("gulp-newer");
const minifyJS = require('gulp-uglify');
const concat = require('gulp-concat');
const plumber = require("gulp-plumber");
const autoprefixer = require('gulp-autoprefixer');
const del = require("del");

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "dist"
    },
    port: 3000
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean assets
function clean() {
  return del(['dist/css', 'dist/js', 'dist/img', 'dist/**/*.html']);
}

// Optimize Images
function images() {
  return gulp
    .src("src/img/**/*")
    .pipe(newer("dist/img"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest("dist/img"));
}

// CSS task
function css() {
  return gulp
    .src("src/scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({ outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(minifyCSS())
		.pipe(autoprefixer())
		.pipe(concat('main.min.css'))
    .pipe(gulp.dest("dist/css"))
    .pipe(browsersync.stream());
}

// Transpile, concatenate and minify scripts
function scripts() {
  return (
    gulp
      .src(["src/js/**/*.js"])
      .pipe(plumber())
			.pipe(concat('main.min.js'))
			.pipe(minifyJS())
      .pipe(gulp.dest("dist/js"))
      .pipe(browsersync.stream())
  );
}

// Copy HTML Files
function html() {
	return (
		gulp
		.src('src/**/*.html')
		.pipe(gulp.dest('dist'))
		.pipe(browsersync.stream())
	);
};

// Copy Font Files
function fonts() {
	return (
		gulp
		.src('src/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'))
		.pipe(browsersync.stream())
	);
};

// Watch files
function watchFiles() {
  gulp.watch("src/scss/**/*.scss", css);
	gulp.watch("src/js/**/*.js", scripts);
	gulp.watch("src/**/*.html", gulp.series(html, browserSyncReload));
  gulp.watch("src/img/**/*", images);
}

// define complex tasks
const js = scripts;
const build = gulp.series(clean, gulp.parallel(css, html, fonts, images, js));
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.images = images;
exports.css = css;
exports.html = html;
exports.fonts = fonts;
exports.js = js;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;