"use strict"

/**
 * Figlet JS
 *
 * Copyright (c) 2010 Scott González
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://github.com/scottgonzalez/figlet-js
 */

;
(function () {

  var Figlet = (typeof exports !== "undefined" ? exports : window).Figlet = {
    fonts: {},

    loadFont: function loadFont(name, defn) {
      var lines = defn.split("\n");
      var header = lines[0].split(" ");
      var hardblank = header[0].charAt(header[0].length - 1);
      var height = +header[1];
      var comments = +header[5];

      Figlet.fonts[name] = {
        defn: lines.slice(comments + 1),
        hardblank: hardblank,
        height: height,
        char: {}
      };
    },

    parseChar: function parseChar(char, font) {
      var fontDefn = Figlet.fonts[font];
      if (char in fontDefn.char) {
        return fontDefn.char[char];
      }

      var height = fontDefn.height;
      var start = (char - 32) * height;
      var charDefn = [];

      for (var i = 0; i < height; i++) {
        charDefn[i] = fontDefn.defn[start + i].replace(/@/g, "").replace(RegExp("\\" + fontDefn.hardblank, "g"), " ");
      }
      return fontDefn.char[char] = charDefn;
    },

    write: function write(str, font) {

      var chars = [];
      var len = str.length;
      var result = "";

      for (var i = 0; i < len; i++) {
        chars[i] = Figlet.parseChar(str.charCodeAt(i), font);
      }

      var height = chars[0].length;

      for (var i = 0; i < height; i++) {
        for (var j = 0; j < len; j++) {
          result += chars[j][i];
        }

        result += "\n";
      }

      return result;
    }
  };
})();
