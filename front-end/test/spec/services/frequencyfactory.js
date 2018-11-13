'use strict';

describe('Service: FrequencyFactory', function () {

  // load the service's module
  beforeEach(module('middlewareAngularApp'));

  // instantiate service
  var FrequencyFactory;
  beforeEach(inject(function (_FrequencyFactory_) {
    FrequencyFactory = _FrequencyFactory_;
  }));

  it('should do something', function () {
    expect(!!FrequencyFactory).toBe(true);
  });

});
