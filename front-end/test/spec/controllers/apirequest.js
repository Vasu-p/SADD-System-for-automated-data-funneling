'use strict';

describe('Controller: ApirequestCtrl', function () {

  // load the controller's module
  beforeEach(module('middlewareAngularApp'));

  var ApirequestCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ApirequestCtrl = $controller('ApirequestCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ApirequestCtrl.awesomeThings.length).toBe(3);
  });
});
