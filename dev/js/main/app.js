var app = angular.module('frontier', [
  'ngRoute', 'ngAnimate', 'ngSanitize'
]);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "partials/home.html", controller: "HomeCtrl", animation:"home"})
    .when("/about", {templateUrl: "partials/about.html", controller: "AboutCtrl", animation:"about"});
    // Pages

    $locationProvider.html5Mode({
      enabled: false,
      requireBase: false
    });
}]);

app.controller('MainCtrl', ['$sce','$http','$scope','$location','$rootScope','$window',function($sce,$http, $scope, $location, $rootScope, $window){
	$scope.go = function ( path ) {
	  $location.path( path );
	};

}]);

app.controller('HomeCtrl', ['$http','$location','$scope',function($http, $location, $scope, $rootScope){

}]);

app.directive('nav', ['$location',function($location){
  return{
    restrict : 'E',
    templateUrl:'partials/nav.html'
  };
}]);