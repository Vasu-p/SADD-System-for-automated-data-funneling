'use strict';

describe('Service: ProjectFactory', function () {

  // load the service's module
  beforeEach(module('middlewareAngularApp'));

  // instantiate service
  var ProjectFactory;
  beforeEach(inject(function (_ProjectFactory_) {
    ProjectFactory = _ProjectFactory_;
  }));

  it('should do something', function () {
    expect(!!ProjectFactory).toBe(true);
  });

});
