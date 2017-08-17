var app = angular.module('myApp', ['ngRoute','ngStorage','ngSanitize','btford.markdown','ngFileUpload']);

$(document).on("click", ".navigation .link", function(event) {
    $(".navigation .link").removeClass("active");
    $(event.target).addClass("active");
});