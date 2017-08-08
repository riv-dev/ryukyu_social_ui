app.controller('homePanelController', function($scope, $http, $location, $localStorage, CommonFunctions) {
    $scope.$parent.hero = "Home Panel";
    $scope.$parent.panel_class = "home";

    if($localStorage.flash_message == "Successful Login!") { 
        //clear all settings
        $localStorage.selected_projects_tab = null; 
        $localStorage.projects_limit = null;
        $localStorage.projects_current_page = null;
        $localStorage.selected_tasks_tab = null;
        $localStorage.tasks_limit = null;
        $localStorage.tasks_current_page = null;
        delete $localStorage.tasks_maximized;
    } 

    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage, $location);

    if(!$localStorage.hasOwnProperty('tasks_maximized')) {
        $localStorage.tasks_maximized = true;
    }

    $scope.tasksMinMaxButtonClass = function() {
        if($localStorage.tasks_maximized) {
            return "minimize";
        } else {
            return "maximize";
        }
    }

    $scope.tasksMinMaxSectionClass = function() {
        if($localStorage.tasks_maximized) {
            return "maximized";
        } else {
            return "minimized";
        }
    }

    $scope.projectsMinMaxSectionClass = function() {
        if($localStorage.tasks_maximized) {
            return "compact";
        } else {
            return "full";
        }
    }

    $scope.minMaxTasksSection = function() {
        if($localStorage.tasks_maximized) {
            $localStorage.tasks_maximized = false;
        } else {
            $localStorage.tasks_maximized = true;
        }
    }



    $scope.prettyDateDeadline = function(isoDateStr, status) {
        if(moment() > moment(isoDateStr) && (status == "dump" || status=="waiting" || status == "doing")) {
            return "Past Due";
        } else {
            return moment(isoDateStr).calendar();
        }
    }

    $scope.userInitials = function (user) {
        return user.firstname.charAt(0).toUpperCase() + user.lastname.charAt(0).toUpperCase();
    }

    $scope.tasksCountCSS = function(count) {
        if(count == 0) {
            return "alert";
        }
    }

    $scope.tasksCountCSSNice = function(count) {
        if(count > 10) {
            return "success";
        }
    }

    $scope.prettyDate = function(isoDateStr) {
        return moment(isoDateStr).calendar();
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


    //Pagination variables and functions
    $scope.limits = ["5","10","15","20","all"];

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
        else if(moment() > moment(date) && (status == "dump" || status == "waiting" || status == "doing")) {
            return "important";
        } 
        else {
            return null;
        }
    }

    $scope.selectedClass = function(selected_name, check_name) {
        if(selected_name == check_name) {
            return "selected";
        } else {
            return "";
        }
    }

    $scope.getTasks = function(status,limit,page) {
        //Save/Default settings
        if(!status || status == null || status == undefined) {
            $scope.selected_tasks_tab = "doing";
            $localStorage.selected_tasks_tab = $scope.selected_tasks_tab;
            status = $scope.selected_tasks_tab;
        } else {
            $localStorage.selected_tasks_tab = status;
            $scope.selected_tasks_tab = status;
        }

        if(!limit || limit == null || limit == undefined) {
            $scope.tasks_limit = $scope.limits[1];
            $localStorage.tasks_limit = $scope.tasks_limit;
            limit = $scope.tasks_limit;
        } else {
            $localStorage.tasks_limit = limit;
            $scope.tasks_limit = limit;
        }

        if(!page || page == null || page == undefined) {
            $scope.tasks_current_page = 1;
            $localStorage.tasks_current_page = $scope.tasks_current_page;
            page = $scope.tasks_current_page;
        } else {
            $localStorage.tasks_current_page = page;
            $scope.tasks_current_page = page;
        }

        var queryStr = "?status="+status;

        //Get total tasks count first in order to calculate pagination parameters
        $http({
            method: 'GET',
            url: tasksApiBaseURL + '/tasks-count' + queryStr,
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

            //Get tasks list        
            $http({
                method: 'GET',
                url: tasksApiBaseURL + '/tasks' + queryStr, //'/ranked-tasks',
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
    }//End getTasks()

    $scope.getProjects = function(status,limit,page) {
        //Save/default settings
        if(!status || status == null || status == undefined) {
            $scope.selected_projects_tab = "doing";
            $localStorage.selected_projects_tab = $scope.selected_projects_tab;
            status = $scope.selected_projects_tab;
        } else {
            $localStorage.selected_projects_tab = status;
            $scope.selected_projects_tab = status;
        }

        if(!limit || limit == null || limit == undefined) {
            $scope.projects_limit = $scope.limits[1];
            $localStorage.projects_limit = $scope.projects_limit;
            limit = $scope.projects_limit;
        } else {
            $localStorage.projects_limit = limit;
            $scope.projects_limit = limit;
        }

        if(!page || page == null || page == undefined) {
            $scope.projects_current_page = 1;
            $localStorage.projects_current_page = $scope.projects_current_page;
            page = $scope.projects_current_page;
        } else {
            $localStorage.projects_current_page = page;
            $scope.projects_current_page = page;
        }

        var queryStr = "?status="+status;

        //Get total projects count first in order to calculate pagination parameters
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/projects-count' + queryStr, //'/ranked-projects',
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

            //Get projects list
            $http({
                method: 'GET',
                url: projectsApiBaseURL + '/projects' + queryStr,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(function (response) {
                $scope.projects = response.data;

                for(var i=0;i<response.data.length;i++) {
                    var current_project = $scope.projects[i];
                    var current_project_id = current_project.id;

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

                    //Get the project's tasks, limit top 3
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
            });
        });
    } //End getProjects()

    $scope.projectPinnedClass = function(project) {
        if(project.pinned) {
            return "pinned";
        } else {
            return "";
        }    
    }

    $scope.projectTogglePin = function (project) {
        var pinned = false;
        if (project.pinned) {
            pinned = false;
        } else {
            pinned = true;
        }

        $http({
            method: 'PUT',
            url: projectsApiBaseURL + '/projects/' + project.id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: {
                pinned: pinned
            }
        }).then(
            function successCallback(response) {
                $scope.getProjects($localStorage.selected_projects_tab, $localStorage.projects_limit, $localStorage.projects_current_page);
            },
            function errorCallback(response) {
            }
        );
    }

    $scope.taskPinnedClass = function(task) {
        if(task.pinned) {
            return "pinned";
        } else {
            return "";
        }    
    }

    $scope.taskTogglePin = function (task) {
        var pinned = false;
        if (task.pinned) {
            pinned = false;
        } else {
            pinned = true;
        }

        $http({
            method: 'PUT',
            url: tasksApiBaseURL + '/tasks/' + task.id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: {
                pinned: pinned
            }
        }).then(
            function successCallback(response) {
                $scope.getTasks($localStorage.selected_tasks_tab, $localStorage.tasks_limit, $localStorage.tasks_current_page);    
            },
            function errorCallback(response) {
            }
        );
    }

    if($localStorage.loggedin_user) {
        //Get users list
        $http({
            method: 'GET',
            url: usersApiBaseURL + '/users',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.users = response.data;

            for (var i = 0; i < $scope.users.length; i++) {
                //Get task metrics
                $http({
                    method: 'GET',
                    url: tasksApiBaseURL + '/users/' + $scope.users[i].id + '/tasks-count',
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    },
                    params: {
                        'i': i
                    }
                }).then(function (response) {
                    var i = parseInt(response.config["params"]["i"]);
                    $scope.users[i].tasks_count = response.data;
                });

                $http({
                    method: 'GET',
                    url: tasksApiBaseURL + '/users/' + $scope.users[i].id + '/tasks-count?status=doing',
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    },
                    params: {
                        'i': i
                    }
                }).then(function (response) {
                    var i = parseInt(response.config["params"]["i"]);
                    $scope.users[i].doing_count = response.data;
                });

                $http({
                    method: 'GET',
                    url: tasksApiBaseURL + '/users/' + $scope.users[i].id + '/tasks-count?status=finished',
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    },
                    params: {
                        'i': i
                    }
                }).then(function (response) {
                    var i = parseInt(response.config["params"]["i"]);
                    $scope.users[i].finished_count = response.data;
                });

                $http({
                    method: 'GET',
                    url: userPhotosApiBaseURL + "/users/"+$scope.users[i].id+"/photo",
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    },
                    params: {
                        'i': i
                    }
                }).then(
                function successCallback(response) {
                    var i = parseInt(response.config["params"]["i"]);
                    $scope.users[i].photo = response.data;
                    $scope.users[i].photo.uri = userPhotosApiBaseURL+"/users/"+$scope.users[i].id+"/photo.image";
                },
                function errorCallback(response) { 

                });
            }
        });

        $scope.getProjects($localStorage.selected_projects_tab, $localStorage.projects_limit, $localStorage.projects_current_page);

        $scope.getTasks($localStorage.selected_tasks_tab, $localStorage.tasks_limit, $localStorage.tasks_current_page);
    } 

});