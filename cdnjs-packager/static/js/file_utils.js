/**
 * Created by parth on 7/7/16.
 */



function getFileExtension(file) {
    return file.substring(file.lastIndexOf(".") + 1);
}

function fileInfo(file) {
    var red = {
        minified: "dev",
        mapFile: "non_map"
    };

    if (file.indexOf("\min\.") > -1) {
        red.minified = "min";
    }
    if (file.indexOf(".map") > -1) {
        red.mapFile = "map"
    }
    red.extension = getFileExtension(file);
    return red;
}
