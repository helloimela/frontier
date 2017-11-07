var app = angular.module('frontier', [
  'ngRoute', 'ngAnimate', 'ngSanitize'
]);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "partials/home.html", controller: "HomeCtrl"})
    .when("/species", {templateUrl: "partials/views/species.html", controller: "SpeciesCtrl"});
    // Pages

    $locationProvider.html5Mode({
      enabled: false,
      requireBase: false
    });
}]);

app.controller('MainCtrl', ['Page','$sce','$http','$scope','$location','$rootScope','$window',function(Page,$sce,$http, $scope, $location, $rootScope, $window){
  $scope.Page = Page;

	$scope.go = function ( path ) {
	  $location.path( path );
	};

}]);

app.controller('HomeCtrl', ['$http','$location','$scope',function($http, $location, $scope, $rootScope){
  Page.setTitle('Frontier - A Planet of a Thousand Footprints');
}]);

app.controller('SpeciesCtrl', ['Page','$http','$location','$scope',function(Page,$http, $location, $scope, $rootScope){
  Page.setTitle('Species Overview');
}]);

app.directive('nav', ['$location',function($location){
  return{
    restrict : 'E',
    templateUrl:'partials/nav.html'
  };
}]);

app.directive('header', ['$location',function($location){
  return{
    restrict : 'E',
    templateUrl:'partials/header.html'
  };
}]);

app.factory('Page', function(){
  var title = 'Frontier - A Planet of a Thousand Footprints';
  return {
    title: function() { return title; },
    setTitle: function(newTitle) { title = newTitle; }
  };
});
