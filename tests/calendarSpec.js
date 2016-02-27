
describe('DJDCalendar', function () {
  it('should throw when instantiated without parameters', function () {
    var noParams = function () {
      return new DJDCalendar();
    };

    expect(noParams).toThrow();
  });
});
