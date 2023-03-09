const gulp = require('gulp');
const insert = require('gulp-insert');
const fs = require('fs');
const concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
const through2 = require('through2');

OUTPUT = 'merged.user.js';
HEADER = `
// ==UserScript==
// @name         ModernBot
// @author       Sau1707
// @description  A modern grepolis bot
// @version      1.0.0
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @updateURL    https://github.com/Sau1707/ModernBot/blob/main/dist/merged.user.js
// @downloadURL  https://github.com/Sau1707/ModernBot/blob/main/dist/merged.user.js
// @icon         https://raw.githubusercontent.com/Sau1707/ModernBot/main/img/gear.png
// @require		 http://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

var uw = unsafeWindow || window, $ = uw.jQuery || jQuery;
`;
// Gulp task to minify JavaScript files
gulp.task('scripts', () => {
	return gulp
		.src('./src/util.js')
		.pipe(concat(OUTPUT))
		.pipe(gulp.src(['./src/**/*.js', '!./src/setup.js', '!./src/util.js']))
		.pipe(concat(OUTPUT))
		.pipe(gulp.src('./src/setup.js'))
		.pipe(concat(OUTPUT))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('styles', function () {
	return gulp
		.src('./styles/**/*.css')
		.pipe(concat('all.css'))
		.pipe(cleanCSS())
		.pipe(gulp.dest('./dist/'));
});

gulp.task('merge', function () {
	let cssContents = fs.readFileSync('./dist/all.css', 'utf8');

	return gulp
		.src(`./dist/${OUTPUT}`)
		.pipe(
			through2.obj(function (file, enc, cb) {
				file.contents = Buffer.concat([
					Buffer.from('var style = document.createElement("style");\n'),
					Buffer.from('style.textContent = `' + cssContents + '`;\n'),
					Buffer.from('document.head.appendChild(style);\n'),
					Buffer.from('\n'),
					file.contents,
				]);
				cb(null, file);
			}),
		)
		.pipe(insert.prepend(HEADER))
		.pipe(gulp.dest('./dist/'));
});

// Gulp task to minify all files
gulp.task('default', (cb) => {
	gulp.watch('./src/**/*.js', gulp.series('scripts', 'styles', 'merge'));
	gulp.watch('./styles/**/*.css', gulp.series('scripts', 'styles', 'merge'));

	gulp.series('scripts', 'styles', 'merge')(cb);

	process.on('SIGINT', () => {
		console.log('Exiting...');
		process.exit(0);
	});
});
