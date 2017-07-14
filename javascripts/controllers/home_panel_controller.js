app.controller('homePanelController', function($scope, $http, $localStorage, CommonFunctions) {
    $scope.$parent.hero = "Home Panel";
    $scope.$parent.panel_class = "home_panel";

    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage);

    $scope.prettyDate = function(isoDateStr, status) {
        if(moment() > moment(isoDateStr) && (status == "new" || status == "doing")) {
            return "Past Due";
        } else {
            return moment(isoDateStr).calendar();
        }
    }

    $scope.showControlsFlags = {
        tasks: false,
        projects: false
    }

    $scope.showHideControlsClass = function(type) {
        if($scope.showControlsFlags[type]) {
            return "show";
        } else {
            return "hide";
        }
    }

    $scope.toggleShowHideControls = function(type) {
        if($scope.showControlsFlags[type]) {
            $scope.showControlsFlags[type] = false;
        } else {
            $scope.showControlsFlags[type] = true;
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

    $scope.filter_statuses = [
        "all",
        "new",
        "doing",
        "finished"
    ]

    $scope.limits = ["5","10","15","20","all"];
    $scope.tasks_limit = $scope.limits[1];
    $scope.projects_limit = $scope.limits[1];

    $scope.tasks_current_page = 1;
    $scope.projects_current_page = 1;

    $scope.selected_tasks_status_filter = $scope.filter_statuses[0];
    $scope.selected_projects_status_filter = $scope.filter_statuses[0];

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

    $scope.cssLast = function(isLast) {
        if(isLast) {
            return "last";
        }
    }

    var getNumber = function(num) {
        return new Array(num);   
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
        else if(moment() > moment(date) && (status == "new" || status == "doing")) {
            return "important";
        } 
        else {
            return null;
        }
    }

    $scope.getTasks = function(status,limit,page) {
        $scope.tasks_current_page = page;

        var queryStr = "";

        if(status && status != "all") {
            queryStr = "?status="+status;
        }

        //Get total tasks count first in order to calculate pagination parameters
        $http({
            method: 'GET',
            url: tasksApiBaseURL + '/tasks-count' + queryStr, //'/ranked-tasks',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.tasks_count = parseInt(response.data);

            //For pagination
            if(limit != "all" && $scope.tasks_count && $scope.tasks_count > 0) {
                var tasks_page_count = Math.ceil($scope.tasks_count / parseInt(limit));
                $scope.tasks_page_count_arr = getNumber(tasks_page_count);
            } else {
                $scope.tasks_page_count_arr = getNumber(1);
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

    $scope.getProjectsCount = function(status) {
        var queryStr = "";

        if(status && status != "all") {
            queryStr = "?status="+status;
        }

        //Get projects count
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/projects-count' + queryStr, //'/ranked-projects',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.projects_count = parseInt(response.data);
        });
    }

    $scope.getProjects = function(status,limit,page) {
        $scope.projects_current_page = page;

        var queryStr = "";

        if(status && status != "all") {
            queryStr = "?status="+status;
        }

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
                $scope.projects_page_count_arr = getNumber(projects_page_count);
            } else {
                $scope.projects_page_count_arr = getNumber(1);
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
        });

        $scope.getProjects($scope.selected_projects_status_filter, $scope.projects_limit, $scope.projects_current_page);

        $scope.getTasks($scope.selected_tasks_status_filter, $scope.tasks_limit, $scope.tasks_current_page);
    } 

});