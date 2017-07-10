app.controller('editProjectController', function($scope, $http, $location, $localStorage, $routeParams, CommonFunctions) {
    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage);

    if($localStorage.loggedin_user) {
        $scope.$parent.hero = "Add Project";

        $scope.this_project_id = $routeParams.project_id;

        $scope.statuses = [
            "new",
            "doing",
            "finished"
        ];

        //Get the project details to fill in form defaults
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/projects/' + $routeParams.project_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.name = response.data.name;
            $scope.description = response.data.description;
            $scope.status = response.data.status;
            $scope.value = response.data.value;
            $scope.effort = response.data.effort;
        });

        $scope.put = function() {
            //Validate the date
            if($scope.project_form.deadline_input.$touched && !$scope.deadline) {
                $scope.$parent.flash_message = "Error editing project.";
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

            var deadlineMySQL = null;

            if($scope.deadline) {
                deadlineMySQL = CommonFunctions.formatDate($scope.deadline);
            }

            //Validate the date
            if($scope.project_form.start_date_input.$touched && !$scope.start_date) {
                $scope.$parent.flash_message = "Error editing project.";
                $scope.$parent.flash_level = "fail";
                $scope.errors = {}; 
                $scope.errors.start_date = ["Please select date and type in the time"];
                return;
            } else {
                $scope.$parent.flash_message = null;
                $scope.$parent.flash_level = null;
                $scope.errors = {};
                $scope.errors.start_date = [];
            }

            var start_dateMySQL = null;

            if($scope.start_date) {
                start_dateMySQL = CommonFunctions.formatDate($scope.start_date);
            }

            $http({
                method: 'PUT',
                url: projectsApiBaseURL + '/projects/' + $routeParams.project_id,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                data: {name: $scope.name, description: $scope.description, status: $scope.status, effort: $scope.effort, value: $scope.value, start_date: start_dateMySQL, deadline: deadlineMySQL} 
            }).then(
                function successCallback(response) {
                    $localStorage.flash_message = "Successfully edited project!";
                    $scope.$parent.flash_level = "success";
                    window.history.back();
                },
                function errorCallback(response) {
                    $scope.$parent.flash_message = "Error editing project.";
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