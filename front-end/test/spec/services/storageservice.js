'use strict';

describe('Service: StorageService', function () {

  // load the service's module
  beforeEach(module('middlewareAngularApp'));

  // instantiate service
  var StorageService;
  beforeEach(inject(function (_StorageService_) {
    StorageService = _StorageService_;
  }));

  it('should do something', function () {
    expect(!!StorageService).toBe(true);
  });

});
