"use strict";

let gulp = require("gulp"),
	autoprefixer = require("gulp-autoprefixer"),
	sass = require("gulp-sass"),
	uglify = require("gulp-uglify"),
	concat = require("gulp-concat"),
	cleanCSS = require("gulp-clean-css"),
	rename = require("gulp-rename"),
	del = require("del"),
	moment = require("moment"),
	sassLint = require("gulp-sass-lint"),
	newer = require("gulp-newer"),
	sourcemaps = require("gulp-sourcemaps"),
	babel = require("gulp-babel"),
	plumber = require("gulp-plumber"),
	cp = require("child_process");;

let browserSync = require('browser-sync').create();
var config = require('./.gulpconfig.json');

/**
* Unify all scripts to work with source and destination paths.
* For more custom paths, please add them in this object
*/
const paths = {
	source: {
		scripts: "assets/src/scripts/",
		sass: "assets/src/sass/",
		images: "assets/src/images/",
		fonts: "assets/src/fonts/"
	},
	destination: {
		scripts: "assets/dist/scripts/",
		css: "assets/dist/css/",
		images: "assets/dist/images/",
		fonts: "assets/dist/fonts/"
	}
};

gulp.task("sass", function() {
	return gulp
	.src(paths.source.sass + "**/*.scss")
	.pipe(sourcemaps.init())
	.pipe(sass().on("error", sass.logError))
	.pipe(autoprefixer())
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest(paths.destination.css))
	.pipe(browserSync.stream({ match: '**/*.css' }))
	;
});

gulp.task("cssmin", function() {
	return gulp
	.src(paths.destination.css + "master.css")
	.pipe(sourcemaps.init({ loadMaps: true }))
	.pipe(cleanCSS({compatibility: 'ie8'}))
	.pipe(rename({ suffix: ".min" }))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest(paths.destination.css))
	.pipe(browserSync.stream({ match: '**/*.css' }))
});

// The files to be watched for minifying. If more dev js files are added this
// will have to be updated.
gulp.task("watch", function() {

	browserSync.init({
		proxy: {
			target: config.localhostURL
		}
	});

	gulp.watch(paths.source.sass + "**/*.scss", gulp.series("sass"));
	gulp.watch(paths.source.scripts + "custom/*.js", gulp.series("moveScripts"));
	gulp.watch(paths.source.scripts + "**/*.js", gulp.series("minifyScripts"));

	gulp.watch("**/*.php").on('change', browserSync.reload);

	// Once the CSS file is build, minify it.
	gulp.watch(paths.destination.css + "master.css", gulp.series("cssmin"));
});

gulp.task("moveScripts", function() {
	return gulp
	.src([
		paths.source.scripts + "custom/*.js",
	])
	.pipe(babel({
		presets: ['@babel/preset-env']
	}))
	.pipe(uglify())
	.pipe(gulp.dest(paths.destination.scripts));
});

gulp.task("minifyScripts", function() {
	// Add separate folders if required.
	return gulp
	.src([
		paths.source.scripts + "vendor/*.js",
		paths.source.scripts + "inc/*.js",
		paths.source.scripts + "scripts.js"
	])
	.pipe(plumber({
		handleError: function (error) {
			console.log(error);
			this.emit('end');
		}
	}))
	.pipe(babel({
		presets: ['@babel/preset-env']
	}))
	.pipe(concat("bundle.min.js"))
	.pipe(uglify())
	.pipe(gulp.dest(paths.destination.scripts));
});

// This will take care of rights permission errors if any
gulp.task("updateAssets", done => {
	return cp.spawn("npm run ver", { stdio: "inherit", shell: true });
});

// TODO: Replace with TinyPNG with API Key for important files only. 
gulp.task("optimizeImages", function() {
	// Add separate folders if required.
	return gulp
		.src(paths.source.images + "**/*")
		.pipe(newer(paths.destination.images))
		.pipe(imagemin())
		.pipe(gulp.dest(paths.destination.images));
});

gulp.task("optimizeFonts", function() {
	gulp
	.src(paths.source.fonts + "*")
	.pipe(gulp.dest(paths.destination.fonts));
});

// This will take care of rights permission errors if any
gulp.task("cleanup", function() {
	del(paths.destination.scripts + "bundle.min.js");
	del(paths.destination.css + "*.css");
});

// Will delete .git files so that you can use it on your own repository
gulp.task("reset", function() {
	del(".git");
	del(".DS_Store");

	// @TODO: create a command that will rename all functions and comments
	// to use the one the developer needs.
});

// What will be run with simply writing "$ gulp"
gulp.task("default", 
	gulp.series("sass",
		gulp.parallel(
			"moveScripts",
			"minifyScripts",
			"cssmin"
		),
		"watch"	
	)
);

// Print the current date formatted. Used for the script compile notify messages.
function getFormatDate() {
	return moment().format("LTS");
}
