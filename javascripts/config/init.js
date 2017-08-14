var app = angular.module('myApp', ['ngRoute','ngStorage','ngSanitize','btford.markdown']);

$(document).on("click", ".navigation .link", function(event) {
    $(".navigation .link").removeClass("active");
    $(event.target).addClass("active");
});