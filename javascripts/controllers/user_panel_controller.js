app.controller('userPanelController', function($scope, $http, $timeout, $location, $routeParams, $localStorage, $mdDialog, Upload, CommonFunctions) {
    $scope.$parent.hero = "User Panel";
    $scope.$parent.panel_class = "user";

    $scope.statuses = ["dump","waiting","doing","finished"];

    //Caches for optimization
    $scope.users_cache = {
        //Cache by user id
    }

    //Default settings
    if (!("user_panel_projects_params" in $localStorage)) {
        $localStorage.user_panel_projects_params = {
            "dump": {
                limit: 5,
                page: 1,
                count: null
            },
            "waiting": {
                limit: 5,
                page: 1,
                count: null
            },
            "doing": {
                limit: 5,
                page: 1,
                count: null
            },
            "finished": {
                limit: 5,
                page: 1,
                count: null
            }
        }
    }

    //Default settings
    if (!("user_panel_tasks_params" in $localStorage)) {
        $localStorage.user_panel_tasks_params = {
            "dump": {
                limit: 10,
                page: 1,
                count: null,
                project_id_filter: null
            },
            "waiting": {
                limit: 10,
                page: 1,
                count: null,
                project_id_filter: null
            },
            "doing": {
                limit: 10,
                page: 1,
                count: null,
                project_id_filter: null
            },
            "finished": {
                limit: 10,
                page: 1,
                count: null,
                project_id_filter: null
            }
        }
    }

    //Default settings, always reset
    $localStorage.user_panel_show_settings = {
        "projects": {
            "dump": false,
            "waiting": false,
            "doing": false,
            "finished": false
        },
        "tasks": {
            "dump": false,
            "waiting": false,
            "doing": false,
            "finished": false
        }
    }

    if($localStorage.last_visited_user_id == null || $localStorage.last_visited_user_id != $routeParams.user_id) {
        //clear all settings
        for(var i=0;i<$scope.statuses.length;i++) {
            var status = $scope.statuses[i]; 
            $localStorage.user_panel_projects_params[status]['page'] = 1;
            $localStorage.user_panel_tasks_params[status]['page'] = 1;
        }
    } 

    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage, $location);

    if($routeParams.project_id) {
        $scope.this_project_id = $routeParams.project_id;
    }

    $scope.this_user_id = $routeParams.user_id;
    $localStorage.last_visited_user_id = $routeParams.user_id;

    if(!("user_panel_layout_settings" in $localStorage)) {
        $localStorage.user_panel_layout_settings = {
            "projects": {
                type: "layered",
                selected: "dump"
            },
            "tasks": {
                type: "layered",
                selected: "dump"
            }
        }
    }

    $scope.setLayout = function(category, value) {
        $localStorage.user_panel_layout_settings[category]['type'] = value;
    }

    $scope.getLayoutCSS = function(category) {
        return $localStorage.user_panel_layout_settings[category]['type'];
    }

    $scope.setTabSelected = function(category,status) {
        $localStorage.user_panel_layout_settings[category]['selected'] = status;
    }

    $scope.getTabSelectedCSS = function(category,status) {
        if($localStorage.user_panel_layout_settings[category]['selected'] == status) {
            return "selected";
        } else {
            return "";
        }
    }

    //Placeholder for clarity
    $scope.projects = {
        "dump":[],
        "waiting":[],
        "doing":[],
        "finished":[]
    };


    $scope.getProjectsParam = function(status,setting) {
        return $localStorage.user_panel_projects_params[status][setting];
    }

    $scope.setProjectsParam = function(status,setting,value) {
        $localStorage.user_panel_projects_params[status][setting] = value; 
    }

    //Placeholder for clarity
    $scope.tasks = {
        "dump":[],
        "waiting":[],
        "doing":[],
        "finished":[]
    };

    $scope.getTasksParam = function(status,setting) {
        return $localStorage.user_panel_tasks_params[status][setting];
    }

    $scope.setTasksParam = function(status,setting,value) {
        $localStorage.user_panel_tasks_params[status][setting] = value; 
    }


    //Default settings
    if(!("user_panel_view_advanced" in $localStorage)) {
        $localStorage.user_panel_view_advanced = {
            projects: false,
            tasks: false,
            users: false
        }
    } 

    $scope.isViewAdvanced = function(category) {
        return $localStorage.user_panel_view_advanced[category];
    }

    $scope.setViewAdvanced = function(category, flag) {
        $localStorage.user_panel_view_advanced[category] = flag;
    }

    $scope.maximize = function (this_section_name) {
        for (var section_name in $localStorage.user_panel_maximized) {
            if ($localStorage.user_panel_maximized.hasOwnProperty(section_name)) {
                $localStorage.user_panel_maximized[section_name] = false;
            }
        }

        $localStorage.user_panel_maximized[this_section_name] = true;
    }

    $scope.minimize = function(this_section_name) {
        for (var section_name in $localStorage.user_panel_maximized) {
            if ($localStorage.user_panel_maximized.hasOwnProperty(section_name)) {
                $localStorage.user_panel_maximized[section_name] = false;
            }
        }

        if($scope.getLayoutCSS(this_section_name) == "horizontal") {
            $scope.setLayout(this_section_name,"layered");
        }
    }

    if(!("user_panel_maximized" in $localStorage)) {
        $localStorage.user_panel_maximized = {
        "projects": false,
        "tasks": false
        }
    }

    $scope.isMaximized = function(this_section_name) {
        return $localStorage.user_panel_maximized[this_section_name];    
    }

    $scope.isMaximizedClass = function(this_section_name) {
        if($localStorage.user_panel_maximized && $localStorage.user_panel_maximized[this_section_name]) {
            return "maximized";
        } else {
            //If at least one key is maximized, make this a minimized class to hide
            for (var section_name in $localStorage.user_panel_maximized) {
                if ($localStorage.user_panel_maximized.hasOwnProperty(section_name)) {
                    if($localStorage.user_panel_maximized[section_name]) {
                        return "minimized";
                    }
                }
            }

            return "";
        }
    }

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



    $scope.isShowingSettings = function (category, status) {
        return $localStorage.user_panel_show_settings[category][status];
    }

    $scope.toggleShowSettings = function (category, status) {
        if ($localStorage.user_panel_show_settings[category][status]) {
            $localStorage.user_panel_show_settings[category][status] = false;
        } else {
            $localStorage.user_panel_show_settings[category][status] = true;
        }
    }


    $scope.archivedClass = function (archived) {
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
    $scope.limits = ["5", "10", "15", "20", "all"];

    $scope.currentTasksPageClass = function (status,page) {
        if (page == $scope.getTasksParam(status, 'page')) {
            return "selected";
        } else {
            return "";
        }
    }

    $scope.currentProjectsPageClass = function (status, page) {
        if (page == $scope.getProjectsParam(status, 'page')) {
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
        else if(moment() > moment(date) && (status == "new" || status == "dump" || status == "waiting" || status == "doing")) {
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

    $scope.active = function(user) {
        if(user.active) {
            return "Yes";
        } else {
            return "No";
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

    $scope.selectedClass = function(selected_name, check_name) {
        if(selected_name == check_name) {
            return "selected";
        } else {
            return "";
        }
    }

    //Placeholder for clarity
    //Used for pagination
    $scope.tasks_page_count_arr = {
        "dump":[],
        "waiting":[],
        "doing":[],
        "finished":[]
    };

    $scope.getTasks = function(status,project_id,limit,page) {
        //Save/Default settings
        console.log("Get Tasks");
        console.log("Status: " + status + ", limit: " + limit + ", page: " + page);
        //Save settings
        $scope.setTasksParam(status,'limit',limit);
        $scope.setTasksParam(status,'project_id_filter',project_id);
        $scope.setTasksParam(status,'page',page);

        var queryStr = "?status="+status;

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
            var tasks_count = parseInt(response.data); 
            $scope.setTasksParam(status,'count', tasks_count);

            //For pagination
            if(limit != "all" && tasks_count && tasks_count > 0) {
                var tasks_page_count = Math.ceil(tasks_count / parseInt(limit));
                $scope.tasks_page_count_arr[status] = createNumbersArray(tasks_page_count);
            } else {
                $scope.tasks_page_count_arr[status] = createNumbersArray(1);
            }

            //Set the current page
            var pageInt = parseInt(page,10);
            if(pageInt) {
                if(pageInt <= 0) { //don't let pages go below zero
                    $scope.setTasksParam(status,'page',1);
                } else if (pageInt > $scope.tasks_page_count_arr[status].length) { //don't let pages go past max pages
                    $scope.setTasksParam(status,'page',$scope.tasks_page_count_arr[status].length);
                } else {
                    $scope.setTasksParam(status,'page',pageInt);
                }
            } else {
                $scope.setTasksParam(status,'page',1);
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
                queryPage = "page="+$scope.getTasksParam(status,'page'); //processed page
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
                $scope.tasks[status] = response.data;

                for(var i=0;i<$scope.tasks[status].length;i++) {
                    var current_task = $scope.tasks[status][i];
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
                            $scope.tasks[status][parseInt(response.config["params"]["i"])]["project_name"] = current_project.name;
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
                        var i = parseInt(response.config["params"]["i"]);
                        $scope.tasks[status][i]["users"] = response.data;

                        for(var j=0;j<response.data.length;j++) {
                            if($routeParams.user_id == response.data[j]["user_id"]) {
                                $scope.this_task_user = response.data[j];
                            }

                            var current_user_id = response.data[j]["user_id"];
         
                            try {
                                $scope.tasks[status][i]["users"][j].firstname = $scope.users_cache[current_user_id].firstname;
                                $scope.tasks[status][i]["users"][j].lastname = $scope.users_cache[current_user_id].lastname;
                            } catch(err) {
                                console.log(err);
                            }
                        }
                    });                   
                }
            });  
        });
    } //End getTasks()


    //Placeholder for clarity
    //Used for pagination
    $scope.projects_page_count_arr = {
        "dump":[],
        "waiting":[],
        "doing":[],
        "finished":[]
    };


    $scope.getProjects = function(status,limit,page) {
        console.log("Get Projects");
        console.log("Status: " + status + ", limit: " + limit + ", page: " + page);
        //Save settings
        $scope.setProjectsParam(status,'limit',limit);
        $scope.setProjectsParam(status,'page',page);

        var queryStr = "?status="+status;

        //Get total projects count first in order to calculate pagination parameters
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/users/' + $routeParams.user_id + '/projects-count' + queryStr,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            var projects_count = parseInt(response.data); 
            $scope.setProjectsParam(status,'count', projects_count);

            //For pagination
            if(limit != "all" && projects_count && projects_count > 0) {
                var projects_page_count = Math.ceil(projects_count / parseInt(limit));
                $scope.projects_page_count_arr[status] = createNumbersArray(projects_page_count);
            } else {
                $scope.projects_page_count_arr[status] = createNumbersArray(1);
            }

            //Set the current page
            var pageInt = parseInt(page,10);
            if(pageInt) {
                if(pageInt <= 0) { //don't let pages go below zero
                    $scope.setProjectsParam(status,'page',1);
                } else if (pageInt > $scope.projects_page_count_arr[status].length) { //don't let pages go past max pages
                    $scope.setProjectsParam(status,'page',$scope.projects_page_count_arr[status].length);
                } else {
                    $scope.setProjectsParam(status,'page',pageInt);
                }
            } else {
                $scope.setProjectsParam(status,'page',1);
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
                queryPage = "page="+$scope.getProjectsParam(status,'page'); //processed page
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
                $scope.projects[status] = response.data;

                for(var i=0;i<response.data.length;i++) {
                    var current_project = $scope.projects[status][i];
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
                        var i = parseInt(response.config["params"]["i"]);
                        $scope.projects[status][i]["users"] = response.data;

                        for(var j=0;j<response.data.length;j++) {
                            var current_user_id = response.data[j]["user_id"];
                            try {
                                $scope.projects[status][i]["users"][j].firstname = $scope.users_cache[current_user_id].firstname;
                                $scope.projects[status][i]["users"][j].lastname = $scope.users_cache[current_user_id].lastname;
                            } catch(err) {
                                console.log(err);
                            }
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
                        $scope.projects[status][parseInt(response.config["params"]["i"])]["tasks"] = response.data;
                    });                    
                }

                $scope.projects_filter = [{name: "all", project_id: 0}];
                $scope.projects_filter = $scope.projects_filter.concat($scope.projects);
                $scope.setTasksParam(status,'project_id_filter',$scope.projects_filter[0]);
            });
        });
    } //End getProjects()

    //Use user_pinned, not pinned (pinned is global, user_pinned is per user)
    $scope.projectPinnedClass = function(status,project) {
        if(project.user_pinned) {
            return "pinned";
        } else {
            return "";
        }    
    }

    $scope.projectTogglePin = function (status,project) {
        var pinned = false;
        if (project.user_pinned) {
            pinned = false;
        } else {
            pinned = true;
        }

        $http({
            method: 'PUT',
            url: projectsApiBaseURL + '/users/' + project.user_id + '/projects/' + project.project_id,
            headers:{
                'x-access-token': CommonFunctions.getToken()
            },
            data: {
                user_pinned: pinned
            }
        }).then(
            function successCallback(response) {
                $scope.getProjects(status, $scope.getProjectsParam(status,'limit'), $scope.getProjectsParam(status,'page'));
            },
            function errorCallback(response) {
            }
        );
    }

    $scope.taskPinnedClass = function(status,task) {
        if(task.user_pinned) {
            return "pinned";
        } else {
            return "";
        }    
    }

    $scope.taskTogglePin = function (status,task) {
        var pinned = false;
        if (task.user_pinned) {
            pinned = false;
        } else {
            pinned = true;
        }

        $http({
            method: 'PUT',
            url: tasksApiBaseURL + '/users/' + task.user_id + '/tasks/' + task.task_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: {
                user_pinned: pinned
            }
        }).then(
            function successCallback(response) {
                $scope.getTasks(status, $scope.getTasksParam(status,'project_id_filter'), $scope.getTasksParam(status,'limit'), $scope.getTasksParam(status,'page'));
            },
            function errorCallback(response) {
            }
        );
    }

    $scope.show_caption_form = function () {
        $('figcaption.caption').css('display', 'none');
        $('.form.caption').css('display', 'block');
        $('.button.edit.caption').css('display', 'none');

        $scope.name_backup = $scope.this_user_photo.caption;
    }

    $scope.cancel_caption = function () {
        $('figcaption.caption').css('display', 'block');
        $('.form.caption').css('display', 'none');
        $('.button.edit.caption').css('display', 'inline-block');

        $scope.this_user_photo.caption = $scope.name_backup;
    }

    $scope.update_caption = function () {
        $('figcaption.caption').css('display', 'block');
        $('.form.caption').css('display', 'none');
        $('.button.edit.caption').css('display', 'inline-block');

        $http({
            method: 'PUT',
            url: userPhotosApiBaseURL + "/users/" + $routeParams.user_id + "/photo",
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: {
                caption: $scope.this_user_photo.caption
            }
        }).then(
            function successCallback(response) {
                Lobibox.notify('success', {
                    position: 'top right',
                    size: 'mini',
                    msg: 'Successfully updated caption!'
                });
            },
            function errorCallback(response) {
                Lobibox.notify('error', {
                    position: 'top right',
                    size: 'mini',
                    msg: 'Error updated caption!'
                });
                $scope.this_user_photo.caption = $scope.name_backup;
            }
        );
    }

    $scope.$watch('files', function (files) {
        $scope.formUpload = false;
        if (files != null) {
            // make files array for not multiple to be able to be used in ng-repeat in the ui
            if (!angular.isArray(files)) {
                $timeout(function () {
                    $scope.files = files = [files];
                });
                return;
            }
            for (var i = 0; i < files.length; i++) {
                (function (f) {
                    $scope.upload(f);
                })(files[i]);
            }
        }
    });

    $scope.upload = function(file) {
        Upload.upload({
            url: userPhotosApiBaseURL + "/users/" + $routeParams.user_id + "/photo",
            method: 'POST',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },                
            data: {          
                lastname: $localStorage.loggedin_user.lastname, 
                firstname: $localStorage.loggedin_user.firstname, 
                caption: '',
                photo: file
            }
        }).then(function (response) {
            Lobibox.notify('success', {
                position: 'top right',
                size: 'mini',
                msg: 'Successfully added photo!'
            });
            $scope.this_user_photo.caption = response.data.caption;
            $scope.this_user_photo.uri = userPhotosApiBaseURL + response.data.photo_uri;
        }, function (response) {
            Lobibox.notify('error', {
                position: 'top right',
                size: 'mini',
                msg: 'Error adding photo.'
            });
            $scope.errors = {};
            var responseError;
            for (var i=0; i < response.data.errors.length; i++) {
                responseError = response.data.errors[i];
                if(responseError.hasOwnProperty('param')) {
                    if(!$scope.errors[responseError['param']]) {
                        $scope.errors[responseError['param']] = [];
                    }
                    $scope.errors[responseError['param']].push(responseError['msg']);
                }
            }
        });
    } //End upload()

    $scope.delete_photo = function() {
        $http({
            method: 'DELETE',
            url: userPhotosApiBaseURL + '/users/' + $routeParams.user_id + "/photo",
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(
            function successCallback(response) {
                Lobibox.notify('success', {
                    position: 'top right',
                    size: 'mini',
                    msg: 'Deleted photo!'
                });
                $scope.this_user_photo = {};
                $scope.this_user_photo.uri = "./images/default_user.png";
                $scope.this_user_photo.caption = "Todo user photo microservice";
            },
            function errorCallback(response) {
                Lobibox.notify('error', {
                    position: 'top right',
                    size: 'mini',
                    msg: 'Error deleting photo.'
                });
            }
        );
    }
    
    $scope.showDialog = function(ev, data_group_assignment) {
        // Appending dialog to document.body to cover sidenav in docs app
        var parentEl = angular.element(document.body);
        var template = '<md-dialog aria-label="list dialog">' +
        '  <form name="groupForm" novalidate ng-submit="groupForm.$valid && assignment()">' +
        '    <md-dialog-content class="md-dialog-content">'+
        '      <h2 class="md-title">Add user ' + $scope.this_user.firstname + ' ' + $scope.this_user.lastname + ' to group</h2>' +
        '      <div layout="row" layout-align="start" flex>' +
        '        <md-input-container flex="100">' +
        '          <md-select ng-model="group_select" placeholder="Select a group" required>' +
        '            <md-option ng-repeat="item in items" ng-value="item" ng-disabled="checkGroups(item.id)">' +
        '              {{item.name}}' +
        '            </md-option>' +
        '          </md-select>' +
        '        </md-input-container>' +
        '      </div>' +
        '    </md-dialog-content>' +
        '    <md-dialog-actions>' +
        '      <md-button ng-click="closeDialog()" class="md-primary md-cancel-button md-button">' +
        '        Cancel' +
        '      </md-button>' +
        '      <md-button type="submit" class="md-primary md-confirm-button md-button">' +
        '        Add to group' +
        '      </md-button>' +
        '    </md-dialog-actions>' +
        '  </form>' +
        '</md-dialog>';
    
        $mdDialog.show({
            parent: parentEl,
            targetEvent: ev,
            template: template,
            focusOnOpen: false,
            locals: {
                items: $scope.items
            },
            controller: DialogController
        });

        function DialogController($scope, $mdDialog, items) {
            $scope.group_select = 0;
            $http({
                method: 'GET',
                url: groupsApiBaseURL + '/groups',
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(function (response) {
                $scope.items = response.data;
            });
            
            $scope.closeDialog = function() {
                $mdDialog.hide();
            }

            $scope.checkGroups = function(id) {
                var result = $.grep(data_group_assignment, function(e){ return e.group_id == id; });
                if (result.length == 0) return false;
                return true;
            }

            $scope.assignment = function() {
                $http({
                    method: 'POST',
                    url: groupsApiBaseURL + '/users/' + $routeParams.user_id + '/groups/' + $scope.group_select.id,
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    }
                }).then(
                    function successCallback(response) {
                        data_group_assignment.push({id: response.data.group_assignment_id, group_id: $scope.group_select.id, name: $scope.group_select.name})
                        $scope.group_assignment = data_group_assignment;
                        $mdDialog.hide($scope.group_assignment);
                        Lobibox.notify('success', {
                            position: 'top right',
                            sound: false,
                            size: 'mini',
                            msg: 'Added user to group!'
                        });
                    },
                    function errorCallback(response) {
                        Lobibox.notify('error', {
                            position: 'top right',
                            sound: false,
                            size: 'mini',
                            msg: 'Error adding user to group.'
                        });
                    }
                );
            }
        }
    };

    $scope.delete_group_assignment = function(index, group_id, group_name) {
        var answer = prompt('Remove group ' + group_name + '?  Type "yes" to confirm');
        if(answer == "yes") {
            $http({
                method: 'DELETE',
                url: groupsApiBaseURL + '/users/' + $routeParams.user_id + '/groups/' + group_id,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(
                function successCallback(response) {
                    delete $scope.group_assignment[index];
                    $scope.group_assignment.splice(index, 1);
                    Lobibox.notify('success', {
                        position: 'top right',
                        sound: false,
                        size: 'mini',
                        msg: 'Deleted assign to group ' + group_name + '!'
                    });
                },
                function errorCallback(response) {
                    Lobibox.notify('error', {
                        position: 'top right',
                        sound: false,
                        size: 'mini',
                        msg: 'Error deleting assign to group ' + group_name + '.'
                    });
                }
            );
        } else {
            Lobibox.notify('error', {
                position: 'top right',
                sound: false,
                size: 'mini',
                msg: 'Did not type "yes". Cannot not removed assign the user to group' + group_name + '.'
            });
        }
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
                    $http({
                        method: 'POST',
                        url: tasksApiBaseURL + '/tasks/' + response.data.task_id + '/users/' + $routeParams.user_id,
                        headers: {
                            'x-access-token': CommonFunctions.getToken()
                        }
                    }).then(function() {
                        $scope.getTasks("dump", $scope.getTasksParam(status,'project_id_filter'), $scope.getTasksParam(status,'limit'), $scope.getTasksParam(status,'page'));
                    });
                },
                function errorCallback(response) {

                }
            );
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////// 
    /////////////////////////////// On Page Load //////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
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

            // $scope.this_user.status = response.data.status;
            // $scope.this_user.bio = "Hello, this is my bio.  This is where I talk about myself and my history.  Anything I like actually.  I like this and this and this.  Yup, that's right."
            $http({
                method: 'GET',
                url: userProfileApiBaseURL + "/users/"+$routeParams.user_id+"/profile",
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(
            function successCallback(response) {
                $scope.this_user.nickname = response.data.nickname;
                $scope.this_user.phone_number = response.data.phone_number;
                $scope.this_user.birthday = response.data.birthday;
                $scope.this_user.status = response.data.status;
                $scope.this_user.bio = response.data.bio;
            },
            function errorCallback(response) { 
                
            });

            $http({
                method: 'GET',
                url: userPhotosApiBaseURL + "/users/" + $routeParams.user_id + "/photo",
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(
            function successCallback(response) {
                $scope.this_user_photo = response.data;
                $scope.this_user_photo.uri = userPhotosApiBaseURL + response.data.photo_uri;
            },
            function errorCallback(response) { 
                $scope.this_user_photo = {};
                $scope.this_user_photo.uri = "./images/default_user.png";
                $scope.this_user_photo.caption = "Todo user photo microservice";
            });
        });
        
        $http({
            method: 'GET',
            url: groupsApiBaseURL + '/users/' + $routeParams.user_id + '/groups',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.group_assignment = response.data;
        });

        //Get users list for caching optimization
        $http({
            method: 'GET',
            url: usersApiBaseURL + '/users',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.users = response.data;

            for (var i = 0; i < $scope.users.length; i++) {
                //Cache the user by id for optimization
                $scope.users_cache[$scope.users[i].id] = $scope.users[i];
            }

            for(var i=0;i<$scope.statuses.length;i++) {
                var status = $scope.statuses[i]; 
                $scope.getProjects(status, $scope.getProjectsParam(status,'limit'), $scope.getProjectsParam(status,'page'));
                $scope.getTasks(status, $scope.getTasksParam(status,'project_id_filter'),$scope.getTasksParam(status,'limit'), $scope.getTasksParam(status,'page'));
            }
        });
    } 

});
