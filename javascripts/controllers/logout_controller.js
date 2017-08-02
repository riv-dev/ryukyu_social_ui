app.controller('logoutController', function($scope, $http, $route, $location, $localStorage, CommonFunctions) {
    //delete $localStorage.token;
    CommonFunctions.deleteToken(); 
    delete $localStorage.loggedin_user; //decoded token
    delete $localStorage.last_visited_user_id;
    delete $localStorage.last_visited_project_id;
    $localStorage.flash_message = "Logged out";
    $scope.$parent.flash_level = "alert";
    $location.path('/');
});