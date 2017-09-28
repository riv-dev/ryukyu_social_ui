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
  })
  .when("/users/:user_id/profile/edit", {
    templateUrl: "edit_user_profile.html",
    controller: "editUserProfileController"
  })
  .when("/groups/:group_id", {
    templateUrl: "group_panel.html",
    controller: "groupPanelController"
  });

  // use the HTML5 History API
  $locationProvider.html5Mode(true);
});
