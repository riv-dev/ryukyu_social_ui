app.controller('newTaskController', function($scope, $http, $location, $localStorage, $routeParams, CommonFunctions) {
    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage);

    if($localStorage.loggedin_user) {
        $scope.$parent.hero = "Add Task";

        $scope.priorities = [
            {label: "Very Important", level: 4},
            {label: "Fairly Important", level: 3},
            {label: "Important", level: 2},
            {label: "Slighly Important", level: 1},
            {label: "Not at all Important", level: 0}
        ];

        $scope.statuses = [
            "new",
            "doing",
            "finished"
        ]

        $scope.status = $scope.statuses[0];
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
            //Validate the date
            if($scope.task_form.deadline_input.$touched && !$scope.deadline) {
                $scope.$parent.flash_message = "Error adding task.";
                $scope.$parent.flash_level = "fail";
                $scope.errors = {}; 
                $scope.errors.deadline = ["Please select date and type in the time"];
                return;
            } else {
                $scope.$parent.flash_message = null;
                $scope.$parent.flash_level = null;
                $scope.errors = {};
                $scope.errors.deadline = [];
            }

            var mysqlDate = null;

            if($scope.deadline) {
                mysqlDate = CommonFunctions.formatDate($scope.deadline);
            }

            $http({
                method: 'POST',
                url: tasksApiBaseURL + '/tasks',
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                data: {name: $scope.name, description: $scope.description, priority: $scope.priority_level, status: $scope.status, deadline: mysqlDate, project_id: $scope.project_id} 
            }).then(
                function successCallback(response) {
                    $localStorage.flash_message = "Successfully added task!";
                    $scope.$parent.flash_level = "success";
                    window.history.back();
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