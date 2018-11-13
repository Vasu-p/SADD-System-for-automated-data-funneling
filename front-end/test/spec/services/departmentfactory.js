'use strict';

describe('Service: departmentfactory', function () {

  // load the service's module
  beforeEach(module('middlewareAngularApp'));

  // instantiate service
  var departmentfactory;
  beforeEach(inject(function (_departmentfactory_) {
    departmentfactory = _departmentfactory_;
  }));

  it('should do something', function () {
    expect(!!departmentfactory).toBe(true);
  });

});
