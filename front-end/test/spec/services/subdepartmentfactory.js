'use strict';

describe('Service: SubDepartmentFactory', function () {

  // load the service's module
  beforeEach(module('middlewareAngularApp'));

  // instantiate service
  var SubDepartmentFactory;
  beforeEach(inject(function (_SubDepartmentFactory_) {
    SubDepartmentFactory = _SubDepartmentFactory_;
  }));

  it('should do something', function () {
    expect(!!SubDepartmentFactory).toBe(true);
  });

});
