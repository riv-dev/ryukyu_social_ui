app.controller('newUserController', function($scope, $http, $location, $localStorage, CommonFunctions) {
    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage);

    if($localStorage.loggedin_user && $localStorage.loggedin_user.admin) {
        $scope.$parent.hero = "Add User";
        $scope.checkboxModel = {admin : 0};

        $scope.post = function() {
            $http({
                method: 'POST',
                url: usersApiBaseURL + '/users',
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                data: {firstname: $scope.firstname, lastname: $scope.lastname, title: $scope.title, email: $scope.email, password: $scope.password, admin: $scope.checkboxModel.admin}
            }).then(
                function successCallback(response) {
                    $localStorage.flash_message = "Successfully added user!";
                    $scope.$parent.flash_level = "success";
                    $location.path('/');
                },
                function errorCallback(response) {
                    $scope.$parent.flash_message = "Error adding user.";
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
        $scope.$parent.flash_level = "success";
        $location.path('/');
    }
});