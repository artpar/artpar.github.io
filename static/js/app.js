/**
 * Created by parth on 2/7/16.
 */

var writeNext = function (text, editor, speed, complete) {
    if (!text || text.length < 1) {
        if (complete && typeof complete == "function") {
            complete();
        }
        return
    }
    editor.insert(text[0]);
    setTimeout(function () {
        writeNext(text.substring(1), editor, speed, complete)
    }, speed.getSpeed() / 10)
};


var Speed = function () {
    this.speed = 120;
    this.setSpeed = function (s) {
        this.speed = s * 10;
    };
    this.getSpeed = function () {
        return this.speed * 2;
    };
    return this;
};

var speed = new Speed();

$("#loadRepo").on("click", function () {
    $("#editorContainer").html('<ul id="fileTabs" class="nav nav-tabs"></ul>' +
        '<div class="tab-content file-content clearfix"></div>');
    initEditor();
    loadUrl($("#githubUrl").val());
});

function App(defaultUrl) {
    var that = this;
    var commitUrl = defaultUrl;
    var urlParts = commitUrl.split("/");

    if (urlParts.length < 5) {
        notify("Bad url, cannot load " + commitUrl)
    }

    var username = urlParts[3];
    var repoName = urlParts[4];

    $("#githubUrl").val(githubUrl + username + "/" + repoName);

    that.ga = new GithubApi(username, repoName);


    that.ed = new EditorInterface(this.ga, speed);
    var state = 0;
    that.sha = undefined;
    that.canStart = false;


    this.getSha = function () {
        if (!commitUrl) {
            console.log("no commit url");
        }
        if (urlParts.length > 6) {
            return urlParts[6];
        }
        console.log("no sha provided");
        that.sha = "random";
    };

    this.reload = function () {
        that.canStart = false;
    };

    this.update = function (sha, fullUrl) {


        if (sha.length < 6) {
            that.sha = undefined;
            var number = sha;
            this.ga.getPullCommits(number, function (commitList) {
                $("#commitTabHeader").text("Commits (pull/" + number + ")");
                updateCommitList(commitList);
                $("#commitTabHeader").tab("show");
            });
            return;
        }

        if (!sha) {
            return;
        }
        that.sha = sha;
        if (!that.canStart) {
            console.log("that cannot start now", sha);
            return;
        }
        if (!that.commitMap[sha]) {
            notify("Sha " + sha + " is not in commits yet.")
            return;
        }
        var parent = that.commitMap[sha].parents[0].sha;
        mixpanel.track("load sha for diff", {
            sha1: sha
        });
        $("#commitList").find(".active").removeClass("active");
        that.ga.getDiffBySha(sha, function (text) {
            var scrollTo = $("#commit-sha-" + sha);
            scrollTo.addClass("active");
            var container = scrollTo.parent();

            container.animate({
                scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
            });

            var changes = fpp(text);
            //var diff = JsDiff.di
            that.ed.runAllChanges(changes, parent);
        }, true);
    };

    that.commitMap = {};

    that.ga.getPulls(function (list) {
        console.log("pull requests", list);
        that.pulls = list;
        that.pullMap = {};

        if (list.length > 0) {


            for (var i = 0; i < that.pulls.length; i++) {
                that.pullMap[that.pulls[i].number] = that.pulls[i];
            }
            $.get('static/templates/pull_list.mustache', function (template) {
                Mustache.parse(template);   // optional, speeds up future uses
                var rendered = Mustache.render(template, {commits: list});
                $('#pullListContainer').html(rendered);
                stroll.bind("body ul");
                var userList = new List('pullListContainer', {
                    valueNames: ["message"]
                });
            });
        }
    });


    var updateCommitList = function (list) {

        that.commits = list;
        for (var i = 0; i < list.length; i++) {
            that.commitMap[list[i].sha] = list[i];
        }
        that.canStart = true;

        $.get('static/templates/commit_list.mustache', function (template) {
            Mustache.parse(template);   // optional, speeds up future uses
            var rendered = Mustache.render(template, {commits: list});
            $('#commitListContainer').html(rendered);
            stroll.bind("body ul");
            var userList = new List('commitListContainer', {
                valueNames: ["message"]
            });
        });

        if (!that.sha || that.sha == "random") {
            var item = list[list.length - 1];
            that.sha = item.sha;
        }

        that.update(that.sha);


    };
    $("#commitTabHeader").text("(branch/master)");
    that.ga.getCommits(updateCommitList);


    return this;
}