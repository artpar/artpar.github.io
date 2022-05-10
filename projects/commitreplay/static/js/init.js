/**
 * Created by parth on 2/7/16.
 */
//jQuery.fn.render = Transparency.jQueryPlugin;


var DelayedLoop = function () {
};

DelayedLoop.forEach = function (collection, delay, callback, completedCallback) {
    var index = 0;
    var timerObject;

    var executor = function () {
        // Stop the delayed loop.
        clearInterval(timerObject);

        // Executes the callback, and gets the returned value to indicate what the next delay will be.
        var newInterval = callback(collection[index++]);

        // If they returned false, quit looping.
        if (typeof(newInterval) == "boolean" && newInterval == false) {
            return;
        }

        // If nothing / non-number is provided, re-use initial delay.
        if (typeof(newInterval) != "number") {
            newInterval = delay;
        } else if (newInterval < 0) { // If a negative number is returned, quit looping.
            return;
        }

        // If there are more elements to iterate, re-set delayed loop. Otherwise, call the "completed" callback.
        if (index < collection.length) {
            timerObject = setInterval(executor, newInterval);
        } else {
            completedCallback();
        }
    };

    // Initial loop setup.
    timerObject = setInterval(function () {
        executor();
    }, delay);
};

var editor = undefined;

function initEditor(name) {
    var theme = 'ace/theme/solarized_dark';
    var editor = ace.edit(name);

    editor.$blockScrolling = Infinity;
    editor.setTheme(theme);
    editor.setBehavioursEnabled(false);
    editor.setOptions({
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: false,
        wrap: 120,
        readOnly: true
    });

    return editor;
}

window.app = {};
var githubUrl = "https://github.com/";

$(window).on('hashchange', once);

function random() {
    window.location.hash = "#!" + "https://github.com/atomix/copycat";
    window.location.reload(true);
    return;
    $.ajax({
        url: "https://api.github.com/search/repositories?sort=stars&order=desc&q=created:>2016-07-01&q=java",
        success: function (res) {
            var list = res.items;
            var rand = list[Math.floor(Math.random() * list.length)];
            window.location.hash = "#!" + rand.html_url;
            window.location.reload(true);
        }
    })
}

function loadUrl(newHash) {

    if (!newHash || newHash.length < 10 || newHash.indexOf("github.com/") < 0) {
        console.log("bad url given to load");
        if (!newHash || newHash.length < 1) {
            random();
        }
        return;
    }

    console.log("load ", newHash);

    if (newHash.indexOf("\/pull\/") > -1) {
        console.log("pull url")
    }

    if (newHash.substr(0, githubUrl.length) == githubUrl) {
        console.log("url has github");
        newHash = newHash.substr(githubUrl.length);
    }

    var defaultUrl = githubUrl + newHash;
    var config = defaultUrl.split("/");
    if (!window.app.update || config.length < 6) {
        var p = defaultUrl.split("?");
        window.app = new App(p[0]);
    }

    if (config.length > 5) {
        window.app.update(config[config.length - 1], defaultUrl);
    }


}

function once() {
    var newHash = window.location.hash.substring(2);
    if (dropInstance) {
        dropInstance.close();
    }
    loadUrl(newHash)
}

once();

function addTabCore(to, name) {
    var $fileTabs = $('#' + to + 'Tabs');
    var nextTab = $fileTabs.find('li').size() + 1;

    var tabName = name.replace("\/", "-").replace("\.", "-");
    if (name.length > 10) {
        var parts = tabName.split("\/");
        tabName = "...";
        if (parts.length > 2) {
            tabName += "/" + parts[parts.length - 2]
        }
        tabName = tabName + "/" + parts[parts.length - 1];
    }
    var active = " active ";
    if (nextTab > 1) {
        active = "";
    }
    $('<li class="nav-item"><a class="nav-link' + active + '" href="#' + to + 'Tabs' + nextTab + '" data-toggle="tab">' + tabName + '</a></li>').appendTo('#' + to + 'Tabs');

    name = to + "-container-" + name.replace("\.", "-").replace("\/", "-");
    var container = $('<div class="tab-pane' + active + '" id="' + to + 'Tabs' + nextTab + '"></div>');
    container.appendTo('.' + to + '-content');
    return container;
}

function addTab(name) {
    var className = "ace-editor-all";
    var to = "file";
    var container = addTabCore(to, name);
    var $fileTabs = $('#' + to + 'Tabs');
    name = "ace-editorid-" + name.replace("\.", "-").replace("/", "-");

    container.append($('<div id="' + name + '" class="' + className + '"></div>'));
    var editor = initEditor(name);
    // make the new tab active
    $fileTabs.find('a:last').tab('show');
    updateSize();
    return editor;
}


function notify(msg) {
    var small = $("<p class='well'></p>").html(msg);
    $("#notifications").prepend($("<li class='list-group-item'></li>").append(small))
}

var stored = store.getItem("speed");
function updateSize() {
    var newHeight = $(window).height() - 150;
//        console.log("resize to ", newHeight);
    $('.ace-editor-all').css("height", newHeight + "px");
    $('#commitListContainer').css("height", newHeight + "px");
    $('#third').css("height", newHeight + "px");

}
$(window).on("resize", function () {
    updateSize();
});
updateSize();

//    var slider = $("#slider").rangeSlider();
var slider = document.getElementById('slider');

noUiSlider.create(slider, {
    start: 20, // Handle start position
    connect: false, // Display a colored bar between the handles
    orientation: 'horizontal', // Orient the slider vertically
    range: { // Slider can select '0' to '100'
        'min': 0,
        'max': 100
    }
});

slider.noUiSlider.on("update", function (value) {
    value = parseInt(value[0]);
    //console.log("slide value ", value);
    store.setItem("speed", value);
    speed.setSpeed(value);
});
if (stored) {
    console.log("Stored value ", stored);
//        speedSlider.setValue(stored)
//        speedSlider.slider('setValue', stored);
    speed.setSpeed(stored);
}

$("#random").on("click", function () {
    random();
});






















