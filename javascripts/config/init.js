var app = angular.module('myApp', ['ngRoute','ngStorage','ngSanitize','btford.markdown','ngFileUpload','ngAnimate','ngMaterial']);

$(document).on("click", ".navigation .link", function(event) {
    $(".navigation .link").removeClass("active");
    $(event.target).addClass("active");
});

app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});