
var myfuddleApp = angular.module('myfuddleApp', ['ngResource']);
myfuddleApp.factory('unfuddle', function($http, $rootScope, $location) {
    var self = this;
    var path = '.unfuddle.com/api/v1/';

    function do_get(entity, params, success_cb, headers) {
        console.log('headers: ' + headers)
        var default_headers = {
            Authorization: 'Basic ' + self.credentials,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
        if (headers != undefined) {
            _.extend(default_headers, headers);
        }
        $http({
            method: 'GET',
            url: 'https://' + self.subdomain + path + entity,
            params: params,
            headers: default_headers
        }).success(function(data, status, headers, config) {
            if (success_cb != undefined) {
                success_cb(data);
            }
        }).error(function(data, status, headers, config) {
            console.log(data);
            alert('Invalid username/password test ' + data);
        });
    }
    return {
        get: do_get,
        login: function(subdomain, username, password) {
            self.subdomain = subdomain;
            self.credentials = base64_encode(username + ':' + password);
            do_get('account.json', {}, function(data) {
                $rootScope.logged_in = true;
                $rootScope.account = data;
                $location.path('index');
            });
        }
    };
});

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
        when('/projects/:id/tickets', {
            controller: 'TicketListController',
            templateUrl: 'views/tickets.html'
        }).
        when('/projects/:id/tickets/:ticket_id', {
            controller: 'TicketController',
            templateUrl: 'views/ticket.html'
        }).
        when('/login', {
            controller: 'LoginController',
            templateUrl: 'views/login.html'
        });
});

myfuddleApp.controller('IndexController', function($scope, $location, unfuddle) {
    if ($scope.logged_in) {
        unfuddle.get('projects', {}, function(data) {
            $scope.projects = data;
        });
    }
    else {
        $location.path('login');
    }
    console.log($scope.username);
    console.log($scope.password);
});

myfuddleApp.controller('LoginController', function($scope, $rootScope, $location, unfuddle) {
    $scope.login = function() {
        unfuddle.login($scope.subdomain, $scope.username, $scope.password);
    }
});

myfuddleApp.controller('TicketListController', function($scope, $location, $routeParams, unfuddle) {
    var params = {};
    if ($scope.logged_in) {
        $scope.project_id = $routeParams.id;
        params['conditions_string'] = 'status-neq-closed';
        unfuddle.get('projects/' + $routeParams.id + '/ticket_reports/dynamic.json',
            params, 
            function(data) {
                $scope.tickets = data.groups[0].tickets;
            }
        );
    }
    else {
        $location.path('login');
    }
});

myfuddleApp.controller('TicketController', function($scope, $location, $routeParams, unfuddle) {
    var params = {};
    if ($scope.logged_in) {
        $scope.project_id = $routeParams.id;
        $scope.ticket_id = $routeParams.ticket_id;
        params['comments'] = true;
        unfuddle.get('projects/' + $routeParams.id + '/tickets/' + $scope.ticket_id,
            params, 
            function(data) {
                $scope.ticket = data;
            }
        );
    }
    else {
        $location.path('login');
    }
});

myfuddleApp.run(function($rootScope) {
    $rootScope.logged_in = false;
});
