'use strict';

angular.module('raw', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  'raw.filters',
  'raw.services',
  'raw.directives',
  'raw.controllers',
  'mgcrea.ngStrap',
  'ui',
  'colorpicker.module'
])

.config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
  $routeProvider.when('/index.html', {templateUrl: 'partials/main.html', controller: 'RawCtrl'});
  $routeProvider.otherwise({redirectTo: '/index.html'});
  $locationProvider.html5Mode(true);
}]);