app.controller('projectPanelController', function($scope, $http, $window, $timeout, $routeParams, $location, $localStorage, $mdDialog, Upload, CommonFunctions) {
    $scope.$parent.hero = "Project Panel";
    $scope.$parent.panel_class = "project";

    $scope.statuses = ["dump","waiting","doing","finished"];
    $scope.validator_types = ["W3C","Ryukyu","AChecker"];

    //Caches for optimization
    $scope.users_cache = {
        //Cache by user id
    }

    //Default settings
    if (!("project_panel_tasks_params" in $localStorage)) {
        $localStorage.project_panel_tasks_params = {
            "dump": {
                limit: 10,
                page: 1,
                count: null,
                user_id_filter: 0
            },
            "waiting": {
                limit: 10,
                page: 1,
                count: null,
                user_id_filter: 0
            },
            "doing": {
                limit: 10,
                page: 1,
                count: null,
                user_id_filter: 0
            },
            "finished": {
                limit: 10,
                page: 1,
                count: null,
                user_id_filter: 0
            }
        }
    }

    if (!("project_panel_code_checker_results_params" in $localStorage)) {
        $localStorage.project_panel_code_checker_results_params = {
            "W3C": {
                limit: 10,
                page: 1,
                count: null,
                file: "all"
            },
            "Ryukyu": {
                limit: 10,
                page: 1,
                count: null,
                file: "all"
            },
            "AChecker": {
                limit: 10,
                page: 1,
                count: null,
                file: "all" 
            }
        }
    }

    $scope.project_panel_tasks_params = $localStorage.project_panel_tasks_params;

    $scope.project_panel_code_checker_results_params = $localStorage.project_panel_code_checker_results_params;

    $scope.getTasksParam = function(status,setting) {
        return $localStorage.project_panel_tasks_params[status][setting];
    }

    $scope.setTasksParam = function(status,setting,value) {
        $localStorage.project_panel_tasks_params[status][setting] = value; 
        $scope.project_panel_tasks_params[status][setting] = value;
    }

    $scope.getCodeCheckerResultsParam = function(status,setting) {
        return $localStorage.project_panel_code_checker_results_params[status][setting];
    }

    $scope.setCodeCheckerResultsParam = function(status,setting,value) {
        $localStorage.project_panel_code_checker_results_params[status][setting] = value; 
        $scope.project_panel_code_checker_results_params[status][setting] = value;
    }

    //Default settings, always reset
    $localStorage.project_panel_show_settings = {
        "tasks": {
            "dump": false,
            "waiting": false,
            "doing": false,
            "finished": false
        },
        "code_checker_results": {
            "W3C": false,
            "Ryukyu": false,
            "AChecker": false
        }
    }

    //Reset settings on different project visits
    if($localStorage.last_visited_project_id == null || $localStorage.last_visited_project_id != $routeParams.project_id) {
        //clear all settings
        for(var i=0;i<$scope.statuses.length;i++) {
            var status = $scope.statuses[i]; 
            $scope.setTasksParam(status,'page',1);
            $scope.setTasksParam(status,'user_id_filter',0); 

        }

        for(var i=0;i<$scope.validator_types.length;i++) {
            var validator_type = $scope.validator_types[i]; 
            $scope.setCodeCheckerResultsParam(validator_type,'page',1);
        }
    } 

    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage, $location);

    if($routeParams.user_id) {
        $scope.this_user_id = $routeParams.user_id;
    }

    $scope.this_project_id = $routeParams.project_id;
    $localStorage.last_visited_project_id = $routeParams.project_id;

    if(!("project_panel_layout_settings" in $localStorage)) {
        $localStorage.project_panel_layout_settings = {
            "projects": {
                type: "layered",
                selected: "dump"
            },
            "tasks": {
                type: "layered",
                selected: "dump"
            },
            "code_checker_results": {
                type: "layered",
                selected: "W3C"
            }
        }
    }

    //Gracefull upgrade
    if(!$localStorage.project_panel_layout_settings["code_checker_results"]) {
        $localStorage.project_panel_layout_settings["code_checker_results"] = {
            type: "layered",
            selected: "W3C"            
        }
    }

    $scope.setLayout = function(category, value) {
        $localStorage.project_panel_layout_settings[category]['type'] = value;
    }

    $scope.getLayoutCSS = function(category) {
        return $localStorage.project_panel_layout_settings[category]['type'];
    }

    $scope.setTabSelected = function(category,status) {
        $localStorage.project_panel_layout_settings[category]['selected'] = status;
    }

    $scope.getTabSelectedCSS = function(category,status) {
        if($localStorage.project_panel_layout_settings[category]['selected'] == status) {
            return "selected";
        } else {
            return "";
        }
    }

    //Placeholder for clarity
    $scope.tasks = {
        "dump":[],
        "waiting":[],
        "doing":[],
        "finished":[]
    };

    $scope.unassigned_tasks = {
        "dump":[],
        "waiting":[],
        "doing":[],
        "finished":[]        
    }

    $scope.code_checker_results = {
        "W3C":[],
        "Ryukyu":[],
        "AChecker":[]
    };

    //Default settings
    if(!("project_panel_view_advanced" in $localStorage)) {
        $localStorage.project_panel_view_advanced = {
            projects: false,
            tasks: false,
            users: false
        }
    } 

    $scope.isViewAdvanced = function(category) {
        return $localStorage.project_panel_view_advanced[category];
    }

    $scope.setViewAdvanced = function(category, flag) {
        $localStorage.project_panel_view_advanced[category] = flag;
    }

    $scope.maximize = function (this_section_name) {
        for (var section_name in $localStorage.project_panel_maximized) {
            if ($localStorage.project_panel_maximized.hasOwnProperty(section_name)) {
                $localStorage.project_panel_maximized[section_name] = false;
            }
        }

        $localStorage.project_panel_maximized[this_section_name] = true;
    }

    $scope.minimize = function(this_section_name) {
        for (var section_name in $localStorage.project_panel_maximized) {
            if ($localStorage.project_panel_maximized.hasOwnProperty(section_name)) {
                $localStorage.project_panel_maximized[section_name] = false;
            }
        }

        if($scope.getLayoutCSS(this_section_name) == "horizontal") {
            $scope.setLayout(this_section_name,"layered");
        }
    }

    if(!("project_panel_maximized" in $localStorage)) {
        $localStorage.project_panel_maximized = {
            "projects": false,
            "tasks": false,
            "code_checker_results": false
        }
    }

    $scope.isMaximized = function(this_section_name) {
        return $localStorage.project_panel_maximized[this_section_name];    
    }

    $scope.isMaximizedClass = function(this_section_name) {
        if($localStorage.project_panel_maximized && $localStorage.project_panel_maximized[this_section_name]) {
            return "maximized";
        } else {
            //If at least one key is maximized, make this a minimized class to hide
            for (var section_name in $localStorage.project_panel_maximized) {
                if ($localStorage.project_panel_maximized.hasOwnProperty(section_name)) {
                    if($localStorage.project_panel_maximized[section_name]) {
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
        return $localStorage.project_panel_show_settings[category][status];
    }

    $scope.toggleShowSettings = function (category, status) {
        if ($localStorage.project_panel_show_settings[category][status]) {
            $localStorage.project_panel_show_settings[category][status] = false;
        } else {
            $localStorage.project_panel_show_settings[category][status] = true;
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

    $scope.currentTasksPageClass = function (status,page) {
        if (page == $scope.getTasksParam(status, 'page')) {
            return "selected";
        } else {
            return "";
        }
    }

    $scope.currentCodeCheckerResultsPageClass = function (validator_type,page) {
        if (page == $scope.getCodeCheckerResultsParam(validator_type, 'page')) {
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
            data: {user_id: $scope.selected_user_id, write_access: 1}
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

                //try block for users removed, get undefined error
                try {
                    if($scope.users_cache[current_user_id]) {
                        $scope.assigned_users[i]["firstname"] = $scope.users_cache[current_user_id].firstname;
                        $scope.assigned_users[i]["lastname"] = $scope.users_cache[current_user_id].lastname;
                    } else {
                        $http({
                            method: 'GET',
                            url: usersApiBaseURL + '/users/' + current_user_id,
                            headers: {
                                'x-access-token': CommonFunctions.getToken()
                            },
                            params: {
                                'i': i,
                            }
                        }).then(function (response) { 
                            var i = parseInt(response.config["params"]["i"]);
                            var user = response.data;
                            if(user && user.id) {
                                $scope.users_cache[user.id] = user;
                            }
                            $scope.assigned_users[i]["firstname"] = user.firstname;
                            $scope.assigned_users[i]["lastname"] = user.lastname;
                        });  
                    }
                } catch(err) {
                    console.log(err);
                }
            }

            $scope.users_filter = [{firstname: "all", lastname: "", user_id: 0},{firstname: "unassigned", lastname: "", user_id: -1}];
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

    //Placeholder for clarity
    //Used for pagination
    $scope.tasks_page_count_arr = {
        "dump":[],
        "waiting":[],
        "doing":[],
        "finished":[]
    };

    $scope.code_checker_results_page_count_arr = {
        "W3C":[],
        "Ryukyu":[],
        "AChecker":[]
    };

    $scope.getTasks = function(status,user_id,limit,page) {
        //Save/Default settings
        console.log("Get Tasks");
        console.log("Status: " + status + ", limit: " + limit + ", page: " + page);
        //Save settings
        $scope.setTasksParam(status,'limit',limit);
        $scope.setTasksParam(status,'user_id_filter',user_id);
        $scope.setTasksParam(status,'page',page);

        var queryStr = "?status="+status;

        var userFilterBase = "";
        var unassignedTag = "";

        if(!isNaN(user_id) && user_id > 0) {
            console.log("User ID: " + user_id);
            console.log("Limit : " + limit);
            userFilterBase = '/users/' + user_id;
        }
        else if(user_id == -1) {
            unassignedTag = "unassigned-";
        }

        var tasksCountURL = tasksApiBaseURL + userFilterBase + '/projects/' + $routeParams.project_id + '/' + unassignedTag + 'tasks-count' + queryStr;

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

            var tasksURL = tasksApiBaseURL + userFilterBase + '/projects/' + $routeParams.project_id + '/' + unassignedTag + 'tasks' + queryStr;

            //Get the project's tasks
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


                     $scope.tasks[status][i]["project_name"] = $scope.this_project.name;

                    if (user_id != -1) { //if this is an assigned task
                        //Get all users on the current task
                        $http({
                            method: 'GET',
                            url: tasksApiBaseURL + '/tasks/' + $scope.getTaskID(current_task) + '/users',
                            headers: {
                                'x-access-token': CommonFunctions.getToken()
                            },
                            params: {
                                'i': i
                            }
                        }).then(function (response) {
                            $scope.tasks[status][parseInt(response.config["params"]["i"])]["users"] = response.data

                            for (var j = 0; j < response.data.length; j++) {
                                if ($routeParams.user_id == response.data[j]["user_id"]) {
                                    $scope.this_task_user = response.data[j];
                                }

                                var current_user_id = response.data[j]["user_id"];

                                var i = parseInt(response.config["params"]["i"]);
                     
                                try {
                                    if($scope.users_cache[current_user_id]) {
                                        $scope.tasks[status][i]["users"][j].firstname = $scope.users_cache[current_user_id].firstname;
                                        $scope.tasks[status][i]["users"][j].lastname = $scope.users_cache[current_user_id].lastname;
                                    } else {
                                        $http({
                                            method: 'GET',
                                            url: usersApiBaseURL + '/users/' + current_user_id,
                                            headers: {
                                                'x-access-token': CommonFunctions.getToken()
                                            },
                                            params: {
                                                'i': i,
                                                'j': j
                                            }
                                        }).then(function (response) { 
                                            var i = parseInt(response.config["params"]["i"]);
                                            var j = parseInt(response.config["params"]["j"]);
                                            var user = response.data;
                                            if(user && user.id) {
                                                $scope.users_cache[user.id] = user;
                                            }
                                            $scope.tasks[status][i]["users"][j].firstname = user.firstname;
                                            $scope.tasks[status][i]["users"][j].lastname = user.lastname;
                                        });  
                                    }
                                } catch(err) {
                                    console.log(err);
                                }
                            }
                        });
                    }
                }
            });        
        });
    } //End getTasks()


    $scope.getCodeCheckerResults = function(validator_type,limit,page,file) {
        //Save/Default settings
        console.log("Get Code Checker Results");
        console.log("Status: " + validator_type + ", limit: " + limit + ", page: " + page + ", file: " + file);
        //Save settings
        $scope.setCodeCheckerResultsParam(validator_type,'limit',limit);
        $scope.setCodeCheckerResultsParam(validator_type,'page',page);
        $scope.setCodeCheckerResultsParam(validator_type,'file',file);

        var queryStr = "?validator="+validator_type;

        if(file && file != "all") {
            queryStr = queryStr + "&url="+file;
        }

        var codeCheckerResultsCountURL = codeCheckerApiBaseURL + '/code-checker-projects/' + $routeParams.project_id + '/result-messages-count' + queryStr;

        //Get total code_checker_results count first in order to calculate pagination parameters
        $http({
            method: 'GET',
            url: codeCheckerResultsCountURL,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            var code_checker_results_count = parseInt(response.data); 
            $scope.setCodeCheckerResultsParam(validator_type,'count', code_checker_results_count);

            //For pagination
            if(limit != "all" && code_checker_results_count && code_checker_results_count > 0) {
                var code_checker_results_page_count = Math.ceil(code_checker_results_count / parseInt(limit));
                $scope.code_checker_results_page_count_arr[validator_type] = createNumbersArray(code_checker_results_page_count);
            } else {
                $scope.code_checker_results_page_count_arr[validator_type] = createNumbersArray(1);
            }

            //Set the current page
            var pageInt = parseInt(page,10);
            if(pageInt) {
                if(pageInt <= 0) { //don't let pages go below zero
                    $scope.setCodeCheckerResultsParam(validator_type,'page',1);
                } else if (pageInt > $scope.code_checker_results_page_count_arr[validator_type].length) { //don't let pages go past max pages
                    $scope.setCodeCheckerResultsParam(validator_type,'page',$scope.code_checker_results_page_count_arr[validator_type].length);
                } else {
                    $scope.setCodeCheckerResultsParam(validator_type,'page',pageInt);
                }
            } else {
                $scope.setCodeCheckerResultsParam(validator_type,'page',1);
            }

            //Build the query string to get the code_checker_results for the current page
            var queryArr = [];
            var queryStr = "";
            var queryStatus = null;
            var queryLimit = null;
            var queryPage = null;
            var queryFile = null;

            //Query to filter by validator_type
            if(validator_type && validator_type != "all") {
                queryStatus = "validator="+validator_type;
                queryArr.push(queryStatus);
            }

            //Query for limiting results and pagination
            if(limit && limit != "all") {
                queryLimit = "limit="+limit;
                queryArr.push(queryLimit);
                queryPage = "page="+$scope.getCodeCheckerResultsParam(validator_type,'page'); //processed page
                queryArr.push(queryPage);
            }

             //Query to filter by file 
             if(file && file != "all") {
                queryFile = "url="+file;
                queryArr.push(queryFile);
            }           

            if(queryArr.length > 0) {
                queryStr = "?" + queryArr.join("&");
            }

            var codeCheckerResultsURL = codeCheckerApiBaseURL + '/code-checker-projects/' + $routeParams.project_id + '/result-messages' + queryStr;

            //Get the project's code_checker_results
            $http({
                method: 'GET',
                url: codeCheckerResultsURL,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(function (response) {
                $scope.code_checker_results[validator_type] = response.data;
            });        
        });
    } //End getCodeCheckerResults()

    $scope.taskPinnedClass = function(status,task) {
        if(task.project_pinned) {
            return "pinned";
        } else {
            return "";
        }    
    }

    $scope.taskTogglePin = function (status,task) {
        var pinned = false;
        if (task.project_pinned) {
            pinned = false;
        } else {
            pinned = true;
        }

        $http({
            method: 'PUT',
            url: tasksApiBaseURL + '/projects/' + task.project_id + '/tasks/' + task.id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: {
                project_pinned: pinned
            }
        }).then(
            function successCallback(response) {
                $scope.getTasks(status, $scope.getTasksParam(status,'user_id_filter'), $scope.getTasksParam(status,'limit'), $scope.getTasksParam(status,'page')); 
            },
            function errorCallback(response) {
            }
        );
    }


    $scope.show_caption_form = function () {
        $('figcaption.caption').css('display', 'none');
        $('.form.caption').css('display', 'block');
        $('.button.edit.caption').css('display', 'none');

        $scope.name_backup = $scope.this_project_photo.caption;
    }

    $scope.cancel_caption = function () {
        $('figcaption.caption').css('display', 'block');
        $('.form.caption').css('display', 'none');
        $('.button.edit.caption').css('display', 'inline-block');

        $scope.this_project_photo.caption = $scope.name_backup;
    }

    $scope.update_caption = function () {
        $('figcaption.caption').css('display', 'block');
        $('.form.caption').css('display', 'none');
        $('.button.edit.caption').css('display', 'inline-block');

        $http({
            method: 'PUT',
            url: projectPhotosApiBaseURL + "/projects/" + $routeParams.project_id + "/photo",
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: {
                caption: $scope.this_project_photo.caption
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
                $scope.this_project_photo.caption = $scope.name_backup;
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
                    $scope.uploadPhoto(f);
                })(files[i]);
            }
        }
    });

    $scope.uploadPhoto = function(file) {
        Upload.upload({
            url: projectPhotosApiBaseURL + "/projects/" + $routeParams.project_id + "/photo",
            method: 'POST',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },                
            data: {          
                name: $scope.this_project.name, 
                caption: '',
                photo: file
            }
        }).then(function (response) {
            Lobibox.notify('success', {
                position: 'top right',
                size: 'mini',
                msg: 'Successfully added photo!'
            });
            $scope.this_project_photo.caption = response.data.caption;
            $scope.this_project_photo.uri = projectPhotosApiBaseURL + response.data.photo_uri;
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

    $scope.getFileIcon = function(fileType) {
        var imgIcon = "/images";
        switch (fileType) {
            case 'image/jpeg':
                imgIcon += '/icon/jpg.png';
                break;
            case 'image/gif':
                imgIcon += '/icon/gif.png';
                break;
            case 'image/png':
                imgIcon += '/icon/png.png';
                break;
            case 'image/svg+xml':
                imgIcon += '/icon/svg.png';
                break;
            case 'text/html':
                imgIcon += '/icon/html.png';
                break;
            case 'text/csv':
                imgIcon += '/icon/csv.png';
                break;
            case 'application/x-javascript':
                imgIcon += '/icon/javascript.png';
                break;
            case 'application/json':
                imgIcon += '/icon/json.png';
                break;
            case 'application/xml':
                imgIcon += '/icon/xml.png';
                break;
            case 'application/pdf':
                imgIcon += '/icon/pdf.png';
                break;
            case 'application/zip':
                imgIcon += '/icon/zip.png';
                break;
            case 'video/x-msvideo':
                imgIcon += '/icon/avi.png';
                break;
            case 'audio/mpeg':
                imgIcon += '/icon/mp3.png';
                break;
            case 'text/css':
                imgIcon += '/icon/css.png';
                break;
            case 'application/msword':
                imgIcon += '/icon/css.png';
                break;
            case 'application/vnd.ms-excel':
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                imgIcon += '/icon/xls.png';
                break;
            case 'application/vnd.ms-powerpoint':
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                imgIcon += '/icon/ppt.png';
                break;
            case 'application/x-shockwave-flash':
                imgIcon += '/icon/fla.png';
                break;
            default:
                imgIcon += '/icon/file.png';
                break;
        }
        return imgIcon;
    };

    $scope.getFile = function(uri) {
        return filesApiBaseURL + uri;
    }

    $scope.upload_files = function (files) {
        if (files && files.length) {
            angular.forEach(files, function (file, key) {
                $scope.upload_single_file(0, file);
            });
        }
    }

    $scope.upload_single_file = function(index, fileData) {
        if (!fileData.$error) {
            fileData.upload = Upload.upload({
                url: filesApiBaseURL + "/projects/" + $routeParams.project_id + "/files",
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                data: {
                    file: fileData
                }
            });

            fileData.upload.then(function (response) {
                $timeout(function () {
                    if (fileData.progress == 100) {
                        delete $scope.uploadFiles[index];
                        $scope.uploadFiles.splice(index, 1);
                    }
                    if ($scope.projectFiles.message) $scope.projectFiles = [];
                    $scope.projectFiles.push(response.data);
                    Lobibox.notify('success', {
                        position: 'top right',
                        sound: false,
                        size: 'mini',
                        msg: 'Successfully added file ' + fileData.name + '!'
                    });
                });
            }, function (response) {
                if (response.status > 0)
                    Lobibox.notify('error', {
                        position: 'top right',
                        sound: false,
                        size: 'mini',
                        msg: response.status + ': ' + response.data + '.'
                    });
            }, function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                fileData.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        } else {
            Lobibox.notify('error', {
                position: 'top right',
                sound: false,
                size: 'mini',
                msg: 'Error added ' + fileData.name + '.'
            });
        }
    }

    $scope.delete_photo = function() {
        $http({
            method: 'DELETE',
            url: projectPhotosApiBaseURL + '/projects/' + $routeParams.project_id + "/photo",
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(
            function successCallback(response) {
                Lobibox.notify('success', {
                    position: 'top right',
                    sound: false,
                    size: 'mini',
                    msg: 'Deleted photo!'
                });
                $scope.this_project_photo = {};
                $scope.this_project_photo.uri = "./images/default_project.png";
                $scope.this_project_photo.caption = "Todo project photo microservice";
            },
            function errorCallback(response) {
                Lobibox.notify('error', {
                    position: 'top right',
                    sound: false,
                    size: 'mini',
                    msg: 'Error deleting photo.'
                });
            }
        );
    }

    $scope.delete_upload_file = function(index) {
        delete $scope.uploadFiles[index];
        $scope.uploadFiles.splice(index, 1);
    }

    $scope.delete_file = function(index, id, filename) {
        var answer = prompt('Remove file ' + filename + ' from this project?  Type "yes" to confirm');
        if(answer == "yes") {
            $http({
                method: 'DELETE',
                url: filesApiBaseURL + '/files/' + id,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(
                function successCallback(response) {
                    delete $scope.projectFiles[index];
                    $scope.projectFiles.splice(index, 1);
                    Lobibox.notify('success', {
                        position: 'top right',
                        sound: false,
                        size: 'mini',
                        msg: 'Deleted file ' + filename + '!'
                    });
                },
                function errorCallback(response) {
                    Lobibox.notify('error', {
                        position: 'top right',
                        sound: false,
                        size: 'mini',
                        msg: 'Error deleting file ' + filename + '.'
                    });
                }
            );
        } else {
            Lobibox.notify('error', {
                position: 'top right',
                sound: false,
                size: 'mini',
                msg: 'Did not type "yes". ' + filename + ' not removed from the project.'
            });
        }
    }
    
    $scope.deleteAllFiles = function() {
        var answer = prompt('Remove all file from this project?  Type "yes" to confirm');
        if(answer == "yes") {
            $http({
                method: 'DELETE',
                url: filesApiBaseURL + '/projects/' + $routeParams.project_id + '/files',
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(
                function successCallback(response) {
                    delete $scope.projectFiles;
                    $scope.projectFiles = [];
                    Lobibox.notify('success', {
                        position: 'top right',
                        sound: false,
                        size: 'mini',
                        msg: 'Deleted all file!'
                    });
                },
                function errorCallback(response) {
                    Lobibox.notify('error', {
                        position: 'top right',
                        sound: false,
                        size: 'mini',
                        msg: 'Error deleting all file.'
                    });
                }
            );
        } else {
            Lobibox.notify('error', {
                position: 'top right',
                sound: false,
                size: 'mini',
                msg: 'Did not type "yes". All file not removed from the project.'
            });
        }
    };

    $scope.uploadAllFiles = function() {
        if ($scope.uploadFiles) {
            $scope.upload_files($scope.uploadFiles);
        } else {
            Lobibox.notify('error', {
                position: 'top right',
                sound: false,
                size: 'mini',
                msg: 'Error adding file.'
            });
        }
    };
    
    $scope.showDialog = function(ev, data_group_assignment) {
        // Appending dialog to document.body to cover sidenav in docs app
        var parentEl = angular.element(document.body);
        var template = '<md-dialog aria-label="list dialog">' +
        '  <form name="groupForm" novalidate ng-submit="groupForm.$valid && assignment()">' +
        '    <md-dialog-content class="md-dialog-content">'+
        '      <h2 class="md-title">Add project ' + $scope.this_project.name + ' to group</h2>' +
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
                    url: groupsApiBaseURL + '/projects/' + $routeParams.project_id + '/groups/' + $scope.group_select.id,
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
                            msg: 'Added project to group!'
                        });
                    },
                    function errorCallback(response) {
                        Lobibox.notify('error', {
                            position: 'top right',
                            sound: false,
                            size: 'mini',
                            msg: 'Error adding project to group.'
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
                url: groupsApiBaseURL + '/projects/' + $routeParams.project_id + '/groups/' + group_id,
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
                msg: 'Did not type "yes". Cannot not removed assign the project to group' + group_name + '.'
            });
        }
    }


    $scope.get_code_checker_project = function() {
        //Get project information
        $http({
            method: 'GET',
            url: codeCheckerApiBaseURL + '/code-checker-projects/' + $routeParams.project_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(
            function successCallback(response) {
                $scope.this_code_checker_project = response.data;
                $scope.this_code_checker_project.source_password = ""; //do not show github password

                //Get url's to check
                $http({
                    method: 'GET',
                    url: codeCheckerApiBaseURL + '/code-checker-projects/' + $routeParams.project_id + '/urls-to-check',
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    }
                }).then(
                    function successCallback(response) {
                        $scope.this_code_checker_project.urls_to_check = response.data;
                    },
                    function errorCallback(response) { 
                        $scope.this_code_checker_project.urls_to_check = [];
                    }
                );

                //Get sass folders to check
                $http({
                    method: 'GET',
                    url: codeCheckerApiBaseURL + '/code-checker-projects/' + $routeParams.project_id + '/sass-folders',
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    }
                }).then(
                    function successCallback(response) {
                        $scope.this_code_checker_project.sass_folders = response.data;
                    },
                    function errorCallback(response) { 
                        $scope.this_code_checker_project.sass_folders = [];
                    }
                );
            },
            function errorCallback(response) { 
                $scope.this_code_checker_project = null;
            }
        );
    }

    $scope.add_code_checker = function() {
        $http({
            method: 'POST',
            url: codeCheckerApiBaseURL + '/code-checker-projects',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: {
                project_id: $routeParams.project_id
            }
        }).then(
            function successCallback(response) {
                $scope.get_code_checker_project();
            },
            function errorCallback(response) {
            }
        );
    }

    $scope.update_code_checker_check_sass_html = function() {
        $http({
            method: 'PUT',
            url: codeCheckerApiBaseURL + '/code-checker-projects/' + $routeParams.project_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: {
                check_sass: $scope.this_code_checker_project.check_sass,
                check_html: $scope.this_code_checker_project.check_html
            }
        }).then(
            function successCallback(response) {
                $scope.get_code_checker_project();
            },
            function errorCallback(response) {
            }
        );
    }

    $scope.update_code_checker = function(type) {
        var update_data = {}
        if(type == "html") {
            update_data = {
                development_server: $scope.this_code_checker_project.development_server,
                dev_server_username: $scope.this_code_checker_project.dev_server_username,
                dev_server_password: $scope.this_code_checker_project.dev_server_password           
            }
        } else if (type == "sass") {
            update_data = {
                source_code_server: $scope.this_code_checker_project.source_code_server,
                source_username: $scope.this_code_checker_project.source_username,
            }
            if($scope.this_code_checker_project.source_password && $scope.this_code_checker_project.source_password.length > 0) {
                update_data.source_password = $scope.this_code_checker_project.source_password;
                console.log("Github password: " + update_data.source_password);
            }
        }

        $http({
            method: 'PUT',
            url: codeCheckerApiBaseURL + '/code-checker-projects/' + $routeParams.project_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: update_data
        }).then(
            function successCallback(response) {
                $scope.get_code_checker_project();
                $scope.edit_code_checker_form[type] = false;
            },
            function errorCallback(response) {
            }
        );
    }

    $scope.add_url_to_check = function(url) {
        $http({
            method: 'POST',
            url: codeCheckerApiBaseURL + '/code-checker-projects/' + $routeParams.project_id + '/urls-to-check',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: {
                url: url
            }
        }).then(
            function successCallback(response) {
                $scope.get_code_checker_project();
                $scope.url_to_add = null;
            },
            function errorCallback(response) {
            }
        );        
    }

    $scope.add_sass_folder = function(relative_path) {
        $http({
            method: 'POST',
            url: codeCheckerApiBaseURL + '/code-checker-projects/' + $routeParams.project_id + '/sass-folders',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: {
                relative_path: relative_path
            }
        }).then(
            function successCallback(response) {
                $scope.get_code_checker_project();
                $scope.sass_folder_to_add = null;
            },
            function errorCallback(response) {
            }
        );        
    }

    $scope.remove_url_to_check = function(id) {
        $http({
            method: 'DELETE',
            url: codeCheckerApiBaseURL + '/code-checker-projects/' + $routeParams.project_id + '/urls-to-check/' + id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(
            function successCallback(response) {
                $scope.get_code_checker_project();
            },
            function errorCallback(response) {
            }
        );        
    }

    $scope.remove_sass_folder = function(id) {
        $http({
            method: 'DELETE',
            url: codeCheckerApiBaseURL + '/code-checker-projects/' + $routeParams.project_id + '/sass-folders/' + id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(
            function successCallback(response) {
                $scope.get_code_checker_project();
            },
            function errorCallback(response) {
            }
        );        
    }

    $scope.code_checker_running = false;
    $scope.code_checker_results = {};
    $scope.run_code_checker = function() {
        $scope.code_checker_running = true;
        $('.code_checker .button').prop('disabled', true);
        $http({
            method: 'PUT',
            url: codeCheckerApiBaseURL + '/code-checker-projects/' + $routeParams.project_id + '/run',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: {
                hi: "world"
            }
        }).then(
            function successCallback(response) {
                $scope.code_checker_running = false;
                $scope.get_code_checker_project();
                $('.code_checker .button').prop('disabled', false);
                for(var i=0;i<$scope.validator_types.length;i++) {
                    var validator_type = $scope.validator_types[i]; 
                    $scope.setCodeCheckerResultsParam(validator_type,'page',1);
                    $scope.getCodeCheckerResults(validator_type, $scope.getCodeCheckerResultsParam(validator_type,'limit'), $scope.getCodeCheckerResultsParam(validator_type,'page'));
                }

                //Get the checked urls list for select box filter
                $scope.get_code_checker_checked_files();
            },
            function errorCallback(response) {
                $scope.code_checker_running = false;
                $scope.get_code_checker_project();
                $('.code_checker .button').prop('disabled', false);
            }
        );
    }    

    $scope.output_urls = {
        "W3C": [],
        "Ryukyu": [],
        "AChecker": []
    }
    $scope.get_code_checker_checked_files = function () {
        for (var i = 0; i < $scope.validator_types.length; i++) {
            $http({
                method: 'GET',
                url: codeCheckerApiBaseURL + '/code-checker-projects/' + $routeParams.project_id + '/output-urls?validator='+$scope.validator_types[i],
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                params: {
                   'i': i
                }
            }).then(
                function successCallback(response) {
                    var i = parseInt(response.config["params"]["i"]);
                    var output_urls = response.data;
                    output_urls.push({url: "all"});
                    $scope.output_urls[$scope.validator_types[i]] = output_urls;
                },
                function errorCallback(response) {
                    var i = parseInt(response.config["params"]["i"]);
                    $scope.output_urls[$scope.validator_types[i]] = [];
                }
            );
        }
    }


    $scope.remove_code_checker = function() {
        var answer = prompt('Remove Code Checker from this project?  Type "yes" to confirm');
        if(answer == "yes") {
            //(this) is equivalent to ($scope) inside the function
            $http({
                method: 'DELETE',
                url: codeCheckerApiBaseURL + '/code-checker-projects/' + $routeParams.project_id,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(function (response) {
                $scope.$parent.flash_message = "Removed Code Checker from this project";
                $scope.$parent.flash_level = "alert";
                $scope.this_code_checker_project = null;
            });      
        } else {
            $scope.$parent.flash_message = 'Did not type "yes". Code Checker not removed from the project.';
            $scope.$parent.flash_level = "fail";
        }
    }

    $scope.edit_code_checker_form = {
        html: false,
        sass: false
    }

    $scope.show_edit_code_checker_form = function(type) {
        $scope.edit_code_checker_form[type] = true;
    }

    $scope.cancel_update_code_checker = function(type) {
        $scope.edit_code_checker_form[type] = false;
        $scope.get_code_checker_project();
    }

    $scope.quick_task_form_data = {};

    $scope.quick_post_task = function() {
        if ($scope.quick_task_form_data.name && $scope.quick_task_form_data.name.length > 0) {
            $http({
                method: 'POST',
                url: tasksApiBaseURL + '/projects/' + $routeParams.project_id + '/tasks',
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                data: {
                    name: $scope.quick_task_form_data.name
                }
            }).then(
                function successCallback(response) {
                    $scope.quick_task_form_data.name = "";
                    $scope.getTasks("dump", $scope.getTasksParam(status,'user_id_filter'), $scope.getTasksParam(status,'limit'), $scope.getTasksParam(status,'page'));
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

            $http({
                method: 'GET',
                url: projectPhotosApiBaseURL + "/projects/" + $routeParams.project_id + "/photo",
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(
            function successCallback(response) {
                $scope.this_project_photo = response.data;
                $scope.this_project_photo.uri = projectPhotosApiBaseURL + response.data.photo_uri;
            },
            function errorCallback(response) { 
                $scope.this_project_photo = {};
                $scope.this_project_photo.uri = "./images/default_project.png";
                $scope.this_project_photo.caption = "Todo project photo microservice";
            });

            //Get all users for assigning new users
            $http({
                method: 'GET',
                url: usersApiBaseURL + '/users?active=1',
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(function (response) {
                $scope.users = response.data;
                //Cache the users
                for (var i = 0; i < $scope.users.length; i++) {
                    //Cache the user by id for optimization
                    $scope.users_cache[$scope.users[i].id] = $scope.users[i];
                }

                //Get all users on the current project
                get_project_users();

                //Get all tasks on the curent project
                for(var i=0;i<$scope.statuses.length;i++) {
                    var status = $scope.statuses[i]; 
                    $scope.getTasks(status, $scope.getTasksParam(status,'user_id_filter'),$scope.getTasksParam(status,'limit'), $scope.getTasksParam(status,'page'));
                }
            });
        });

        for(var i=0;i<$scope.validator_types.length;i++) {
            var validator_type = $scope.validator_types[i]; 
            $scope.getCodeCheckerResults(validator_type, $scope.getCodeCheckerResultsParam(validator_type,'limit'), $scope.getCodeCheckerResultsParam(validator_type,'page'));
        }

        $scope.get_code_checker_checked_files();

        //Get all files for project
        $http({
            method: 'GET',
            url: filesApiBaseURL + "/projects/" + $routeParams.project_id + "/files",
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.projectFiles = response.data;
        });
        
        $http({
            method: 'GET',
            url: groupsApiBaseURL + '/projects/' + $routeParams.project_id + '/groups',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.group_assignment = response.data;
        });

        $scope.get_code_checker_project();

    } 

});
