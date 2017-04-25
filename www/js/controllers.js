var appControllers = angular.module('starter.controllers', []); // Use for all controller of application.
var appServices = angular.module('starter.services', []);// Use for all service of application.

appControllers.constant('endpoint', 'http://dev-project-midas.pantheonsite.io');
appControllers
.service('auth',  authService)
.config(function($httpProvider) {
  $httpProvider.interceptors.push(authInterceptor);
}).service('client', clientService);
