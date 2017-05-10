var layout, selected, classes, selectedclass, copied, filter, dummydiv, scrn, highlighted, $jq, lessstyle, shorcuts;
window.csssheet = null, window.cssNode = null;
try {
  $jq = jQuery.noConflict();
} catch (e) {
}

var rootdir;

var containers = {

};

var properties = {
  global:{
    style:{type:'attr', label:'CSS'},
    id:{type:'attr', label:'Element ID'},
    name:{type:'attr', label:'Element Name'},
    accesskey:{type:'attr', label:'Access Key'},
    title:{type:'attr', label:'Element Title'},
    text:{type:'text', label:'Inner Text'},
    class:{type:'attr', label:'Classes Associated'}
  },
  a:{
    href:{type:'attr', label:'Href'}
  },
  img:{
    src:{type:'attr', label:'Image Source'},
    alt:{type:'attr', label:'Alternate Text'}
  },
  input:{
    type:{type:'prop', label:'Input Type'},
    value:{type:'attr', label:'Value'},
    name:{type:'attr', label:'Name'}
  },
  form:{
    action:{type:'attr', label:'Form Action'},
    method:{type:'attr', label:'Form GET/POST'}
  }
};

var defaulttagstyle = {
  global:{
    style:'background-color:grey;width:100px;height:100px'
  },
  a:{
    href:'#',
    text:'New Link',
    style:'background-color:"";border:"";'
  },
  img:{
    src:'images/black_big.png',
    alt:'an Image',
    style:'background:none;'
  },
  input:{
    type:'text',
    value:'New Text Input'
  },
  button:{
    style:'background:"";width:"";height:"";border:"";',
    text:''
  }
};

function insertNewElement() {
  singlekeys(false);
  $.msgbox("Insert Element TagName below:", {
    type:"prompt"
  }, function (result) {
    singlekeys(true);
    if (result) {
      var x = $(document.createElement(result));
      var id = result + '_' + makeid(6);
      x.attr('id', id);
      x.addClass('class_' + id);
      x.addClass('class_' + id);
      var eprop = $.extend({}, defaulttagstyle.global, defaulttagstyle[result]);
      console.log(eprop);
      if (!properties[result])properties[result] = {};
      for (var prop in eprop) {
        p = properties[result][prop] ? result : 'global';//properties[result][prop]
        console.log(prop + " from " + p);
        if (prop == "style") {
          console.log(eprop[prop]);
          globalstylesheet.cssBySelector('#' + id, eprop[prop]);
        } else {
          x[properties[p][prop]['type']](prop, eprop[prop]);
        }
      }
      $('#' + id).globalcss('background-color', get_random_color());
      //less.refresh();
      if (selected) {
        selected.append(x);
      }
      else {
        $(layout.panes.center).append(x);
      }
      select(x[0]);
    }
  });
}

function startloading() {
  if (window.loaded)
    return;
  window.loaded = true;
  if (document.location.hostname == "localhost") {
    rootdir = "";
  } else {
    rootdir = "http://parth.me/builderjs/";
  }

  var head = document.getElementsByTagName('head')[0];

  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.onreadystatechange = function () {
    if (this.readyState == 'complete') start();
  };
  script.onload = start;
  script.src = rootdir + 'js/jquery-1.7.1.js';
  //console.log(script);
  head.appendChild(script);
}
startloading();

document.getCSS = function (css) {
  if (css instanceof Array) {
    for (c in css) {
      document.getCSS(css[c]);
    }
  } else {
    var stl = $('<link rel="stylesheet" media="screen" type="text/css"></style>');
    stl.attr('href', css);
    $('head').append(stl);
  }
};

document.getJS = function (js) {
  if (js instanceof Array) {
    for (c in js) {
      document.getJS(js[c]);
    }
  } else {
    var stl = $('<script type="text/javascript"></script>');
    stl.attr('src', js);
    //console.log(stl);
    $('head').append(stl);

  }
};

