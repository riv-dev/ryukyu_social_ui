app.controller('editUserProfileController', function($scope, $http, $location, $localStorage, $routeParams, CommonFunctions) {
    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage, $location);


    if($localStorage.loggedin_user && ($localStorage.loggedin_user.admin || $localStorage.loggedin_user.id == $routeParams.user_id)){
        $scope.$parent.hero = "Edit User Profile";
        $scope.this_user_id = $routeParams.user_id;

        $scope.back = function() {
            window.history.back();
        }
    
        
    //Get current user_profile
    $http({
        method: 'GET',
        url: userProfileApiBaseURL + '/users/' + $routeParams.user_id + '/profile',
        headers: {
            'x-access-token': CommonFunctions.getToken()
        },
    }).then(
        function successCallback(response) {
            //Get the profile details to fill in form
            $scope.nickname = response.data.nickname;
            $scope.phone_number = response.data.phone_number;
            $scope.status = response.data.status;
            $scope.bio = response.data.bio;

            if(response.data.birthday) {
                      $scope.birthday = moment(response.data.birthday).toDate();
            }

            $scope.submit = function() {
                $http({
                    method: 'PUT',
                    url: userProfileApiBaseURL + '/users/' + $routeParams.user_id + '/profile',
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    },
                    data: {
                        nickname: $scope.nickname, 
                        phone_number: $scope.phone_number, 
                        birthday: CommonFunctions.getDateTimeMoment($scope.birthday, null),
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
        },
        function errorCallback(response) {

            $scope.submit = function() {
                $http({
                    method: 'POST',
                    url: userProfileApiBaseURL + '/users/' + $routeParams.user_id + '/profile',
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    },
                    data: {
                        nickname: $scope.nickname, 
                        phone_number: $scope.phone_number, 
                        birthday: CommonFunctions.getDateTimeMoment($scope.birthday, null),
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
    )
    }else {
        $localStorage.flash_message = "Invalid Credentials";
        $scope.$parent.flash_level = "fail";
        $location.path('/');
    }
});