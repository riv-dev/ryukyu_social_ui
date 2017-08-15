app.controller('editUserProfileController', function($scope, $http, $location, $localStorage, $routeParams, CommonFunctions) {
    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage, $location);


    if($localStorage.loggedin_user){
        $scope.$parent.hero = "Edit User Profile";
        $scope.this_user_id = $routeParams.user_id;

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
        if(response.data.user_id) {
            //Get the profile details to fill in form
            $scope.nickname = response.data.nickname;
            $scope.phone_number = response.data.phone_number;
            $scope.birthday = response.data.birthday;
            $scope.status = response.data.status;
            $scope.bio = response.data.bio;

            $scope.submit = function() {
                $http({
                    method: 'PUT',
                    url: userProfileApiBaseURL + '/users/' + $routeParams.user_id,
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    },
                    data: {
                        nickname: $scope.nickname, 
                        phone_number: $scope.phone_number, 
                        birthday: $scope.birthday, 
                        status: $scope.status, 
                        bio: $scope.bio
                    } 
                }).then(
                    function successCallback(response) {
                        $localStorage.flash_message = "User Profile Updated!";
                        $scope.$parent.flash_level = "success";
                        window.history.back();
                    },
                    function errorCallback(response) {
                        $scope.$parent.flash_message = "See errors";
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
        }else{
            $scope.nickname = null;
            $scope.phone_number = null;
            $scope.birthday = null;
            $scope.status = null;
            $scope.bio = null;

            $scope.submit = function() {
                $http({
                    method: 'POST',
                    url: userProfileApiBaseURL + '/users/' + $routeParams.user_id,
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    },
                    data: {
                        nickname: $scope.nickname, 
                        phone_number: $scope.phone_number, 
                        birthday: $scope.birthday, 
                        status: $scope.status, 
                        bio: $scope.bio
                    } 
                }).then(
                    function successCallback(response) {
                        $localStorage.flash_message = "User Profile Updated!";
                        $scope.$parent.flash_level = "success";
                        window.history.back();
                    },
                    function errorCallback(response) {
                        $scope.$parent.flash_message = "See errors";
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
        }
    });

        
    }else {
        $localStorage.flash_message = "Invalid Credentials";
        $scope.$parent.flash_level = "fail";
        $location.path('/');
    }
});