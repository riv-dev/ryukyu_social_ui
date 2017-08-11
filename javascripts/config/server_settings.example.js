var run_environment = "remote_development";

var usersApiBaseURL = null;
var userPhotosApiBaseURL = null;
var projectsApiBaseURL = null;
var tasksApiBaseURL = null;

switch (run_environment) {
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
    usersApiBaseURL = "http://localhost:8000";
    userPhotosApiBaseURL = "http://localhost:8001";
    projectsApiBaseURL = "http://localhost:8002";
    tasksApiBaseURL = "http://localhost:8003";  
}