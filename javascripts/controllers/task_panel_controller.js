app.controller('taskPanelController', function($scope, $http, $routeParams, $localStorage, CommonFunctions) {
    $scope.$parent.hero = "Task Panel";
    $scope.$parent.panel_class = "task_panel";



    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage);

    $scope.getPriorityLabel = function(index) {
        var priorities = [
            "Not Important at All",
            "Slightly Important",
            "Important",
            "Fairly Important",
            "Verty Important"
        ]

        if(index) {
            return priorities[index];
        } else {
            return null;
        }
    }

    $scope.cssLast = function(isLast) {
        if(isLast) {
            return "last";
        }
    }

    if($localStorage.loggedin_user) {
        //Get task information
        $http({
            method: 'GET',
            url: tasksApiBaseURL + '/tasks/' + $routeParams.task_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.this_task = response.data;

            //Get the project name assigned to the task
            if($scope.this_task.project_id) { 
                $http({
                    method: 'GET',
                    url: projectsApiBaseURL + '/projects/' + $scope.this_task.project_id,
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    }
                }).then(function (response) {
                    $scope.this_task.project_name = response.data.name;
                });
            }
        });

        //Get the task's users
        $http({
            method: 'GET',
            url: tasksApiBaseURL + '/tasks/' + $routeParams.task_id + '/users',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.users = response.data;

            for(var i=0;i<response.data.length;i++) {
                var current_user = $scope.users[i];
                //When grabbing project users, the "id" field is not the user_id.
                //"id" field is actually the id of the link between the project and the user
                //Use the "user_id" field
                var current_user_id = current_user.user_id;

                $http({
                    method: 'GET',
                    url: usersApiBaseURL + '/users/'+current_user_id,
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    },
                    params: {
                        'i': i
                    }
                }).then(function (response) {
                    $scope.users[parseInt(response.config["params"]["i"])]["firstname"] = response.data.firstname;
                    $scope.users[parseInt(response.config["params"]["i"])]["lastname"] = response.data.lastname;
                    $scope.users[parseInt(response.config["params"]["i"])]["title"] = response.data.title;
                });                    
            }
        });

    } 

});