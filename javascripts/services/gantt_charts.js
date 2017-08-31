//Free version of Gantt only allows one instance of gantt chart
//Hack to get four gantt charts on one page.
app.directive('dhxGantt1', function ($location) {
  gantt1.config.autosize = "y";
  gantt1.config.columns = [
    { name: "text", label: "Project Name", width: "*", tree: true },
    { name: "start_date", label: "Start Date", width: 80, align: "center" },
    { name: "duration", label: "Duration", width: 80, align: "center" },
  ];

  gantt1.config.sort = true;


  gantt1.attachEvent("onDataRender", function () {
    var markerId = gantt1.addMarker({
      start_date: new Date(new Date(moment().format())), //a Date object that sets the marker's date
      css: "today", //a CSS class applied to the marker
      text: "Now", //the marker title
      title: moment().format('DD-MM-YYYY') // the marker's tooltip
    });

    gantt1.showDate(new Date(moment().format()));
  });

  gantt1.showLightbox = function(id) {
    window.location = '/projects/' + id;
  }

  return {
    restrict: 'EA',
    scope: {
      //@ reads the attribute value, = provides two-way binding, & works with functions
      data: '=',
      layout: '&',
      selectedProjectId: '=' 
    },
    transclude: true,
    template: '<div ng-transclude></div>',

    link: function ($scope, $element, $attrs, $controller) {
      //watch data collection, reload on changes
      console.log("$scope.layout = " + $scope.layout);
      console.log("$attrs.layout = " + $attrs.layout);

      console.log("$scope.data = " + JSON.stringify($scope.data));
      console.log("$attrs.data = " + $attrs.data);

      $scope.$watch('data', function(newValue, oldValue) {
        if(newValue) {
          gantt1.clearAll();
          gantt1.parse(newValue, "json");
        }
      }, true);

      //size of gantt
      $scope.$watch(function() {
        return $element[0].offsetWidth + "." + $element[0].offsetHeight;
      }, function() {
        gantt1.setSizes();
        gantt1.showDate(new Date(moment().format()));
      });

      $scope.$watch($scope.layout, function(layout_selection){
        console.log("layout_selection = " + layout_selection);
        if(layout_selection == 'gantt') {
          setTimeout(function(){ 
            gantt1.setSizes();
            gantt1.showDate(new Date(moment().format()));
          }, 1000);
        }
      }, true);

      $scope.setSelectedProjectId = function(value) {
        $scope.selectedProjectId = value;   
        $scope.$apply();
      }

      var menuElId = "";
      gantt1.attachEvent("onContextMenu", function(taskId, linkId, event){
        menuElId = $attrs.contextmenu;
        $("#"+menuElId).on('mouseleave',function() {
          $("#"+menuElId).hide();
        });
        if(taskId){
          $("#"+menuElId).show();
          $("#"+menuElId).detach().appendTo("body"); //position to body
          $("#"+menuElId).css('position','absolute');
          $("#"+menuElId).css({left:event.pageX, top:event.pageY});
          $scope.setSelectedProjectId(taskId);
          console.log("$scope.selectedProjectId = " + $scope.selectedProjectId);
        }
        if(taskId){
          return false;
        }
    
        return true;
      });

      //init gantt
      gantt1.init($element[0]);
    }
  }
});