function start() {
  //console.log(window.loaded);
  $(document).ready(function () {

    jQuery.fn.cssObject = function () {
      if (arguments.length) return jQuery.fn.css2.apply(this, arguments);
      var attr = ['font-family', 'font-size', 'font-weight', 'font-style', 'color',
        'text-transform', 'text-decoration', 'letter-spacing', 'word-spacing',
        'line-height', 'text-align', 'vertical-align', 'direction', 'background-color',
        'background-image', 'background-repeat', 'background-position',
        'background-attachment', 'opacity', 'width', 'height', 'top', 'right', 'bottom',
        'left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'border-top-width', 'border-right-width', 'border-bottom-width',
        'border-left-width', 'border-top-color', 'border-right-color',
        'border-bottom-color', 'border-left-color', 'border-top-style',
        'border-right-style', 'border-bottom-style', 'border-left-style', 'position',
        'display', 'visibility', 'z-index', 'overflow-x', 'overflow-y', 'white-space',
        'clip', 'float', 'clear', 'cursor', 'list-style-image', 'list-style-position',
        'list-style-type', 'marker-offset'];

      attr = ['accelerator', 'azimuth', 'background', 'background-attachment', 'background-color', 'background-image', 'background-position', 'background-position-x', 'background-position-y', 'background-repeat', 'behavior', 'border', 'border-bottom', 'border-bottom-color', 'border-bottom-style', 'border-bottom-width', 'border-collapse', 'border-color', 'border-left', 'border-left-color', 'border-left-style', 'border-left-width', 'border-right', 'border-right-color', 'border-right-style', 'border-right-width', 'border-spacing', 'border-style', 'border-top', 'border-top-color', 'border-top-style', 'border-top-width', 'border-width', 'bottom', 'caption-side', 'clear', 'clip', 'color', 'content', 'counter-increment', 'counter-reset', 'cue', 'cue-after', 'cue-before', 'cursor', 'direction', 'display', 'elevation', 'empty-cells', 'filter', 'float', 'font', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'height', 'ime-mode', 'include-source', 'layer-background-color', 'layer-background-image', 'layout-flow', 'layout-grid', 'layout-grid-char', 'layout-grid-char-spacing', 'layout-grid-line', 'layout-grid-mode', 'layout-grid-type', 'left', 'letter-spacing', 'line-break', 'line-height', 'list-style', 'list-style-image', 'list-style-position', 'list-style-type', 'margin', 'margin-bottom', 'margin-left', 'margin-right', 'margin-top', 'marker-offset', 'marks', 'max-height', 'max-width', 'min-height', 'min-width', 'binding', 'border-radius', 'border-radius-topleft', 'border-radius-topright', 'border-radius-bottomright', 'border-radius-bottomleft', 'border-top-colors', 'border-right-colors', 'border-bottom-colors', 'border-left-colors', 'opacity', 'outline', 'outline-color', 'outline-style', 'outline-width', 'user-focus', 'user-input', 'user-modify', 'user-select', 'orphans', 'outline', 'outline-color', 'outline-style', 'outline-width', 'overflow', 'overflow-X', 'overflow-Y', 'padding', 'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'page', 'page-break-after', 'page-break-before', 'page-break-inside', 'pause', 'pause-after', 'pause-before', 'pitch', 'pitch-range', 'play-during', 'position', 'quotes', '-replace', 'richness', 'right', 'ruby-align', 'ruby-overhang', 'ruby-position', '-set-link-source', 'size', 'speak', 'speak-header', 'speak-numeral', 'speak-punctuation', 'speech-rate', 'stress', 'scrollbar-arrow-color', 'scrollbar-base-color', 'scrollbar-dark-shadow-color', 'scrollbar-face-color', 'scrollbar-highlight-color', 'scrollbar-shadow-color', 'scrollbar-3d-light-color', 'scrollbar-track-color', 'table-layout', 'text-align', 'text-align-last', 'text-decoration', 'text-indent', 'text-justify', 'text-overflow', 'text-shadow', 'text-transform', 'text-autospace', 'text-kashida-space', 'text-underline-position', 'top', 'transform', 'unicode-bidi', '-use-link-source', 'vertical-align', 'visibility', 'voice-family', 'volume', 'white-space', 'widows', 'width', 'word-break', 'word-spacing', 'word-wrap', 'writing-mode', 'z-index', 'zoom'];

      var len = attr.length, obj = {};
      for (var i = 0; i < len; i++)
        obj[attr[i]] = jQuery.fn.css.call(this, attr[i]);
      return obj;
    };

    init();
  })
}

function styleToClass(classname, target) {
  var style = $(target).attr('style');
  var st = $("<style type='text/css'></style>");
  st.text(classname + '{' + style + '}');
  $('head').append(st);
  $(target).removeAttr('style');
}

function init() {
  //console.log('Load complete');
  //console.log($);
  if (rootdir == '') {
    $.ajaxSetup({cache:true});
  }

  document.getJS(rootdir + 'js/jquery-ui-1.8.18.custom.min.js');
  $.getScript(rootdir + 'js/jquery.getpath.js');
  $.getScript(rootdir + 'js/beautify-html.js');
  $.getScript(rootdir + 'js/beautify-css.js');
  $.getScript(rootdir + 'js/rgbcolor.js');
  $.getScript(rootdir + 'js/less-1.2.2.js', function () {
    lessstyle = $('<style id="lessstyle" type="text/css"></style>');
  });
  $.getScript(rootdir + 'js/jquery.caret.1.02.min.js');


  $.getScript(rootdir + 'js/jquery.borderlayout.js', function () {
    var body = $('body').html();
    var newbody = $('<div id="centerpane" class="ui-layout-center">Center</div>' +
      '<div class="ui-layout-north builder">North</div>' +
      '<div class="ui-layout-south builder">South</div>' +
      '<div class="ui-layout-east builder"></div>' +
      '<div class="ui-layout-west builder">West</div>');
    $('body').html(newbody);
    layout = $('body').borderLayout({ applyDefaultStyles:true });
    $('.ui-layout-center').html(body);
    $.getScript(rootdir + 'js/jquery.globalless.js', function () {
      $(layout.panes.center).addClass('super');
      $(layout.panes.center).addClass('centerpain');
      styleToClass('.centerpain', layout.panes.center);
      $(layout.panes.center).addClass('centerpain');
      $('.centerpain').globalcss('width:100%;height:100%;');
      $(layout.panes.center).removeAttr('style');

      jQuery.getScript(rootdir + 'js/jstorage.js', function () {
        tryload();
        initwest();
        initEast();

      });

    });

    document.getJS([rootdir + 'js/jquery.msgbox.js']);
    $.getScript(rootdir + 'js/shortcut.js', function () {
      console.log("loaded shortcut");
      initNorth();

      keyBoardListener();
      singlekeys(true);
      select(layout.panes.center);
    });
    document.getCSS([
      rootdir + 'css/ui-lightness/jquery-ui-1.8.18.custom.css',
      rootdir + 'css/nbuilder.css'
    ]);


    scrn = $('<div id="scrn" style="background: #add8e6;display: none"></div>');
    dummydiv = $('<div style="background: white;display: none"></div>');
    setListeners();
    $('body').append(scrn);
  });

  document.getCSS([
    rootdir + 'css/jquery.msgbox.css'
  ]);
}

function initNorth() {
  north = $(layout.panes.north);
  north.html('<div><select id="shortcuts"></select></div>');
  shorcuts = $('#shortcuts');
}

function addShortcut(key, action) {
  /*if (!shorcuts) {
   shorcuts = $('#shortcuts');
   }*/
  var tid = "shortcut_" + key;
  $('#shortcuts #' + tid).remove();
  shorcuts.prepend("<option id='" + tid + "'>" + key + "-----" + action + "</option>");
  shorcuts.val(0);
}

function removeShortcut(key) {
  $('#shortcuts #shortcut_' + key).remove();
}


function setListeners() {
  $(layout.panes.center).on('mouseover.builder', mouseOver);
  $(layout.panes.center).on('mouseout.builder', mouseOut);
  $(layout.panes.center).on('click.builder', mouseClick);
}

function unSelect() {
  if (selected != null) {
    //console.log(selected.attr('id'));
    try {
      selected.draggable('destroy').resizable('destroy');
//      $('#' + selected.attr('id')).globalcss('width', selected.css('width'));
//      $('#' + selected.attr('id')).globalcss('height', selected.css('height'));
//      $('#' + selected.attr('id')).globalcss('top', selected.css('top'));
//      $('#' + selected.attr('id')).globalcss('left', selected.css('left'));


      selected.removeAttr('style');
    } catch (e) {
    }
    selected = null;
    $(layout.panes.west).find(":input").removeAttr('disabled');
    $(layout.panes.west).find(":checked").removeAttr('checked');
  }

  singlekeys(true);

}

function select(target) {
  if (target == undefined)target = layout.panes.center;
  unSelect();
  $(layout.panes.center).off('.builder');
  $(layout.panes.center).css('width', '100%');
  $(layout.panes.center).css('height', '100%');
  selected = $(target);
  var c = new RGBColor(selected.css('background-color'));
  c.r = 255 - c.r;
  c.g = 255 - c.g;
  c.b = 255 - c.b;
  c = c.toHex();
  if (c == '#ffffff')c = get_random_color();
  selected.css('border', '3px solid ' + c);
  //selected.css('opacity', '0.5');
  //scrnover(selected);

  updateClassList();
  refreshEast();
  refreshSouth();
}


function mouseClick(event) {
  event.preventDefault();
  select(event.target);
  return false;
}

function updateClassList() {
  var classes = getSelectors();
  //console.log(classes);
  var selector = $('#selector');
  selector.html('');
  for (clss in classes) {
    var op = $("<option></option>");
    op.attr('value', classes[clss]);
    op.text(classes[clss]);
    selector.append(op);
  }
  selector.val(0);
}

function refreshSouth() {
  var x = selected.getPath().split(' > ');
  x = x.splice(3);
  //console.log(x);
  ul = $('<ul class="builder" id="breadcrumb"></ul>');
  var li;
  for (l in x) {
    li = $('<li></li>');
    a = $("<a></a>");
    a.text('> ' + x[l]);
    a.attr('href', '#');
    a.attr('title', x[l]);
    li.append(a);
    ul.append(li);
  }
  if (li != undefined) {
    li.css('font-weight', 'bold');
  }
  $(layout.panes.south).html(ul);
  ul.on('click', function (e) {
    //console.log($(e.target).attr('title'));
    $('#breadcrumb li').css('font-weight', '');
    select($($(e.target).attr('title'))[0]);
    $(event.target).css('font-weight', 'bold');
  });
}

function refreshEast(selector) {
  selectedclass = selector;
  if (selector == null) {
    selector = selected;
    selectedclass = selected.attr('id');
    $('#selector').val(0);
  } else {
    selector = $(selector);
  }
  $(layout.panes.east).find("[name=cssprop]:text").each(function (a, b) {
    //console.log(b + ", " + b.name + ":" + selector.css(b.name));
    $(b).attr('value', selector.css(b.id.trim().toLowerCase()));
  });
}

function mouseOver(event) {
  highlighted = $(event.target);
  var c = new RGBColor(highlighted.css('background-color'));
  c.r = 255 - c.r;
  c.g = 255 - c.g;
  c.b = 255 - c.b;
  c = c.toHex();
  if (c == '#ffffff')c = get_random_color();
  highlighted.css('border', '3px solid ' + c);
  //highlighted.css('opacity', 0.5);
  //scrnover(highlighted);
}

function scrnover(element) {
  if (element == null)element = $(layout.panes.center);
  z = element.css('z-index');
  scrn.css('position', 'absolute');
  scrn.css('top', element.offset().top + 'px');
  scrn.css('left', element.offset().left + 'px');
  scrn.css('width', element.width() + 'px');
  scrn.css('height', element.height() + 'px');
  scrn.css('z-index', z - 1);
  scrn.css('display', 'block');
  scrn.css('background', get_random_color());
}

function mouseOut(event) {
  $(event.target).removeAttr('style');
  //console.log('out');
}

function displaytoggle(direction) {
  //console.log(direction + " : " + layout.options[direction].isClosed);
  if (layout.options[direction].isClosed) {
    layout.show(direction);
  } else {
    layout.hide(direction);
  }
}



function deleteselected(answer) {

  if (selected) {
    if (selected.hasClass('ui-layout-center')) {
      $.msgbox('Cannot remove Body Element');
      return;
    }
    singlekeys(false);
    $.msgbox('Are you sure you want to delete the selected Element ?', {type:'confirm',
      buttons:[
        {type:"button", value:"Yes"},
        {type:"button", value:"No"},
        {type:"cancel", value:"Cancel"}
      ]
    }, function (e) {
      singlekeys(true);
      if (e == 'Yes') {
        try {
          selected.remove();
          globalstylesheet.deleteClass('#' + selected.prop('id'));
        } catch (e) {
        }
        select();
      }
    })
  } else {
    $.msgbox('No Element Selected');
  }

}

function save(pagename) {
  if (!pagename)pagename = 'default';
  var body = $(layout.panes.center).html();
  for (var i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].title == "globalless") {
      sheet = document.styleSheets[i];
    }
  }
  rules = sheet.rules ? sheet.rules : sheet.cssRules;
  var style;
  $.jStorage.set(pagename + '-stylecount', rules.length);
  for (i = 0; i < rules.length; i++) {
    if (rules[i].selectorText === '.centerpain')continue;
    $.jStorage.set(pagename + '-styleSelector' + i, rules[i].selectorText);
    $.jStorage.set(pagename + '-styleText' + i, rules[i].style.cssText);
  }
  $.jStorage.set(pagename + '-body', body);
}

