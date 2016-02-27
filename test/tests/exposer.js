function Exposer() { //jshint ignore:line
  'uses strict';

  if (!(this instanceof Exposer)) { //jshint ignore:line
    return new Exposer();
  }

  this.removeComments = function removeComments(funcStr) {
    return funcStr.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, ' ');
  };

  function getIndexOf(indexOfWhat, funcStr) {
    if (typeof funcStr !== 'string') {throw 'Invalid paremeter type.'; }

    var idx = null;
    var match;

    switch (indexOfWhat) {
      case 'afterFunctionDeclaration':
        match = funcStr.match(/function\s*?\w*?\((\w|\s|\,)*?\)\s*?\{/);
        break;
      case 'beforeFunctionClosing':
        match = funcStr.match(/\}\s*$/);
        break;
      default:
        throw 'Invalid option';
    }

    if (match.length > 0) {
      idx = match[0].length;
    }

    return idx;
  }

  function getFunctionName(funcStr, pointer) {
    var isFunctionVariable = false;
    var funcName = '';

    //Check if is  function variable
    var scavange = funcStr.slice(0, pointer);
    var searchResult = scavange.match(/\s*\=[\s(]*function$/);
    if (searchResult && searchResult.length > 0) {
      isFunctionVariable = true;

      //Remove the function keyword and equals sign part
      scavange = scavange.slice(0, scavange.length - searchResult[0].length);

      //If is an object's property
      if (scavange.search(/\.[\w\s]+$/) >= 0) {
        return null;
      }

      //Get the variable name
      searchResult = scavange.match(/\w+$/);
      funcName = (searchResult && searchResult[0]) ? searchResult[0] : '';
      funcName = funcName.replace(/\s/g, '').replace(/\s*?=\s*?\(?\s*?function/, '');
    }

    if (funcName === '' && !isFunctionVariable) {
      scavange = funcStr.slice(pointer);
      searchResult = scavange.match(/\w*\s*\(/);
      funcName = (searchResult && searchResult[0]) ? searchResult[0] : '';
      funcName = funcName.replace(/\s/g, '').replace('(', '');
    }

    return (funcName !== '') ? funcName : null;
  }

  function matchingChar(char) {
    var answer;
    switch (char) {
      case '{':
        answer = '}';
        break;
      case '}':
        answer = '{';
        break;
      case '\'':
        answer = '\'';
        break;
      case '"':
        answer = '"';
        break;
      default:
        answer = null;
    }
    return answer;
  }

  function indexOfMatchingElement(funcString, openingIndex) {
    if (typeof funcString !== 'string' ||
        typeof openingIndex !== 'number') {
      throw 'Invalid paremeter type.';
    }

    var closingIndex = openingIndex;
    var scavange = funcString.slice(openingIndex);

    var toBeMatched = [];
    var lastMatch;
    var currMatch;
    var idx;

    do {
      lastMatch = toBeMatched[toBeMatched.length - 1];
      idx = scavange.search(/\{|\}|\'|\"/);
      currMatch = scavange.charAt(idx);

      if (lastMatch === matchingChar(currMatch) &&
            scavange.charAt(idx - 1) !== '\\') {
        toBeMatched.pop();
      } else if (lastMatch !== '\'' && lastMatch !== '"') {
        toBeMatched.push(currMatch);
      }

      scavange = scavange.slice(idx + 1);
      closingIndex += idx + 1;
    } while (toBeMatched.length > 0 && scavange.length > 0 && idx >= 0);

    if (toBeMatched.length > 0) {
      throw 'Parsing error';
    }

    return closingIndex;
  }

  function getFunctionLength(scavange) {
    if (typeof scavange !== 'string') {throw 'Invalid paremeter type.'; }

    var idx = scavange.search('{');
    return indexOfMatchingElement(scavange, idx) + 1;
  }

  this.getFunctions = function getFunctions(funcStr) {
    if (typeof funcStr !== 'string') {throw 'Invalid paremeter type.'; }

    funcStr = this.removeComments(funcStr);

    //Isolate module from other code in file
    var moduleStr = funcStr.slice(0, getFunctionLength(funcStr) - 1);
    var pointer = getIndexOf('afterFunctionDeclaration', moduleStr);

    var functions = [];
    var cutFrom;
    var FUNCWORDLEN = 'function'.length;
    var scavange = moduleStr.slice(pointer);
    var funcName;
    var funcLen;
    var idx;

    while (pointer < moduleStr.length) {
      // Go to next function
      idx = scavange.search(/(?:\{|\'|\"|function)/);
      if (idx < 0) {
        break;
      } else if (['{', '\'', '"'].indexOf(scavange.charAt(idx)) >= 0) {
        pointer += indexOfMatchingElement(scavange, idx);
        scavange = funcStr.slice(pointer);
      } else {
        cutFrom = idx + FUNCWORDLEN;
        pointer += cutFrom;
        scavange = scavange.slice(cutFrom);

        funcName = getFunctionName(moduleStr, pointer);
        if (funcName) {
          functions.push(funcName);
        }

        funcLen = getFunctionLength(scavange);
        scavange = scavange.slice(funcLen);
        pointer += funcLen;
      }

    }

    return functions;
  };

  this.exposeAll = function exposeAll(func) {
    if (typeof func !== 'function') {
      throw 'Invalid paremeter type. It must be a constructor function';
    }

    var funcStr = func.toString();
    var closingBracketIdx = funcStr.search(/\}[^\}]*$/);

    var functionsExposition = '';
    var functions = this.getFunctions(funcStr);
    var funcName;
    while (functions.length) {
      funcName = functions.pop();
      functionsExposition += '\n\tthis._' + funcName + ' = ' + funcName + ';';
    }

    var topPart = funcStr.slice(0, closingBracketIdx);
    var bottomPart = funcStr.slice(closingBracketIdx, funcStr.length);
    var outcome = topPart + functionsExposition + bottomPart;

    eval.call(window, outcome);
    return;
  };

  return this;
}
