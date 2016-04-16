var gulp = require('gulp');
var gutil = require('gulp-util');
var plugins = require('gulp-load-plugins')();

//var browserify = require('browserify');
//var watchify = require('watchify');
//var source = require('vinyl-source-stream');
//var buffer = require('vinyl-buffer');
//var through = require('through2');

var browserSync = require('browser-sync');
//var minimist = require('minimist');

var cp = require('child_process');
// var fs = require('fs');
var del = require('del');

var pkg = require('./package.json');
// var options = minimist(process.argv.slice(2), {
// 	string: ['api-path', 'api-proxy'],
// 	default: {
// 		'api-path': 'v1'
// 	}
// });
var polyfills = ['array.prototype.findindex',
                 'object.assign/dist/browser.js'];

// gulp.task('script', ['patch-version'], function() {
// 	return scriptBundle('script/index.js')
// 		// Don't transform, see: http://git.io/vcJlV
// 		.pipe(source('index.js')).pipe(buffer())
// 		.pipe(plugins.sourcemaps.init({ loadMaps: true }))
// 		.pipe(plugins.uglify())
// 		.pipe(plugins.sourcemaps.write('./'))
// 		.pipe(gulp.dest('dist'));
// });

// gulp.task('script-watch', ['patch-version'], function () {
// 	return scriptBundle('script/index.js', function (bundle) {
// 		return bundle.pipe(source('index.js'))
// 			.pipe(gulp.dest('./dist'))
// 			.pipe(browserSync.stream());
// 	});
// });

// gulp.task('style', function () {
// 	return gulp.src('style/index.less')
// 		.pipe(plugins.sourcemaps.init())
// 		.pipe(plugins.less({ paths: ['node_modules'] }))
// 		// don't use less plugins due http://git.io/vqVDy bug
// 		.pipe(plugins.autoprefixer({ browsers: ['> 0.5%'] }))
// 		.pipe(plugins.minifyCss())
// 		.pipe(plugins.sourcemaps.write('./'))
// 		.pipe(gulp.dest('dist'))
// 		.pipe(browserSync.stream({match: '**/*.css'}));
// });

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

// gulp.task('html', function () {
// 	return gulp.src('index.html')
// 		.pipe(gulp.dest('dist'))
// 		.pipe(browserSync.stream());
// });

gulp.task('clean', function () {
	return del(['dist/**', pkg.name + '-*.zip']);
});

// gulp.task('archive', ['assets', 'code'], function (cb) {
// 	return gulp.src(['dist/**', '!**/*.map'])
// 		.pipe(plugins.rename({ dirname: pkg.name }))
// 		.pipe(plugins.zip(pkg.name + '-' + pkg.version + '.zip'))
// 		.pipe(gulp.dest('.'));
// });

gulp.task('serve', ['assets']/*, 'style', 'script-watch']*/, function() {
	browserSync({
		open: false,
		logConnections: true,
		server: {
			baseDir: '.'
			//middleware: options['api-proxy'] ? proxyIfNotExist('dist', options['api-proxy']) : null
		}
	});

	// gulp.watch('style/**.less', ['style']);
	gulp.watch(['index.html', 'js/**'], browserSync.reload);

	gulp.watch(['gulpfile.js', 'package.json'], function() {
		cp.spawn('gulp', ['serve'], { stdio: 'inherit' });
		process.exit();
	});
});

gulp.task('patch-version', function (cb) {
	if (pkg.rev)
		return cb();
	cp.exec('git rev-list ' + pkg.version + '..HEAD --count', function (err, stdout, _) {
		if (err && err.code != 127) // not "command not found"
			gutil.log('Could not fetch revision. ' +
					  'Please git tag the package version.');
		else if (!err && stdout > 0) {
			pkg.rev =  stdout.toString().trim();
			pkg.version += ('+r' + pkg.rev);
		}
		cb(err);
	});
});

function scriptBundle(src, watchUpdate) {
	var build = browserify(src, {
		cache: {}, packageCache: {},
		debug: true
	});
	build.external('codemirror')
		.transform('exposify', { expose: {'mithril': 'm' }})
		.transform('browserify-replace', { replace: [
			{ from: '__VERSION__', to: pkg.version },
			{ from: '__API_PATH__', to: options['api-path'] }
		]});

	build.on('bundle', function() {
		var firstChunk = true;
		var polyfillData = polyfills.reduce(function (res, module) {
			var data = fs.readFileSync(require.resolve(module));
			return res + data + '\n';
		}, '');
		var stream = through.obj(function (buf, enc, next) {
			if (firstChunk) {
				this.push(polyfillData);
				firstChunk = false;
			}
			this.push(buf);
			next();
		});
		stream.label = "prepend";
		build.pipeline.get('wrap').push(stream);
	});

	if (!watchUpdate)
		return build.bundle();

	var rebuild = function () {
		return watchUpdate(build.bundle().on('error', function (err) {
			gutil.log(err.message);
		}));
	};
	build.plugin(watchify);
	build.on('log', gutil.log.bind(null, 'Script update:'));
	build.on('update', rebuild);
	return rebuild();
}
function proxyIfNotExist(basePath, proxyPath) {
	var httpProxy = require('http-proxy');
	var url = require('url');
	var path = require('path');

	var proxy = httpProxy.createProxyServer();
	return function (req, res, next) {
		var pn = path.join(basePath, url.parse(req.url).pathname);
		try {
			fs.accessSync(pn);
			next();
		} catch (e) {
			proxy.web(req, res, {target: proxyPath}, function () {});
		}
	};
};

gulp.task('assets', ['common', 'mithril']);
// gulp.task('code', ['style', 'script']);
// gulp.task('build', ['clean', 'archive']);