function tryload(pagename) {
  if (!pagename)pagename = 'default';
  var body = $.jStorage.get(pagename + '-body');
  var style = $.jStorage.get(pagename + '-body');
  if (body && body.length && style && style.length) {
    load(pagename);
    return true;
  }
  return false;
}

function load(pagename, times) {
  if (!pagename)pagename = 'default';
  var body = $.jStorage.get(pagename + '-body');
  var stylecount = parseInt($.jStorage.get(pagename + '-stylecount'));
  //console.log(body);

  //console.log(stylecount);
  for (var i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].title == "globalless") {
      csssheet = document.styleSheets[i];
    }
  }
  if(!csssheet && times<3){
    times++;
    console.log('Reload after 5');
    setTimeout("load('"+ pagename +"', " + times +")", 5000);
    return;
  }
  rules = csssheet.cssRules ? csssheet.cssRules : csssheet.rules;
  for (i = 0; i < stylecount; i++) {
    var selectortext = $.jStorage.get(pagename + '-styleSelector' + i);
    var csstext = $.jStorage.get(pagename + '-styleText' + i);
    //console.log(selectortext + ":" + csstext);
    addrule = csssheet.addRule ? csssheet.addRule : csssheet.insertRule;
    if (csssheet.addRule) {
      csssheet.addRule(selectortext, csstext, 0);
    } else {
      csssheet.insertRule(selectortext + '{' + csstext + '}', 0);
    }
  }

  $(layout.panes.center).html(body);

}

