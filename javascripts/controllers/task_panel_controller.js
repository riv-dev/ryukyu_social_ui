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

    $scope.getFullName = function(user) {
        if(user.title) {
            return user.firstname + " " + user.lastname + " (" + user.title + ")";
        } else {
            return user.firstname + " " + user.lastname;
        }
    }

    $scope.is_mine_class = function(user) {
        if($localStorage.loggedin_user.id == user.user_id) {
            return "is_mine";
        } else {
            return null;
        }
    }

    var get_task_details = function() {
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
    }

    var get_users_assigned_to_task = function() {
        //Get the task's users
        $http({
            method: 'GET',
            url: tasksApiBaseURL + '/tasks/' + $routeParams.task_id + '/users',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.assigned_users = response.data;

            for(var i=0;i<response.data.length;i++) {
                var current_user = $scope.assigned_users[i];
                //When grabbing project users, the "id" field is not the user_id.
                //"id" field is actually the id of the link between the project and the user
                //Use the "user_id" field
                var current_user_id = current_user.user_id;

                if($localStorage.loggedin_user.id == current_user_id) {
                    $scope.my_progress_description = current_user.progress_description;
                }

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
                    $scope.assigned_users[parseInt(response.config["params"]["i"])]["firstname"] = response.data.firstname;
                    $scope.assigned_users[parseInt(response.config["params"]["i"])]["lastname"] = response.data.lastname;
                    $scope.assigned_users[parseInt(response.config["params"]["i"])]["title"] = response.data.title;
                });                    
            }
        });        
    }

    $scope.assign_user = function() {
        //Get task information
        $http({
            method: 'POST',
            url: tasksApiBaseURL + '/tasks/' + $routeParams.task_id + '/users/' + $scope.selected_user_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            //Refresh assigned users
            get_users_assigned_to_task();
        });        
    }

    $scope.update_progress = function() {
        //(this) is equivalent to ($scope) inside the function
        $http({
            method: 'PUT',
            url: tasksApiBaseURL + '/users/' + $localStorage.loggedin_user.id + '/tasks/' +  $routeParams.task_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: {progress_description: this.my_progress_description}
        }).then(function (response) {
            //Refresh assigned users
            get_users_assigned_to_task();
        });                
    }

    $scope.remove_task = function() {
        //(this) is equivalent to ($scope) inside the function
        $http({
            method: 'DELETE',
            url: tasksApiBaseURL + '/tasks/' + $routeParams.task_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            //Refresh assigned users
            $localStorage.flash_message = "Deleted Task: " + $scope.this_task.name;
            $scope.$parent.flash_level = "alert";
            window.history.back();
        });          
    }

    $scope.remove_user = function(user) {
        //(this) is equivalent to ($scope) inside the function
        $http({
            method: 'DELETE',
            url: tasksApiBaseURL + '/users/' + user.user_id + '/tasks/' +  $routeParams.task_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            //Refresh assigned users
            get_users_assigned_to_task();
        });      
    }

    if($localStorage.loggedin_user) {
        //Get task information
        get_task_details();

        //Get the user's assigned to the task
        get_users_assigned_to_task();

        //Get all users for assigning new users
        $http({
            method: 'GET',
            url: usersApiBaseURL + '/users',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.users = response.data;
        });


    } 

});