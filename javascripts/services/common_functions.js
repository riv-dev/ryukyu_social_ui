app.service('CommonFunctions',  ['SiteNotifications', function(SiteNotifications) {
    var decodedToken;

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

    this.getLoggedInUserName = function() {
      return decodedToken.firstname + " " + decodedToken.lastname;
    }

    this.deleteToken = function() {
        window.localStorage.removeItem("token");
    }
    
    this.checkLoggedInUser = function(scope, localStorage, location) {
        if(this.getToken()) {
            decodedToken = parseJwt(this.getToken());
            scope.$parent.login_status = "Logged in as: " + decodedToken.email;
            scope.$parent.loggedin_user = decodedToken;
            scope.loggedin_user = decodedToken;
            localStorage.loggedin_user = decodedToken; //save for usage
            console.log("Token: " + JSON.stringify(decodedToken));
            console.log(moment(decodedToken.exp,"X").calendar());
            if(moment() > moment(decodedToken.exp,"X")) {
              //expired
              localStorage.flash_message = "Log in expired.";
              scope.$parent.flash_level = "fail";
              delete scope.loggedin_user;
              delete scope.$parent.loggedin_user;
              delete scope.$parent.login_status;
              delete localStorage.loggedin_user;              
              SiteNotifications.unSubscribeToNotifications();

              localStorage.url_attempted = location.path();
              location.path('/login');
            } else {
              SiteNotifications.subscribeToNotifications(this.getLoggedInUserName(), this.getToken());
            }
        } else {
            delete scope.loggedin_user;
            delete scope.$parent.loggedin_user;
            delete scope.$parent.login_status;
            delete localStorage.loggedin_user;
            localStorage.flash_message = "Please log in.";
            scope.$parent.flash_level = "fail";

            SiteNotifications.unSubscribeToNotifications();

            localStorage.url_attempted = location.path();
            location.path('/login');
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
}]);