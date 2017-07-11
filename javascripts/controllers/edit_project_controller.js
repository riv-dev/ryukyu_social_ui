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
            $scope.start_date = moment(response.data.start_date).toDate();
            $scope.deadline = moment(response.data.deadline).toDate();
        });

        $scope.put = function() {
            $http({
                method: 'PUT',
                url: projectsApiBaseURL + '/projects/' + $routeParams.project_id,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                data: {name: $scope.name, description: $scope.description, status: $scope.status, effort: $scope.effort, value: $scope.value, start_date: moment($scope.start_date).format(), deadline: moment($scope.deadline).format()} 
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