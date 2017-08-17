app.controller('homePanelTwoController', function($scope, $http, $location, $localStorage, CommonFunctions) {
    $scope.$parent.hero = "Home Panel";
    $scope.$parent.panel_class = "home";

    if($localStorage.flash_message == "Successful Login!") { 
        //clear all settings
        //$localStorage.selected_projects_tab = null; //Save between sessions
        $localStorage.projects_limit = null;
        $localStorage.projects_current_page = null;
        //$localStorage.selected_tasks_tab = null; //Save between sessions
        $localStorage.tasks_limit = null;
        $localStorage.tasks_current_page = null;
        //delete $localStorage.tasks_maximized; //Save between sessions
        
    } 

    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage, $location);

    $scope.capitalize = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    $scope.statuses = ["dump","waiting","doing","finished"];

    $scope.showByPerson = function($event) {
        $localStorage.showBy = "person";
        $scope.showBy = "person";
    }

    $scope.showByStatus = function($event) {
        $localStorage.showBy = "status";
        $scope.showBy = "status";
    }

    //Create container to save
    if(!$localStorage.expand_projects) {
        $localStorage.expand_projects = {}
    }

    if(!$scope.expand_projects) {
        $scope.expand_projects = {}
    }

    //Load default show by settings
    if($localStorage.showBy != undefined) {
        $scope.showBy = $localStorage.showBy;
    } else {
        $localStorage.showBy = "status";
        $scope.showBy = "status";
    }

    if($localStorage.expandAllSetting != undefined) {
        $scope.expandAllSetting = $localStorage.expandAllSetting;
    } else {
        $localStorage.expandAllSetting = {
            'status': true,
            'person': true
        }

        $scope.expandAllSetting = $localStorage.expandAllSetting;
    }

    $scope.expand = function($event, category) {
        $localStorage.expand_projects[category] = true;
        $scope.expand_projects[category] = true;
    }

    $scope.expandAll = function(showBy) {
        for (var category in $localStorage.expand_projects) {
            if (showBy == 'person' && !isNaN(category)) { //category is an int for person
                $localStorage.expand_projects[category] = true;
                $scope.expand_projects[category] = true;
                $localStorage.expandAllSetting['person'] = true;
                $scope.expandAllSetting['person'] = true;
            } else if(showBy == 'status' && isNaN(category)) {//category is a string
                $localStorage.expand_projects[category] = true;
                $scope.expand_projects[category] = true;
                $localStorage.expandAllSetting['status'] = true;
                $scope.expandAllSetting['status'] = true;
            }
        }
    }

    $scope.collapseAll = function(showBy) {
        for (var category in $localStorage.expand_projects) {
            if (showBy == 'person' && !isNaN(category)) { //category is an int for person
                $localStorage.expand_projects[category] = false;
                $scope.expand_projects[category] = false;
                $localStorage.expandAll['person'] = false;
                $scope.expandAll['person'] = false;
            } else if(showBy == 'status' && isNaN(category)) {//category is a string
                $localStorage.expand_projects[category] = false;
                $scope.expand_projects[category] = false;
                $localStorage.expandAll['status'] = false;
                $scope.expandAll['status'] = false;
            }
        }
    }

    $scope.collapse = function($event, category) {
        $localStorage.expand_projects[category] = false;
        $scope.expand_projects[category] = false;
    }
    
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

    //Get users
    $scope.getUsers = function() {
        $http({
            method: 'GET',
            url: usersApiBaseURL + '/users',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.users = response.data;

            for (var i = 0; i < $scope.users.length; i++) {
                //Get projects
                $scope.getProjectsByUser($scope.users[i].id);

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
    }

    $scope.projects = {
        "example_status": {
            limit: 5,
            current_page: 1,
            count: 100,
            data: []
        }
    };

    $scope.getProjectsByUser = function (user_id) {
        $scope.projects[user_id] = {};

        //Get projects list
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/users/' + user_id + '/projects',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.projects[user_id].data = response.data;

            //Load default expand settings
            if($localStorage.expand_projects[user_id] != undefined) {
                $scope.expand_projects[user_id] = $localStorage.expand_projects[user_id];
            } else {
               $localStorage.expand_projects[user_id] = true; 
               $scope.expand_projects[user_id] = true;
            }
        });
    }

    //Get Projects
    $scope.getProjects = function(status,limit,page) {
        //Load default expand/collapse settings
        if($localStorage.expand_projects[status] != undefined) {
            $scope.expand_projects[status] = $localStorage.expand_projects[status];
        } else {
            //If expand is defined, save the value
            $localStorage.expand_projects[status] = true;
            $scope.expand_projects[status] = true;
        }

        //Create containers for saving pagination parameters
        if(!$scope.projects[status]) {
            $scope.projects[status] = {}
        }

        if(!$localStorage.projects) {
            $localStorage.projects = {}
        }

        if(!$localStorage.projects[status]) {
            $localStorage.projects[status] = {}
        }
        if(!limit || limit == null || limit == undefined) {
            //Default values if limit is not defined
            $localStorage.projects[status].limit = $scope.limits[1]; //For saving
            $scope.projects[status].limit = $scope.limits[1]; //For html
            limit = $scope.limits[1];
        } else {
            //If limit is defined, save the limit value
            $localStorage.projects[status].limit = limit; //For saving
            $scope.projects[status].limit = limit; //For html
        }

        if(!page || page == null || page == undefined) {
            //Default page if not defined
            $scope.projects[status].current_page = 1;
            $localStorage.projects[status].current_page = 1;
            page = 1;
        } else {
            //If page is defined save the value
            $localStorage.projects[status].current_page = page;
            $scope.projects[status].current_page = page;
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
            $scope.projects[status].count = parseInt(response.data);

            //For pagination
            if(limit != "all" && $scope.projects_count && $scope.projects_count > 0) {
                var projects_page_count = Math.ceil($scope.projects_count / parseInt(limit));
                $scope.projects[status].page_count_arr = createNumbersArray(projects_page_count);
            } else {
                $scope.projects[status].page_count_arr = createNumbersArray(1);
            }

            //Set the current page
            var pageInt = parseInt(page,10);
            if(pageInt) {
                if(pageInt <= 0) { //don't let pages go below zero
                    $scope.projects[status].current_page = 1;
                } else if (pageInt > $scope.projects[status].page_count_arr.length) { //don't let pages go past max pages
                    $scope.projects[status].current_page = $scope.projects[status].page_count_arr.length;
                } else {
                    $scope.projects[status].current_page = pageInt;
                }
            } else {
                $scope.projects[status].current_page = 1;
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
                $scope.projects[status].data = response.data;
            });
        });
    } //End getProjects()

    $scope.projectPinnedClass = function(project,user) {
        if(user) {
            if(project.user_pinned) {
                return "pinned";
            } else {
                return "";
            }
        } else {
            if(project.pinned) {
                return "pinned";
            } else {
                return "";
            }    
        }
    }

    $scope.projectTogglePin = function (project,user) {
        var pinned = false;
        var project_id;
        var body = {};
        var putURL;
        if(user) {
            project_id = project.project_id;
            if(project.user_pinned) {
                pinned = false;
            } else {
                pinned = true;
            }

            body['user_pinned'] = pinned;
            putURL =  projectsApiBaseURL + '/users/' + project.user_id + '/projects/' + project_id;
        } else {
            project_id = project.id;
            if (project.pinned) {
                pinned = false;
            } else {
                pinned = true;
            }

            body['pinned'] = pinned;
            putURL = projectsApiBaseURL + '/projects/' + project_id;
        }

        $http({
            method: 'PUT',
            url: putURL,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: body
        }).then(
            function successCallback(response) {
                if(user) {
                    $scope.getProjectsByUser(project.user_id);
                } else {
                    $scope.getProjects(project.status, $localStorage.projects_limit, $localStorage.projects_current_page);
                }
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

    $scope.quick_task_form_data = {};

    $scope.quick_post_task = function() {
        if ($scope.quick_task_form_data.name && $scope.quick_task_form_data.name.length > 0) {
            $http({
                method: 'POST',
                url: tasksApiBaseURL + '/tasks',
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                data: {
                    name: $scope.quick_task_form_data.name
                }
            }).then(
                function successCallback(response) {
                    $scope.quick_task_form_data.name = "";
                    $scope.getTasks($localStorage.selected_tasks_tab, $localStorage.tasks_limit, $localStorage.tasks_current_page);
                },
                function errorCallback(response) {
                }
            );
        }
    }

    if($localStorage.loggedin_user) {
        $scope.getProjects("dump", $localStorage.projects_limit, $localStorage.projects_current_page);
        $scope.getProjects("waiting", $localStorage.projects_limit, $localStorage.projects_current_page);
        $scope.getProjects("doing", $localStorage.projects_limit, $localStorage.projects_current_page);
        $scope.getProjects("finished", $localStorage.projects_limit, $localStorage.projects_current_page);
        $scope.getUsers();
    } 

});