var showinghtml = false;
function showhtml() {
  shortcut.remove('ctrl+space');
  if (showinghtml)return;
  showinghtml = true;
  $(".centerpain [style]").removeAttr('style');
  removeDuplicateStyleRules();
  unSelect();
  save();
  var body = $(layout.panes.center).html();

  for (var i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].title == "globalless") {
      sheet = document.styleSheets[i];
    }
  }
  rules = sheet.rules ? sheet.rules : sheet.cssRules;
  var style = '';
  for (i = 0; i < rules.length; i++) {
    if (rules[i].selectorText === '.centerpain')continue;
    if (rules[i].style.length < 1)continue;
    style += rules[i].cssText + '\n';
  }
  style = '<style type="text/css">' + style + '</style>';


  var d = $('<textarea cols=100></textarea>');
  d.css('display', 'none');
  var html = "<html>" +
    "<head>" + style +
    "</head>" +
    "<body>" + body + "</body></html>";
  d.text(style_html(html));
  d.attr('id', 'htmlcode');

  //$('body').append(d);
  d.dialog({
    modal:true,
    width:1000,
    height:500,
    close:function () {
      showinghtml = false;
      shortcut.add('ctrl+space', function () {
        showhtml();
      }, null, 'Show Source Code');
      d.remove();
      d.dialog('destroy');
      keyBoardListener();
    }
  });
}

shortcutkeys = [
  'alt+s',
  'alt+a',
  'alt+w',
  'alt+d',
  //'ctrl+space',
  'delete',
  'ctrl+x',
  'ctrl+c',
  'ctrl+v'
];

function removeKeyBoardListener() {
  for (x in shortcutkeys) {
    shortcut.remove(shortcutkeys[x]);
  }
}

function keyBoardListener() {
  removeKeyBoardListener();
  shortcut.add('alt+s', function () {
    displaytoggle('south');
  }, null, 'Hide South');

  shortcut.add('alt+a', function () {
    displaytoggle('west');
  }, null, 'Hide West');

  shortcut.add('alt+w', function () {
    displaytoggle('north');
  }, null, 'Hide North');

  shortcut.add('alt+d', function () {
    displaytoggle('east');
  }, null, 'Hide East');

  shortcut.add('ctrl+space', function () {
    showhtml();
  }, null, 'Show Source Code');

  shortcut.add('ctrl+q', function () {
    $.msgbox('Are you sure you want to Discard changed ?', {type:'confirm'}, function (res) {
      if (res == 'Accept') {
        //console.log(res);
        $.jStorage.flush();
        $(layout.panes.center).html('<br>');
        $('#globalless').text('#undefined{}');
        window.location.reload();
      }
    });

  }, null, 'Start New');

  shortcut.add('esc', function () {
    unSelect();
    save();
    setListeners();
  }, null, 'Unselect any Selected Element');

  shortcut.add('delete', deleteselected, null, 'Delete any Selected Element');


  shortcut.add('ctrl+x', function () {
    if (selected) {
      copied = selected.clone();
      selected.remove();
    }
  }, null, 'Cut any Selected element to be pasted later');

  shortcut.add('ctrl+c', function () {
    copied = selected.clone();
  }, null, 'Copy Selected Element');

  shortcut.add('ctrl+v', function () {
    if (selected && copied) {
      $.msgbox('Paste <br>1. As First child<br>2. As Last child<br>3. After Selected Element<br>4. Before Selected Element', {
        type:'prompt'
      }, function (res) {
        var pasted = copied.clone();
        switch (parseInt(res)) {
          case 1:
            selected.prepend(pasted);
            break;
          case 2:
            selected.append(pasted);
            break;
          case 3:
            if (selected.hasClass('ui-layout-center')) {
              return;
            }
            selected.after(pasted);
            break;
          case 4:
            if (selected.hasClass('ui-layout-center')) {
              return;
            }
            selected.before(pasted);
            break;
        }
        pasted.prop('id', pasted.prop('tagName') + "_" + makeid(6));
      });
    }
  }, null, 'Paste Element(Show menu where to paste)');

}


function up() {
  if (selected.length == 0) {
    select(layout.panes.center);
  } else if (!selected.hasClass('ui-layout-center')) {
    select(selected.parent());
  } else if (selected[0].children.length > 0) {
    //select(selected[0].lastChild);
  } else {
    //select(selected);
  }
}

function down() {
  if (selected == null || selected.length == 0) {
    select(layout.panes.center);
  } else if (selected[0].hasChildNodes()) {
    select(selected[0].children[0]);
  }
  /*else if (selected.next().length > 0) {
   select(selected.next()[0]);
   } else {
   right();
   }*/
}

function left() {
  if (selected == null || selected.length == 0) {
    select(layout.panes.center);
  } else if (selected.prev().length > 0) {
    select(selected.prev()[0]);
  } else {
    select(selected.parent()[0].lastChild)
    //up();
  }
}

function right() {
  if (selected == null || selected.length == 0) {
    select(layout.panes.center);
  } else if (selected.hasClass('ui-layout-center')) {
    down();
  } else if (selected.next().length > 0) {
    select(selected.next()[0])
  } else {
    select(selected.parent()[0].firstChild);
    //up();
  }
}

