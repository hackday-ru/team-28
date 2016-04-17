var gulp = require('gulp');
var gutil = require('gulp-util');
var plugins = require('gulp-load-plugins')();

//var browserify = require('browserify');
//var watchify = require('watchify');
//var source = require('vinyl-source-stream');
//var buffer = require('vinyl-buffer');
//var through = require('through2');

var express = require('express');
var livereload = require('connect-livereload');

var browserSync = require('browser-sync');

var http = require('http');
var ws = require('ws');

var cp = require('child_process');
// var fs = require('fs');
var del = require('del');

var pkg = require('./package.json');

gulp.task('mithril', function () {
	var basename = 'mithril',
		path = require.resolve(basename);
	return gulp.src(path.replace('.js', '.min.js'))
		.pipe(plugins.rename({ basename: basename }))
		.pipe(gulp.dest('dist'));
});

gulp.task('common', function () {
	var path = require.resolve('todomvc-common');
	return gulp.src([path, path.replace('.js', '.css')])
		.pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
	return del(['dist/**', pkg.name + '-*.zip']);
});

gulp.task('serve', ['assets']/*, 'style', 'script-watch']*/, function() {
	browserSync({
		open: false,
		logConnections: true,
		server: {
			baseDir: '.'
		}
	});

	// gulp.watch('style/**.less', ['style']);
	gulp.watch(['index.html', 'js/**'], browserSync.reload);

	gulp.watch(['gulpfile.js', 'package.json'], function() {
		cp.spawn('gulp', ['serve'], { stdio: 'inherit' });
		process.exit();
	});
});

gulp.task('express', ['assets']/*, 'style', 'script-watch']*/, function() {
	var staticServer = express()
		.use(livereload())
	    .use(express.static('./'))
	    .listen(5000);
	var wss = ws.Server({ server: staticServer });

	wss.on('connection', function (ws) {
		ws.on('message', function (message) {
			console.log('->', message);
		});
	});

	plugins.livereload.listen();

	// gulp.watch('style/**.less', ['style']);
	gulp.watch(['index.html', 'js/**'], plugins.livereload.changed);

	gulp.watch(['gulpfile.js', 'package.json'], function() {
		cp.spawn('gulp', ['express'], { stdio: 'inherit' });
		process.exit();
	});
});

gulp.task('assets', ['common', 'mithril']);
// gulp.task('code', ['style', 'script']);
// gulp.task('build', ['clean', 'archive']);
