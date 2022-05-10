/*
 * Global Stylesheet jQuery Plugin
 * Version: 0.1
 * 
 * Enables CSS modification that uses a 'global' stylesheet, rather than inline CSS.
 *
 * Copyright (c) 2009 Jeremy Shipman (http://www.burnbright.co.nz)
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 * 
 * INSTRUCTIONS:
 * use in the same way as the jQuery css function. Eg:
 *  $("some selector").globalcss("style","value");
 *
 * use the globalsetylesheet.print() function to return a string of the global stylesheet
 */

(function ($) {

  //global singleton class for
  globalstylesheet = new function globalStylesheet() {

    this.deleteClass = function (className) {

      if (csssheet == null) {
        for (i = 0; i < document.styleSheets.length; i++) {
          if (document.styleSheets[i].title == "globalless") {
            csssheet = document.styleSheets[i];
            break;
          }
        }
      }
      cssRules = csssheet.rules ? csssheet.rules : csssheet.cssRules;


      console.log("Delete " + className);
      var ruleIndex = [];
      console.log(cssRules.length);
      for (i = 0; i < cssRules.length; i++) {
        console.log(cssRules[i].selectorText);
        if (cssRules[i].selectorText == className) {
          ruleIndex.push(i);
        } else if (cssRules[i].selectorText == "null") {
          ruleIndex.push(i);
        }
      }
      console.log("Delete : " + ruleIndex);
      for (x = ruleIndex.length - 1; x >= 0; x--) {
        csssheet.deleteRule(ruleIndex[x]);
      }
    };
    if (!document.styleSheets) {
      alert("document.Stylesheets not found");
      return false;
    }

    var setrules = Array(); // rule cache
    var csssheet, cssNode, cssRules, cssRulesCache;
    //set up a dummy noded
    cssNode = document.createElement('style');
    cssNode.type = 'text/css';
    cssNode.rel = 'stylesheet/css';
    cssNode.title = 'globalless';
    cssNode.id = 'globalless';
    document.getElementsByTagName("head")[0].appendChild(cssNode);

    //find the newly created stylesheet and store reference
    for (var i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].title == "globalless") {
        csssheet = document.styleSheets[i];
      }
    }

    //set a CSS rule
    this.setRule = function (selector, ruleText) {
      if (selector == '.super')return;
      ruleText = ruleText.trim();
      if (selector == null || selector == undefined || selector == 'null' || selector == 'undefined') {
        //console.log('selector null or undefined');
        return;
      }
      if (ruleText.length < 3) {
        //console.log('rule length less then 3');
        return;
      }
      if (ruleText.substr(ruleText.length - 1) != ';')ruleText = ruleText + ';';
      var i;
      if (csssheet == null) {
        for (i = 0; i < document.styleSheets.length; i++) {
          if (document.styleSheets[i].title == "globalless") {
            csssheet = document.styleSheets[i];
            break;
          }
        }
      }

      if (csssheet == null)return;

      var rule = '', ruleIndex = [];
      if (true || !cssRulesCache[selector]) {
        cssRules = csssheet.rules ? csssheet.rules : csssheet.cssRules;
        for (i = 0; i < cssRules.length; i++) {
          //console.log(i + ":" + cssRules[i].selectorText);
          if (cssRules[i].selectorText == selector) {
            rule += cssRules[i].style.cssText;
            ruleIndex.push(i);
            //cssRulesCache[selector] = rule;
          } else if (cssRules[i].selectorText == "null") {
            ruleIndex.push(i);
          }
        }
      } else {
        rule = cssRulesCache[selector];
      }
      //console.log("to Delete : " + ruleIndex.join(", "));
      for (x = ruleIndex.length - 1; x >= 0; x--) {
        //console.log('Delete Rule: ' + ruleIndex[x]);
        csssheet.deleteRule(ruleIndex[x]);
      }

      if (rule) {
        //console.log('Old Rule Index : ' + ruleIndex);
        //console.log('Old Rule : ');
        //console.log(rule);
      }
      //console.log('New Rule : ' + ruleText);


      var ruleObj = {};
      ruleText = ruleText + rule;
      var rulearray = ruleText.split(';');

      for (r in rulearray) {

        var x = rulearray[r].indexOf(':');
        var prop = rulearray[r].substr(0, x).trim();
        if (prop.length < 2 || ruleObj[prop])continue;
        //console.log(r + ':' + prop + "->" + ruleObj[prop]);
        var val = rulearray[r].substr(x + 1).trim();
        if (val.length < 2)continue;
        ruleObj[prop] = val;
        //console.log(ruleObj[prop]);
        //console.log(ruleObj);
      }

      ruleText = '';
      for (p in ruleObj) {
        ruleText += p + ":" + ruleObj[p] + ';'
      }

      //console.log(ruleText);
      ////console.log('2');
      if (csssheet.addRule) { // IE
        ////console.log('3');
        csssheet.addRule(selector, ruleText, 0);
      } else {
        ////console.log('4');
        csssheet.insertRule(selector + '{' + ruleText + '}', 0);
      }
      ////console.log('5');
      setrules[selector] = this.getRule(selector);

      ////console.log('6');
      return setrules[selector];
    };

    //get a saved CSS rule
    this.getRule = function getRule(selector) {
      if (setrules[selector] != undefined) {
        return setrules[selector];
      } else {
        var rules = allRules();
        for (var i = 0; i < rules.length; i++) {
          if (rules[i].selectorText == selector) {
            return rules[i];
          }
        }
      }
      return false;
    };

    //helper function to get all rules
    function allRules() {
      if (csssheet.cssRules) { //IE
        return csssheet.cssRules;
      } else {
        return csssheet.rules;
      }
    }

    //print out the stylesheet
    this.print = function print() {
      var styleinfo = "";
      var rules = allRules();
      for (var i = 0; i < rules.length; i++) {
        styleinfo += rules[i].cssText + "\n"
      }
      return styleinfo;
    }

    //use jQuery's css selector function to set the style object
    this.css = function css(jquery, key, value) {
      rule = this.setRule(jquery.selector, key + ":" + value + ";");
      jQuery(rule).css(key, value);
    };

    this.cssBySelector = function (selector, csstext) {
      //console.log('CSS By' + selector + " : " + csstext);
      rule = this.setRule(selector, csstext);
      return rule;
    };

    this.cssByObject = function (selector, cssObject) {
      var cssline = '';
      for (prop in cssObject) {
        if (cssObject[prop].length < 1)continue;
        if (
          cssObject[prop] == null ||
            cssObject[prop] == "null" ||
            cssObject[prop] == undefined ||
            cssObject[prop] == 'undefined'
          )continue;
        cssline += prop + ":" + cssObject[prop] + ";";
      }
      this.cssBySelector(selector, cssline);
    }
  };

  //hook new function into jQuery
  jQuery.fn.extend({
    globalcss:function globalcss(key, value) {
      globalstylesheet.css(this, key, value);
    }
  });


})(jQuery);