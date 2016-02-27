module.exports = function (options) {
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
