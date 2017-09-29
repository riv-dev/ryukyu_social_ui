app.controller('groupPanelController', function($scope, $http, $window, $timeout, $routeParams, $location, $localStorage, $mdDialog, CommonFunctions) {
    var selected = null,
        previous = null;

    $scope.$parent.hero = "Group Panel";
    $scope.$parent.panel_class = "group";

    $scope.groups = {
        "projects":[],
        "users":[]
    };
    $scope.group_categories = [
        {title: "projects", content: $scope.groups.projects},
        {title: "users", content: $scope.groups.users}
    ];
    $scope.selectedIndex = 0;

    $scope.getItemName = function(item) {
        if (item.name) return item.name;
        return item.firstname + ' ' + item.lastname;
    }

    if($localStorage.loggedin_user) {
        $http({
            method: 'GET',
            url: groupsApiBaseURL + '/groups/' + $routeParams.group_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.group_info = response.data;
        });

        $http({
            method: 'GET',
            url: groupsApiBaseURL + '/group-assign/' + $routeParams.group_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            var groupAssignmentData = response.data,
                l = groupAssignmentData.length,
                arrAssignementIds = {};

            for (var i = 0; i < l; i++) {
                if (arrAssignementIds[groupAssignmentData[i]['item_type']] == undefined) {
                    arrAssignementIds[groupAssignmentData[i]['item_type']] = [];
                }
                arrAssignementIds[groupAssignmentData[i]['item_type']].push(groupAssignmentData[i]['item_id'])
            }

            $.each(arrAssignementIds, function( key, value ) {
                $http({
                    method: 'GET',
                    url: eval(key + 'ApiBaseURL') + '/' + key + '?ids=' + arrAssignementIds[key].join(","),
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    }
                }).then(function (response) {
                    var assignmentData = response.data,
                        l = assignmentData.length;
                    
                    for (var i = 0; i < l; i++) {
                        $scope.groups[key].push(assignmentData[i]);
                    }
                });
            });
        });
    }
});