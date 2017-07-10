app.controller('editTaskController', function($scope, $http, $location, $localStorage, $routeParams, CommonFunctions) {
    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage);

    var mysqlTimeStampToDate = function (timestamp) {
      //function parses mysql datetime string and returns javascript Date object
      //input has to be in this format: 2007-06-05 15:26:02
      var regex=/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
      var parts=timestamp.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
      return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
    }

    if($localStorage.loggedin_user) {
        $scope.$parent.hero = "Edit Task";

        $scope.this_task_id = $routeParams.task_id;

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

        //Get the task details to fill in form defaults
        $http({
            method: 'GET',
            url: tasksApiBaseURL + '/tasks/' + $routeParams.task_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.name = response.data.name;
            $scope.description = response.data.description;
            $scope.priority_level = response.data.priority;
            $scope.status = response.data.status;
            $scope.project_id = response.data.project_id;
        });

        //Get all projects 
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/projects',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.projects = response.data;
        });

        $scope.put = function() {
            //Validate the date
            if($scope.task_form.deadline_input.$touched && !$scope.deadline) {
                $scope.$parent.flash_message = "Error editing task.";
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
                method: 'PUT',
                url: tasksApiBaseURL + '/tasks/' + $routeParams.task_id,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                data: {name: $scope.name, description: $scope.description, priority: $scope.priority_level, status: $scope.status, deadline: mysqlDate, project_id: $scope.project_id} 
            }).then(
                function successCallback(response) {
                    $localStorage.flash_message = "Successfully updated task!";
                    $scope.$parent.flash_level = "success";
                    window.history.back();
                },
                function errorCallback(response) {
                    $scope.$parent.flash_message = "Error editing task.";
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