var arrowKeyslist = [
  {key:'up', action:up, label:'Select Parent'},
  {key:'down', action:down, label:'Select First Chile'},
  {key:'left', action:left, label:'Select Previous Element'},
  {key:'right', action:right, label:'Select Next Element'}
];
function arrowKeys(b) {

  if (b) {
    arrowKeys(false);
    for (l in arrowKeyslist) {
      shortcut.add(arrowKeyslist[l].key, arrowKeyslist[l].action, null, arrowKeyslist[l].label);
    }
  } else {
    for (var l in arrowKeyslist) {
      shortcut.remove(arrowKeyslist[l].key);
    }
  }
}


function editProperties() {
  if (true || properties[selected.prop('tagName').toString().toLowerCase()]) {
    singlekeys(false);
    var prop = $.extend({}, properties.global, properties[selected.prop('tagName').toString().toLowerCase()]);
    console.log(prop);
    var msg = {
      type:'prompt',
      inputs:[]
    };
    for (p in prop) {
      if (prop.hasOwnProperty(p)) {
        console.log("Value: " + selected[prop[p].type](p));
        msg.inputs.push({
          type:'text',
          label:prop[p].label,
          value:prop[p].type != 'text' ? selected[prop[p].type](p) : selected.text()
        });
      }
    }
    //console.log(msg);
    $.msgbox('Set Properties for #' + selected.attr('id'), msg, function (event) {
      singlekeys(true);
      var xc = 0;
      if(arguments.length < prop.length)return;
      for (p in prop) {
        if (arguments[xc].toString().length < 1 && prop[p].type != 'text') {
          selected['remove' + properties.form.action.type.slice(0, 1).toUpperCase() +
            properties.form.action.type.slice(1)](p);
        }
        prop[p].type != 'text' ? selected[prop[p].type](p, arguments[xc]) : selected.text(arguments[xc]);
        xc++;
      }
      //console.log('2');
    });
  }
}


var singlekeyslist2 = [
  {key:'i', action:insertNewElement, label:'Insert New Element'},
  {key:'c', action:addClass, label:'Add new Class to Selected Element'},
  {key:'enter', action:function () {
    filter.val('');
    filter.focus();
  }, label:'Goto Style Section'},
  {key:'r', action:function () {
    if (selected != null) {
      if ($('#resizable').attr('checked')) {
        if (removeResizable()) {
          $('#resizable').removeAttr('checked');
        }
      } else {
        if (makeResizable()) {
          $('#resizable').attr('checked', 'checked')
        }
      }
    }
  }, label:'Make it resizable'},
  {key:'p', action:editProperties, label:'Edit Properties of Selected Element'}
];

var singlekeyslist1 = [
  {key:'w', pane:'north', label:'Toggle North'},
  {key:'a', pane:'west', label:'Toggle North'},
  {key:'s', pane:'south', label:'Toggle North'},
  {key:'d', pane:'east', label:'Toggle North'}
];


function singlekeys(b) {


  if (b) {
    singlekeys(false);
    for (l = 0; l < singlekeyslist2.length; l++) {
      //console.log(list2[l].key + " :" + list2[l].action);
      shortcut.add(singlekeyslist2[l].key, singlekeyslist2[l].action, null, singlekeyslist2[l].label);
    }

    shortcut.add('w', function () {
      layout.toggle('north')
    }, null, 'Toggle North');
    shortcut.add('s', function () {
      layout.toggle('south')
    }, null, 'Toggle South');
    shortcut.add('d', function () {
      if (selected != null) {
        //console.log($('#draggable').attr('checked'));
        if ($('#draggable').attr('checked')) {
          removeDraggable();
        } else {
          if (makeDraggable()) {
            $('#draggable').attr('checked', 'checked');
          }
        }

      } else {
        layout.toggle('east');
      }
    }, null, 'Toggle East OR make Selected element Draggable');
    shortcut.add('a', function () {
      layout.toggle('west');
    }, null, 'Toggle West');


  } else {
    shortcut.remove('w');
    shortcut.remove('a');
    shortcut.remove('s');
    shortcut.remove('d');
    for (l in singlekeyslist1) {
      shortcut.remove(singlekeyslist1[l].key);
    }
    for (l in singlekeyslist2) {
      shortcut.remove(singlekeyslist2[l].key);
    }
  }
  arrowKeys(b);
}

function removeDuplicateStyleRules() {
  var sheetindex;
  for (i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].title == "globalless") {
      sheetindex = i;
      break;
    }
  }
  cssRules = document.styleSheets[sheetindex].rules;
  for (var i = 0; i < document.styleSheets[sheetindex].cssRules.length; i++) {
    var s = document.styleSheets[sheetindex].cssRules[i].selectorText;
    var csstxt = document.styleSheets[sheetindex].cssRules[i].cssText;
    var todelete = [];
    for (j = i + 1; j < document.styleSheets[sheetindex].cssRules.length; j++) {
      if (s == document.styleSheets[sheetindex].cssRules[j].selectorText) {
        csstxt += document.styleSheets[sheetindex].cssRules[j].cssText;
        document.styleSheets[sheetindex].deleteRule(j);
        j--;
      }
    }
  }
}

