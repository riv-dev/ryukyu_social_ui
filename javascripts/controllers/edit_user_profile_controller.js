app.controller('editUserProfileController', function($scope, $http, $location, $localStorage, $routeParams, CommonFunctions) {
    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage, $location);

    $scope.back = function() {
        window.history.back();
    }
    //Get current user_profile
    $http({
        method: 'GET',
        url: userProfileApiBaseURL + '/users/' + $routeParams.user_id,
        headers: {
            'x-access-token': CommonFunctions.getToken()
        },
    }).then(function (response) {
        $scope.nickname = response.data.nickname;
        $scope.phone_number = response.data.phone_number;
        $scope.birthday = response.data.birthday;
        $scope.status = response.data.status;
        $scope.bio = response.data.bio;

        
        if($routeParams.project_id) {
            $scope.project_id = parseInt($routeParams.project_id);
        }
    });

    $scope.put = function(){
        if ($scope.not_exist()){
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
        }
    }
});