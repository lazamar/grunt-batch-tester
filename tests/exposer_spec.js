/*global describe, it, expect, Exposer*/

//Mock module
var mockmodule = function MockModule (var1, var2) {
  function private1() {return 'worked'; }

  function private2(a, b) { return a + b; }

  function private3(){
    function subfunction1() { return true; }

    function subfunction2() {return true; }
  }

  function private4(){}

  var private5 = function () {};

  var private6 = (function () {'{'}());

  var private7 = (function () {'}'}());

  //This is actually global, but we must account for that too.
  private8 = (function () {})();

  this.public1 = function () {};

  this.public2 = function public2 () {};

  this.public3 = (function public3(){});

  this.public4 = (function (){});

  // function inlineCommentFunction1 () {}

  /*
    function blockCommentFunction () {}
   */

  var stringVariable = 'function stringFunction () {}';
  var numberVariable = 123;
  var objectVariable = {
    property1: 1,
    property2: 2,
  };

  var objectWithFunction = {
    objectFunction1: function () {},
    objectFunction2: function objectFunction2() {},
  }

  // (function immediateFunctionNotExportable() {
  //   return objectWithFunction;
  // }());

  // return this; //for now the return this is breaking the function.
}

describe('Exposer module', function () {
  'use strict';

  it('should have been loaded by Jasmine', function () {
    expect(Exposer).toBeDefined();
  });

  it('should be successfully instantiated without parameters', function () {
    var ex = new Exposer();
    expect(ex).toBeDefined();
    expect(typeof ex === 'object').toBe(true);
  });

  it('should have an exposeAll function', function () {
    var ex = new Exposer();
    expect(typeof ex.exposeAll === 'function').toBe(true);
  });

  describe('when exposing a module', function () {


    var exposer = new Exposer();

    //We pass the variable containing the constructor, but the variable that
    //will be created will use the real function name.
    exposer.exposeAll(mockmodule);

    it('should generate a global variable with the function name', function () {
      expect(MockModule).toBeDefined();
    });

    it('This global variable should be a function', function () {
      expect(typeof MockModule === 'function').toBe(true);
    });

    var exposedModule = new MockModule();
    it('should have constructed an object of the right type', function () {
      expect(typeof exposedModule === 'object').toBe(true);
    });

    it('should have constructed an object with the right constructor', function () {
      expect(exposedModule instanceof MockModule).toBe(true);
    });

    it('should have exposed the right amount of functions', function () {
      expect(Object.keys(exposedModule).length).toEqual(12);
    });

    it('should have added an underscore to private methods', function () {
      expect(typeof exposedModule._private1 === 'function').toBe(true);
    });

    it('should call the private methods appropriately', function () {
      expect(exposedModule._private1()).toEqual('worked');
      expect(exposedModule._private2(1, 1)).toEqual(2);
    });

    it('should not have exposed again functions that were already public', function () {
      expect(exposedModule._public1).not.toBeDefined();
      expect(exposedModule._this).not.toBeDefined();
      expect(exposedModule.this).not.toBeDefined();
    });

    it('should not expose function declarations in comments', function () {
      expect(exposedModule._inlineCommentFunction1).not.toBeDefined();
      expect(exposedModule.inlineCommentFunction1).not.toBeDefined();
      expect(exposedModule._blockCommentFunction).not.toBeDefined();
      expect(exposedModule.blockCommentFunction).not.toBeDefined();
    });

    it('should not expose function declarations within strings', function () {
      expect(exposedModule._stringFunction).not.toBeDefined();
      expect(exposedModule.stringFunction).not.toBeDefined();
    });

    it('should not expose private varibles', function () {
      expect(exposedModule._stringVariable).not.toBeDefined();
      expect(exposedModule._numberVariable).not.toBeDefined();
      expect(exposedModule._objectVariable).not.toBeDefined();
      expect(exposedModule._objectWithFunction).not.toBeDefined();
      expect(exposedModule.stringVariable).not.toBeDefined();
      expect(exposedModule.numberVariable).not.toBeDefined();
      expect(exposedModule.objectVariable).not.toBeDefined();
      expect(exposedModule.objectWithFunction).not.toBeDefined();
    });

    it('should not expose functions within objects', function () {
      expect(exposedModule.objectFunction1).not.toBeDefined();
      expect(exposedModule._objectFunction1).not.toBeDefined();
      expect(exposedModule.objectFunction2).not.toBeDefined();
      expect(exposedModule._objectFunction2).not.toBeDefined();
    });

    it('should not expose immediate functions not assigned to a variable', function () {
      expect(exposedModule._immediateFunctionNotExportable).not.toBeDefined();
      expect(exposedModule.immediateFunctionNotExportable).not.toBeDefined();
    });
  });
});
