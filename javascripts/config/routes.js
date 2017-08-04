var app = angular.module('myApp', ['ngRoute','ngStorage','ngSanitize','btford.markdown']);

var development_mode = run_environment;

var usersApiBaseURL = null;
var userPhotosApiBaseURL = null;
var projectsApiBaseURL = null;
var tasksApiBaseURL = null;

switch (development_mode) {
  case 'local_development':
    usersApiBaseURL = "http://localhost:8000";
    userPhotosApiBaseURL = "http://localhost:8001";
    projectsApiBaseURL = "http://localhost:8002";
    tasksApiBaseURL = "http://localhost:8003";
    break;
  case 'remote_development':
    usersApiBaseURL = "https://ryukyu-social-dev.cleverword.com/users_service/api";
    userPhotosApiBaseURL = "https://ryukyu-social-dev.cleverword.com/user_photos_service/api";
    projectsApiBaseURL = "https://ryukyu-social-dev.cleverword.com/projects_service/api";
    tasksApiBaseURL = "https://ryukyu-social-dev.cleverword.com/tasks_service/api";  
    break;
  case 'production':
    usersApiBaseURL = "https://ryukyu-social.cleverword.com/users_service/api";
    userPhotosApiBaseURL = "https://ryukyu-social.cleverword.com/user_photos_service/api";
    projectsApiBaseURL = "https://ryukyu-social.cleverword.com/projects_service/api";
    tasksApiBaseURL = "https://ryukyu-social.cleverword.com/tasks_service/api";
    break;
  default:
    usersApiBaseURL = "http://localhost:7000";
    userPhotosApiBaseURL = "http://localhost:7001";
    projectsApiBaseURL = "http://localhost:7002";
    tasksApiBaseURL = "http://localhost:7003";  
}

