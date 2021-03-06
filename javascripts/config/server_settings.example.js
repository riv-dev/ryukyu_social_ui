var run_environment = "remote_development";

var usersApiBaseURL = null;
var userPhotosApiBaseURL = null;
var userProfileApiBaseURL = null;
var projectsApiBaseURL = null;
var projectPhotosApiBaseURL = null;
var tasksApiBaseURL = null;
var filesApiBaseURL = null;
var groupsApiBaseURL = null;
var codeCheckerApiBaseURL = null;


switch (run_environment) {
  case 'local_development':
    usersApiBaseURL = "http://localhost:8000";
    userPhotosApiBaseURL = "http://localhost:8001";
    projectsApiBaseURL = "http://localhost:8002";
    projectPhotosApiBaseURL = "http://localhost:8004";
    tasksApiBaseURL = "http://localhost:8003";
    userProfileApiBaseURL = "http://localhost:8005";
    filesApiBaseURL = "http://localhost:8006";
    groupsApiBaseURL = "http://localhost:8008";
    codeCheckerApiBaseURL = "http://localhost:8100";

    break;
  case 'remote_development':
    usersApiBaseURL = "https://ryukyu-social-dev.cleverword.com/users_service/api";
    userPhotosApiBaseURL = "https://ryukyu-social-dev.cleverword.com/user_photos_service/api";
    projectsApiBaseURL = "https://ryukyu-social-dev.cleverword.com/projects_service/api";
    projectPhotosApiBaseURL = "https://ryukyu-social-dev.cleverword.com/project_photos_service/api";
    tasksApiBaseURL = "https://ryukyu-social-dev.cleverword.com/tasks_service/api";  
    userProfileApiBaseURL = "https://ryukyu-social-dev.cleverword.com/user_profile_service/api";
    filesApiBaseURL = "https://ryukyu-social-dev.cleverword.com/files_service/api";
    groupsApiBaseURL = "https://ryukyu-social-dev.cleverword.com/groups_service/api";
    codeCheckerApiBaseURL = "https://ryukyu-social-dev.cleverword.com/code_checker_service/api"; 
    break;
  case 'production':
    usersApiBaseURL = "https://ryukyu-social.cleverword.com/users_service/api";
    userPhotosApiBaseURL = "https://ryukyu-social.cleverword.com/user_photos_service/api";
    projectsApiBaseURL = "https://ryukyu-social.cleverword.com/projects_service/api";
    projectPhotosApiBaseURL = "https://ryukyu-social.cleverword.com/project_photos_service/api";
    tasksApiBaseURL = "https://ryukyu-social.cleverword.com/tasks_service/api";
    userProfileApiBaseURL = "https://ryukyu-social.cleverword.com/user_profile_service/api";
    filesApiBaseURL = "https://ryukyu-social.cleverword.com/files_service/api";
    groupsApiBaseURL = "https://ryukyu-social.cleverword.com/groups_service/api";
    codeCheckerApiBaseURL = "https://ryukyu-social.cleverword.com/code_checker_service/api";
    break;
  default:
    usersApiBaseURL = "http://localhost:8000";
    userPhotosApiBaseURL = "http://localhost:8001";
    projectsApiBaseURL = "http://localhost:8002";
    projectPhotosApiBaseURL = "http://localhost:8004";
    tasksApiBaseURL = "http://localhost:8003";  
    userProfileApiBaseURL = "http://localhost:8005";
    filesApiBaseURL = "http://localhost:8006";
    groupsApiBaseURL = "http://localhost:8008";
    codeCheckerApiBaseURL = "http://localhost:8100";
}