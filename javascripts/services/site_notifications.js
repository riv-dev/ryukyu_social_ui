app.service('SiteNotifications', ['$http', function($http)  {

    var tasks_socket;

    var getTaskName = function (task_id, token, callback) {
        $http({
            method: 'GET',
            url: tasksApiBaseURL + '/tasks/' + task_id,
            headers: {
                'x-access-token': token
            }
        }).then(function (response) {
            callback(response.data.name);
        });
    }
    
    var getUserName = function (user_id, token, callback) {
        $http({
            method: 'GET',
            url: usersApiBaseURL + '/users/' + user_id,
            headers: {
                'x-access-token': token
            }
        }).then(function (response) {
            callback(response.data.firstname + " " + response.data.lastname);
        });
    }

    this.subscribeToNotifications = function (loggedin_username, token) {
        if(window.Notification && Notification.permission !== "denied") {
            Notification.requestPermission(function(status) {  // status is "granted", if accepted by user
        	});
        }

        //This part has to be done for NGINX reverse proxying redirects to work correctly
        //Not needed for local development with base root URL.
        var getLocation = function (href) {
            var l = document.createElement("a");
            l.href = href;
            return l;
        };

        var l = getLocation(tasksApiBaseURL);
        var protocol = l.protocol;
        var baseURL = l.hostname;
        var relativePath = l.pathname;

        var connectionOptions = {
            "transports": ["websocket"],
        }

        if(relativePath && relativePath.length > 1) {
            connectionOptions["path"] = relativePath + "/socket.io"
        }

        tasks_socket = io.connect(protocol + "//" + baseURL, connectionOptions);

        tasks_socket.on('task_status', function (data) {
            console.log(data);
            //Create a notification
            var message;
            if (data.status == 'finished') {
                message = 'Finished Task';
            } else if (data.status == 'doing') {
                message = 'Doing Task';
            } else if (data.status == 'waiting') {
                message = 'Task Waiting';
            }

            getTaskName(data.task_id, token, function(task_name) {
                getUserName(data.user_id, token, function(user_name) {
                    var n = new Notification(user_name + ': ' + message, {
                        body: task_name
                        //icon: '/path/to/icon.png' // optional
                    });
                });
            });
        });

        tasks_socket.on('task_assigned', function (data) {
            console.log(data);
            var username;
            var taskname;

            getTaskName(data.task_id, token, function(task_name) {
                getUserName(data.user_id, token, function(user_name) {
                    var n = new Notification(user_name + ': Assigned to Task', {
                        body: task_name
                        //icon: '/path/to/icon.png' // optional
                    });
                });
            });
        });
    }

    this.unSubscribeToNotifications = function () {
        if(tasks_socket) {
            tasks_socket.disconnect();
        }
    }


}]);