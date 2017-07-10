var app = angular.module('myApp', ['ngRoute','ngStorage']);
//var apiBaseURL = "http://localhost:5000"; //local development
var usersApiBaseURL = "https://ryukyu-social.cleverword.com/users_service/api";
var userPhotosApiBaseURL = "https://ryukyu-social.cleverword.com/user_photos_service/api";
var projectsApiBaseURL = "https://ryukyu-social.cleverword.com/projects_service/api";
var tasksApiBaseURL = "https://ryukyu-social.cleverword.com/tasks_service/api";

app.service('CommonFunctions', function() {
    function parseJwt (token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(window.atob(base64));
    };

    function twoDigits(d) {
      if(0 <= d && d < 10) return "0" + d.toString();
      if(-10 < d && d < 0) return "-0" + (-1*d).toString();
      return d.toString();
    }
      
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

    this.checkLoggedInUser = function(scope, localStorage) {
        if(this.getToken()) {
            var decodedToken = parseJwt(this.getToken());
            scope.$parent.login_status = "Logged in as: " + decodedToken.email;
            scope.$parent.loggedin_user = decodedToken;
            scope.loggedin_user = decodedToken;
            localStorage.loggedin_user = decodedToken; //save for usage
        } else {
            delete scope.loggedin_user;
            delete scope.$parent.loggedin_user;
            delete scope.$parent.login_status;
            delete localStorage.loggedin_user;
        }
    }

    this.formatDate = function(dateString) {
      var date = new Date(dateString);
      return date.getUTCFullYear() + "-" + twoDigits(1 + date.getUTCMonth()) + "-" + twoDigits(date.getUTCDate()) + " " + twoDigits(date.getUTCHours()) + ":" + twoDigits(date.getUTCMinutes()) + ":" + twoDigits(date.getUTCSeconds());
    };
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
  .when("/user-panel/:user_id", {
    templateUrl: "user_panel.html",
    controller: "userPanelController"
  })
  .when("/project-panel/:project_id", {
    templateUrl: "project_panel.html",
    controller: "projectPanelController"
  })
  .when("/task-panel/:task_id", {
    templateUrl: "task_panel.html",
    controller: "taskPanelController"
  })
  .when("/tasks/new", {
    templateUrl: "new_task.html",
    controller: "newTaskController"
  })
  .when("/projects/:project_id/tasks/new", {
    templateUrl: "new_task.html",
    controller: "newTaskController"
  })
  .when("/tasks/:task_id/edit", {
    templateUrl: "edit_task.html",
    controller: "editTaskController"
  })
  .when("/projects/new", {
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
  .when("/users/new", {
    templateUrl: "new_user.html",
    controller: "newUserController"
  });

  // use the HTML5 History API
  $locationProvider.html5Mode(true);
});