'use strict';

describe('Service: MappingFactory', function () {

  // load the service's module
  beforeEach(module('middlewareAngularApp'));

  // instantiate service
  var MappingFactory;
  beforeEach(inject(function (_MappingFactory_) {
    MappingFactory = _MappingFactory_;
  }));

  it('should do something', function () {
    expect(!!MappingFactory).toBe(true);
  });

});
