app.controller('logoutController', function($scope, $http, $route, $location, $localStorage, CommonFunctions, SiteNotifications) {
    //delete $localStorage.token;
    CommonFunctions.deleteToken(); 
    delete $localStorage.loggedin_user; //decoded token
    delete $localStorage.last_visited_user_id;
    delete $localStorage.last_visited_project_id;
    delete $localStorage.url_attempted;

    SiteNotifications.unSubscribeToNotifications();

    $localStorage.flash_message = "Logged out";
    $scope.$parent.flash_level = "alert";
    $location.path('/');
});