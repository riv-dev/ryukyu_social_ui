app.controller('loginController', function($scope, $http, $location, $localStorage, CommonFunctions) {
    $scope.$parent.hero = "Log In";

    CommonFunctions.setFlashMessage($scope, $localStorage);

    $scope.post_authenticate = function() {
        $http({
            method: 'POST',
            url: usersApiBaseURL + '/users/authenticate',
            data: {email: $scope.email, password: $scope.password}
        }).then(
            function successCallback(response) {
                if(response.data.status == "success") {
                    $localStorage.flash_message = "Successful Login!";
                    $scope.$parent.flash_level = "success";
                    CommonFunctions.setToken(response.data.token);
                    if($localStorage.url_attempted) {
                        $location.path($localStorage.url_attempted);
                    } else {
                        $location.path('/');
                    }
                } else {
                    $scope.$parent.flash_message = "Invalid Credentials";
                    $scope.$parent.flash_level = "fail";
                }
            },
            function errorCallback(response) {
                $scope.$parent.flash_message = "Invalid Credentials";
                $scope.$parent.flash_level = "fail";
            }
        );
    };
});