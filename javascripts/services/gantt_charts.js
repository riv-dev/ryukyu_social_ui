//Free version of Gantt only allows one instance of gantt chart
//Hack to get four gantt charts on one page.
app.directive('dhxGantt1', function () {
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

  return {
    restrict: 'A',
    scope: false,
    transclude: true,
    template: '<div ng-transclude></div>',

    link:function ($scope, $element, $attrs, $controller){
      //watch data collection, reload on changes
      $scope.$watch($attrs.data, function(collection){
        gantt1.clearAll();
        gantt1.parse(collection, "json");
      }, true);

      //size of gantt
      $scope.$watch(function() {
        return $element[0].offsetWidth + "." + $element[0].offsetHeight;
      }, function() {
        gantt1.setSizes();
        gantt1.showDate(new Date(moment().format()));
      });

      $scope.$watch($attrs.layout, function(layout_selection){
        if(layout_selection == 'gantt') {
          setTimeout(function(){ 
            gantt1.setSizes();
            gantt1.showDate(new Date(moment().format()));
          }, 1000);
        }
      }, true);

      //init gantt
      gantt1.init($element[0]);
    }
  }
});

app.directive('dhxGantt2', function () {
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

  return {
    restrict: 'A',
    scope: false,
    transclude: true,
    template: '<div ng-transclude></div>',

    link:function ($scope, $element, $attrs, $controller){
      //watch data collection, reload on changes
      $scope.$watch($attrs.data, function(collection){
        gantt2.clearAll();
        gantt2.parse(collection, "json");
      }, true);

      //size of gantt
      $scope.$watch(function() {
        return $element[0].offsetWidth + "." + $element[0].offsetHeight;
      }, function() {
        gantt2.setSizes();
        gantt2.showDate(new Date(moment().format())); 
      });

      $scope.$watch($attrs.layout, function(layout_selection){
        if(layout_selection == 'gantt') {
          setTimeout(function(){ 
            gantt2.setSizes();
            gantt2.showDate(new Date(moment().format()));
          }, 1000);
        }
      }, true);

      //init gantt
      gantt2.init($element[0]);
    }
  }
});

app.directive('dhxGantt3', function () {
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

  return {
    restrict: 'A',
    scope: false,
    transclude: true,
    template: '<div ng-transclude></div>',

    link:function ($scope, $element, $attrs, $controller){
      //watch data collection, reload on changes
      $scope.$watch($attrs.data, function(collection){
        gantt3.clearAll();
        gantt3.parse(collection, "json");
      }, true);

      //size of gantt
      $scope.$watch(function() {
        return $element[0].offsetWidth + "." + $element[0].offsetHeight;
      }, function() {
        gantt3.setSizes();
        gantt3.showDate(new Date(moment().format()));
      });

      $scope.$watch($attrs.layout, function(layout_selection){
        if(layout_selection == 'gantt') {
          setTimeout(function(){ 
            gantt3.setSizes();
            gantt3.showDate(new Date(moment().format()));
          }, 1000);
        }
      }, true);

      //init gantt
      gantt3.init($element[0]);
    }
  }
});

app.directive('dhxGantt4', function () {
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

  return {
    restrict: 'A',
    scope: false,
    transclude: true,
    template: '<div ng-transclude></div>',

    link:function ($scope, $element, $attrs, $controller){
      //watch data collection, reload on changes
      $scope.$watch($attrs.data, function(collection){
        gantt4.clearAll();
        gantt4.parse(collection, "json");
      }, true);

      //size of gantt
      $scope.$watch(function() {
        return $element[0].offsetWidth + "." + $element[0].offsetHeight;
      }, function() {
        gantt4.setSizes();
        gantt4.showDate(new Date(moment().format())); 
      });

      $scope.$watch($attrs.layout, function(layout_selection){
        if(layout_selection == 'gantt') {
          setTimeout(function(){ 
            gantt4.setSizes();
            gantt4.showDate(new Date(moment().format()));
          }, 100);
        }
      }, true);

      //init gantt
      gantt4.init($element[0]);
    }
  }
});