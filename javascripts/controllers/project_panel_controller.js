app.controller('projectPanelController', function($scope, $http, $routeParams, $localStorage, CommonFunctions) {
    $scope.$parent.hero = "Project Panel";
    $scope.$parent.panel_class = "project_panel";

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

    $scope.assign_user = function() {
        //Get project information
        $http({
            method: 'POST',
            url: projectsApiBaseURL + '/projects/' + $routeParams.project_id + '/users/' + $scope.selected_user_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            //Refresh assigned users
            get_project_users();
        });        
    }

    $scope.get_project_users = function() {
        //Get the project's users
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/projects/' + $routeParams.project_id + '/users',
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
                });                    
            }
        });
    }

    $scope.remove_project = function() {
        //(this) is equivalent to ($scope) inside the function
        $http({
            method: 'DELETE',
            url: projectsApiBaseURL + '/projects/' + $routeParams.project_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            //Refresh assigned users
            $localStorage.flash_message = "Deleted Project: " + $scope.this_project.name;
            $scope.$parent.flash_level = "alert";
            window.history.back();
        });          
    }

    $scope.remove_user = function(user) {
        //(this) is equivalent to ($scope) inside the function
        $http({
            method: 'DELETE',
            url: projectsApiBaseURL + '/projects/' + $routeParams.project_id + '/users/' +  user.user_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            //Refresh assigned users
            get_project_users();
        });      
    }

    if($localStorage.loggedin_user) {
        //Get project information
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/projects/' + $routeParams.project_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.this_project = response.data;
            $scope.this_project_photo = {};
            $scope.this_project_photo.uri = "./images/default_project.png";
            $scope.this_project_photo.caption = "Todo project photo microservice";
        });


        get_project_users();

        //Get the project's tasks
        $http({
            method: 'GET',
            url: tasksApiBaseURL + '/projects/' + $routeParams.project_id + '/tasks', //'/ranked-tasks',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.tasks = response.data;

            for(var i=0;i<$scope.tasks.length;i++) {
                var current_task = $scope.tasks[i];
                var current_project_id = current_task.project_id;

                //Get the project name
                if(current_project_id) {
                    $http({
                        method: 'GET',
                        url: projectsApiBaseURL + '/projects/'+current_project_id,
                        headers: {
                            'x-access-token': CommonFunctions.getToken()
                        },
                        params: {
                            'i': i
                        }
                    }).then(function (response) {
                        var current_project = response.data;
                        $scope.tasks[parseInt(response.config["params"]["i"])]["project_name"] = current_project.name;
                    });                    
                }

                //Get all users on the current task
                $http({
                    method: 'GET',
                    url: tasksApiBaseURL + '/tasks/'+current_task.id+'/users',
                    headers: {
                       'x-access-token': CommonFunctions.getToken()
                    },
                    params: {
                       'i': i
                    }
                }).then(function (response) {
                    $scope.tasks[parseInt(response.config["params"]["i"])]["users"] = response.data

                    for(var j=0;j<response.data.length;j++) {
                        if($routeParams.user_id == response.data[j]["user_id"]) {
                            $scope.this_task_user = response.data[j];
                        }

                        $http({
                            method: 'GET',
                            url: usersApiBaseURL + '/users/'+response.data[j]["user_id"],
                            headers: {
                                'x-access-token': CommonFunctions.getToken()
                            },
                            params: {
                                'i': response.config["params"]["i"],
                                'j': j
                            }
                        }).then(function (response) {
                            var i = parseInt(response.config["params"]["i"]);
                            var j = parseInt(response.config["params"]["j"]);
                            $scope.tasks[i]["users"][j].firstname = response.data.firstname; 
                            $scope.tasks[i]["users"][j].lastname = response.data.lastname; 
                        });                          
                    }

                });                   
            }
        });        
    } 

});