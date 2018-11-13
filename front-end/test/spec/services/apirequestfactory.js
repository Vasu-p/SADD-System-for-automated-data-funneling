'use strict';

describe('Service: APIRequestFactory', function () {

  // load the service's module
  beforeEach(module('middlewareAngularApp'));

  // instantiate service
  var APIRequestFactory;
  beforeEach(inject(function (_APIRequestFactory_) {
    APIRequestFactory = _APIRequestFactory_;
  }));

  it('should do something', function () {
    expect(!!APIRequestFactory).toBe(true);
  });

});
