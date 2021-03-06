var app = angular.module('frontier', [
  'ngRoute', 'ngAnimate', 'ngSanitize','pubnub.angular.service','firebase'
]);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "partials/home.html", controller: "HomeCtrl"})
    .when("/1", {templateUrl: "partials/home1.html", controller: "HomeCtrl"})
    .when("/playernew/:playerId", {templateUrl: "partials/views/newplayer.html", controller: "NewplayerCtrl"})
    .when("/motion/:turnId", {templateUrl: "partials/views/motion.html", controller: "MotionCtrl"})
    .when("/sharedscreen", {templateUrl: "partials/views/sharedScreen.html", controller: "SharedCtrl"})
    .when("/sharedmotion/:turnId", {templateUrl: "partials/views/sharedmotion.html", controller: "MotionCtrl"})
    .when("/species/:speciesId", {templateUrl: "partials/views/species.html", controller: "SpeciesCtrl"});
    // Pages

    $locationProvider.html5Mode({
      enabled: false,
      requireBase: false
    });
}]);

app.controller('MainCtrl', ['Pubnub','Page','$sce','$http','$scope','$location','$rootScope','$window','$firebaseArray',function(Pubnub,Page,$sce,$http, $scope, $location, $rootScope, $window,$firebaseArray){
  $scope.Page = Page;

	$scope.go = function ( path ) {
	  $location.path( path );
	};

  $rootScope.messages = [];
  $rootScope.presences = [];

  $scope.uuid = Math.random(100).toString();
  Pubnub.init({
   publish_key: 'pub-c-445d8ace-41a9-40d2-b68c-bdfcc1e2a298',
   subscribe_key: 'sub-c-33a57daa-c3a7-11e7-b683-b67c7dbcdd00',
   uuid: $scope.uuid
  });

  $scope.publish = function(n,channel){
    var adata=[];
    Pubnub.publish({
        channel: channel,
        message: {
            readyState:n,
            sender_uuid: $scope.uuid
        },
        callback: function(m) {
          $rootScope.messages.push(m);
          adata.push(m);
          $rootScope.$apply();
          // console.log($rootScope.messages);
        }
    });
    return adata;
  };

  $scope.nn = {
    'state':'1',
    'number':'10'
  };

  $scope.startGame = function(){
    $scope.gameID = Math.floor(Math.random() * 9999) + 1000; 
    $scope.channel = $scope.gameID;
    firebase.database().ref('gameChannel').child('game-' + $scope.gameID).set({
      id : $scope.gameID
    });
    $scope.hideStartGame = true;
    $scope.subscribePN($scope.gameID); 
    // $rootScope.messages.push($scope.nn);
    $rootScope.messages.push($scope.publish(1,$scope.channel));
    console.log($scope.publish(1,$scope.channel));
  };

  $scope.subscribePN = function(gameid){
    var data=[];
    Pubnub.subscribe({
        channel : gameid,
        triggerEvents: ['callback'],
        presence: function(presenceEvent){
          console.log(presenceEvent.action); // online status events
          console.log(presenceEvent.timestamp); // timestamp on the event is occurred
          console.log(presenceEvent.uuid); // uuid of the user
          console.log(presenceEvent.occupancy); // current number of users online
          // console.log(m);
          $rootScope.presences=presenceEvent;
          $rootScope.$apply();
          console.log($rootScope.presences);  
        }
    });
    console.log(data);
  };

}]);



app.controller('joinGameCtrl',['$scope','Pubnub','$rootScope',function($scope,Pubnub,$rootScope){
  $scope.joinGameID="";
  
  $scope.publish = function(n,uuid){
    console.log($scope.joinGameID);
    Pubnub.publish({
        channel: $scope.joinGameID,
        message: {
            readyState:n,
            sender_uuid: uuid
        },
        callback: function(m) {
          $rootScope.messages.push(m);
          $rootScope.$apply();
          // console.log($rootScope.messages);
        }
    });
  };

  $scope.joinGame = function(){
    $rootScope.test = 'hello world';
    Pubnub.subscribe({
        channel: $scope.joinGameID,
        triggerEvents: ['callback'],
        presence:function(m){
          $scope.sendData(m);
        }
    });

    $scope.uuid = Math.random(100).toString();
    $scope.publish(0,$scope.uuid);
    // console.log($rootScope.messages);
    // $location.path('/species/'+$scope.userID);

  };

  $scope.sendData = function(m){
    $rootScope.messages = m;
    console.log('message in sendData');
    console.log($rootScope.messages);
  };

  // endof function join Game
}]);

