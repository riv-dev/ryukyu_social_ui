app.controller('userPanelController', function($scope, $http, $location, $routeParams, $localStorage, CommonFunctions) {
    $scope.$parent.hero = "User Panel";
    $scope.$parent.panel_class = "user_panel";

    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage);

    $scope.prettyDate = function(isoDateStr) {
        return moment(isoDateStr).calendar();
    }

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

    $scope.delete_user = function() {
        var email = prompt("Type in user's email address to confirm delete.");
        if (email == $scope.this_user.email) {
            $http({
                method: 'DELETE',
                url: usersApiBaseURL + "/users/"+$routeParams.user_id,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(
            function successCallback(response) {
                $localStorage.flash_message = "Deleted user: " + $scope.this_user.email;
                $scope.$parent.flash_level = "alert";
                $location.path("/");
            },
            function errorCallback(response) { 
                $scope.$parent.flash_message = "Error deleting user.";
                $scope.$parent.flash_level = "fail";
            });     
        } else {
            $scope.$parent.flash_message = "Did not enter correct email address.  User not deleted.";
            $scope.$parent.flash_level = "fail";           
        }
    }

    if($localStorage.loggedin_user) {
        //Get user information
        $http({
            method: 'GET',
            url: usersApiBaseURL + '/users/' + $routeParams.user_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.this_user = response.data;

            $scope.this_user.status = "I'm feeling great today!";
            $scope.this_user.bio = "Hello, this is my bio.  This is where I talk about myself and my history.  Anything I like actually.  I like this and this and this.  Yup, that's right."

            $http({
                method: 'GET',
                url: userPhotosApiBaseURL + "/users/"+$routeParams.user_id+"/photo",
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(
            function successCallback(response) {
                $scope.this_user_photo = response.data;
                $scope.this_user_photo.uri = userPhotosApiBaseURL+"/users/"+$routeParams.user_id+"/photo.image";
            },
            function errorCallback(response) { 
                $scope.this_user_photo = {};
            });
        });

        //Get the user's projects
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/users/' + $routeParams.user_id + '/projects',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.projects = response.data;

            for(var i=0;i<response.data.length;i++) {
                var current_project = $scope.projects[i];
                //When grabbing user's projects, the "id" field is not the project_id.
                //"id" field is actually the id of the link between the user and the project.
                //Use the "project_id" field
                var current_project_id = current_project.project_id;

                $http({
                    method: 'GET',
                    url: projectsApiBaseURL + '/projects/'+current_project_id+'/users',
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    },
                    params: {
                        'i': i
                    }
                }).then(function (response) {
                    $scope.projects[parseInt(response.config["params"]["i"])]["users"] = response.data;

                    for(var j=0;j<response.data.length;j++) {
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
                            $scope.projects[i]["users"][j].firstname = response.data.firstname; 
                            $scope.projects[i]["users"][j].lastname = response.data.lastname; 
                        });                          
                    }
                });                    

                $http({
                    method: 'GET',
                    url: tasksApiBaseURL + '/projects/'+current_project_id+'/tasks',
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    },
                    params: {
                        'i': i
                    }
                }).then(function (response) {
                    $scope.projects[parseInt(response.config["params"]["i"])]["tasks"] = response.data;
                });                    
            }
        });

        //Get the user's tasks
        $http({
            method: 'GET',
            url: tasksApiBaseURL + '/users/' + $routeParams.user_id + '/tasks', //'/ranked-tasks',
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
                    url: tasksApiBaseURL + '/tasks/'+current_task.task_id+'/users',
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