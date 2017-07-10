app.controller('editUserController', function($scope, $http, $location, $localStorage, $routeParams, CommonFunctions) {
    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage);

    $scope.not_admin = function() {
        if($localStorage.loggedin_user && $localStorage.loggedin_user.admin) {
            return false;
        } else {
            return true;
        }
    }

    //Only admin can edit user information
    //User's can only edit their user profile, which is in a different microservice
    if($localStorage.loggedin_user && ($localStorage.loggedin_user.admin || $localStorage.loggedin_user.id == $routeParams.user_id)) {
        $scope.$parent.hero = "Edit User";
        $scope.checkboxModel = {admin : 0};
        $scope.this_user_id = $routeParams.user_id;

        //Get the task details to fill in form defaults
        $http({
            method: 'GET',
            url: usersApiBaseURL + '/users/' + $routeParams.user_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.firstname = response.data.firstname;
            $scope.lastname = response.data.lastname;
            $scope.title = response.data.title;
            $scope.email = response.data.email;
            $scope.checkboxModel.admin = response.data.admin;
        });

        $scope.put = function() {

            if($scope.not_admin()) {
                $http({
                    method: 'PUT',
                    url: usersApiBaseURL + '/users/' + $routeParams.user_id + '/password',
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    },
                    data: {password: $scope.password}
                }).then(
                    function successCallback(response) {
                        $localStorage.flash_message = "Successfully updated password!";
                        $scope.$parent.flash_level = "success";
                        window.history.back();
                    },
                    function errorCallback(response) {
                        $scope.$parent.flash_message = "Error updating password.";
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
            } else {
                $http({
                    method: 'PUT',
                    url: usersApiBaseURL + '/users/' + $routeParams.user_id,
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    },
                    data: {firstname: $scope.firstname, lastname: $scope.lastname, title: $scope.title, email: $scope.email, password: $scope.password, admin: $scope.checkboxModel.admin}
                }).then(
                    function successCallback(response) {
                        $localStorage.flash_message = "Successfully edited user!";
                        $scope.$parent.flash_level = "success";
                        window.history.back();
                    },
                    function errorCallback(response) {
                        $scope.$parent.flash_message = "Error editing user.";
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
            }
        };
    } else {
        $localStorage.flash_message = "Invalid Credentials";
        $scope.$parent.flash_level = "success";
        $location.path('/');
    }
});