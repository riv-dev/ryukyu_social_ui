var app = angular.module('myApp', ['ngRoute','ngStorage','ngSanitize']);
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