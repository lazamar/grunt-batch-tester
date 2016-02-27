/*
 * grunt-phantom-batch-tester
 * https://github.com/marcelo/grunt-phantom-batch-tester
 *
 * Copyright (c) 2016 lazamar
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
  var system = require('system');
  var Formatter = require('../formatter');
  var Promise = require('promise');
  var childProcess = require('child_process');
  var spawn = childProcess.spawn;
  var formatter = new Formatter();

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('phantom_batch_tester',
        'Test loads of html files with phantomjs in one go.', function () {
    var done = this.async();
    function testWithPhantom(fileName) {
      return new Promise(function (resolve, reject) {
        var runner = __dirname + '/../runner.js';
        var args = [runner, fileName];
        var cspr = spawn('phantomjs', args);
        var errors = 0;
        var timeoutTime = 5000;
        var timeout = setTimeout(function () {
          cspr.kill('SIGINT');
          var timeoutMessage = formatter.colorize('red', 'Test timed out: ' + fileName);
          var abortingMessage = formatter.colorize('yellow', 'Aborting tests...');
          grunt.log.error(timeoutMessage);
          grunt.log.error(abortingMessage);
          done(false);
          resolve(1);
        }, timeoutTime);

        //cspr.stdout.setEncoding('utf8');
        cspr.stdout.on('data', function (data) {
          var buff = new Buffer(data);
          grunt.log.writeln(fileName + '\n' + buff.toString('utf8'));
        });

        cspr.stderr.on('data', function (data) {
          errors++;
          data += '';
          var errMessage = formatter.colorize('red', data.replace('\n', '\nstderr: '));
          grunt.log.error(errMessage);
        });

        cspr.on('exit', function (code) {
          clearTimeout(timeout);
          resolve(code + errors);
        });
      });
    }

    // Iterate over all specified file groups.
    // Lint specified files.
    var files = this.filesSrc;
    var errorCount = 0;

    var runThroughFiles = (function () {
      var hadErrors = false;
      var i = 0;

      return function runThroughFiles(fileNames) {
        testWithPhantom(fileNames[i]).then(function (processExitVal) {
          hadErrors = (processExitVal !== 0) ? true : hadErrors;
          if (fileNames[i + 1]) {
            i++;
            runThroughFiles(fileNames);
          } else {
            var exitValue = hadErrors ? false : true;
            grunt.log.writeln('Exit value: ' + exitValue);
            done(exitValue);
          }
        });
      };
    }());
    grunt.log.ok(files);

    runThroughFiles(files);
  });

};