app.directive('dhxGantt2', function ($location) {
  gantt2.config.autosize = "y";
  gantt2.config.columns = [
    { name: "text", label: "Project Name", width: "*", tree: true },
    { name: "start_date", label: "Start Date", width: 80, align: "center" },
    { name: "duration", label: "Duration", width: 80, align: "center" },
  ];

  gantt2.config.sort = true;


  gantt2.attachEvent("onDataRender", function () {
    var markerId = gantt2.addMarker({
      start_date: new Date(new Date(moment().format())), //a Date object that sets the marker's date
      css: "today", //a CSS class applied to the marker
      text: "Now", //the marker title
      title: moment().format('DD-MM-YYYY') // the marker's tooltip
    });

    gantt2.showDate(new Date(moment().format()));
  });

  gantt2.showLightbox = function(id) {
    window.location = '/projects/' + id;
  }

  return {
    restrict: 'EA',
    scope: {
      //@ reads the attribute value, = provides two-way binding, & works with functions
      data: '=',
      layout: '&',
      selectedProjectId: '=' 
    },
    transclude: true,
    template: '<div ng-transclude></div>',

    link: function ($scope, $element, $attrs, $controller) {
      //watch data collection, reload on changes
      console.log("$scope.layout = " + $scope.layout);
      console.log("$attrs.layout = " + $attrs.layout);

      console.log("$scope.data = " + JSON.stringify($scope.data));
      console.log("$attrs.data = " + $attrs.data);

      $scope.$watch('data', function(newValue, oldValue) {
        if(newValue) {
          gantt2.clearAll();
          gantt2.parse(newValue, "json");
        }
      }, true);

      //size of gantt
      $scope.$watch(function() {
        return $element[0].offsetWidth + "." + $element[0].offsetHeight;
      }, function() {
        gantt2.setSizes();
        gantt2.showDate(new Date(moment().format()));
      });

      $scope.$watch($scope.layout, function(layout_selection){
        console.log("layout_selection = " + layout_selection);
        if(layout_selection == 'gantt') {
          setTimeout(function(){ 
            gantt2.setSizes();
            gantt2.showDate(new Date(moment().format()));
          }, 1000);
        }
      }, true);

      $scope.setSelectedProjectId = function(value) {
        $scope.selectedProjectId = value;   
        $scope.$apply();
      }

      var menuElId = "";
      gantt2.attachEvent("onContextMenu", function(taskId, linkId, event){
        menuElId = $attrs.contextmenu;
        $("#"+menuElId).on('mouseleave',function() {
          $("#"+menuElId).hide();
        });
        if(taskId){
          $("#"+menuElId).show();
          $("#"+menuElId).detach().appendTo("body"); //position to body
          $("#"+menuElId).css('position','absolute');
          $("#"+menuElId).css({left:event.pageX, top:event.pageY});
          $scope.setSelectedProjectId(taskId);
          console.log("$scope.selectedProjectId = " + $scope.selectedProjectId);
        }
        if(taskId){
          return false;
        }
    
        return true;
      });

      //init gantt
      gantt2.init($element[0]);
    }
  }
});

app.directive('dhxGantt3', function ($location) {
  gantt3.config.autosize = "y";
  gantt3.config.columns = [
    { name: "text", label: "Project Name", width: "*", tree: true },
    { name: "start_date", label: "Start Date", width: 80, align: "center" },
    { name: "duration", label: "Duration", width: 80, align: "center" },
  ];

  gantt3.config.sort = true;


  gantt3.attachEvent("onDataRender", function () {
    var markerId = gantt3.addMarker({
      start_date: new Date(new Date(moment().format())), //a Date object that sets the marker's date
      css: "today", //a CSS class applied to the marker
      text: "Now", //the marker title
      title: moment().format('DD-MM-YYYY') // the marker's tooltip
    });

    gantt3.showDate(new Date(moment().format()));
  });

  gantt3.showLightbox = function(id) {
    window.location = '/projects/' + id;
  }

  return {
    restrict: 'EA',
    scope: {
      //@ reads the attribute value, = provides two-way binding, & works with functions
      data: '=',
      layout: '&',
      selectedProjectId: '=' 
    },
    transclude: true,
    template: '<div ng-transclude></div>',

    link: function ($scope, $element, $attrs, $controller) {
      //watch data collection, reload on changes
      console.log("$scope.layout = " + $scope.layout);
      console.log("$attrs.layout = " + $attrs.layout);

      console.log("$scope.data = " + JSON.stringify($scope.data));
      console.log("$attrs.data = " + $attrs.data);

      $scope.$watch('data', function(newValue, oldValue) {
        if(newValue) {
          gantt3.clearAll();
          gantt3.parse(newValue, "json");
        }
      }, true);

      //size of gantt
      $scope.$watch(function() {
        return $element[0].offsetWidth + "." + $element[0].offsetHeight;
      }, function() {
        gantt3.setSizes();
        gantt3.showDate(new Date(moment().format()));
      });

      $scope.$watch($scope.layout, function(layout_selection){
        console.log("layout_selection = " + layout_selection);
        if(layout_selection == 'gantt') {
          setTimeout(function(){ 
            gantt3.setSizes();
            gantt3.showDate(new Date(moment().format()));
          }, 1000);
        }
      }, true);

      $scope.setSelectedProjectId = function(value) {
        $scope.selectedProjectId = value;   
        $scope.$apply();
      }

      var menuElId = "";
      gantt3.attachEvent("onContextMenu", function(taskId, linkId, event){
        menuElId = $attrs.contextmenu;
        $("#"+menuElId).on('mouseleave',function() {
          $("#"+menuElId).hide();
        });
        if(taskId){
          $("#"+menuElId).show();
          $("#"+menuElId).detach().appendTo("body"); //position to body
          $("#"+menuElId).css('position','absolute');
          $("#"+menuElId).css({left:event.pageX, top:event.pageY});
          $scope.setSelectedProjectId(taskId);
          console.log("$scope.selectedProjectId = " + $scope.selectedProjectId);
        }
        if(taskId){
          return false;
        }
    
        return true;
      });

      //init gantt
      gantt3.init($element[0]);
    }
  }
});

