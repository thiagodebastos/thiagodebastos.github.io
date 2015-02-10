// Generated on 2015-01-29 using generator-jekyllized 0.7.0
'use strict';

var gulp = require('gulp');
// Loads the plugins without having to list all of them, but you need
// to call them as $.pluginname
var $ = require('gulp-load-plugins')();
// 'del' is used to clean out directories and such
var del = require('del');
// BrowserSync isn't a gulp package, and needs to be loaded manually
var browserSync = require('browser-sync');
// merge is used to merge the output from two different streams into the same stream
var merge = require('merge-stream');
// Control the sequence of task running for Modernizr to not break task
var runSequence = require('run-sequence');
// Need a command for reloading webpages using BrowserSync
var reload = browserSync.reload;
// And define a variable that BrowserSync uses in it's function
var bs;

// Deletes the directory that is used to serve the site during development
gulp.task('clean:dev', del.bind(null, ['serve']));

// Deletes the directory that the optimized site is output to
gulp.task('clean:prod', del.bind(null, ['site']));

// Runs the build command for Jekyll to compile the site locally
// This will build the site with the production settings
gulp.task('jekyll:dev', $.shell.task('jekyll build'));
gulp.task('jekyll-rebuild', ['jekyll:dev'], function () {
  reload;
});

// Almost identical to the above task, but instead we load in the build configuration
// that overwrites some of the settings in the regular configuration so that you
// don't end up publishing your drafts or future posts
gulp.task('jekyll:prod', $.shell.task('jekyll build --config _config.yml,_config.build.yml'));

// Compiles the SASS files and moves them into the 'assets/stylesheets' directory
// node-sass not compatible with node 0.12
gulp.task('styles:libsass', function () {
  // Looks at the style.scss or style.sass file for what to include and creates a style.css file
  return gulp.src('src/assets/scss/*.{scss,sass}')
    .pipe($.if('*.sass', $.sass({indentedSyntax: true, errLogToConsole: true})))
    .pipe($.if('*.scss', $.sass({indentedSyntax: false, errLogToConsole: true})))
    // AutoPrefix your CSS so it works between browsers
    .pipe($.autoprefixer('last 1 version', { cascade: true }))
    // Directory your CSS file goes to
    .pipe(gulp.dest('src/assets/stylesheets/'))
    .pipe(gulp.dest('serve/assets/stylesheets/'))
    // Outputs the size of the CSS file
    .pipe($.size({title: 'styles'}))
    // Injects the CSS changes to your browser since Jekyll doesn't rebuild the CSS
    .pipe(reload({stream: true}));
});

gulp.task('styles', function () {
  return $.rubySass(
      // This replaces `update` or `file:file` as the source.
      // The appropriate Sass command is fired
      // based on whether a file or directory is passed.
      'src/assets/scss', {
        sourcemap: false,
        style: 'expanded',
        precision: 10
      })
      .pipe($.autoprefixer(['last 2 versions', { cascade: true }]))
      .pipe(gulp.dest('src/assets/stylesheets/'))
      .pipe(gulp.dest('serve/assets/stylesheets/'))
      .pipe($.size({title: 'styles'}))
      .pipe(reload({stream: true}));;
});

// Optimizes the images that exists
gulp.task('images', function () {
  return gulp.src('src/assets/images/**')
    .pipe($.changed('site/assets/images'))
    .pipe($.imagemin({
      // Lossless conversion to progressive JPGs
      progressive: true,
      // Interlace GIFs for progressive rendering
      interlaced: true
    }))
    .pipe(gulp.dest('site/assets/images'))
    .pipe($.size({title: 'images'}));
});

// Copy images to 'serve' directory during development
gulp.task('images:dev', function () {
  return gulp.src('src/assets/images/**')
    .pipe($.changed('site/assets/images'))
    .pipe(gulp.dest('site/assets/images'))
    .pipe($.size({title: 'images dev'}));
});

// Copy over fonts to the 'site' directory
gulp.task('fonts', function () {
  return gulp.src('src/assets/fonts/**')
    .pipe(gulp.dest('site/assets/fonts'))
    .pipe($.size({ title: 'fonts' }));
});

// Copy xml and txt files to the 'site' directory
gulp.task('copy', function () {
  return gulp.src(['serve/*.txt', 'serve/*.xml'])
    .pipe(gulp.dest('site'))
    .pipe($.size({ title: 'xml & txt' }))
});