app.controller('HomeCtrl', ['Page','$http','$location','$scope','$rootScope',function(Page,$http, $location, $scope, $rootScope){
  Page.setTitle('Frontier - A Planet of a Thousand Footprints');
}]);

app.controller('NewplayerCtrl', ['Page','$timeout','$http','$location','$scope','$rootScope','$routeParams',function(Page,$timeout,$http, $location, $scope, $rootScope,$routeParams){
  Page.setTitle('Who are you?');
  $rootScope.userID = $routeParams.playerId;
  $scope.words = 'In the process of creating an awesome species ...';
  $timeout( function(){
    if($rootScope.userID==0){
      $scope.words = 'You are Space Ulk!';  
    } else {
      $scope.words = 'You are Space Feline!';
    }
    $scope.showButton = true;
  }, 2000 );

}]);

app.controller('SpeciesCtrl', ['Pubnub','Page','$sce','$http','$scope','$location','$rootScope','$window','$firebaseArray','$routeParams',function(Pubnub,Page,$sce,$http, $scope, $location, $rootScope, $window,$firebaseArray,$routeParams){

  Page.setTitle('Species Overview');

  var ref = firebase.database().ref('species');
  var data= $firebaseArray(ref);
  var dataisi = {};

  data.$loaded().then(function() {
      $scope.itemDetail = data[$routeParams.speciesId];
      dataisi = data[$routeParams.speciesId];
      firebase.database().ref('players').child('player-' + $scope.slicedUUID).update({
         'species/class' : dataisi.class,
         'species/habitat' : dataisi.habitat,
         'species/name' : dataisi.name,
         'species/type' : dataisi.type,
         'species/stats/energy' : dataisi.stats.energy,
         'species/stats/food' : dataisi.stats.food,
         'species/stats/influence' : dataisi.stats.influence,
         'species/stats/land' : dataisi.stats.land,
         'species/stats/population' : dataisi.stats.population
      });
      // To iterate the key/value pairs of the object, use angular.forEach()
      // angular.forEach(data, function(value, key) {
      //   // console.log(key, value);
      // });
     });

  // For three-way data bindings, bind it to the scope instead
  // data.$bindTo($scope, "itemDetail");

}]);

app.controller('SharedCtrl', ['Page','$http','$location','$scope','$routeParams','$rootScope','Pubnub',function(Page,$http, $location, $scope,$routeParams,$rootScope, Pubnub){
  Page.setTitle('Start');

  $scope.start = function (path){
    console.log('Start');
    $location.path(path);
  };

}]);

app.controller('MotionCtrl', ['Vote','Page','$rootScope','$routeParams','$http','$location','$scope','Pubnub',function(Vote,Page,$rootScope,$routeParams, $http, $location, $scope,Pubnub){
  Page.setTitle('Motions');

  if($routeParams.turnId==1){
    $scope.x=1;
    $scope.y=3;
  } else if($routeParams.turnId==2){
    $scope.x=2;
    $scope.y=5;
  } else if($routeParams.turnId==3){
    $scope.x=4;
    $scope.y=6;
  } else if($routeParams.turnId==4){
    $scope.x=1;
    $scope.y=5;
  } else if($routeParams.turnId==5){
    $scope.x=2;
    $scope.y=6;
  }

  $http.get('js/main/motions.json').then(function(data){
      $scope.itemDetail = data.data[$scope.x];
      $scope.effects = data.data[$scope.x].effects[0];
      
      $scope.itemDetail2 = data.data[$scope.y];
      $scope.effects2 = data.data[$scope.y].effects[0];
       
  });
  $scope.submitMotion = function(){
    //console.log($scope.influence);
    Pubnub.publish({
          channel: $scope.channel,
          message: {
              motionId: $scope.itemDetail,
              influence: $scope.count,
              motionId2: $scope.itemDetail2,
              influence2: $scope.count2,
              sender_uuid: $scope.uuid
          },
          callback: function(m) {
            //console.log(m);
          }
      });
  };
  $scope.$watch('influence',function(newVal, oldVal){
    if(newVal!==oldVal) Vote.setInfluence(newVal);
  });

  $scope.count = 0;
  $scope.count2 = 0;
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