function ctrlmove(b) {
  //console.log('add ' + b);
  var list = [
    {key:'ctrl+right'},
    {key:'ctrl+up'},
    {key:'ctrl+left'},
    {key:'ctrl+down'}
  ]
  if (b) {
    var dir = 0;
    var inc = 1;
    shortcut.add('ctrl+right', function () {
      //console.log(dir);
      if (dir == 1) {
        inc++;
      } else {
        inc = 1;
        dir = 1;
      }
      selected.css('left', (parseInt(selected.css('left').replace('px', '')) + inc) + 'px');
    }, null, 'Move to right (position relatively)');

    shortcut.add('ctrl+left', function () {
      //console.log('move right');
      if (dir == 2) {
        inc++;
      } else {
        inc = 1;
        dir = 2;
      }
      selected.css('left', (parseInt(selected.css('left').replace('px', '')) - inc) + 'px');
    }, null, 'Move to left (position relatively)');

    shortcut.add('ctrl+up', function () {
      if (dir == 3) {
        inc++;
      } else {
        inc = 1;
        dir = 3;
      }
      selected.css('top', (parseInt(selected.css('top').replace('px', '')) - inc) + 'px');
    }, null, 'Move up (position relatively)');

    shortcut.add('ctrl+down', function () {
      if (dir == 4) {
        inc++;
      } else {
        inc = 1;
        dir = 4;
      }
      selected.css('top', (parseInt(selected.css('top').replace('px', '')) + inc) + 'px');
    }, null, 'Move to down (position relatively)');
  } else {
    styleToClass('#' + $(selector).val(), selected);
    for (l in list) {
      shortcut.remove(list[l].key);
    }
  }
}

function makeResizable() {
  if (selected.attr('id') == "centerpane")return false;
  removeDraggable();
  enterToStyle(true);
  if (selected == null)return;
  $(layout.panes.west).find(":input").attr('disabled', 'disabled');
  $($('#resizable')).removeAttr('disabled');
  selected.resizable();
  arrowKeys(false);
  var dir = 0;
  var inc = 1;
  shortcut.add('right', function () {
    //console.log(dir);
    if (dir == 1) {
      inc++;
    } else {
      inc = 1;
      dir = 1;
    }
    selected.css('width', (parseInt(selected.css('width').replace('px', '')) + inc) + 'px');
  }, null, 'Increase Width');

  shortcut.add('left', function () {
    if (dir == 2) {
      inc++;
    } else {
      inc = 1;
      dir = 2;
    }
    selected.css('width', (parseInt(selected.css('width').replace('px', '')) - inc) + 'px');
  }, null, 'Decrease Width');

  shortcut.add('up', function () {
    if (dir == 3) {
      inc++;
    } else {
      inc = 1;
      dir = 3;
    }
    selected.css('height', (parseInt(selected.css('height').replace('px', '')) - inc) + 'px');
  }, null, 'Decrease height');

  shortcut.add('down', function () {
    if (dir == 4) {
      inc++;
    } else {
      inc = 1;
      dir = 4;
    }
    selected.css('height', (parseInt(selected.css('height').replace('px', '')) + inc) + 'px');
  }, null, 'Increase height');
}

function removeResizable() {
  if (selected == null)return true;
  var xx = selected;
  unSelect();
  select(xx);
  selected.resizable('destroy');
  $(layout.panes.west).find(":input").removeAttr('disabled');
  arrowKeys(true);
  return true;
}

function addClass() {
  singlekeys(false);
  $.msgbox("Enter Class Name (without dot):", {
    type:"prompt"
  }, function (result) {
    singlekeys(true);
    if (result) {
      selected.addClass(result);
      $('#selector').prepend("<option value='." + result + "'>." + result + "</option>");
      $('#selector').val(0);
      refreshEast();
    }
  });
}

function initwest() {
  tbl = $('<dl></dl>');
  menu = [
    {
      label:'Insert New Element',
      type:'button',
      id:'newelement',
      action:insertNewElement
    },
    {
      label:'Add a Class to Selected',
      type:'button',
      id:'newclass',
      action:addClass
    },
    {
      label:'Resizable',
      type:'checkbox',
      id:'resizable',
      action:function () {
        if ($('#resizable').checked) {
          makeResizable();
        } else {
          removeResizable();
        }
      }
    },
    {
      label:'Draggable',
      type:'checkbox',
      id:'draggable',
      action:function () {
        if (this.checked) {
          makeDraggable();
        } else {
          removeDraggable();
        }
      }
    },
    {
      label:'Set Element Properties',
      type:'button',
      id:'innertext',
      action:editProperties
    }
  ];

  for (m in menu) {
    if (menu[m].type == 'button') {
      var dt = $("<dt></dt>");
      var x = $('<input>');
      x.attr('type', menu[m].type)
      x.attr('value', menu[m].label);
      x.on('click', menu[m].action);
      x.attr('id', menu[m].id);
      dt.append(x);
      tbl.append(dt);
    } else {
      var dt = $("<dt></dt>");
      var dd = $("<dd></dd>");
      var x = $('<input>');
      x.attr('type', menu[m].type)
      x.attr('value', '');
      x.attr('id', menu[m].id);
      x.on('click', menu[m].action);
      dt.text(menu[m].label);
      dd.append(x);
      tbl.append(dt).append(dd);
    }

  }
  $(layout.panes.west).html(tbl);
}

function enterToStyle(b) {
  shortcut.remove('enter');
  shortcut.add('enter', function () {
    if (selected.attr('id') != 'centerpane' && selected.attr('id') != undefined) {
      var css = 'width:' + selected.css('width') + ';' +
        'height:' + selected.css('height') + ';' +
        'top:' + selected.css('top') + ';' +
        'left:' + selected.css('left') + ';' +
        'position:relative;';
      //console.log("Css:" + css);
      globalstylesheet.cssBySelector('#' + selected.attr('id'), css);
    }
  }, null, 'Update Size and Position (Draggable/Resizable Mode)');
}