app.service('CommonFunctions', function() {
    function parseJwt (token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(window.atob(base64));
    };

    this.setFlashMessage = function(scope, localStorage) {
        if(localStorage.flash_message) {
            scope.$parent.flash_message = localStorage.flash_message;
            delete localStorage.flash_message;
        } else {
            delete scope.$parent.flash_message;
        }     
    };

    this.setToken = function(token) {
        window.localStorage.setItem("token", token);
    }

    this.getToken = function() {
        return window.localStorage.getItem("token");
    }

    this.deleteToken = function() {
        window.localStorage.removeItem("token");
    }
    
    this.checkLoggedInUser = function(scope, localStorage, location) {
        if(this.getToken()) {
            var decodedToken = parseJwt(this.getToken());
            scope.$parent.login_status = "Logged in as: " + decodedToken.email;
            scope.$parent.loggedin_user = decodedToken;
            scope.loggedin_user = decodedToken;
            localStorage.loggedin_user = decodedToken; //save for usage
            console.log("Token: " + JSON.stringify(decodedToken));
            console.log(moment(decodedToken.exp,"X").calendar());
            if(moment() > moment(decodedToken.exp,"X")) {
              //expired
              scope.$parent.flash_message = "Log in expired.";
              scope.$parent.flash_level = "fail";
              delete scope.loggedin_user;
              delete scope.$parent.loggedin_user;
              delete scope.$parent.login_status;
              delete localStorage.loggedin_user;              

              if(window.location.pathname != '/' && window.location.pathname != '') {
                localStorage.url_attempted = location.path();
                location.path('/');
              } 
            }
        } else {
            delete scope.loggedin_user;
            delete scope.$parent.loggedin_user;
            delete scope.$parent.login_status;
            delete localStorage.loggedin_user;
            scope.$parent.flash_message = "Please log in.";
            scope.$parent.flash_level = "fail";

            if(window.location.pathname != '/' && window.location.pathname != '') {
              localStorage.url_attempted = location.path();
              location.path('/');
            }
        }
    }

    this.getDateTimeMoment = function(date,time) {
        var dateStr = "";
        if(!date) {
          console.log("DateTimeStr: " + null);
          return undefined;
        } else {
          var monthStr = "";

          if((date.getMonth()+1) < 10) {
            monthStr = "0" + (date.getMonth()+1); 
          } else {
            monthStr = date.getMonth()+1;
          }

          var dayStr = "";
          if(date.getDate() < 10) {
            dayStr = "0" + date.getDate(); 
          } else {
            dayStr = date.getDate();
          }
          dateStr = date.getFullYear() + "-" + monthStr + "-" + dayStr;
        }

        var timeStr = null;
        if(!time) {
          timeStr = "18:00"
        } else {
          var hoursStr = "";
          if(time.getHours() < 10) {
            hoursStr = "0" + time.getHours(); 
          } else {
            hoursStr = time.getHours();
          }

          var minutesStr = "";
          if(time.getMinutes() < 10) {
            minutesStr = "0" + time.getMinutes(); 
          } else {
            minutesStr = time.getMinutes();
          }  
          timeStr = hoursStr + ":" + minutesStr;
        }

        var dateTimeStr = dateStr + "T" + timeStr + ":00";

        console.log("DateTimeStr: " + dateTimeStr);

        return moment(dateTimeStr).format();
    }
});

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when("/", {
    templateUrl: "home_panel.html",
    controller: "homePanelController"
  })
  .when("/login", {
    templateUrl: "login.html",
    controller: "loginController"
  })
  .when("/logout", {
    templateUrl: "logout.html",
    controller: "logoutController"
  })
  .when("/home-panel", {
    templateUrl: "home_panel.html",
    controller: "homePanelController"
  })
  .when("/users/new", {
    templateUrl: "new_user.html",
    controller: "newUserController"
  })
  .when("/users/:user_id/edit", {
    templateUrl: "edit_user.html",
    controller: "editUserController"
  })
  .when("/users/:user_id", {
    templateUrl: "user_panel.html",
    controller: "userPanelController"
  })
  .when("/projects/:project_id/users/:user_id", {
    templateUrl: "user_panel.html",
    controller: "userPanelController"
  })
  .when("/projects/new", {
    templateUrl: "new_project.html",
    controller: "newProjectController"
  })
  .when("/users/:user_id/projects/new", {
    templateUrl: "new_project.html",
    controller: "newProjectController"
  })
  .when("/projects/:project_id/edit", {
    templateUrl: "edit_project.html",
    controller: "editProjectController"
  })
  .when("/projects/:project_id/users/:user_id/edit", {
    templateUrl: "edit_project_permissions.html",
    controller: "editProjectPermissionsController"
  })
  .when("/projects/:project_id", {
    templateUrl: "project_panel.html",
    controller: "projectPanelController"
  })
  .when("/users/:user_id/projects/:project_id", {
    templateUrl: "project_panel.html",
    controller: "projectPanelController"
  })
  .when("/tasks/new", {
    templateUrl: "new_task.html",
    controller: "newTaskController"
  })
  .when("/projects/:project_id/tasks/new", {
    templateUrl: "new_task.html",
    controller: "newTaskController"
  })
  .when("/users/:user_id/tasks/new", {
    templateUrl: "new_task.html",
    controller: "newTaskController"
  })
  .when("/tasks/:task_id/edit", {
    templateUrl: "edit_task.html",
    controller: "editTaskController"
  })
  .when("/tasks/:task_id", {
    templateUrl: "task_panel.html",
    controller: "taskPanelController"
  })
  .when("/users/:user_id/tasks/:task_id", {
    templateUrl: "task_panel.html",
    controller: "taskPanelController"
  })
  .when("/projects/:project_id/tasks/:task_id", { //viewing a task from context of a project
    templateUrl: "task_panel.html",
    controller: "taskPanelController"
  });

  // use the HTML5 History API
  $locationProvider.html5Mode(true);
});