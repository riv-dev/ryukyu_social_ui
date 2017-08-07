app.controller('editTaskController', function($scope, $http, $location, $localStorage, $routeParams, CommonFunctions) {
    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage, $location);

    if($localStorage.loggedin_user) {
        $scope.$parent.hero = "Edit Task";

        $scope.this_task_id = $routeParams.task_id;

        $scope.checkboxModel = {archived: 0};

        $scope.back = function() {
            window.history.back();
        }

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
            if(response.data.deadline) {
                $scope.deadline_date = moment(response.data.deadline).toDate();
                $scope.deadline_time = moment(response.data.deadline).toDate();
            }
            $scope.checkboxModel.archived = response.data.archived;
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
            console.log(moment($scope.deadline).format());
            $http({
                method: 'PUT',
                url: tasksApiBaseURL + '/tasks/' + $routeParams.task_id,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                data: {
                    name: $scope.name, 
                    description: $scope.description, 
                    priority: $scope.priority_level, 
                    status: $scope.status, 
                    deadline: CommonFunctions.getDateTimeMoment($scope.deadline_date,$scope.deadline_time),
                    project_id: $scope.project_id, 
                    archived: $scope.checkboxModel.archived
                } 
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