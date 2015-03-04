axis            = require 'axis'
rupture         = require 'rupture'
jeet            = require 'jeet'
autoprefixer    = require 'autoprefixer-stylus'
js_pipeline     = require 'js-pipeline'
css_pipeline    = require 'css-pipeline'
yaml            = require 'roots-yaml'
dynamic_content = require 'dynamic-content'

module.exports =
	ignores: ['readme.md', '_templates/**/*', '**/_*', '**/*.sublime*', '_layouts/**/*', '.gitignore', '.editorconfig', 'ship.*conf']

	dump_dirs: ['']

	extensions: [
		yaml(),
		dynamic_content(write: {'posts.json': 'posts', 'portfolio.json': 'portfolio'})
		js_pipeline(files: 'assets/js/*.coffee', out: 'js/build.js', minify: true, hash: true),
		css_pipeline(files: 'assets/css/*.styl', out: 'css/build.css', minify: true, hash: true),
	]

	stylus:
		use: [axis(), rupture(), jeet(), autoprefixer()]
		sourcemap: true

	jade:
		pretty: true
		basedir: '/Users/Thiago/Sites/thiagodebastos/'

	locals:
			siteUrl: 'http://thiagodebastos.com'
			siteTitle: 'thiagodebastos.com'
			description: 'This is where Thiago de Bastos keeps you connected to things he creates, thinks and feels. An Art directed blog'
			author:
				name: 'Thiago de Bastos'
				email: 'thiago@thiagodebastos.com'
				phone: '+44 (0)7 53456 2784'
				city: 'London'
				github: 'thiagodebastos'
				twitter: 'thiagodebastos'
				facebook: 'thiago.davoodifar'
				behance: 'xingur'
			analytics: 'google'
			config:
				node_env: process.env.NODE_ENV = "production"

	server:
		clean_urls: true

