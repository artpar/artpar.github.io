/**
 * Created by parth on 5/7/16.
 */


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


if (!window.auth_result) {
    mixpanel.track("not logged in");
    $("#loginButton").css("display", "");
    $("#loginButton").on("click", function () {
        mixpanel.track("login init");
        OAuth.initialize('CT4CkS8URTCXsiVQDU0egRsM4No');
        OAuth.popup('github')
            .done(function (result) {
                mixpanel.track("login success");
                window.auth_result = result;
                store.setItem("auth", JSON.stringify(result));
                notify("You are logged in");
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
    $("#loginButton").remove();
}