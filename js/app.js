
var myfuddleApp = angular.module('myfuddleApp', ['ngResource']);

myfuddleApp.config(function($routeProvider) {
    $routeProvider.
        when('/', {
            controller: 'IndexController',
            templateUrl: 'views/index.html'
        }).
        when('/index', {
            controller: 'IndexController',
            templateUrl: 'views/index.html'
        }).
        when('/login', {
            controller: 'LoginController',
            templateUrl: 'views/login.html'
        });
});

myfuddleApp.controller('IndexController', function($scope, $location) {
    if (!$scope.logged_in) {
        $location.path('login');
    }
    console.log($scope.username);
    console.log($scope.password);
});

myfuddleApp.controller('LoginController', function($scope, $rootScope, $location, $http) {
    var credentials;
    $scope.login = function() {
        credentials = base64_encode($scope.username + ':' + $scope.password);
        $http({
            method: 'GET',
            url: 'https://' + $scope.subdomain + '.unfuddle.com/api/v1/account.json',
            headers: {
                Authorization: 'Basic ' + credentials,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }).success(function(data, status, headers, config) {
            console.log(data);
            $rootScope.logged_in = true;
            $rootScope.username = $scope.username;
            $rootScope.password = $scope.password;
            $rootScope.account = data;
            $location.path('index');
        }).error(function(data, status, headers, config) {
            console.log(data);
            alert('Invalid username/password');
        });
    }
});

myfuddleApp.run(function($rootScope) {
    $rootScope.logged_in = false;
});
