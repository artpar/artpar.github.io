/**
 * Created by parth on 4/7/16.
 */

function GithubApi(username, repoName) {
    var github = "https://api.github.com";
    var githubHtml = "https://github.com";
    var repoFullName = username + "/" + repoName;
    var apiRepoBase = github + "/repos/" + repoFullName;

    var commitBase = apiRepoBase + "/commits";
    var fileBase = apiRepoBase + "/contents";
    var pullBase = apiRepoBase + "/pulls";
    var commitBaseHtml = githubHtml + "/" + repoFullName + "/commits";
    var fileBaseHtml = githubHtml + "/" + repoFullName + "/contents";


    this.getPullCommits = function (number, cb) {
        var msg = $("Getting ");
        msg.append($("<a>commits of pull " + number + "</a>").attr("href", pullBase + "/" + number).attr("target", "_blank"));
        notify(msg.html());
        request(pullBase + "/" + number + "/commits", cb);
    };

    this.getDiffBySha = function (sha, cb) {
        var msg = $("Getting ");
        msg.append($("<a>diff of sha " + sha + "</a>").attr("href", commitBase + "/" + sha).attr("target", "_blank"));
        notify(msg.html());
        request(commitBase + "/" + sha, cb);
    };

    this.getDiff = function (url, cb) {
        var config = {
            url: url,
            method: "GET",
            headers: {
                "Accept": "application/vnd.github.diff"
            },
            params: {},
            data: {},
            responseType: 'text'
        };

        config.success = function (text) {
            cb(text)
        };

        $.ajax(config);
    };


    this.getFile = function (filePath, cb) {
        mixpanel.track("get single file", {filePath: filePath});
        notify("Get file " + filePath.split("?")[0]);

        var config = {
            url: fileBase + "/" + filePath,
            method: "GET",
            headers: {
                "Accept": "application/vnd.github.raw"
            },
            responseType: 'text'
        };
        config.success = cb;
        request(fileBase + "/" + filePath, cb, {
            headers: {
                "Accept": "application/vnd.github.raw"
            }
        })
    };

    this.getFileList = function (cb) {
        mixpanel.track("get list of files", {
            repoName: fileBase
        });
        notify("Getting list of files in root ");
        request(fileBase, cb);
    };

    this.getCommits = function (cb) {
        mixpanel.track("get commits", {
            repoName: repoFullName
        });
        notify("Getting list of commits for " + repoFullName);
        request(commitBase, cb)
    };

    this.getPulls = function (cb) {
        mixpanel.track("get pulls", {
            repoName: repoFullName
        });
        notify("Getting list of pull requests for " + repoFullName);
        request(pullBase, cb)
    };

    return this;
}
