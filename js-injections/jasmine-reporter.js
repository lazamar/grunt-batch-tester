Formatter = function (options) {
  options = options || {};

  var defaultStackFilter = function (string) {
    return string;
  };

  var defaultPrint = function (str) {
    console.log(str);
  };

  var ansi = {
    green: '\x1B[32m',
    red: '\x1B[31m',
    yellow: '\x1B[33m',
    blue: '\x1b[34m',
    none: '\x1B[0m'
  };

  this.showColors = options.showColors === undefined ? true : options.showColors;
  this.formatStack = options.stackFilter || defaultStackFilter;
  this.print = options.print || defaultPrint;

  this.printNewline = function () {
    this.print('\n');
  };

  this.colorize = function (color, str) {
    return this.showColors ? (ansi[color] + str + ansi.none) : str;
  };

  this.pluralize = function (str, count) {
    return count > 1 ? str + 's' : str;
  };

  this.indent = function (str, spaces) {
    var indentation = '';
    for (var i = 0; i < spaces; i++) {
      indentation += ' ';
    }
    return spaces <= 0 ? str : indentation + str;
  };
};


var customReporter = (function () {
  var formatter = new Formatter();
  var errors = 0;
  var specs = 0;
  var timerStarted;
  var timerName = 'Test finished. Elapsed time in miliseconds';

  function icon(word) {
    if (word === 'passed') {
      return '✓';

      // return '\xE2\x9C\x93 ';
    } else {
      return 'X';
    }
  }

  function startTimer() {
    if (!timerStarted) {
      console.time(timerName);
      timerStarted = true;
    }
  }

  function endTimer() {
    console.timeEnd(timerName);
  }

  return {
  //  jasmineStarted: function (suiteInfo) {
  //    console.log('Running suite with ' + suiteInfo.totalSpecsDefined + 'specs');
  //  },
   // //`suiteStarted` is invoked when a `describe` starts to run
   suiteStarted: function (result) {
     startTimer();
     var sentence =  formatter.colorize('yellow', result.fullName);
     console.log(sentence);
   },
   // //`specStarted` is invoked when an `it` starts to run (including associated `beforeEach` functions)
   // specStarted: function (result) {
   //   console.log('Spec      : ' + result.description + ' whose full description is: ' + result.fullName);
   // },
   // `specDone` is invoked when an `it` and its associated `beforeEach` and `afterEach` functions have been run.
   // While jasmine doesn't require any specific functions, not defining a `specDone` will make it impossible for a reporter to know when a spec has failed.
   specDone: function (result) {
     //  * The result here is the same object as in `specStarted` but with the addition of a status and lists of failed and passed expectations.
     var sentence = '     ' + icon(result.status) + ' ' + result.description;
     specs++;
     if (result.failedExpectations.length > 0) {
       errors++;
       sentence = formatter.colorize('red', sentence);
     } else {
       sentence = formatter.colorize('green', sentence);
     }

     console.log(sentence);

     for (var i = 0; i < result.failedExpectations.length; i++) {
       // Each `failedExpectation` has a message that describes the failure and a stack trace.
       sentence = '           ' + 'Failure: ' + result.failedExpectations[i].message;
       sentence = formatter.colorize('red', sentence);
       console.log(sentence);
     }
   },
   //  * `suiteDone` is invoked when all of the child specs and suites for a given suite have been run
   //  * While jasmine doesn't require any specific functions, not defining a `suiteDone` will make it impossible for a reporter to know when a suite has failures in an `afterAll`.
   // suiteDone: function (result) {
   //   //  * The result here is the same object as in `suiteStarted` but with the addition of a status and a list of failedExpectations.
   //   console.log(icon(result.status) + ' ' + result.description);
   //
   //   for (var i = 0; i < result.failedExpectations.length; i++) {
   //     console.log('AfterAll ' + result.failedExpectations[i].message);
   //     console.log(result.failedExpectations[i].stack);
   //   }
   // },
   // When the entire suite has finished execution `jasmineDone` is called
   jasmineDone: function () {
     endTimer();
     var plural = (errors > 0) ? 's' : '';
     var sentence = specs + ' specs, ' + errors + ' failure' + plural + '.';
     sentence = formatter.colorize('blue', sentence);
     console.log(sentence);
   }
 }
}());

/**
 * Register the reporter with jasmine
 */
window.addEventListener('load', function () {
  jasmine.getEnv().addReporter(customReporter);
})
