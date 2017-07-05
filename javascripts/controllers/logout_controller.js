app.controller('logoutController', function($scope, $http, $route, $location, $localStorage, CommonFunctions) {
    //delete $localStorage.token;
    CommonFunctions.deleteToken(); 
    delete $localStorage.loggedin_user; //decoded token
    $localStorage.flash_message = "Logged out";
    $scope.$parent.flash_level = "alert";
    $location.path('/');
});