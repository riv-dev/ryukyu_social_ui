app.controller('editProjectPermissionsController', function($scope, $http, $location, $localStorage, $routeParams, CommonFunctions) {
    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage);


    if($localStorage.loggedin_user) {
        $scope.$parent.hero = "Edit Project";

        $scope.this_project_id = $routeParams.project_id;

        $scope.write_accesses = [
            {label: "Admin", level: 2},
            {label: "Write", level: 1},
            {label: "Read", level: 0}
        ];

        $scope.statuses = [
            "active",
            "inactive"
        ]

        $scope.back = function() {
            window.history.back();
        }

        //Get user name
        $http({
            method: 'GET',
            url: usersApiBaseURL + '/users/' + $routeParams.user_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.firstname = response.data.firstname;
            $scope.lastname = response.data.lastname;
        });

        //Get permission details to fill in the form
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/projects/' + $routeParams.project_id + '/users/' + $routeParams.user_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.role = response.data.role;
            $scope.status = response.data.status;
            $scope.write_access_level = parseInt(response.data.write_access);
        });

        $scope.put = function() {
            $http({
                method: 'PUT',
                url: projectsApiBaseURL + '/projects/' + $routeParams.project_id + '/users/' + $routeParams.user_id,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                data: {role: $scope.role, status: $scope.status, write_access: $scope.write_access_level}
            }).then(
                function successCallback(response) {
                    $localStorage.flash_message = "Successfully updated project permissions!";
                    $scope.$parent.flash_level = "success";
                    $location.path('./projects/'+$routeParams.project_id);
                },
                function errorCallback(response) {
                    $scope.$parent.flash_message = "Error editing project permissions.";
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