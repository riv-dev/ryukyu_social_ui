app.controller('homePanelController', function($scope, $http, $location, $localStorage, CommonFunctions) {
    $scope.$parent.hero = "Home Panel";
    $scope.$parent.panel_class = "home";

    $scope.statuses = ["dump","waiting","doing","finished"];

    //Default settings
    if (!("projects_params" in $localStorage)) {
        $localStorage.projects_params = {
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
    if (!("tasks_params" in $localStorage)) {
        $localStorage.tasks_params = {
            "dump": {
                limit: 10,
                page: 1,
                count: null
            },
            "waiting": {
                limit: 10,
                page: 1,
                count: null
            },
            "doing": {
                limit: 10,
                page: 1,
                count: null
            },
            "finished": {
                limit: 10,
                page: 1,
                count: null
            }
        }
    }

    //Default settings, always reset
    $localStorage.show_settings = {
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

    if($localStorage.flash_message == "Successful Login!") { 
        //clear all settings
        for(var i=0;i<$scope.statuses.length;i++) {
            var status = $scope.statuses[i]; 
            $localStorage.projects_params[status]['page'] = 1;
            $localStorage.tasks_params[status]['page'] = 1;
        }
    } 

    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage, $location);

    if(!("layout_settings" in $localStorage)) {
        $localStorage.layout_settings = {
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
        $localStorage.layout_settings[category]['type'] = value;
    }

    $scope.getLayoutCSS = function(category) {
        return $localStorage.layout_settings[category]['type'];
    }

    $scope.setTabSelected = function(category,status) {
        $localStorage.layout_settings[category]['selected'] = status;
    }

    $scope.getTabSelectedCSS = function(category,status) {
        if($localStorage.layout_settings[category]['selected'] == status) {
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
        return $localStorage.projects_params[status][setting];
    }

    $scope.setProjectsParam = function(status,setting,value) {
        $localStorage.projects_params[status][setting] = value; 
    }

    //Placeholder for clarity
    $scope.tasks = {
        "dump":[],
        "waiting":[],
        "doing":[],
        "finished":[]
    };




    $scope.getTasksParam = function(status,setting) {
        return $localStorage.tasks_params[status][setting];
    }

    $scope.setTasksParam = function(status,setting,value) {
        $localStorage.tasks_params[status][setting] = value; 
    }


    //Default settings
    if(!("view_advanced" in $localStorage)) {
        $localStorage.view_advanced = {
            projects: false,
            tasks: false,
            users: false
        }
    } 

    $scope.isViewAdvanced = function(category) {
        return $localStorage.view_advanced[category];
    }

    $scope.setViewAdvanced = function(category, flag) {
        $localStorage.view_advanced[category] = flag;
    }

    $scope.maximize = function (this_section_name) {
        for (var section_name in $localStorage.maximized) {
            if ($localStorage.maximized.hasOwnProperty(section_name)) {
                $localStorage.maximized[section_name] = false;
            }
        }

        $localStorage.maximized[this_section_name] = true;
    }

    $scope.minimize = function(this_section_name) {
        for (var section_name in $localStorage.maximized) {
            if ($localStorage.maximized.hasOwnProperty(section_name)) {
                $localStorage.maximized[section_name] = false;
            }
        }

        if($scope.getLayoutCSS(this_section_name) == "horizontal") {
            $scope.setLayout(this_section_name,"layered");
        } else if($scope.getLayoutCSS(this_section_name) == "gantt") {
            $scope.setLayout(this_section_name,"layered");
        }
    }

    $scope.isMaximized = function(this_section_name) {
        if(!("maximized" in $localStorage)) {
            $localStorage.maximized = {
                "projects": false,
                "tasks": false,
                "users": false
            }
        }

        return $localStorage.maximized[this_section_name];    
    }

    $scope.isMaximizedClass = function(this_section_name) {
        if($localStorage.maximized && $localStorage.maximized[this_section_name]) {
            return "maximized";
        } else {
            //If at least one key is maximized, make this a minimized class to hide
            for (var section_name in $localStorage.maximized) {
                if ($localStorage.maximized.hasOwnProperty(section_name)) {
                    if($localStorage.maximized[section_name]) {
                        return "minimized";
                    }
                }
            }

            return "";
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



    $scope.isShowingSettings = function(category, status) {
        return $localStorage.show_settings[category][status];
    }

    $scope.toggleShowSettings = function(category, status) {
        if($localStorage.show_settings[category][status]) {
            $localStorage.show_settings[category][status] = false;
        } else {
            $localStorage.show_settings[category][status] = true;
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

    $scope.currentTasksPageClass = function(status,page) {
        if(page == $scope.getTasksParam(status,'page')) {
            return "selected";
        } else {
            return "";
        }
    }

    $scope.currentProjectsPageClass = function(status,page) {
        if(page == $scope.getProjectsParam(status,'page')) {
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

    //Placeholder for clarity
    //Used for pagination
    $scope.tasks_page_count_arr = {
        "dump":[],
        "waiting":[],
        "doing":[],
        "finished":[]
    };

    $scope.getTasks = function(status,limit,page) {
        //Save/Default settings
        console.log("Get Tasks");
        console.log("Status: " + status + ", limit: " + limit + ", page: " + page);
        //Save settings
        $scope.setTasksParam(status,'limit',limit);
        $scope.setTasksParam(status,'page',page);

        var queryStr = "?status="+status;

        //Get total tasks count first in order to calculate pagination parameters
        $http({
            method: 'GET',
            url: tasksApiBaseURL + '/tasks-count' + queryStr,
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

            //Get tasks list        
            $http({
                method: 'GET',
                url: tasksApiBaseURL + '/tasks' + queryStr, //'/ranked-tasks',
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
                        url: tasksApiBaseURL + '/tasks/'+current_task.id+'/users',
                        headers: {
                           'x-access-token': CommonFunctions.getToken()
                        },
                        params: {
                           'i': i
                        }
                    }).then(function (response) {
                        $scope.tasks[status][parseInt(response.config["params"]["i"])]["users"] = response.data

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
                                $scope.tasks[status][i]["users"][j].firstname = response.data.firstname; 
                                $scope.tasks[status][i]["users"][j].lastname = response.data.lastname; 
                            });                          
                        }

                    });                   
                }
            }); 
        });
    }//End getTasks()

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
            url: projectsApiBaseURL + '/projects-count' + queryStr, //'/ranked-projects',
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

            //Get projects list
            $http({
                method: 'GET',
                url: projectsApiBaseURL + '/projects' + queryStr,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(function (response) {
                $scope.projects[status] = response.data;

                var gantt_projects = {
                    data: []
                };

                /*$scope.example_tasks = {
                    data: [
                        {
                            id: 1, text: "Project #2", start_date: "01-04-2013", duration: 18, order: 10,
                            progress: 0.4, open: true
                        },
                        {
                            id: 2, text: "Task #1", start_date: "02-04-2013", duration: 8, order: 10,
                            progress: 0.6, parent: 1
                        },
                        {
                            id: 3, text: "Task #2", start_date: "11-04-2013", duration: 8, order: 20,
                            progress: 0.6, parent: 1
                        },
                        {
                            id: 4, text: "Project #3", start_date: "01-04-2013", duration: 18, order: 30,
                            progress: 0.4, open: true
                        }
                    ],
                    links: [
                        { id: 1, source: 1, target: 2, type: "1" },
                        { id: 2, source: 2, target: 3, type: "0" },
                        { id: 3, source: 3, target: 4, type: "0" },
                        { id: 4, source: 2, target: 5, type: "2" },
                    ]
                };*/

                for(var i=0;i<response.data.length;i++) {
                    var current_project = $scope.projects[status][i];
                    var current_project_id = current_project.id;

                    var start;
                    var end;
                    var duration;
                    if(current_project.start_date) {
                        start = moment(current_project.start_date);
                    } else {
                        start = moment();
                    }

                    if(current_project.deadline) {
                        end = moment(current_project.deadline);
                    } else {
                        end = start.add('3','months');
                    }

                    duration = moment.duration(end.diff(start)).asDays();

                    var status_colors = {
                        "dump": "white",
                        "waiting": "#ffe5fc",
                        "doing": "#fffce2",
                        "finished": "#e8ffed"
                    }

                    gantt_projects.data.push(
                        {
                            id: current_project.id,
                            text: current_project.name,
                            start_date: start.format('DD-MM-YYYY'),
                            duration: duration,
                            order: i,
                            open: true,
                            color: status_colors[current_project.status]
                        }
                    );

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
                        $scope.projects[status][parseInt(response.config["params"]["i"])]["users"] = response.data;

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
                                $scope.projects[status][i]["users"][j].firstname = response.data.firstname; 
                                $scope.projects[status][i]["users"][j].lastname = response.data.lastname; 
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
                        $scope.projects[status][parseInt(response.config["params"]["i"])]["tasks"] = response.data;
                    });                    
                }

                gantt.config.autosize = "y";
                gantt.config.columns = [
                    {name:"text",       label:"Project Name",  width:"*", tree:true },
                    {name:"start_date", label:"Start Date", width: 80, align: "center" },
                    {name:"duration",   label:"Duration",   width: 80, align: "center" },
                ];

                var markerId = gantt.addMarker({
                    start_date: new Date(new Date(moment().format())), //a Date object that sets the marker's date
                    css: "today", //a CSS class applied to the marker
                    text: "Now", //the marker title
                    title: moment().format('DD-MM-YYYY') // the marker's tooltip
                });

                gantt.config.initial_scroll = false;

                gantt.init("gantt_here");
                gantt.parse(gantt_projects);

                gantt.attachEvent("onParse", function(){
                    gantt.showDate(new Date(moment().format()));
                });

            });
        });
    } //End getProjects()

    $scope.projectPinnedClass = function(status,project) {
        if(project.pinned) {
            return "pinned";
        } else {
            return "";
        }    
    }

    $scope.projectTogglePin = function (status,project) {
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
                $scope.getProjects(status, $scope.getProjectsParam(status,'limit'), $scope.getProjectsParam(status,'page'));
            },
            function errorCallback(response) {
            }
        );
    }

    $scope.taskPinnedClass = function(status,task) {
        if(task.pinned) {
            return "pinned";
        } else {
            return "";
        }    
    }

    $scope.taskTogglePin = function (status,task) {
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
                $scope.getTasks(status, $scope.getTasksParam(status,'limit'), $scope.getTasksParam(status,'page'));
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
                    $scope.getTasks("dump", $scope.getTasksParam(status,'limit'), $scope.getTasksParam(status,'page'));
                },
                function errorCallback(response) {
                }
            );
        }
    }

    $scope.user_projects = {};

    $scope.getProjectsByUser = function (user_id) {
        //Get projects list
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/users/' + user_id + '/projects',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.user_projects[user_id] = response.data;
        });
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

        for(var i=0;i<$scope.statuses.length;i++) {
            var status = $scope.statuses[i]; 
            $scope.getProjects(status, $scope.getProjectsParam(status,'limit'), $scope.getProjectsParam(status,'page'));
            $scope.getTasks(status, $scope.getTasksParam(status,'limit'), $scope.getTasksParam(status,'page'));
        }
    } 

});