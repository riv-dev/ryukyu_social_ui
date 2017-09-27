app.controller('taskPanelController', function ($scope, $http, $window, $timeout, $routeParams, $location, $localStorage, Upload, CommonFunctions) {
    $scope.$parent.hero = "Task Panel";
    $scope.$parent.panel_class = "task";


    CommonFunctions.setFlashMessage($scope, $localStorage);
    CommonFunctions.checkLoggedInUser($scope, $localStorage, $location);


    if ($routeParams.project_id) {
        $scope.this_project_id = $routeParams.project_id;
    }

    if ($routeParams.user_id) {
        $scope.this_user_id = $routeParams.user_id;
    }

    $scope.show_deadline_calendar = function () {
        $('.value.deadline .date').css('display', 'none');
        $('.form.deadline').css('display', 'block');
        $('.button.calendar').css('display', 'none');
    }

    $scope.update_deadline = function () {
        $('.value.deadline .date').css('display', 'inline-block');
        $('.form.deadline').css('display', 'none');
        $('.button.calendar').css('display', 'inline-block');

        var new_deadline = moment($('#deadline_input').handleDtpicker('getDate')).format();

        $scope.put('deadline', new_deadline, function (response) {
            get_task_details();
        });
    }

    $scope.cancel_deadline = function () {
        $('.value.deadline .date').css('display', 'inline-block');
        $('.form.deadline').css('display', 'none');
        $('.button.calendar').css('display', 'inline-block');

        if($scope.this_task.deadline) {
            $('#deadline_input').handleDtpicker('setDate', new Date($scope.this_task.deadline));
        }
    }

    $scope.show_project_form = function () {
        $('.value.project .link').css('display', 'none');
        $('.form.project').css('display', 'block');
        $('.button.edit.project').css('display', 'none');

        $scope.project_id_backup = $scope.this_task.project_id;
    }

    $scope.update_project = function () {
        $('.value.project .link').css('display', 'inline-block');
        $('.form.project').css('display', 'none');
        $('.button.edit.project').css('display', 'inline-block');

        $scope.put('project_id', $scope.this_task.project_id, function (response) {
            $('#deadline_input').handleDtpicker('destroy');
            get_task_details();
        });
    }

    $scope.cancel_project = function () {
        $('.value.project .link').css('display', 'inline-block');
        $('.form.project').css('display', 'none');
        $('.button.edit.project').css('display', 'inline-block');

        $scope.this_task.project_id = $scope.project_id_backup;
    }

    $scope.show_name_form = function () {
        $('.title.task').css('display', 'none');
        $('.form.name').css('display', 'block');
        $('.button.edit.name').css('display', 'none');

        $scope.name_backup = $scope.this_task.name;
    }

    $scope.update_name = function () {
        $('.title.task').css('display', 'inline-block');
        $('.form.name').css('display', 'none');
        $('.button.edit.name').css('display', 'inline-block');

        $scope.put('name', $scope.this_task.name, function (response) {
            get_task_details();
        });
    }

    $scope.cancel_name = function () {
        $('.title.task').css('display', 'inline-block');
        $('.form.name').css('display', 'none');
        $('.button.edit.name').css('display', 'inline-block');

        $scope.this_task.name = $scope.name_backup;

    }


    $scope.show_description_form = function () {
        $('.info.description.markdown').css('display', 'none');
        $('.form.description').css('display', 'block');
        $('.button.edit.description').css('display', 'none');

        $scope.description_backup = $scope.this_task.description;
    }

    $scope.update_description = function () {
        $('.info.description.markdown').css('display', 'block');
        $('.form.description').css('display', 'none');
        $('.button.edit.description').css('display', 'inline-block');

        $scope.put('description', $scope.this_task.description, function (response) {
            get_task_details();
        });
    }

    $scope.cancel_description = function () {
        $('.info.description.markdown').css('display', 'block');
        $('.form.description').css('display', 'none');
        $('.button.edit.description').css('display', 'inline-block');

        $scope.this_task.description = $scope.description_backup;

    }

    $scope.prettyDateDeadline = function (isoDateStr, status) {
        if (moment() > moment(isoDateStr) && (status == "new" || status == "dump" || status == "waiting" || status == "doing")) {
            return "Past Due";
        } else {
            return moment(isoDateStr).calendar();
        }
    }

    $scope.put = function (key, value, callback) {
        var update_object = {};
        update_object[key] = value;

        $http({
            method: 'PUT',
            url: tasksApiBaseURL + '/tasks/' + $routeParams.task_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: update_object
        }).then(
            function successCallback(response) {
                if(callback) {  
                    callback(response);
                }
            },
            function errorCallback(response) {
                if(callback) {
                    callback(response);
                }

                $scope.$parent.flash_message = "You are not assigned to this task. Cannot edit.";
                $scope.$parent.flash_level = "fail";
            }
        );
    };



    $scope.prettyDate = function (isoDateStr) {
        return moment(isoDateStr).calendar();
    }

    $scope.back = function () {
        window.history.back();
    }

    $scope.archivedYesNo = function (archived) {
        if (archived) {
            return "Yes";
        } else {
            return "No";
        }
    }

    $scope.checkPriorityImportance = function (priority) {
        if (priority > 2) {
            return "important";
        } else {
            return null;
        }
    }

    $scope.checkDateImportance = function (date, status) {
        if (/today/i.test(moment(date).calendar())) {
            return "important";
        } else if (moment() > moment(date) && (status == "new" || status == "dump" || status == "waiting" || status == "doing")) {
            return "important";
        } else {
            return null;
        }
    }

    $scope.getPriorityLabel = function (index) {
        var priorities = [
            "Not Important at All",
            "Slightly Important",
            "Important",
            "Fairly Important",
            "Very Important"
        ]

        if (index) {
            return priorities[index];
        } else {
            return null;
        }
    }

    $scope.cssLast = function (isLast) {
        if (isLast) {
            return "last";
        }
    }

    $scope.getFullName = function (user) {
        if (user.title) {
            return user.firstname + " " + user.lastname + " (" + user.title + ")";
        } else {
            return user.firstname + " " + user.lastname;
        }
    }

    $scope.is_mine_class = function (user) {
        if ($localStorage.loggedin_user.id == user.user_id) {
            return "is_mine";
        } else {
            return null;
        }
    }

    var get_task_details = function () {
        //Get task information
        $http({
            method: 'GET',
            url: tasksApiBaseURL + '/tasks/' + $routeParams.task_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.this_task = response.data;

            if($scope.loggedin_user.admin || $scope.this_task.creator_user_id == $scope.loggedin_user.id) {
                $scope.im_assigned_to_this_task = true;
            }

            //Form fields
            //JQuery Libs
            $(function () {
                $('#deadline_input').appendDtpicker({
                    "inline": true
                });
                if($scope.this_task.deadline) {
                    $('#deadline_input').handleDtpicker('setDate', new Date($scope.this_task.deadline));
                }
                $('.form.deadline').css('display', 'none');
                $('.form.project').css('display', 'none');
                $('.form.name').css('display', 'none');
                $('.form.description').css('display', 'none');
            });

            //Get the project name assigned to the task
            if ($scope.this_task.project_id) {
                $http({
                    method: 'GET',
                    url: projectsApiBaseURL + '/projects/' + $scope.this_task.project_id,
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    }
                }).then(function (response) {
                    $scope.this_task.project_name = response.data.name;
                });
            }

            //Get the name of the user that created this task
            if ($scope.this_task.creator_user_id == $scope.loggedin_user.id) {
                $scope.this_task.creator_name = "Me";
            } else {
                $http({
                    method: 'GET',
                    url: usersApiBaseURL + '/users/' + $scope.this_task.creator_user_id,
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    }
                }).then(function (response) {
                    $scope.this_task.creator_name = $scope.getFullName(response.data);
                });
            }
        });
    }

    var get_users_assigned_to_task = function () {
        //Get the task's users
        $http({
            method: 'GET',
            url: tasksApiBaseURL + '/tasks/' + $routeParams.task_id + '/users',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.assigned_users = response.data;

            for (var i = 0; i < response.data.length; i++) {
                var current_user = $scope.assigned_users[i];
                //When grabbing project users, the "id" field is not the user_id.
                //"id" field is actually the id of the link between the project and the user
                //Use the "user_id" field
                var current_user_id = current_user.user_id;

                if ($localStorage.loggedin_user.id == current_user_id) {
                    $scope.my_progress_description = current_user.progress_description;
                    $scope.im_assigned_to_this_task = true;
                }

                $http({
                    method: 'GET',
                    url: usersApiBaseURL + '/users/' + current_user_id,
                    headers: {
                        'x-access-token': CommonFunctions.getToken()
                    },
                    params: {
                        'i': i
                    }
                }).then(function (response) {
                    $scope.assigned_users[parseInt(response.config["params"]["i"])]["firstname"] = response.data.firstname;
                    $scope.assigned_users[parseInt(response.config["params"]["i"])]["lastname"] = response.data.lastname;
                    $scope.assigned_users[parseInt(response.config["params"]["i"])]["title"] = response.data.title;
                });
            }
        });
    }

    $scope.assign_user = function () {
        //Get task information
        $http({
            method: 'POST',
            url: tasksApiBaseURL + '/tasks/' + $routeParams.task_id + '/users/' + $scope.selected_user_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            //Refresh assigned users
            get_users_assigned_to_task();
        });
    }

    $scope.update_progress = function () {
        //(this) is equivalent to ($scope) inside the function
        $http({
            method: 'PUT',
            url: tasksApiBaseURL + '/users/' + $localStorage.loggedin_user.id + '/tasks/' + $routeParams.task_id,
            headers: {
                'x-access-token': CommonFunctions.getToken()
            },
            data: {
                progress_description: this.my_progress_description
            }
        }).then(function (response) {
            //Refresh assigned users
            get_users_assigned_to_task();
        });
    }

    $scope.remove_task = function () {
        var answer = prompt('Are you sure you wish to delete this task?  Type "yes" to confirm');
        //(this) is equivalent to ($scope) inside the function
        if (answer == "yes") {
            $http({
                method: 'DELETE',
                url: tasksApiBaseURL + '/tasks/' + $routeParams.task_id,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(function (response) {
                $localStorage.flash_message = "Deleted Task: " + $scope.this_task.name;
                $scope.$parent.flash_level = "alert";
                window.history.back();
            });
        } else {
            $scope.$parent.flash_message = 'Did not type "yes".  Task not deleted';
            $scope.$parent.flash_level = 'fail';
        }
    }

    $scope.remove_user = function (user) {
        //(this) is equivalent to ($scope) inside the function
        var answer = prompt('Remove ' + user.firstname + " " + user.lastname + ' from this task?  Type "yes" to confirm');
        if (answer == "yes") {
            $http({
                method: 'DELETE',
                url: tasksApiBaseURL + '/users/' + user.user_id + '/tasks/' + $routeParams.task_id,
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(function (response) {
                //Refresh assigned users
                $scope.$parent.flash_message = "Removed " + user.firstname + " " + user.lastname + " from this task";
                $scope.$parent.flash_level = "alert";
                get_users_assigned_to_task();
            });
        } else {
            $scope.$parent.flash_message = 'Did not type "yes". ' + user.firstname + " " + user.lastname + " not removed from the task.";
            $scope.$parent.flash_level = "fail";
        }
    }

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
                url: filesApiBaseURL + "/tasks/" + $routeParams.task_id + "/files",
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
                    if ($scope.taskFiles.message) $scope.taskFiles = [];
                    $scope.taskFiles.push(response.data);
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
                    delete $scope.taskFiles[index];
                    $scope.taskFiles.splice(index, 1);
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
                url: filesApiBaseURL + '/tasks/' + $routeParams.task_id + '/files',
                headers: {
                    'x-access-token': CommonFunctions.getToken()
                }
            }).then(
                function successCallback(response) {
                    delete $scope.taskFiles;
                    $scope.taskFiles = [];
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

    if ($localStorage.loggedin_user) {
        //Get task information
        get_task_details();

        //Get the user's assigned to the task
        get_users_assigned_to_task();

        //Get all users for assigning new users
        $http({
            method: 'GET',
            url: usersApiBaseURL + '/users?active=1',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.users = response.data;
        });

        //Get all projects for assigning project 
        $http({
            method: 'GET',
            url: projectsApiBaseURL + '/projects',
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.projects = response.data;
        });
        
        //Get all files for task
        $http({
            method: 'GET',
            url: filesApiBaseURL + "/tasks/" + $routeParams.task_id + "/files",
            headers: {
                'x-access-token': CommonFunctions.getToken()
            }
        }).then(function (response) {
            $scope.taskFiles = response.data;
        });

    }

});