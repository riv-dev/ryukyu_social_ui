app.controller('taskPanelController', function ($scope, $http, $routeParams, $localStorage, CommonFunctions) {
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

    if ($localStorage.loggedin_user) {


        //Get task information
        get_task_details();

        //Get the user's assigned to the task
        get_users_assigned_to_task();

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



    }

});