'use strict';

describe('Service: UtilityService', function () {

  // load the service's module
  beforeEach(module('middlewareAngularApp'));

  // instantiate service
  var UtilityService;
  beforeEach(inject(function (_UtilityService_) {
    UtilityService = _UtilityService_;
  }));

  it('should do something', function () {
    expect(!!UtilityService).toBe(true);
  });

});
