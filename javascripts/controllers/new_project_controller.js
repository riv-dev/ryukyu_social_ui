app.controller('newProjectController', function($scope, $http, $location, $routeParams, $localStorage, CommonFunctions) {
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

        $scope.back = function() {
            window.history.back();
        }

        $scope.post = function() {
            $http({
                method: 'POST',
                url: projectsApiBaseURL + '/projects',
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                data: {name: $scope.name, description: $scope.description, status: $scope.status, effort: $scope.effort, value: $scope.value, start_date: moment($scope.start_date).format(), deadline: moment($scope.deadline).format()} 
            }).then(
                function successCallback(response) {
                    $localStorage.flash_message = "Successfully added project!";
                    $scope.$parent.flash_level = "success";
                    window.history.back();
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