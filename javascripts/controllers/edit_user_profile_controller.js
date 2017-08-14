app.controller('editUserProfileController', function($scope, $http, $location, $localStorage, $routeParams, CommonFunctions) {
    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage, $location);

    $scope.not_admin = function() {
        if($localStorage.loggedin_user && $localStorage.loggedin_user.admin) {
            return false;
        } else {
            return true;
        }
    }
    //Only admin can edit user information
    //User's can only edit their user profile, which is in a different microservice
});