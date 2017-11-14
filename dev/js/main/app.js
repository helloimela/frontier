var app = angular.module('frontier', [
  'ngRoute', 'ngAnimate', 'ngSanitize'
]);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "partials/home.html", controller: "HomeCtrl"})
    .when("/playernew", {templateUrl: "partials/views/newplayer.html", controller: "NewplayerCtrl"})
    .when("/motion", {templateUrl: "partials/views/motion.html", controller: "MotionCtrl"})
    .when("/sharedScreen", {templateUrl: "partials/views/sharedScreen.html", controller: "MotionCtrl"})
    .when("/species/:speciesId", {templateUrl: "partials/views/species.html", controller: "SpeciesCtrl"});
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

app.controller('HomeCtrl', ['Page','$http','$location','$scope',function(Page,$http, $location, $scope, $rootScope){
  Page.setTitle('Frontier - A Planet of a Thousand Footprints');
}]);

app.controller('NewplayerCtrl', ['Page','$timeout','$http','$location','$scope',function(Page,$timeout,$http, $location, $scope, $rootScope){
  Page.setTitle('Who are you?');
  $scope.userID = Math.floor(Math.random() * 2) + 0;
  console.log($scope.userID);
  $scope.words = 'In the process of creating an awesome species ...';
  $timeout( function(){
    if($scope.userID==0){
      $scope.words = 'You are Space Ulk!';  
    } else {
      $scope.words = 'You are Space Feline!';
    }
    $scope.showButton = true;
  }, 2000 );

  $scope.goSpecies = function(){
     $scope.activeMenu = $scope.userID;
     $location.path('/species/'+$scope.userID);
  };

}]);

app.controller('SpeciesCtrl', ['Page','$routeParams','$http','$location','$scope',function(Page,$routeParams, $http, $location, $scope, $rootScope){
  Page.setTitle('Species Overview');

  $http.get('js/main/species.json').then(function(data){
      $scope.totalnum=data.data.length;
      // $scope.trueID=$scope.totalnum-$routeParams.speciesId-1;
      $scope.itemDetail = data.data[$routeParams.speciesId];
  });

}]);

app.controller('MotionCtrl', ['Vote','Page','$rootScope','$routeParams','$http','$location','$scope',function(Vote,Page,$rootScope,$routeParams, $http, $location, $scope){
  Page.setTitle('Vote for a Motion');
  $scope.submitMotion = function(){
    console.log($scope.influence);
  };
  $scope.$watch('influence',function(newVal, oldVal){
    if(newVal!==oldVal) Vote.setInfluence(newVal);
  });
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


app.factory('Vote', function(){
  var influence = {number:''};
  return {
    getInfluence: function(){
      return influence.number;
    },
    setInfluence: function(num){
      influence.number = num;
    }
  };
});