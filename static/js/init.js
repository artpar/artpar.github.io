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
        wrap: 80,
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

    if (newHash.substr(0, githubUrl.length) == githubUrl) {
        console.log("url has github");
        newHash = newHash.substr(githubUrl.length);
    }

    var defaultUrl = githubUrl + newHash;
    window.app = new App(defaultUrl);
    window.app.update(window.app.getSha());
}

function once() {
    var newHash = window.location.hash.substring(2);
    loadUrl(newHash)
}

once();


function addTab(name) {
    var nextTab = $('#fileTabs li').size() + 1;

    // create the tab

    var tabName = name;
    if (name.length > 10) {
        var parts = tabName.split("\/");
        tabName = "...";
        if (parts.length > 2) {
            tabName += "/" + parts[parts.length - 2]
        }
        tabName = tabName + "/" + parts[parts.length - 1];
    }
    $('<li class="nav-item"><a class="nav-link" href="#fileTabs' + nextTab + '" data-toggle="tab">' + tabName + '</a></li>').appendTo('#fileTabs');


    name = "ace-editorid-" + name.replace("\.", "-").replace("\/", "-");
    // create the tab content
    $('<div class="tab-pane" id="fileTabs' + nextTab + '"><div id="' + name + '" class="ace-editor-all"></div></div>').appendTo('.files-content');

    var editor = initEditor(name);
    // make the new tab active
    $('#fileTabs a:last').tab('show');
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






















