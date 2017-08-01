app.controller('newTaskController', function($scope, $http, $location, $localStorage, $routeParams, CommonFunctions) {
    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage);

    if($localStorage.loggedin_user) {
        $scope.$parent.hero = "Add Task";

        $scope.priorities = [
            {label: "Very Important", level: 4},
            {label: "Fairly Important", level: 3},
            {label: "Important", level: 2},
            {label: "Slightly Important", level: 1},
            {label: "Not at all Important", level: 0}
        ];

        $scope.statuses = [
            "dump",
            "waiting",
            "doing",
            "finished"
        ]

        $scope.status = $location.search().status;
        $scope.user_id = null;

        $scope.project_defined = function() {
            if($routeParams.project_id) {
                return true;
            } else {
                return null;
            }
        }

        $scope.back = function() {
            window.history.back();
        }

        //Get all projects 
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/projects',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.projects = response.data;

            //Set the project for this task if it is defined in the route
            if($routeParams.project_id) {
                $scope.project_id = parseInt($routeParams.project_id);
            }
        });

        $scope.post = function() {
            $http({
                method: 'POST',
                url: tasksApiBaseURL + '/tasks',
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                data: {
                    name: $scope.name, 
                    description: $scope.description, 
                    priority: $scope.priority_level, 
                    status: $scope.status, 
                    deadline: CommonFunctions.getDateTimeMoment($scope.deadline_date,$scope.deadline_time),
                    project_id: $scope.project_id
                } 
            }).then(
                function successCallback(response) {
                    //if a user_id exists, add user to the task
                    if($routeParams.user_id) {
                        $http({
                        method: 'POST',
                        url: tasksApiBaseURL + '/tasks/' + response.data.task_id + '/users/' + $routeParams.user_id,
                        headers: {
                            'x-access-token': CommonFunctions.getToken()
                        }
                        }).then(
                            function successCallback(response) {
                                $localStorage.flash_message = "Successfully added task for user!";
                                $scope.flash_level = "success";
                                $location.path('./users/'+$routeParams.user_id);
                            },
                            function errorCallback(response) {
                                $scope.flash_message = "Error adding task for user.";
                                $scope.flash_level = "fail";
                                $scope.errors = {};
                                var responseError;
                                for (var i=0; i < response.data.errors.length; i++) {
                                    responseError = response.data.errors[i];
                                    if(responseError.hasOwnProperty('param')) {
                                        if(!$scope.errors[responseError['param']]) {
                                            $scope.errors[responseError['param']] = [];
                                        }
                                        $scope.errors[responseError['param']].push(responseError['msg']);
                                    }
                                }
                            }
                        );
                    } else {
                        $localStorage.flash_message = "Successfully added task!";
                        $scope.$parent.flash_level = "success";
                        window.history.back();
                    }
                },
                function errorCallback(response) {
                    $scope.$parent.flash_message = "Error adding task.";
                    $scope.$parent.flash_level = "fail";
                    $scope.errors = {};
                    var responseError;
                    for (var i=0; i < response.data.errors.length; i++) {
                        responseError = response.data.errors[i];
                        if(responseError.hasOwnProperty('param')) {
                            if(!$scope.errors[responseError['param']]) {
                                $scope.errors[responseError['param']] = [];
                            }
                            $scope.errors[responseError['param']].push(responseError['msg']);
                        }
                    }
                }
            );
        };
    } else {
        $localStorage.flash_message = "Invalid Credentials";
        $scope.$parent.flash_level = "fail";
        $location.path('/');
    }
});