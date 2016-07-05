/**
 * Created by parth on 5/7/16.
 */

function request(url, cb, options) {
    var headers = {
        "Accept": "application/vnd.github.diff"
    };
    var config = _.extend({
        url: url,
        method: "GET",
        headers: headers,
        params: {},
        data: {},
        responseType: 'text',
        success: cb
    }, options || {});
    window.auth.addHeader(config);
    $.ajax(config);
}
//$.ajax({
//    url: "static/templates/github.mustache",
//    success: function (template) {
//        Mustache.parse(template);   // optional, speeds up future uses
//        var rendered = Mustache.render(template, {});
//        $(".repoTabContent").html(template);
//    }
//});


var store = window.localStorage;
var authString = store.getItem("auth");
if (authString) {
    window.auth_result = JSON.parse(authString);
}

window.auth = (function () {
    this.getToken = function () {
        if (window.auth_result) {
            return window.auth_result.access_token;
        }
        return null;
    };

    this.addHeader = function (res1) {
        if (this.isAuthenticated()) {
            if (!res1.headers) {
                res1.headers = {};
            }
            res1.headers["Authorization"] = "token " + this.getToken();
        }
    };

    this.isAuthenticated = function () {
        return !!window.auth_result;

    };
    return this;
})();

function initProfileButton() {

    var button = $('#profileButton');


    button.css("display", "");

    var dropInstance = new Drop({
        target: document.querySelector('#profileButton'),
        content: $("#repoTabContent")[0],
        classes: 'drop-theme-arrows',
        position: 'bottom',
        openOn: 'click'
    });

    request("https://api.github.com/user/orgs", function (orgs) {
        console.log("orgs", orgs);
        _.each(orgs, function (org) {
            request("https://api.github.com/users/" + org.login + "/repos", function (repos) {
                addRepos(org.login, repos);
            });
        })
    });

    request("https://api.github.com/user/repos", function (repos) {
        console.log("repos", repos);
        addRepos("mine", repos);
    });
}

window.repoTemplate = undefined;
$.ajax({
    url: "static/templates/repo_list.mustache",
    success: function (template) {
        window.repoTemplate = template;
        Mustache.parse(window.repoTemplate);
    }
});

function addRepos(name, list) {
    console.log("add repo", name, list);
    var tab = addTabCore("repo", name);
    var rendered = Mustache.render(window.repoTemplate, {list: list});
    tab.html(rendered);
}


var $loginButton = $("#loginButton");
if (!window.auth_result) {
    mixpanel.track("not logged in");
    $loginButton.css("display", "");
    $loginButton.on("click", function () {
        mixpanel.track("login init");
        OAuth.initialize('CT4CkS8URTCXsiVQDU0egRsM4No');
        OAuth.popup('github')
            .done(function (result) {
                mixpanel.track("login success");
                window.auth_result = result;
                store.setItem("auth", JSON.stringify(result));
                notify("You are logged in");
                initProfileButton();
                //use result.access_token in your API request
                //or use result.get|post|put|del|patch|me methods (see below)
            })
            .fail(function (err) {
                mixpanel.track("login fail", err);
                console.log("github login error", err);
                notify("user not logged in. Github will limit number of API requests for guests.");
                //handle error with err
            });
    });

} else {
    mixpanel.track("logged in user");
    $loginButton.remove();
    initProfileButton();
}