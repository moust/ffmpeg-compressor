var parseBuildPlatforms = function (argumentPlatform) {
	// this will make it build no platform when the platform option is specified
	// without a value which makes argumentPlatform into a boolean
	var inputPlatforms = argumentPlatform || process.platform + ";" + process.arch;

	// Do some scrubbing to make it easier to match in the regexes bellow
	inputPlatforms = inputPlatforms.replace("darwin", "mac");
	inputPlatforms = inputPlatforms.replace(/;ia|;x|;arm/, "");

	var buildAll = /^all$/.test(inputPlatforms);

	var buildPlatforms = {
		mac: /mac/.test(inputPlatforms) || buildAll,
		win: /win/.test(inputPlatforms) || buildAll,
		linux32: /linux32/.test(inputPlatforms) || buildAll,
		linux64: /linux64/.test(inputPlatforms) || buildAll
	};

	return buildPlatforms;
};

module.exports = function (grunt) {
	"use strict";

	var buildPlatforms = parseBuildPlatforms(grunt.option('platforms'));

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('build', [
		'compass',
		'jshint',
		'bower_clean',
		'nodewebkit'
	]);

	grunt.initConfig({

		nodewebkit: {
			options: {
				build_dir: './build', // Where the build version of my node-webkit app is saved
				keep_nw: true,
				embed_nw: false,
				mac_icns: './src/img/icon.icns', // Path to the Mac icon file
				zip: buildPlatforms.win, // Zip nw for mac in windows. Prevent path too long if build all is used.
				mac: buildPlatforms.mac,
				win: buildPlatforms.win,
				linux32: buildPlatforms.linux32,
				linux64: buildPlatforms.linux64
			},
			src: ['./src/**/*', '!./src/sass/**', '!./src/.sass-cache/**',
				'./node_modules/**', '!./node_modules/bower/**', '!./node_modules/*grunt*/**',
				'!./**/build/**', '!./**/.*/**',
				'./package.json', './README.md', './LICENSE'
			]
		},

		jshint: {
			gruntfile: {
				options: {
					jshintrc: '.jshintrc'
				},
				src: 'Gruntfile.js'
			},
			src: {
				options: {
					jshintrc: '.jshintrc'
				},
				src: ['src/**/*.js', '!src/vendor/**/*.js']
			}
		},

		compass: {
			all: {
				options: {
					config: 'src/config.rb'
				}
			}
		}

	});

};