app.directive('dhxGantt4', function ($location) {
  gantt4.config.autosize = "y";
  gantt4.config.columns = [
    { name: "text", label: "Project Name", width: "*", tree: true },
    { name: "start_date", label: "Start Date", width: 80, align: "center" },
    { name: "duration", label: "Duration", width: 80, align: "center" },
  ];

  gantt4.config.sort = true;


  gantt4.attachEvent("onDataRender", function () {
    var markerId = gantt4.addMarker({
      start_date: new Date(new Date(moment().format())), //a Date object that sets the marker's date
      css: "today", //a CSS class applied to the marker
      text: "Now", //the marker title
      title: moment().format('DD-MM-YYYY') // the marker's tooltip
    });

    gantt4.showDate(new Date(moment().format()));
  });

  gantt4.showLightbox = function(id) {
    window.location = '/projects/' + id;
  }

  return {
    restrict: 'EA',
    scope: {
      //@ reads the attribute value, = provides two-way binding, & works with functions
      data: '=',
      layout: '&',
      selectedProjectId: '=' 
    },
    transclude: true,
    template: '<div ng-transclude></div>',

    link: function ($scope, $element, $attrs, $controller) {
      //watch data collection, reload on changes
      console.log("$scope.layout = " + $scope.layout);
      console.log("$attrs.layout = " + $attrs.layout);

      console.log("$scope.data = " + JSON.stringify($scope.data));
      console.log("$attrs.data = " + $attrs.data);

      $scope.$watch('data', function(newValue, oldValue) {
        if(newValue) {
          gantt4.clearAll();
          gantt4.parse(newValue, "json");
        }
      }, true);

      //size of gantt
      $scope.$watch(function() {
        return $element[0].offsetWidth + "." + $element[0].offsetHeight;
      }, function() {
        gantt4.setSizes();
        gantt4.showDate(new Date(moment().format()));
      });

      $scope.$watch($scope.layout, function(layout_selection){
        console.log("layout_selection = " + layout_selection);
        if(layout_selection == 'gantt') {
          setTimeout(function(){ 
            gantt4.setSizes();
            gantt4.showDate(new Date(moment().format()));
          }, 1000);
        }
      }, true);

      $scope.setSelectedProjectId = function(value) {
        $scope.selectedProjectId = value;   
        $scope.$apply();
      }

      var menuElId = "";
      gantt4.attachEvent("onContextMenu", function(taskId, linkId, event){
        menuElId = $attrs.contextmenu;
        $("#"+menuElId).on('mouseleave',function() {
          $("#"+menuElId).hide();
        });
        if(taskId){
          $("#"+menuElId).show();
          $("#"+menuElId).detach().appendTo("body"); //position to body
          $("#"+menuElId).css('position','absolute');
          $("#"+menuElId).css({left:event.pageX, top:event.pageY});
          $scope.setSelectedProjectId(taskId);
          console.log("$scope.selectedProjectId = " + $scope.selectedProjectId);
        }
        if(taskId){
          return false;
        }
    
        return true;
      });

      //init gantt
      gantt4.init($element[0]);
    }
  }
});