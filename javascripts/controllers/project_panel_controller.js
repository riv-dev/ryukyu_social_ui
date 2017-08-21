app.controller('projectPanelController', function($scope, $http, $window, $timeout, $routeParams, $location, $localStorage, Upload, CommonFunctions) {
    $scope.$parent.hero = "Project Panel";
    $scope.$parent.panel_class = "project";

    $scope.statuses = ["dump","waiting","doing","finished"];

    //Default settings
    if (!("project_panel_tasks_params" in $localStorage)) {
        $localStorage.project_panel_tasks_params = {
            "dump": {
                limit: 10,
                page: 1,
                count: null,
                user_id_filter: null
            },
            "waiting": {
                limit: 10,
                page: 1,
                count: null,
                user_id_filter: null
            },
            "doing": {
                limit: 10,
                page: 1,
                count: null,
                user_id_filter: null
            },
            "finished": {
                limit: 10,
                page: 1,
                count: null,
                user_id_filter: null
            }
        }
    }

    //Default settings, always reset
    $localStorage.project_panel_show_settings = {
        "tasks": {
            "dump": false,
            "waiting": false,
            "doing": false,
            "finished": false
        }
    }

    //Reset settings on different project visits
    if($localStorage.last_visited_project_id == null || $localStorage.last_visited_project_id != $routeParams.project_id) {
        //clear all settings
        for(var i=0;i<$scope.statuses.length;i++) {
            var status = $scope.statuses[i]; 
            $localStorage.project_panel_tasks_params[status]['page'] = 1;
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
            }
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


    $scope.getTasksParam = function(status,setting) {
        return $localStorage.project_panel_tasks_params[status][setting];
    }

    $scope.setTasksParam = function(status,setting,value) {
        $localStorage.project_panel_tasks_params[status][setting] = value; 
    }


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
        "tasks": false
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

    //Placeholder for clarity
    //Used for pagination
    $scope.tasks_page_count_arr = {
        "dump":[],
        "waiting":[],
        "doing":[],
        "finished":[]
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

            var tasksURL = tasksApiBaseURL + userFilterBase + '/projects/' + $routeParams.project_id + '/tasks' + queryStr;

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
                        url: tasksApiBaseURL + '/tasks/'+$scope.getTaskID(current_task)+'/users',
                        headers: {
                           'x-access-token': CommonFunctions.getToken()
                        },
                        params: {
                           'i': i
                        }
                    }).then(function (response) {
                        $scope.tasks[status][parseInt(response.config["params"]["i"])]["users"] = response.data

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
                                $scope.tasks[status][i]["users"][j].firstname = response.data.firstname; 
                                $scope.tasks[status][i]["users"][j].lastname = response.data.lastname; 
                            });                          
                        }
                    });                   
                }
            });        
        });
    } //End getTasks()

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
                imgIcon += 'ppt.png';
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
        $window.open(filesApiBaseURL + uri);
    }

    $scope.upload_files = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                $scope.upload_single_file(i, file);
            }
        }
    }

    $scope.upload_single_file = function(index, fileData) {
        if (!fileData.$error) {
            Upload.upload({
                url: filesApiBaseURL + "/files/" + $routeParams.project_id + "/projects",
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                },
                data: {
                    file: fileData
                }
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            }).success(function (data, status, headers, config) {
                delete $scope.uploadFiles[index];
                $scope.uploadFiles.splice(index, 1);
                if ($scope.projectFiles.message) $scope.projectFiles = [];
                $scope.projectFiles.push(data);
                Lobibox.notify('success', {
                    position: 'top right',
                    sound: false,
                    size: 'mini',
                    msg: 'Successfully added file ' + fileData.name + '!'
                });
            });
        } else {
            Lobibox.notify('error', {
                position: 'top right',
                sound: false,
                size: 'mini',
                msg: 'Error added ' + '.'
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
    }

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
        });


        get_project_users();

        for(var i=0;i<$scope.statuses.length;i++) {
            var status = $scope.statuses[i]; 
            $scope.getTasks(status, $scope.getTasksParam(status,'user_id_filter'),$scope.getTasksParam(status,'limit'), $scope.getTasksParam(status,'page'));
        }

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

        //Get all files for project
        $http({
            method: 'GET',
            url: filesApiBaseURL + "/files/" + $routeParams.project_id + "/projects",
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.projectFiles = response.data;
        });
    } 

});