function makeDraggable() {
  if (selected.attr('id') == "centerpane")return false;

  removeResizable();
  arrowKeys(false);
  removeKeyBoardListener();
  enterToStyle(true);

  var originalparent;
  $(layout.panes.west).find(":input").attr('disabled', 'disabled');
  $('#draggable').removeAttr('disabled');
  $(layout.panes.center).find('*').droppable({
    tolerance:'pointer',
    greedy:true,
    over:function (x) {
      $(x.target).css('border', '2px solid yellow');
    },
    out:function (x) {
      $(x.target).css('border', '');
    },
    drop:function (x) {
      if ($(x.target) != originalparent) {
        $(x.target).append(selected);
      }
      selected.removeAttr('style');
    }
  });
  selected.droppable('destroy');
  selected.draggable({
    start:function (e) {
      originalparent = selected.parent();
    }
  });

  shortcut.add('right', function () {
    if (selected.next().length > 0) {
      $(selected.next()[0]).after(selected);
    } else if (!selected.parent().hasClass('ui-layout-center')) {
      selected.parent().after(selected);
    }
  }, null, 'Move to AFTER NEXT ELEMENT. IF Last Element, Move to After Parent');

  shortcut.add('left', function () {
    if (selected.prev().length > 0) {
      selected.prev().after(selected);
    } else if (!selected.parent().hasClass('ui-layout-center')) {
      selected.parent().before(selected);
    }
  }, null, 'Move to BEFORE PREVIOUS ELEMENT. IF First Element, Move to Before Parent');

  shortcut.add('up', function () {
    if (!selected.parent().hasClass('ui-layout-center')) {
      selected.parent().after(selected);
    }
  }, null, 'Move to After Parent');

  shortcut.add('down', function () {
    if (selected.next().length > 0) {
      selected.next().append(selected);
    } else if (selected.prev().length > 0 && !selected.parent().hasClass('ui-layout-center')) {
      selected.prev().append(selected);
    }
  }, null, 'Make Selected the Last child of Next sibling, if no next element, make lastchild of Previous Sibling');

  if (selected.css('left') == 'auto' || selected.css('top') == 'auto') {
    if (selected.css('position') == 'relative') {
      selected.css('left', selected.position().left + 'px');
      selected.css('top', selected.position().top + 'px');
    } else if (selected.css('position') == 'absolute') {
      selected.css('left', selected.offset().left + 'px');
      selected.css('top', selected.offset().top + 'px');
    }
  }
  ctrlmove(true);
  return true;
}

function wordAroundCursor(target) {

  var word = target.value;
  t = $(target);
  if (t.caret().start != t.caret().start) {
    return t.caret().text;
  }
  var start = t.caret().start;
  var end = word.regexIndexOf(/[^a-zA-Z0-9%]/, start);
  if (end == -1)end = word.length;
  start = word.reverse().regexIndexOf(/[^a-zA-Z0-9%#]/, word.length - end);
  if (start == -1)start = word.length;
  start = word.length - start;
  t.caret({start:start, end:end});
  return {word:t.caret().text, start:start, end:end};
}

function removeDraggable() {
  $('#draggable').removeAttr('checked');
  singlekeys(true);
  ctrlmove(false);
  selected.draggable('destroy');
  $(layout.panes.center).find('*').droppable('destroy');
  $(layout.panes.west).find(":input").removeAttr('disabled');
}

function incColor(color, inc) {
  if (color.ok) {
    color.b += inc;
    if (color.b > 255) {
      color.b = 0;
      color.g += inc;
      if (color.g > 255) {
        color.g = 0;
        color.r += inc;
        if (color.r > 255) {
          color.r = 0;
        }
      }
    } else if (color.b < 0) {
      color.b = 255;
      color.g += inc;
      if (colog.g < 0) {
        color.g = 255;
        color.r += inc;
        if (color.r < 0) {
          color.r = 255;
        }
      }
    }
    return '#' + color.toHex().substr(1);
  }
  return '#343434';
}

function change(word, inc) {
  if (word.substr(-2) == 'px' || word.substr(-2) == 'em') {
    var newval = (parseInt(word.substr(0, word.length - 2)) + inc);
    return newval + 'px';
  }

  if (word.substr(1, 1) == '#') {
    color = new RGBColor(word.substr(1));
    return incColor(color, inc);
  }

  var c = colors.indexOf(word);
  if (c > -1) {
    return colors[(c + inc) % colors.length];
  }

  if (parseInt(word) == word) {
    return parseInt(word) / 1 + inc / 1;
  }

  var color = new RGBColor(word);
  if (color.ok) {
    return incColor(color, inc);
  }


}

function initEast() {

  var selector = $('<select id="selector"></select>');
  $(layout.panes.east).append(selector);

  selector.on('change', function (event) {
    console.log(event.target.value);
    refreshEast(event.target.value);
  });

  var dl = $('<dl id="styleslist"></dl>');
  for (option in $('body').cssObject()) {
    var dv = $('<div id="style' + option + '"></div>')
    var x = document.createElement('input');
    x.type = 'text';
    x.name = 'cssprop';
    $(x).attr('id', option);
    var td1 = $('<dt>' + option + '</dt>');
    var td2 = $('<dd></dd>');
    td2.append(x);
    dv.append(td1).append(td2);
    dl.append(dv);
  }
  $(layout.panes.east).append(dl);
  dl.find(":input").on('focus', function (e) {
    singlekeys(false);
    //console.log('remove key');
    removeKeyBoardListener();
    $(this).on('keydown', function (event) {

      if (!event.ctrlKey)return;

      if (event.which == 38) {
        inc = 1;
      } else if (event.which == 40) {
        inc = -1;
      } else {

        return;
      }

      //console.log(event.which);
      var data = wordAroundCursor(event.target);
      newword = change(data.word, inc);
      //console.log(data.start);
      if (newword != undefined) {
        event.target.value = $(event.target).caret().replace(newword);
        $(event.target).caret({start:data.start, end:data.end});
      }
    });

    $(this).select();
  });
  dl.find(":input").on('blur',
    function (event) {
      singlekeys(true);
      keyBoardListener();
      var v = event.target.value;
      if (v.length < 1) {
        return;
      }
      var s = selector.val();
      var p = event.target.id;

      console.log(p + ', ' + v)
      $(s).globalcss(p, v)
      $(s).removeAttr('style');
      //console.log(s);
      //less.refresh();
      //select(selected);
      //selected.removeAttr('style');
    }).on('change', function (event) {
      var v = event.target.value;
      var s = selector.val();
      var p = event.target.id;
      $(s).globalcss(p, v)
    });

  filter = $("<input type='text' name='filter' value=''>");
  var tsel;
  filter.on('keyup',
    function (event) {

      if (event.which == 27) {
        select(tsel);
        $(this).blur();
        selected.focus();
      } else if (event.which == 13 && this.value != '') {
        //console.log(event.target);
        $(this).blur();
        $("#styleslist :first-child:visible:input")[0].focus();
        $("#styleslist :first-child:visible:input")[0].setSelectionRange(0, 0)
        return;
      }
      val = this.value;
      if (val) {
        $("#styleslist div").hide();
        $("#styleslist div[id*='" + val + "']").show();
      } else {
        $("#styleslist div").show();
      }
    }).on('focus',
    function () {
      tsel = selected;
      singlekeys(false)
    }).on('blur', function () {
      singlekeys(true);
    });
  selector.after(filter);

}

function get_random_color() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}

function getSelectors() {
  x = selected;

  if (x.hasClass('ui-layout-center')) {
    return ['.super'];
    return [x.prop('tagName')];
  }
  classes = [];
  if (x.attr('id') != undefined)
    classes.push('#' + x.attr('id'));
  if (x.attr('class') != undefined) {
    classes = classes.concat(('.' + x.attr('class')).replace(' ', ' .').split(' '));
  }
  //classes.push(x.prop('tagName'));
  x = x.parent();
  while (!x.hasClass('ui-layout-center')) {
    var tcls = [];
    try {
      if (x.attr('class') != undefined) {
        tcls = ('.' + x.attr('class')).replace(' ', ' .').split(' ');
      }
    } catch (e) {
    }
    if (x.attr('id') != undefined) {
      tcls.push(x.attr('id'));
    }
    //tcls.push(x.prop('tagName'));
    //console.log(x.prop('tagName') + " :: " + ' --> TCLS : ' + tcls);
    classes = classes.concat(tcls);
    x = x.parent();
  }
  return cleanArray(classes);
}

function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}


