/**
 * Created by parth on 7/7/16.
 */

$(document).on("ready", function () {

    var App = function (list, el, ed) {
        var that = this;

        $.ajax({
            url: "static/templates/detail_format.mustache",
            success: function (d) {
                that.detailFormat = d;
            }
        });
        that.list = list;
        that.el = el;
        that.editor = ed;
        that.editor.getSession().setMode("ace/mode/" + "html");
        that.editor.setTheme("ace/theme/twilight");
        that.editor.setOption("wrap", 80);
        document.getElementById('editor-container').style.fontSize = '20px';

        $("#clear").on("click", function () {
            mixpanel.track("clear")
            that.selectedFiles = {};
            that.redraw();
        });

        that.grid = $("#bigList");
        that.dataTable = that.grid.DataTable({
            "data": list,
            "stateSave": true,
            "deferRender": true,
            "columns": [
//                {
//                    "className": 'details-control',
//                    "orderable": false,
//                    "data": "<span class='fa fa-github'></span>",
//                    "defaultContent": ''
//                },
                {
                    "data": "name",
                    "className": ""
                },
//                {"data": "version"},
//                {"data": "link"},
                {
                    "data": "url"
                },
                {
                    "className": 'details-link',
                    "orderable": false,
                    "data": function (r) {
                        //console.log("data for", arguments);
                        return "<i class='fa fa-external-link' aria-hidden='true'></i><a target='_blank' href='" + r.url + "'>" + r.name + "</a>";
                    },
                    "defaultContent": ''
                }
            ]
        });
        that.selectedFiles = {};

        that.removeFile = function (file) {
            mixpanel.track("remove file", {
                file: file
            });

            var extension = getFileExtension(file);
            var selectedFiles = that.selectedFiles[extension];
            var originalLength = selectedFiles.length;
            var newFiles = [];
            for (var i = 0; i < originalLength; i++) {
                if (selectedFiles[i] != file) {
                    newFiles.push(selectedFiles[i])
                }
            }
            if (originalLength == newFiles.length) {
                return
            }
            that.selectedFiles[extension] = newFiles;
            that.redraw();
        };

        that.addFile = function (file) {
            mixpanel.track("add file", {
                file: file
            });
            var extension = getFileExtension(file);
            var selectedFile = that.selectedFiles[extension];
            if (!selectedFile) {
                if (that.fileTypes[extension]) {
                    that.selectedFiles[extension] = [];
                }
            }
            that.selectedFiles[extension].push(file);
            that.redraw();
        };

        that.redraw = function () {
            var $html = $("<html></html>");
            var $head = $("<head></head>");

            var $body = $("<body></body>");
            $html.append($head);
            $html.append($body);
            that.addAll($html, that.selectedFiles.js, "js");
            that.addAll($html, that.selectedFiles.css, "css");
            that.editor.setValue(html_beautify("<html>" + $html.html() + "</html>"))
        };

        that.fileTypes = {
            "js": {
                "tag": "script",
                "attrs": {
                    "type": "text/javascript"
                },
                "srcAttr": "src",
                "position": {
                    "type": "append",
                    "target": "body"
                }
            },
            "css": {
                "tag": "link",
                "attrs": {
                    "type": "text/css",
                    "rel": "stylesheet"
                },
                "srcAttr": "href",
                "position": {
                    "type": "append",
                    "target": "head"
                }
            }
        };

        that.addAll = function ($html, files, type) {
            if (!files) {
                return;
            }
            var processor = that.fileTypes[type];
            if (!processor) {
                alert("unknown type " + type)
            }

            files.map(function (file) {
                var tag = $("<" + processor.tag + "></" + processor.tag + ">");

                var keys = Object.keys(processor.attrs);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    tag.attr(key, processor.attrs[key])
                }
                var cdnLink = "https://cdnjs.cloudflare.com/ajax/libs/" + file;
                tag.attr(processor.srcAttr, cdnLink);
                var position = processor.position;
                $html.find(position.target)[position.type](tag);
            });
        };

        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }

        /* Formatting function for row details - modify as you need */
        this.format = function (d) {
            if (!d) {
                return "";
            }
            var id = guid();

            that.getPackage(d.name, function (pack) {
                setTimeout(function () {
                    var container = $("#container-" + id);
                    var files = pack.files;
                    var fileSplit = [];
                    for (var i = 0; i < files.length; i++) {
                        var extension = getFileExtension(files[i]);
                        if (!that.fileTypes[extension]) {
                            continue;
                        }
                        var parts = files[i].split("/");
                        parts.splice(0, parts.length - 2);
                        fileSplit.push({file: files[i], parts: parts, info: fileInfo(files[i])})
                    }
                    pack.fileSplit = fileSplit;
                    container.html(Mustache.render(that.detailFormat, {row: d, pack: pack}));
                    container.find(".file-table tr").on("click", function (e) {
                        var jqCheckBox = $(e.target).parent().find("input[type=checkbox]");
                        var targetCheckbox = jqCheckBox[0];
                        var $e = jqCheckBox;
                        targetCheckbox.checked = !targetCheckbox.checked;

                        var version = container.find(".version-select").val();
                        var lastVersion;
                        if (pack.versions instanceof Array) {
                            lastVersion = pack.versions[0].value;
                        } else {
                            lastVersion = pack.versions.value;
                        }
                        var file = $e.val();
                        file = file.replace(lastVersion, version);
                        if (targetCheckbox.checked) {
                            $(targetCheckbox).closest("tr").addClass("table-success");
                            that.addFile(file);
                        } else {
                            $(targetCheckbox).closest("tr").removeClass("table-success");
                            that.removeFile(file);
                        }
                        console.log("changes", arguments);
                    });

                    container.find('select').selectize({
                        create: true,
                        sortField: 'text'
                    });

                    container.find(".show-non-minified").on("change", function (e) {
                        console.log("show non minified", e.target.checked);
                        if (e.target.checked) {
                            container.find("tr.dev").css("display", "");
                        } else {
                            container.find("tr.dev").css("display", "none");
                        }
                    });
                    container.find(".show-all").on("change", function (e) {
                        console.log("show all", e.target.checked);
                        if (e.target.checked) {
                            container.find("tr").css("display", "");
                        } else {
                            container.find("tr.dev").css("display", "none");
                            container.find("tr.map").css("display", "none");
                        }
                    });

                    container.find("tr").css("display", "none");
                    container.find("tr.min").css("display", "");


                }, 150);
            });

            return "<div class='container' id='container-" + id + "'>" + Mustache.render(that.detailFormat, {
                    row: d,
                    pack: {versions: []}
                }) + "</div>";

        };

        that.base = "https://cdnjs.com/libraries/";

        function processJson(json, name, callback) {
            var results = json.query.results;
            if (!results) {
                console.log("could not get ", name);
                return;
            }
            var url = results.p[0].a.href;
            var description = results.p[2];
            var versions = results.select[0].option;
            var files = results.p.map(function (e, i) {
                if (e && e.class && e.class == "library-url") {
                    return e.content;
                }
            }).filter(function (e, i) {
                //console.log("include", e, !!e);
                return !!e;
            });

            var data = {
                name: name,
                versions: versions,
                files: files,
                url: url,
                description: description
            };
            localStorage.setItem("package-" + name, JSON.stringify(data));
            if (callback) {
                callback(data);
            }
        }

        this.fetch = function (names, callback) {

            names.map(function (name) {
                mixpanel.track("fetch package", {
                    name: names
                });
                var encoded = encodeURIComponent(that.base + name.trim());
                var cached = localStorage.getItem("raw-" + encoded);
                var parsed = !cached || JSON.parse(cached);
                if (!cached || parsed.query.results == null || !parsed.query.results.p) {
                    console.log("gettiing " + name + " from live");
//                    console.log('endoded', encoded);
                    $.ajax({
                        url: "https://query.yahooapis.com/v1/public/yql?q=SELECT%20*%20FROM%20html%20WHERE%20url%3D'" + encoded + "'%20AND%20xpath%3D'%2F%2Fp'%20or%20url%3D'" + encoded + "'%20AND%20xpath%3D'%2F%2Fselect'&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys",
                        success: function (json) {
                            localStorage.setItem("raw-" + encoded, JSON.stringify(json));
                            processJson(json, name, callback);
                        }
                    });
                } else {
                    console.log("getting " + name + " from cache");
                    processJson(JSON.parse(cached), name, callback)
                }
            });
        };

        this.getPackage = function (name, callback) {
            if (!callback || typeof callback != "function") {
                alert("callback is not a function");
                return;
            }
            var s = localStorage.getItem("package-" + name.trim());

            if (s && s.length > 10) {
                callback(JSON.parse(s))
            } else {
                that.fetch([name], function (pack) {
                    callback(pack);
                });
            }
        };


        that.grid.find("tbody").on('click', 'tr', function (e) {
            if (e.target.tagName.toLowerCase() == "a") {
                return;
            }
            var tr = $(this);
            var row = that.dataTable.row(tr);

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                // Open this row
                if (!row.length) {
                    return;
                }
                row.child(that.format(row.data())).show();
                tr.addClass('shown');
            }
        });

        var reloadLibs = function () {
            var names = $("table").find("tr").map(function (i, e) {
                return $(e).find("td")[0]
            }).filter(function (i, e) {
                return e !== undefined
            }).map(function (i, e) {
                return $(e).text().trim()
            });

            // that.fetch(names);
        };
        reloadLibs();
        that.dataTable.on('draw.dt', reloadLibs);


        this.get = function () {
            return this;
        };
        that.redraw();
        return this;
    };

    var d = localStorage.getItem("data");
    if (!d) {
        $.ajax({
            url: "libraries",
            success: function (html) {
                console.log(arguments);
                var $html = $(html);
                var tr = $html.find("tr");
                console.log("we have ", tr.length);
                var data = tr.map(function (i, e) {
                    return $(e).find("td");
                });

                var list = data.map(function (i, e) {
                    var lib = $(e[0]);
                    var link = $(e[1]);
                    if (!lib) {
                        return {};
                    }
                    return {
                        name: lib.find("a").text(),
                        url: lib.find('[itemprop="url"]').attr("content"),
                        version: lib.find('[itemprop="version"]').attr("content"),
                        link: link.find("p").text()
                    }
                });
                list = list.splice(1);
                localStorage.setItem("data", JSON.stringify(list));
                start(list)
            }
        })

    } else {
        start(JSON.parse(d))
    }

    function start(list) {
        window.app = new App(list, $("#appContainer"), ace.edit("editor-container"))
    }
})