// Compile jade layouts into html as plugins do not have permissions
// all other jade files are compiled directly via jade-jekyll plugin
gulp.task('layouts', function() {
  return gulp.src('src/_jade/**/*.jade')
    .pipe($.jade({
      pretty: true
    }))
    .pipe(gulp.dest('src/'))
    .pipe($.size());
});

// Browser Compatability with Modernizr 3
gulp.task('modernize', function() {
  return gulp.src('src/assets/javascript/*.js')
        .pipe($.modernizr())
        .pipe(gulp.dest('src/assets/javascript'))
});

// Optimizes all the CSS, HTML and concats the JS etc
gulp.task('html', ['styles'], function () {
  var assets = $.useref.assets({searchPath: 'serve'});

  return gulp.src('serve/**/*.html')
    .pipe(assets)
    // Concatenate JavaScript files and preserve important comments
    .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
    // Minify CSS
    .pipe($.if('*.css', $.minifyCss()))
    // Start cache busting the files
    .pipe($.revAll({ ignore: ['.eot', '.svg', '.ttf', '.woff'] }))
    .pipe(assets.restore())
    // Conctenate your files based on what you specified in _layout/header.html
    .pipe($.useref())
    // Replace the asset names with their cache busted names
    .pipe($.revReplace())
    // Minify HTML
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      removeCommentsFromCDATA: true,
      removeCDATASectionsFromCDATA: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: false
    })))
    // Send the output to the correct folder
    .pipe(gulp.dest('site'))
    .pipe($.size({title: 'optimizations'}));
});


// Task to upload your site to your personal GH Pages repo
gulp.task('deploy', function () {
  // Deploys your optimized site, you can change the settings in the html task if you want to
  return gulp.src('./site/**/*')
    .pipe($.ghPages({
      // Currently only personal GitHub Pages are supported so it will upload to the master
      // branch and automatically overwrite anything that is in the directory
      branch: 'master'
      }));
});

// Run JS Lint against your JS
gulp.task('jslint', function () {
  gulp.src('./serve/assets/javascript/*.js')
    // Checks your JS code quality against your .jshintrc file
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter());
});

// Runs 'jekyll doctor' on your site to check for errors with your configuration
// and will check for URL errors a well
gulp.task('doctor', $.shell.task('jekyll doctor'));

// BrowserSync will serve our site on a local server for us and other devices to use
// It will also autoreload across all devices as well as keep the viewport synchronized
// between them.
gulp.task('serve:dev', ['layouts', 'styles', 'jekyll:dev'], function () {
  bs = browserSync({
    notify: true,
    // tunnel: '',
    server: {
      baseDir: 'serve'
    }
  });
});

// These tasks will look for files that change while serving and will auto-regenerate or
// reload the website accordingly. Update or add other files you need to be watched.
gulp.task('watch', function () {
  gulp.watch(['src/**/*.{md,html,xml,txt,js}'], ['jekyll-rebuild']);
  gulp.watch(['serve/assets/stylesheets/*.css'], reload);
  gulp.watch(['src/**/*.jade'], ['layouts']);
  gulp.watch(['src/assets/scss/**/*.{scss,sass}'], ['styles']);
  gulp.watch(['src/assets/images/**'], ['images:dev'], reload);
});

// Serve the site after optimizations to see that everything looks fine
gulp.task('serve:prod', function () {
  bs = browserSync({
    notify: false,
    // tunnel: true,
    server: {
      baseDir: 'site'
    }
  });
});

// Default task, run when just writing 'gulp' in the terminal
gulp.task('default', ['serve:dev', 'watch']);

// Checks your CSS, JS and Jekyll for errors
gulp.task('check', ['jslint', 'doctor'], function () {
  // Better hope nothing is wrong.
});

// Builds the site but doesn't serve it to you
gulp.task('build', function(callback) {
  runSequence(['modernize'],
              'jekyll:prod',
              callback);
});

// Runs modernizr script asynchronously then
// builds your site with the 'build' command and then runs all the optimizations on
// it and outputs it to './site'
gulp.task('publish', function(callback) {
  runSequence(['build'],
              ['html', 'copy', 'images', 'fonts' ],
              callback);
});
