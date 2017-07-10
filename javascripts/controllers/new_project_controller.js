app.controller('newProjectController', function($scope, $http, $location, $localStorage, CommonFunctions) {
    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage);

    if($localStorage.loggedin_user) {
        $scope.$parent.hero = "Add Project";

        $scope.statuses = [
            "new",
            "doing",
            "finished"
        ];

        $scope.status = $scope.statuses[0];
        $scope.user_id = null;

        $scope.post = function() {
            //Validate the date
            if($scope.project_form.deadline_input.$touched && !$scope.deadline) {
                $scope.$parent.flash_message = "Error adding project.";
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
                $scope.$parent.flash_message = "Error adding project.";
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
                method: 'POST',
                url: projectsApiBaseURL + '/projects',
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                data: {name: $scope.name, description: $scope.description, status: $scope.status, effort: $scope.effort, value: $scope.value, start_date: start_dateMySQL, deadline: deadlineMySQL} 
            }).then(
                function successCallback(response) {
                    $localStorage.flash_message = "Successfully added project!";
                    $scope.$parent.flash_level = "success";
                    $location.path('/');
                },
                function errorCallback(response) {
                    $scope.$parent.flash_message = "Error adding project.";
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