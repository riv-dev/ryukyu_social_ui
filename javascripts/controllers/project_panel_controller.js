app.controller('projectPanelController', function($scope, $http, $routeParams, $localStorage, CommonFunctions) {
    $scope.$parent.hero = "Project Panel";
    $scope.$parent.panel_class = "project";

    if($localStorage.last_visited_project_id == null || $localStorage.last_visited_project_id != $routeParams.project_id) {
        //clear all settings
        $localStorage.project_panel_selected_projects_tab = null; 
        $localStorage.project_panel_projects_limit = null;
        $localStorage.project_panel_projects_current_page = null;
        $localStorage.project_panel_selected_tasks_tab = null;
        $localStorage.project_panel_selected_project_id_filter = null; 
        $localStorage.project_panel_tasks_limit = null;
        $localStorage.project_panel_tasks_current_page = null;
    } 

    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage);

    if($routeParams.user_id) {
        $scope.this_user_id = $routeParams.user_id;
    }

    $scope.this_project_id = $routeParams.project_id;
    $localStorage.last_visited_project_id = $routeParams.project_id;

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

    $scope.showSettingsFlags = {
        tasks: false,
        projects: false
    }

    $scope.back = function() {
        window.history.back();
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
        else if(moment() > moment(date) && (status == "dump" || status == "new" || status == "waiting" || status == "doing")) {
            return "important";
        } 
        else {
            return null;
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

    $scope.getTaskID = function(task) {
        //For inner join searches use task.task_id
        if(task.task_id) {
            return task.task_id;
        } else {
        //For regular searches use task.id
            return task.id;
        }
    }

    $scope.selectedClass = function(selected_name, check_name) {
        if(selected_name == check_name) {
            return "selected";
        } else {
            return "";
        }
    }

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

    $scope.assign_user = function() {
        //Get project information
        $http({
            method: 'POST',
            url: projectsApiBaseURL + '/projects/' + $routeParams.project_id + '/users',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: {user_id: $scope.selected_user_id}
        }).then(function (response) {
            //Refresh assigned users
            get_project_users();
        });        
    }

    var get_project_users = function() {
        //Get the project's users
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/projects/' + $routeParams.project_id + '/users',
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
                });                    
            }

            $scope.users_filter = [{firstname: "all", lastname: "", user_id: 0}];
            $scope.users_filter = $scope.users_filter.concat($scope.assigned_users);
            $scope.selected_user_id_filter = $scope.users_filter[0];
        });
    }

    $scope.remove_project = function() {
        var answer = prompt('Type in project name "' + $scope.this_project.name + '" to confirm delete (case-sensitive).');         
        
        if(answer == $scope.this_project.name) {
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
        } else {
            $scope.$parent.flash_message = 'Did not type "'+ $scope.this_project.name + '".  Project not deleted';
            $scope.$parent.flash_level = 'fail';
        }
    }

    $scope.remove_user = function(user) {
        var answer = prompt('Remove ' + user.firstname + " " + user.lastname + ' from this project?  Type "yes" to confirm');
        if(answer == "yes") {
            //(this) is equivalent to ($scope) inside the function
            $http({
                method: 'DELETE',
                url: projectsApiBaseURL + '/projects/' + $routeParams.project_id + '/users/' +  user.user_id,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(function (response) {
                $scope.$parent.flash_message = "Removed " + user.firstname + " " + user.lastname + " from this project";
                $scope.$parent.flash_level = "alert";
                //Refresh assigned users
                get_project_users();
            });      
        } else {
            $scope.$parent.flash_message = 'Did not type "yes". ' + user.firstname + " " + user.lastname + " not removed from the project.";
            $scope.$parent.flash_level = "fail";
        }
    }

    $scope.getTasks = function(status,user_id,limit,page) {
        //Save/Default setting
        if(!status || status == null || status == undefined) {
            $scope.selected_tasks_tab = "doing";
            $localStorage.project_panel_selected_tasks_tab = $scope.selected_tasks_tab;
            status = $scope.selected_tasks_tab;
        } else {
            $localStorage.project_panel_selected_tasks_tab = status;
            $scope.selected_tasks_tab = status;
        }

        if(!limit || limit == null || limit == undefined) {
            $scope.tasks_limit = $scope.limits[1];
            $localStorage.project_panel_tasks_limit = $scope.tasks_limit;
            limit = $scope.tasks_limit;
        } else {
            $localStorage.project_panel_tasks_limit = limit;
            $scope.tasks_limit = limit;
        }

        if(!page || page == null || page == undefined) {
            $scope.tasks_current_page = 1;
            $localStorage.project_panel_tasks_current_page = $scope.tasks_current_page;
            page = $scope.tasks_current_page;
        } else {
            $localStorage.project_panel_tasks_current_page = page;
            $scope.tasks_current_page = page;
        }

        if(!user_id || user_id == null || user_id == undefined) {
            $localStorage.project_panel_selected_user_id_filter = $scope.selected_user_id_filter;
            user_id = $scope.selected_user_id_filter;
        } else {
            $scope.selected_user_id_filter = user_id;
            $localStorage.project_panel_selected_user_id_filter = user_id;
        }

        var queryStr = "?status="+status;

        var userFilterBase = "";

        if(!isNaN(user_id) && user_id > 0) {
            console.log("User ID: " + user_id);
            console.log("Limit : " + limit);
            userFilterBase = '/users/' + user_id;
        }

        var tasksCountURL = tasksApiBaseURL + userFilterBase + '/projects/' + $routeParams.project_id + '/tasks-count' + queryStr;

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

            var tasksURL = tasksApiBaseURL + userFilterBase + '/projects/' + $routeParams.project_id + '/tasks' + queryStr;

            //Get the project's tasks
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
                        url: tasksApiBaseURL + '/tasks/'+$scope.getTaskID(current_task)+'/users',
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

    if($localStorage.loggedin_user) {
        //Get permissions information
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/projects/' + $routeParams.project_id + '/users/' + $localStorage.loggedin_user.id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function(response) {
            if(response.data.write_access) {
                $scope.this_user_write_access = response.data.write_access;
            } else {
                $scope.this_user_write_access = 0;
            }
        });

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
        $scope.getTasks($localStorage.project_panel_selected_tasks_tab, $localStorage.project_panel_selected_user_id_filter, $localStorage.project_panel_tasks_limit, $localStorage.project_panel_tasks_current_page);

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