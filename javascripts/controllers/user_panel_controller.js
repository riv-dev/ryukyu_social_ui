app.controller('userPanelController', function($scope, $http, $location, $routeParams, $localStorage, CommonFunctions) {
    $scope.$parent.hero = "User Panel";
    $scope.$parent.panel_class = "user";

    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage);

    if($routeParams.project_id) {
        $scope.this_project_id = $routeParams.project_id;
    }

    $scope.this_user_id = $routeParams.user_id;

    $scope.prettyDateDeadline = function(isoDateStr, status) {
        if(moment() > moment(isoDateStr) && (status == "new" || status == "dump" || status=="waiting" || status == "doing")) {
            return "Past Due";
        } else {
            return moment(isoDateStr).calendar();
        }
    }

    $scope.prettyDate = function(isoDateStr) {
        return moment(isoDateStr).calendar();
    }

    $scope.back = function() {
        window.history.back();
    }

    $scope.showSettingsFlags = {
        tasks: false,
        projects: false
    }

    $scope.showHideSettingsClass = function(type) {
        if($scope.showSettingsFlags[type]) {
            return "show";
        } else {
            return "hide";
        }
    }

    $scope.toggleShowHideSettings = function(type) {
        if($scope.showSettingsFlags[type]) {
            $scope.showSettingsFlags[type] = false;
        } else {
            $scope.showSettingsFlags[type] = true;
        }
    }


    $scope.archivedClass = function(archived) {
        if(archived) {
            return "archived";
        } else {
            return null;
        }
    }

    $scope.getPriorityLabel = function(index) {
        var priorities = [
            "Not Important at All",
            "Slightly Important",
            "Important",
            "Fairly Important",
            "Very Important"
        ]

        if(index) {
            return priorities[index];
        } else {
            return null;
        }
    }

    $scope.tasks_filter_statuses = [
        "all",
        "dump",
        "waiting",
        "doing",
        "finished"
    ]

    $scope.projects_filter_statuses = [
        "all",
        "new",
        "doing",
        "finished"
    ]

    $scope.selected_tasks_status_filter = $scope.tasks_filter_statuses[0];
    $scope.selected_projects_status_filter = $scope.projects_filter_statuses[0];

    //Pagination variables and functions
    $scope.limits = ["5","10","15","20","all"];
    $scope.tasks_limit = $scope.limits[1];
    $scope.projects_limit = $scope.limits[1];

    $scope.tasks_current_page = 1;
    $scope.projects_current_page = 1;

    $scope.currentTasksPageClass = function(page) {
        if(page == $scope.tasks_current_page) {
            return "selected";
        } else {
            return "";
        }
    }

    $scope.currentProjectsPageClass = function(page) {
        if(page == $scope.projects_current_page) {
            return "selected";
        } else {
            return "";
        }
    }

    var createNumbersArray = function(num) {
        return new Array(num);   
    }
    //End pagination variables and functions

    $scope.checkPriorityImportance = function(priority) {
        if(priority > 2) {
            return "important";
        } else {
            return null;
        }
    }    

    $scope.checkDateImportance = function(date, status) {
        if(/today/i.test(moment(date).calendar())) {
            return "important";
        }
        else if(moment() > moment(date) && (status == "new" || status == "doing")) {
            return "important";
        } 
        else {
            return null;
        }
    }

    $scope.cssLast = function(isLast) {
        if(isLast) {
            return "last";
        }
    }

    $scope.delete_user = function() {
        var email = prompt("WARNING: This will completely delete the user from the system.  This is not the same as removing a user from a project.  Visit the project page and click the 'x' if you wish to only remove a user from a project. Type in user's email address to confirm delete.");
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

    $scope.getTasks = function(status,project_id,limit,page) {
        $scope.tasks_current_page = page;

        var queryStr = "";

        if(status && status != "all") {
            queryStr = "?status="+status;
        }

        var projectFilterBase = "";

        if(!isNaN(project_id) && project_id > 0) {
            console.log("Project ID: " + project_id);
            console.log("Limit : " + limit);
            projectFilterBase = '/projects/' + project_id;
        }

        var tasksCountURL = tasksApiBaseURL + projectFilterBase + '/users/' + $routeParams.user_id + '/tasks-count' + queryStr;

        //Get total tasks count first in order to calculate pagination parameters
        $http({
            method: 'GET',
            url: tasksCountURL,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.tasks_count = parseInt(response.data);

            //For pagination
            if(limit != "all" && $scope.tasks_count && $scope.tasks_count > 0) {
                var tasks_page_count = Math.ceil($scope.tasks_count / parseInt(limit));
                $scope.tasks_page_count_arr = createNumbersArray(tasks_page_count);
            } else {
                $scope.tasks_page_count_arr = createNumbersArray(1);
            }

            //Set the current page
            var pageInt = parseInt(page,10);
            if(pageInt) {
                if(pageInt <= 0) { //don't let pages go below zero
                    $scope.tasks_current_page = 1;
                } else if (pageInt > $scope.tasks_page_count_arr.length) { //don't let pages go past max pages
                    $scope.tasks_current_page = $scope.tasks_page_count_arr.length;
                } else {
                    $scope.tasks_current_page = pageInt;
                }
            } else {
                $scope.tasks_current_page = 1;
            }

            //Build the query string to get the tasks for the current page
            var queryArr = [];
            var queryStr = "";
            var queryStatus = null;
            var queryLimit = null;
            var queryPage = null;

            //Query to filter by status
            if(status && status != "all") {
                queryStatus = "status="+status;
                queryArr.push(queryStatus);
            }

            //Query for limiting results and pagination
            if(limit && limit != "all") {
                queryLimit = "limit="+limit;
                queryArr.push(queryLimit);
                queryPage = "page="+$scope.tasks_current_page;
                queryArr.push(queryPage);
            }

            if(queryArr.length > 0) {
                queryStr = "?" + queryArr.join("&");
            }

            var tasksURL = tasksApiBaseURL + projectFilterBase + '/users/' + $routeParams.user_id + '/tasks' + queryStr;

            //Get the user's tasks
            $http({
                method: 'GET',
                url: tasksURL,
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
        });
    } //End getTasks()

    $scope.getProjects = function(status,limit,page) {
        $scope.projects_current_page = page;

        var queryStr = "";

        if(status && status != "all") {
            queryStr = "?status="+status;
        }

        //Get total projects count first in order to calculate pagination parameters
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/users/' + $routeParams.user_id + '/projects-count' + queryStr,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.projects_count = parseInt(response.data);

            //For pagination
            if(limit != "all" && $scope.projects_count && $scope.projects_count > 0) {
                var projects_page_count = Math.ceil($scope.projects_count / parseInt(limit));
                $scope.projects_page_count_arr = createNumbersArray(projects_page_count);
            } else {
                $scope.projects_page_count_arr = createNumbersArray(1);
            }

            //Set the current page
            var pageInt = parseInt(page,10);
            if(pageInt) {
                if(pageInt <= 0) { //don't let pages go below zero
                    $scope.projects_current_page = 1;
                } else if (pageInt > $scope.projects_page_count_arr.length) { //don't let pages go past max pages
                    $scope.projects_current_page = $scope.projects_page_count_arr.length;
                } else {
                    $scope.projects_current_page = pageInt;
                }
            } else {
                $scope.projects_current_page = 1;
            }

            //Build the query string to get the projects for the current page
            var queryArr = [];
            var queryStr = "";
            var queryStatus = null;
            var queryLimit = null;
            var queryPage = null;

            //Query to filter by status
            if(status && status != "all") {
                queryStatus = "status="+status;
                queryArr.push(queryStatus);
            }

            //Query for limiting results and pagination
            if(limit && limit != "all") {
                queryLimit = "limit="+limit;
                queryArr.push(queryLimit);
                queryPage = "page="+$scope.projects_current_page;
                queryArr.push(queryPage);
            }

            if(queryArr.length > 0) {
                queryStr = "?" + queryArr.join("&");
            }

            //Get the user's projects
            $http({
                method: 'GET',
                url: projectsApiBaseURL + '/users/' + $routeParams.user_id + '/projects' + queryStr,
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

                    //Get the project's tasks, limit 3
                    $http({
                        method: 'GET',
                        url: tasksApiBaseURL + '/projects/'+current_project_id+'/tasks?limit=3',
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

                $scope.projects_filter = [{name: "all", project_id: 0}];
                $scope.projects_filter = $scope.projects_filter.concat($scope.projects);
                $scope.selected_project_id_filter = $scope.projects_filter[0];
            });
        });
    } //End getProjects()

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

        //Get the users projects
        $scope.getProjects($scope.selected_projects_status_filter, $scope.projects_limit, $scope.projects_current_page);

        //Get the users tasks
        $scope.getTasks($scope.selected_tasks_status_filter, $scope.selected_project_id_filter, $scope.tasks_limit, $scope.tasks_current_page);
    } 

});