app.controller('userPanelController', function($scope, $http, $timeout, $location, $routeParams, $localStorage, Upload, CommonFunctions) {
    $scope.$parent.hero = "User Panel";
    $scope.$parent.panel_class = "user";

    if($localStorage.last_visited_user_id == null || $localStorage.last_visited_user_id != $routeParams.user_id) {
        //clear all settings
        //$localStorage.user_panel_selected_projects_tab = null; 
        $localStorage.user_panel_projects_limit = null;
        $localStorage.user_panel_projects_current_page = null;
        //$localStorage.user_panel_selected_tasks_tab = null;
        $localStorage.user_panel_selected_project_id_filter = null; 
        $localStorage.user_panel_tasks_limit = null;
        $localStorage.user_panel_tasks_current_page = null;
    } 

    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage, $location);

    if($routeParams.project_id) {
        $scope.this_project_id = $routeParams.project_id;
    }

    $scope.this_user_id = $routeParams.user_id;
    $localStorage.last_visited_user_id = $routeParams.user_id;

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

    $scope.getTasks = function(status,project_id,limit,page) {
        //Save/Default setting
        if(!status || status == null || status == undefined) {
            $scope.selected_tasks_tab = "doing";
            $localStorage.user_panel_selected_tasks_tab = $scope.selected_tasks_tab;
            status = $scope.selected_tasks_tab;
        } else {
            $localStorage.user_panel_selected_tasks_tab = status;
            $scope.selected_tasks_tab = status;
        }

        if(!limit || limit == null || limit == undefined) {
            $scope.tasks_limit = $scope.limits[1];
            $localStorage.user_panel_tasks_limit = $scope.tasks_limit;
            limit = $scope.tasks_limit;
        } else {
            $localStorage.user_panel_tasks_limit = limit;
            $scope.tasks_limit = limit;
        }

        if(!page || page == null || page == undefined) {
            $scope.tasks_current_page = 1;
            $localStorage.user_panel_tasks_current_page = $scope.tasks_current_page;
            page = $scope.tasks_current_page;
        } else {
            $localStorage.user_panel_tasks_current_page = page;
            $scope.tasks_current_page = page;
        }

        if(!project_id || project_id == null || project_id == undefined) {
            $localStorage.user_panel_selected_project_id_filter = $scope.selected_project_id_filter;
            project_id = $scope.selected_project_id_filter;
        } else {
            $scope.selected_project_id_filter = project_id;
            $localStorage.user_panel_selected_project_id_filter = project_id;
        }

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
                        $scope.tasks[parseInt(response.config["params"]["i"])]["users"] = response.data;

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
        if(!status || status == null || status == undefined) {
            $scope.selected_projects_tab = "doing";
            $localStorage.user_panel_selected_projects_tab = $scope.selected_projects_tab;
            status = $scope.selected_projects_tab;
        } else {
            $localStorage.user_panel_selected_projects_tab = status;
            $scope.selected_projects_tab = status;
        }

        if(!limit || limit == null || limit == undefined) {
            $scope.projects_limit = $scope.limits[1];
            $localStorage.user_panel_projects_limit = $scope.projects_limit;
            limit = $scope.projects_limit;
        } else {
            $localStorage.user_panel_projects_limit = limit;
            $scope.projects_limit = limit;
        }

        if(!page || page == null || page == undefined) {
            $scope.projects_current_page = 1;
            $localStorage.user_panel_projects_current_page = $scope.projects_current_page;
            page = $scope.projects_current_page;
        } else {
            $localStorage.user_panel_projects_current_page = page;
            $scope.projects_current_page = page;
        }

        var queryStr = "?status="+status;

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

    //Use user_pinned, not pinned (pinned is global, user_pinned is per user)
    $scope.projectPinnedClass = function(project) {
        if(project.user_pinned) {
            return "pinned";
        } else {
            return "";
        }    
    }

    $scope.projectTogglePin = function (project) {
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
                $scope.getProjects($localStorage.user_panel_selected_projects_tab, $localStorage.user_panel_projects_limit, $localStorage.user_panel_projects_current_page);    
            },
            function errorCallback(response) {
            }
        );
    }

    $scope.taskPinnedClass = function(task) {
        if(task.user_pinned) {
            return "pinned";
        } else {
            return "";
        }    
    }

    $scope.taskTogglePin = function (task) {
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
                $scope.getTasks($localStorage.user_panel_selected_tasks_tab, $localStorage.user_panel_selected_project_id_filter, $localStorage.user_panel_tasks_limit, $localStorage.user_panel_tasks_current_page);    
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
                        $scope.getTasks($localStorage.user_panel_selected_tasks_tab, $localStorage.user_panel_selected_project_id_filter, $localStorage.user_panel_tasks_limit, $localStorage.user_panel_tasks_current_page);
                    });
                },
                function errorCallback(response) {

                }
            );
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

        //Get the users projects
        $scope.getProjects($localStorage.user_panel_selected_projects_tab, $localStorage.user_panel_projects_limit, $localStorage.user_panel_projects_current_page);

        //Get the users tasks
        $scope.getTasks($localStorage.user_panel_selected_tasks_tab, $localStorage.user_panel_selected_project_id_filter, $localStorage.user_panel_tasks_limit, $localStorage.user_panel_tasks_current_page);
    } 

});