function makeid(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


function isTextElement(e) {
  //console.log(e);
  var good = ['a', 'p', 'textarea', 'h1', 'h2', 'h3', 'h4', 'span', 'li', 'td'];
  for (g in good) {
    if (e.is(good[g]))
      return true;
  }
  return false;
}

/*
 $.fn.extend({
 insertAtCaret: function(myValue) {
 if (document.selection) {
 this.focus();
 sel = document.selection.createRange();
 sel.text = myValue;
 this.focus();
 }
 else if (this.selectionStart || this.selectionStart == '0') {
 var startPos = this.selectionStart;
 var endPos = this.selectionEnd;
 var scrollTop = this.scrollTop;
 this.value = this.value.substring(0, startPos)+myValue+this.value.substring(endPos,this.value.length);
 this.focus();
 this.selectionStart = startPos + myValue.length;
 this.selectionEnd = startPos + myValue.length;
 this.scrollTop = scrollTop;
 } else {
 this.value += myValue;
 this.focus();
 }
 }
 })*/

String.prototype.regexIndexOf = function (regex, startpos) {
  var indexOf = this.substring(startpos || 0).search(regex);
  return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

String.prototype.regexLastIndexOf = function (regex, startpos) {
  regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
  if (typeof (startpos) == "undefined") {
    startpos = this.length;
  } else if (startpos < 0) {
    startpos = 0;
  }
  var stringToWorkWith = this.substring(0, startpos + 1);
  var lastIndexOf = -1;
  var nextStop = 0;
  while ((result = regex.exec(stringToWorkWith)) != null) {
    lastIndexOf = result.index;
    regex.lastIndex = ++nextStop;
  }
  return lastIndexOf;
}

String.prototype.reverse = function () {
  return this.split("").reverse().join("");
}


var colors = ['aliceblue', 'darkolivegreen', 'indigo', 'mediumpurple', 'purple', 'antiquewhite', 'darkorange', 'ivory', 'mediumseagreen', 'red', 'aqua', 'darkorchid', 'khaki', 'mediumslateblue', 'rosybrown', 'aquamarine', 'darkred', 'lavender', 'mediumspringgreen', 'royalblue', 'azure', 'darksalmon', 'lavenderblush', 'mediumturquoise', 'saddlebrown', 'beige', 'darkseagreen', 'lawngreen', 'mediumvioletred', 'salmon', 'bisque', 'darkslateblue', 'lemonchiffon', 'midnightblue', 'sandybrown', 'black', 'darkslategray', 'lightblue', 'mintcream', 'seagreen', 'blanchedalmond', 'darkturquoise', 'lightcoral', 'mistyrose', 'seashell', 'blue', 'darkviolet', 'lightcyan', 'moccasin', 'sienna', 'blueviolet', 'deeppink', 'lightgoldenrodyellow', 'navajowhite', 'silver', 'brown', 'deepskyblue', 'lightgray', 'navy', 'skyblue', 'burlywood', 'dimgray', 'lightgreen', 'oldlace', 'slateblue', 'cadetblue', 'dodgerblue', 'lightpink', 'olive', 'slategray', 'chartreuse', 'firebrick', 'lightsalmon', 'olivedrab', 'snow', 'chocolate', 'floralwhite', 'lightseagreen', 'orange', 'springgreen', 'coral', 'forestgreen', 'lightskyblue', 'orangered', 'steelblue', 'cornflowerblue', 'fuchsia', 'lightslategray', 'orchid', 'tan', 'cornsilk', 'gainsboro', 'lightsteelblue', 'palegoldenrod', 'teal', 'crimson', 'ghostwhite', 'lightyellow', 'palegreen', 'thistle', 'cyan', 'gold', 'lime', 'paleturquoise', 'tomato', 'darkblue', 'goldenrod', 'limegreen', 'palevioletred', 'turquoise', 'darkcyan', 'gray', 'linen', 'papayawhip', 'violet', 'darkgoldenrod', 'green', 'magenta', 'peachpuff', 'wheat', 'darkgray', 'greenyellow', 'maroon', 'peru', 'white', 'darkgreen', 'honeydew', 'mediumaquamarine', 'pink', 'whitesmoke', 'darkkhaki', 'hotpink', 'mediumblue', 'plum', 'yellow', 'darkmagenta', 'indianred', 'mediumorchid', 'powderblue', 'yellowgreen'];

window.onbeforeunload = window.onunload = function (e) {
  return;
  //console.log('unload');
  e.returnValue = false;
  e.preventDefault();
  return false;
}