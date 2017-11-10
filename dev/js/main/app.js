var app = angular.module('frontier', [
  'ngRoute', 'ngAnimate', 'ngSanitize','pubnub.angular.service'
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

/*app.run(['Pubnub', '$rootScope',function (Pubnub, $rootScope) {
  $rootScope.channel = 'game-channel';
  $rootScope.uuid = Math.random(100).toString();
  Pubnub.init({
      subscribe_key: 'sub-c-33a57daa-c3a7-11e7-b683-b67c7dbcdd00',
      publish_key: 'pub-c-445d8ace-41a9-40d2-b68c-bdfcc1e2a298',
      uuid: $rootScope.uuid
  });
}]);*/

app.controller('MainCtrl', ['Pubnub','Page','$sce','$http','$scope','$location','$rootScope','$window',function(Pubnub,Page,$sce,$http, $scope, $location, $rootScope, $window){
  $scope.Page = Page;

	$scope.go = function ( path ) {
	  $location.path( path );
	};

  $scope.channel = 'game-channel';
  $scope.uuid = Math.random(100).toString();
  Pubnub.init({
   publish_key: 'sub-c-33a57daa-c3a7-11e7-b683-b67c7dbcdd00',
   subscribe_key: 'pub-c-445d8ace-41a9-40d2-b68c-bdfcc1e2a298',
   uuid: $scope.uuid
  });
     // Send the messages over PubNub Network
  $scope.sendMessage = function() {
     // Don't send an empty message 
    console.log('SendMessage');
     if (!$scope.messageContent || $scope.messageContent === '') {
          return;
      }
      Pubnub.publish({
          channel: $scope.channel,
          message: {
              content: $scope.messageContent,
              sender_uuid: $scope.uuid,
              date: new Date()
          },
          callback: function(m) {
              console.log(m);
          }
      });
      // Reset the messageContent input
      $scope.messageContent = '';

  };

  $scope.messages = [];

  // Subscribing to the ‘messages-channel’ and trigering the message callback
  Pubnub.subscribe({
      channel: $scope.channel,
      triggerEvents: ['callback']
  });

  // Listening to the callbacks
  $scope.$on(Pubnub.getMessageEventNameFor($scope.channel), function (ngEvent, m) {
      $scope.$apply(function () {
          $scope.messages.push(m);
      });
  });

}]);

app.controller('HomeCtrl', ['Page','$http','$location','$scope',function(Page,$http, $location, $scope, $rootScope){
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
