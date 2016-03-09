/*globals phantom */

// =====================================================
// This is PhantomJS code.
// Opens a page sent to it as an argument and prints
// console.log messages from the page to the console.
// =====================================================

var system = require('system');

if (system.args.length !== 2) {
  console.log('Usage: run-jasmine.js URL');
  phantom.exit(1);
}

// Check for console message indicating jasmine is finished running
var doneRegEx = /\d+ specs, (\d+) failure/;
var errorCount = 0;

var timeoutTimer;
timeoutTimer = setTimeout(function () {
  console.error('Error, file timed out: ' + system.args[1]);
  phantom.exit(1);
  return;
}, 1000);

var page = require('webpage').create();

page.onConsoleMessage = function (msg) {
  clearTimeout(timeoutTimer); //Stop from timing out
  system.stdout.write(msg);
  system.stdout.write('\n');
  var match = doneRegEx.exec(msg);
  if (match) {
    var rc = (match[1] === '0' && errorCount === 0) ? 0 : 1;
    system.stdout.writeLine('');
    phantom.exit(rc);
  }
};

page.onError = function (msg) {
  system.stderr.write(msg);
  system.stderr.write('\n');
  errorCount++;

  phantom.exit(1);
};

page.onInitialized = function () {
  var outcome = page.injectJs('jasmine-reporter.js');
  system.stdout.write(outcome);
};

page.open(system.args[1], function (status) {
  if (status !== 'success') {
    console.error('Error: could not load the page ' + system.args[1]);
    phantom.exit(1);
  }

  system.stdout.writeLine('');
});
