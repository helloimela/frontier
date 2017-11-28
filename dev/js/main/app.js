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
    .when("/sharedScreen", {templateUrl: "partials/views/sharedScreen.html", controller: "MotionCtrl"})
    .when("/species/:speciesId", {templateUrl: "partials/views/species.html", controller: "SpeciesCtrl"});
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

app.constant('FBURL', 
  'https://frontier-a3fcb.firebaseio.com/'                                                   
);

app.controller('MainCtrl', ['Pubnub','Page','$sce','$http','$scope','$location','$rootScope','$window','$firebaseArray',function(Pubnub,Page,$sce,$http, $scope, $location, $rootScope, $window,$firebaseArray){
  $scope.Page = Page;

  // var ref = firebase.database().ref();
  // $scope.itemDetail = $firebaseArray(ref);
  // console.log($scope.itemDetail);

	$scope.go = function ( path ) {
	  $location.path( path );
	};
  $rootScope.messages = [];
  $rootScope.presences=[];

  $scope.channel = 'game-channel';
  $scope.uuid = Math.random(100).toString();
  Pubnub.init({
   publish_key: 'pub-c-445d8ace-41a9-40d2-b68c-bdfcc1e2a298',
   subscribe_key: 'sub-c-33a57daa-c3a7-11e7-b683-b67c7dbcdd00',
   uuid: $scope.uuid
  });

  // Subscribing to the ‘messages-channel’ and trigering the message callback
  Pubnub.subscribe({
      channel: $scope.channel,
      triggerEvents: ['callback'],
      presence:function(m){
        // console.log(m);
        $rootScope.presences=m;
      }
  });

  $scope.sendMessage =  function(){
    $scope.publish(0);
    console.log('SendMessage');
    console.log($rootScope.messages);
    $location.path('/species/'+$scope.userID);
  };

  $scope.$on(Pubnub.getPresenceEventNameFor($scope.channel),function(e,payload){
    // console.log(e);   
    // console.log(payload);   
  });

  // Listening to the callbacks
  $scope.$on(Pubnub.getMessageEventNameFor($scope.channel), function (ngEvent, m) {
      $scope.$apply(function () {
          $rootScope.messages.push(m);
          // console.log(ngEvent);
          // console.log(m);
      });
  });

  $scope.sendReady = function(){
    $scope.publish(1);
    console.log('SendReady');
    console.log($rootScope.messages);
  };

  $scope.publish = function(n){
    Pubnub.publish({
          channel: $scope.channel,
          message: {
              speciesId:$rootScope.userID,
              readyState:n,
              sender_uuid: $scope.uuid
          },
          callback: function(m) {
            // console.log(m);
          }
      });
  };

  $scope.counter = 0;
  $scope.goVote = function(){
    $scope.counter+=1;
    $location.path('/motion/'+$scope.counter);
  };

}]);


// app.controller('SubscribeCtrl', ['Pubnub','Page','$http','$location','$scope','$rootScope',function(Pubnub,Page,$http, $location, $scope, $rootScope){
 
//      // Send the messages over PubNub Network
//   // $scope.sendMessage = function() {
//   //     Pubnub.publish({
//   //         channel: $scope.channel,
//   //         message: {
//   //             // content: $scope.messageContent,
//   //             sender_uuid: $scope.uuid,
//   //             date: new Date()
//   //         },
//   //         callback: function(m) {
//   //           console.log(m);
//   //         }
//   //     });
//       // Reset the messageContent input
//       // $scope.messageContent = '';

//   // };
// }]);

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

  var ref = firebase.database().ref('species').child($routeParams.speciesId);
  var data = [];
  // console.log(data);
  $scope.itemDetail = $firebaseArray(ref);
  console.log($scope.itemDetail);

  ref.child($routeParams.speciesId).on("value",function(snapshots){ //value of that id
    console.log(snapshots.val());
    // $scope.itemDetail.class = snapshots.val();
  })

  // $http.get('js/main/species.json').then(function(data){
  //     $scope.totalnum=data.data.length;
  //     // $scope.trueID=$scope.totalnum-$routeParams.speciesId-1;
  //     $scope.itemDetail = data.data[$routeParams.speciesId];
  // });

}]);

app.controller('MotionCtrl', ['Vote','Page','$rootScope','$routeParams','$http','$location','$scope',function(Vote,Page,$rootScope,$routeParams, $http, $location, $scope){
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
    console.log($scope.influence);
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