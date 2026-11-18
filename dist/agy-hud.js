#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/ansi-regex/index.js
var require_ansi_regex = __commonJS({
  "node_modules/ansi-regex/index.js"(exports2, module2) {
    "use strict";
    module2.exports = ({ onlyFirst = false } = {}) => {
      const pattern = [
        "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
        "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
      ].join("|");
      return new RegExp(pattern, onlyFirst ? void 0 : "g");
    };
  }
});

// node_modules/strip-ansi/index.js
var require_strip_ansi = __commonJS({
  "node_modules/strip-ansi/index.js"(exports2, module2) {
    "use strict";
    var ansiRegex = require_ansi_regex();
    module2.exports = (string) => typeof string === "string" ? string.replace(ansiRegex(), "") : string;
  }
});

// node_modules/is-fullwidth-code-point/index.js
var require_is_fullwidth_code_point = __commonJS({
  "node_modules/is-fullwidth-code-point/index.js"(exports2, module2) {
    "use strict";
    var isFullwidthCodePoint = (codePoint) => {
      if (Number.isNaN(codePoint)) {
        return false;
      }
      if (codePoint >= 4352 && (codePoint <= 4447 || // Hangul Jamo
      codePoint === 9001 || // LEFT-POINTING ANGLE BRACKET
      codePoint === 9002 || // RIGHT-POINTING ANGLE BRACKET
      // CJK Radicals Supplement .. Enclosed CJK Letters and Months
      11904 <= codePoint && codePoint <= 12871 && codePoint !== 12351 || // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
      12880 <= codePoint && codePoint <= 19903 || // CJK Unified Ideographs .. Yi Radicals
      19968 <= codePoint && codePoint <= 42182 || // Hangul Jamo Extended-A
      43360 <= codePoint && codePoint <= 43388 || // Hangul Syllables
      44032 <= codePoint && codePoint <= 55203 || // CJK Compatibility Ideographs
      63744 <= codePoint && codePoint <= 64255 || // Vertical Forms
      65040 <= codePoint && codePoint <= 65049 || // CJK Compatibility Forms .. Small Form Variants
      65072 <= codePoint && codePoint <= 65131 || // Halfwidth and Fullwidth Forms
      65281 <= codePoint && codePoint <= 65376 || 65504 <= codePoint && codePoint <= 65510 || // Kana Supplement
      110592 <= codePoint && codePoint <= 110593 || // Enclosed Ideographic Supplement
      127488 <= codePoint && codePoint <= 127569 || // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
      131072 <= codePoint && codePoint <= 262141)) {
        return true;
      }
      return false;
    };
    module2.exports = isFullwidthCodePoint;
    module2.exports.default = isFullwidthCodePoint;
  }
});

// node_modules/string-width/node_modules/emoji-regex/index.js
var require_emoji_regex = __commonJS({
  "node_modules/string-width/node_modules/emoji-regex/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function() {
      return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
    };
  }
});

// node_modules/string-width/index.js
var require_string_width = __commonJS({
  "node_modules/string-width/index.js"(exports2, module2) {
    "use strict";
    var stripAnsi2 = require_strip_ansi();
    var isFullwidthCodePoint = require_is_fullwidth_code_point();
    var emojiRegex2 = require_emoji_regex();
    var stringWidth2 = (string) => {
      if (typeof string !== "string" || string.length === 0) {
        return 0;
      }
      string = stripAnsi2(string);
      if (string.length === 0) {
        return 0;
      }
      string = string.replace(emojiRegex2(), "  ");
      let width = 0;
      for (let i = 0; i < string.length; i++) {
        const code = string.codePointAt(i);
        if (code <= 31 || code >= 127 && code <= 159) {
          continue;
        }
        if (code >= 768 && code <= 879) {
          continue;
        }
        if (code > 65535) {
          i++;
        }
        width += isFullwidthCodePoint(code) ? 2 : 1;
      }
      return width;
    };
    module2.exports = stringWidth2;
    module2.exports.default = stringWidth2;
  }
});

// node_modules/emoji-regex/index.js
var require_emoji_regex2 = __commonJS({
  "node_modules/emoji-regex/index.js"(exports2, module2) {
    module2.exports = () => {
      return /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26D3\uFE0F?(?:\u200D\uD83D\uDCA5)?|\u26F9(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF43\uDF45-\uDF4A\uDF4C-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDF44(?:\u200D\uD83D\uDFEB)?|\uDF4B(?:\u200D\uD83D\uDFE9)?|\uDFC3(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E-\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4\uDEB5](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE41\uDE43\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED8\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC08(?:\u200D\u2B1B)?|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC26(?:\u200D(?:\u2B1B|\uD83D\uDD25))?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])))?))?|\uDD75(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?|\uDE42(?:\u200D[\u2194\u2195]\uFE0F?)?|\uDEB6(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3C-\uDD3E\uDDB8\uDDB9\uDDCD\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE8A\uDE8E-\uDEC2\uDEC6\uDEC8\uDECD-\uDEDC\uDEDF-\uDEEA\uDEEF]|\uDDCE(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1|\uDDD1\u200D\uD83E\uDDD2(?:\u200D\uD83E\uDDD2)?|\uDDD2(?:\u200D\uD83E\uDDD2)?))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g;
    };
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  maxStdinBytes: () => maxStdinBytes,
  parsePayloadObject: () => parsePayloadObject,
  readStdinBounded: () => readStdinBounded,
  renderStatusline: () => renderStatusline,
  runCli: () => runCli,
  stdinTimeoutMs: () => stdinTimeoutMs,
  version: () => version
});
module.exports = __toCommonJS(main_exports);

// src/config.ts
var defaultStdinTimeoutMs = 1e3;
var minStdinTimeoutMs = 50;
var maxStdinTimeoutMs = 1e4;
function defaultConfig() {
  return {
    showModel: true,
    showProgressBar: true,
    multiline: true,
    color: true,
    showGitBranch: true,
    showCWD: true,
    showAgentState: true,
    showCost: true,
    showTitle: false,
    showMode: true,
    showIcons: true,
    contextValue: "percent",
    usageValue: "remaining",
    locale: void 0,
    timeZone: void 0,
    stdinTimeoutMs: defaultStdinTimeoutMs
  };
}
function isValidLocale(value) {
  if (value === "" || value.length > 35 || !/^[A-Za-z0-9-]+$/.test(value)) {
    return false;
  }
  try {
    new Intl.DateTimeFormat(value);
    return true;
  } catch {
    return false;
  }
}
function isValidTimeZone(value) {
  if (value === "" || value.length > 64 || !/^[A-Za-z0-9_/+.-]+$/.test(value)) {
    return false;
  }
  try {
    new Intl.DateTimeFormat(void 0, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
function parseCliConfig(args, base = defaultConfig()) {
  const cfg = { ...base };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--color") cfg.color = true;
    else if (arg === "--no-color") cfg.color = false;
    else if (arg === "--icons") cfg.showIcons = true;
    else if (arg === "--no-icons") cfg.showIcons = false;
    else if (arg === "--bar") cfg.showProgressBar = true;
    else if (arg === "--no-bar") cfg.showProgressBar = false;
    else if (arg === "--multiline") cfg.multiline = true;
    else if (arg === "--single-line") cfg.multiline = false;
    else if (arg === "--no-git") cfg.showGitBranch = false;
    else if (arg === "--no-cwd") cfg.showCWD = false;
    else if (arg === "--no-state") cfg.showAgentState = false;
    else if (arg === "--no-cost") cfg.showCost = false;
    else if (arg === "--no-mode") cfg.showMode = false;
    else if (arg === "--show-title") cfg.showTitle = true;
    else if (arg === "--no-title") cfg.showTitle = false;
    else if (arg.startsWith("--context-value=")) {
      const v = arg.slice("--context-value=".length);
      if (v === "percent" || v === "tokens" || v === "both") cfg.contextValue = v;
      else return { config: cfg, error: "Invalid --context-value (expected percent, tokens, or both)." };
    } else if (arg.startsWith("--usage-value=")) {
      const v = arg.slice("--usage-value=".length);
      if (v === "remaining" || v === "percent") cfg.usageValue = v;
      else return { config: cfg, error: "Invalid --usage-value (expected remaining or percent)." };
    } else if (arg.startsWith("--locale=")) {
      const v = arg.slice("--locale=".length);
      if (isValidLocale(v)) cfg.locale = v;
      else return { config: cfg, error: "Invalid --locale value." };
    } else if (arg.startsWith("--time-zone=")) {
      const v = arg.slice("--time-zone=".length);
      if (isValidTimeZone(v)) cfg.timeZone = v;
      else return { config: cfg, error: "Invalid --time-zone value." };
    } else if (arg.startsWith("--stdin-timeout-ms=")) {
      const raw = Number(arg.slice("--stdin-timeout-ms=".length));
      if (!Number.isInteger(raw) || raw < minStdinTimeoutMs || raw > maxStdinTimeoutMs) {
        return { config: cfg, error: `Invalid --stdin-timeout-ms (expected integer ${minStdinTimeoutMs}..${maxStdinTimeoutMs}).` };
      }
      cfg.stdinTimeoutMs = raw;
    } else {
      return { config: cfg, error: "Unknown flag." };
    }
  }
  return { config: cfg };
}

// src/doctor.ts
var iconProbe = [
  { glyph: "\uEE9C", label: "model" },
  { glyph: "\uF0A3", label: "plan" },
  { glyph: "\uE725", label: "branch" },
  { glyph: "\uF07C", label: "folder" }
];
function nodeMajor(nodeVersion) {
  const match = nodeVersion.trim().match(/^v?(\d+)/);
  return match ? Number(match[1]) : 0;
}
function collectPassiveDoctorReport(version2) {
  const resolved = new Intl.DateTimeFormat().resolvedOptions();
  return {
    version: version2,
    passive: true,
    nodeVersion: process.version,
    nodeOk: nodeMajor(process.version) >= 18,
    platform: process.platform,
    locale: resolved.locale || "unknown",
    timeZone: resolved.timeZone || "unknown",
    defaults: defaultConfig(),
    iconProbe: iconProbe.map((item) => `${item.glyph} ${item.label}`).join("   ")
  };
}
function formatPassiveDoctorReport(report) {
  const lines = [
    `agy-hud ${report.version} (strictly passive mode)`,
    `node      ${report.nodeVersion} (${report.nodeOk ? "ok" : "Node 18+ required"})`,
    `platform  ${report.platform}`,
    `locale    ${report.locale}`,
    `timezone  ${report.timeZone}`,
    `probe     ${report.iconProbe}`,
    `note      If the probe shows boxes instead of icons, pass --no-icons or install a Nerd Font.`
  ];
  return `${lines.join("\n")}
`;
}

// src/ansi.ts
var import_string_width = __toESM(require_string_width());
var import_strip_ansi = __toESM(require_strip_ansi());
var import_emoji_regex = __toESM(require_emoji_regex2());
var graphemes = new Intl.Segmenter(void 0, { granularity: "grapheme" });
var emoji = (0, import_emoji_regex.default)();
function strip(input) {
  return (0, import_strip_ansi.default)(input);
}
function visibleLen(input) {
  const text = strip(input).replace(emoji, "  ").replace(/[\p{Mark}\p{Default_Ignorable_Code_Point}]/gu, "");
  return (0, import_string_width.default)(text);
}
function truncateColumns(input, width) {
  if (width <= 0) return "";
  let result = "";
  let columns = 0;
  for (const { segment } of graphemes.segment(strip(input))) {
    const next = visibleLen(segment);
    if (columns + next > width) break;
    result += segment;
    columns += next;
  }
  return result;
}
function sanitizePlainText(raw, maxCols) {
  if (typeof raw !== "string") return "";
  const stripped = (0, import_strip_ansi.default)(raw).replace(new RegExp("\\p{Cc}", "gu"), " ").replace(new RegExp("(?![\\u200C\\u200D\\u{E0020}-\\u{E007F}])\\p{Cf}", "gu"), "").trim().split(/\s+/).filter(Boolean).join(" ");
  if (stripped === "" || maxCols <= 0) return "";
  if (visibleLen(stripped) <= maxCols) return stripped;
  if (maxCols === 1) return truncateColumns(stripped, 1);
  return `${truncateColumns(stripped, maxCols - 1)}\u2026`;
}

// src/quota.ts
var maxBucketIdColumns = 32;
var clockSkewToleranceSeconds = 120;
var isoTzPattern = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-](?:[01]\d|2[0-3]):?[0-5]\d)$/i;
var knownBucketMeta = /* @__PURE__ */ new Map([
  ["gemini-5h", { groupId: "gemini", groupLabel: "Gemini", windowLabel: "5h", label: "Gemini 5h" }],
  ["gemini-weekly", { groupId: "gemini", groupLabel: "Gemini", windowLabel: "Weekly", label: "Gemini Weekly" }],
  ["gemini-argon-wtu-5h", { groupId: "argon", groupLabel: "Argon", windowLabel: "5h", label: "Argon 5h" }],
  ["argon-5h", { groupId: "argon", groupLabel: "Argon", windowLabel: "5h", label: "Argon 5h" }],
  ["gemini-argon-wtu-weekly", { groupId: "argon", groupLabel: "Argon", windowLabel: "Weekly", label: "Argon Weekly" }],
  ["3p-5h", { groupId: "3p", groupLabel: "Claude/GPT", windowLabel: "5h", label: "Claude/GPT 5h" }],
  ["3p-weekly", { groupId: "3p", groupLabel: "Claude/GPT", windowLabel: "Weekly", label: "Claude/GPT Weekly" }]
]);
var knownGroupOrder = ["gemini", "argon", "3p"];
function resolveBucketMeta(key) {
  const safeId = sanitizePlainText(key, maxBucketIdColumns);
  if (safeId === "" || safeId === "__proto__" || safeId === "constructor" || safeId === "prototype") {
    return null;
  }
  const known = knownBucketMeta.get(key);
  if (known) {
    return known;
  }
  const suffixMatch = safeId.match(/^(.+?)-(5h|weekly)$/i);
  if (suffixMatch) {
    const prefix = sanitizePlainText(suffixMatch[1], maxBucketIdColumns);
    if (prefix !== "") {
      const windowLabel = suffixMatch[2].toLowerCase() === "5h" ? "5h" : "Weekly";
      return {
        groupId: `custom:${prefix.toLowerCase()}`,
        groupLabel: prefix,
        windowLabel,
        label: sanitizePlainText(`${prefix} ${windowLabel}`, maxBucketIdColumns)
      };
    }
  }
  return {
    groupId: `custom:${safeId}`,
    groupLabel: safeId,
    windowLabel: "",
    label: safeId
  };
}
function windowSortRank(windowLabel) {
  if (windowLabel === "5h") return 0;
  if (windowLabel === "Weekly") return 1;
  return 2;
}
function parseTimezoneAwareTimestamp(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const match = trimmed.match(isoTzPattern);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = match[6] !== void 0 ? Number(match[6]) : 0;
  const fracRaw = match[7] ?? "";
  const tzRaw = match[8];
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
    return null;
  }
  const baseUtc = Date.UTC(year, month - 1, day, hour, minute, second, 0);
  const check = new Date(baseUtc);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day || check.getUTCHours() !== hour || check.getUTCMinutes() !== minute || check.getUTCSeconds() !== second) {
    return null;
  }
  let offsetMinutes = 0;
  if (tzRaw.toUpperCase() !== "Z") {
    const sign = tzRaw[0] === "-" ? -1 : 1;
    const digits = tzRaw.slice(1).replace(":", "");
    const tzHours = Number(digits.slice(0, 2));
    const tzMinutes = Number(digits.slice(2, 4));
    offsetMinutes = sign * (tzHours * 60 + tzMinutes);
  }
  const ms = fracRaw === "" ? 0 : Math.trunc(Number(`0.${fracRaw.slice(0, 3)}`) * 1e3);
  const epochMs = baseUtc - offsetMinutes * 6e4 + ms;
  return Number.isFinite(epochMs) ? new Date(epochMs) : null;
}
function formatResetCountdown(diffMs) {
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return "";
  }
  if (diffMs < 6e4) {
    return "<1m";
  }
  let totalMinutes = Math.ceil(diffMs / 6e4);
  const days = Math.trunc(totalMinutes / (24 * 60));
  totalMinutes -= days * 24 * 60;
  const hours = Math.trunc(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    return `${days}d ${hours}h ${pad2(minutes)}m`;
  }
  if (hours > 0) {
    return `${hours}h ${pad2(minutes)}m`;
  }
  return `${minutes}m`;
}
function formatAbsoluteResetTime(date, opts = {}) {
  if (Number.isNaN(date.getTime())) return "";
  const formatOpts = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  };
  if (opts.timeZone) {
    formatOpts.timeZone = opts.timeZone;
  }
  const formatter = new Intl.DateTimeFormat(opts.locale || void 0, formatOpts);
  const parts = formatter.formatToParts(date);
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const isTimePart = (type) => type === "hour" || type === "minute" || type === "dayPeriod";
  const firstTimeIdx = parts.findIndex((p) => isTimePart(p.type));
  let lastTimeIdx = -1;
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    if (isTimePart(parts[i].type)) {
      lastTimeIdx = i;
      break;
    }
  }
  const timeStr = firstTimeIdx !== -1 && lastTimeIdx >= firstTimeIdx ? parts.slice(firstTimeIdx, lastTimeIdx + 1).map((p) => p.value).join("").trim() : "";
  let formatted;
  if (day !== "" && month !== "" && year !== "" && timeStr !== "") {
    const dateStr = opts.compact ? `${day}-${month}` : `${day}-${month}-${year}`;
    formatted = `${dateStr} ${timeStr}`;
  } else {
    formatted = formatter.format(date);
  }
  formatted = formatted.replace(/[\u00A0\u202F]/g, " ");
  if (opts.estimated) {
    return opts.compact ? `~${formatted}` : `~${formatted} (estimated)`;
  }
  return formatted;
}
function normalizeQuota(rawQuota, _modelDisplay, now = /* @__PURE__ */ new Date(), timeOpts = {}) {
  if (!rawQuota || typeof rawQuota !== "object" || Array.isArray(rawQuota)) {
    return { hasQuota: false, buckets: [], groups: [] };
  }
  const record = rawQuota;
  const groupMap = /* @__PURE__ */ new Map();
  for (const key of Object.keys(record)) {
    const meta = resolveBucketMeta(key);
    if (!meta) continue;
    const safeId = sanitizePlainText(key, maxBucketIdColumns);
    const rawBucket = record[key];
    if (!rawBucket || typeof rawBucket !== "object" || Array.isArray(rawBucket)) {
      continue;
    }
    const bucket = rawBucket;
    const fraction = bucket.remaining_fraction;
    if (typeof fraction !== "number" || !Number.isFinite(fraction) || fraction < 0 || fraction > 1) {
      continue;
    }
    const remainingPct = Math.round(100 * fraction);
    const usedPct = 100 - remainingPct;
    const absReset = parseTimezoneAwareTimestamp(bucket.reset_time);
    const relSeconds = typeof bucket.reset_in_seconds === "number" && Number.isFinite(bucket.reset_in_seconds) && bucket.reset_in_seconds >= 0 ? bucket.reset_in_seconds : null;
    let resetAt = null;
    let resetEstimated = false;
    let clockSkewDetected = false;
    if (absReset !== null) {
      resetAt = absReset;
      if (relSeconds !== null) {
        const expectedMs = now.getTime() + relSeconds * 1e3;
        if (Math.abs(absReset.getTime() - expectedMs) > clockSkewToleranceSeconds * 1e3) {
          clockSkewDetected = true;
        }
      }
    } else if (relSeconds !== null) {
      resetAt = new Date(now.getTime() + relSeconds * 1e3);
      resetEstimated = true;
    }
    let resetPastDue = false;
    let countdownText = "";
    let absoluteText = "";
    let shortAbsoluteText = "";
    if (resetAt !== null) {
      const diffMs = resetAt.getTime() - now.getTime();
      if (diffMs <= 0) {
        resetPastDue = true;
        absoluteText = "Reset due / awaiting update";
        shortAbsoluteText = "Reset due";
      } else {
        countdownText = formatResetCountdown(diffMs);
        absoluteText = formatAbsoluteResetTime(resetAt, {
          locale: timeOpts.locale,
          timeZone: timeOpts.timeZone,
          compact: false,
          estimated: resetEstimated
        });
        shortAbsoluteText = formatAbsoluteResetTime(resetAt, {
          locale: timeOpts.locale,
          timeZone: timeOpts.timeZone,
          compact: true,
          estimated: resetEstimated
        });
      }
    }
    const normalizedBucket = {
      id: safeId,
      label: meta.label,
      groupId: meta.groupId,
      groupLabel: meta.groupLabel,
      windowLabel: meta.windowLabel,
      remainingPct,
      usedPct,
      resetAt,
      resetEstimated,
      resetPastDue,
      countdownText,
      absoluteText,
      shortAbsoluteText,
      clockSkewDetected
    };
    let group = groupMap.get(meta.groupId);
    if (!group) {
      group = {
        groupId: meta.groupId,
        groupLabel: meta.groupLabel,
        windows: []
      };
      groupMap.set(meta.groupId, group);
    }
    group.windows.push(normalizedBucket);
  }
  const orderedGroups = [];
  for (const id of knownGroupOrder) {
    const group = groupMap.get(id);
    if (group) {
      group.windows.sort((a, b) => windowSortRank(a.windowLabel) - windowSortRank(b.windowLabel));
      orderedGroups.push(group);
      groupMap.delete(id);
    }
  }
  for (const group of groupMap.values()) {
    group.windows.sort((a, b) => windowSortRank(a.windowLabel) - windowSortRank(b.windowLabel));
    orderedGroups.push(group);
  }
  const buckets = orderedGroups.flatMap((g) => g.windows);
  return {
    hasQuota: buckets.length > 0,
    buckets,
    groups: orderedGroups
  };
}
function pad2(n) {
  return n < 10 ? `0${Math.trunc(n)}` : `${Math.trunc(n)}`;
}

// src/statusline.ts
var colorReset = "\x1B[0m";
var colorBlue = "\x1B[34m";
var colorGreen = "\x1B[32m";
var colorYellow = "\x1B[33m";
var colorCyan = "\x1B[36m";
var colorMagenta = "\x1B[35m";
var colorRed = "\x1B[31m";
var colorOrange = "\x1B[38;5;208m";
var colorMuted = "\x1B[90m";
var titleColumns = 24;
var modelMaxColumns = 18;
var cwdMaxColumns = 32;
var branchMaxColumns = 40;
var stateMaxColumns = 20;
function shortModelName(display) {
  let short = sanitizePlainText(display, 64);
  short = short.split("Gemini").join("");
  short = short.split("Claude").join("");
  short = short.split("Thinking").join("");
  short = short.split("(").join("");
  short = short.split(")").join("");
  short = short.split("Medium").join("Med");
  short = short.trim().split(/\s+/).filter(Boolean).join(" ");
  if (visibleLen(short) > modelMaxColumns) {
    short = `${truncateColumns(short, modelMaxColumns - 3)}...`;
  }
  return short;
}
function formatCost(usd) {
  if (!Number.isFinite(usd) || usd <= 0) {
    return "$0.00";
  }
  if (usd >= 0.01) {
    return `$${usd.toFixed(2)}`;
  }
  if (usd >= 1e-3) {
    return `$${usd.toFixed(3)}`;
  }
  return "<$0.001";
}
function baseName(rawPath) {
  if (typeof rawPath !== "string") return "";
  const parts = rawPath.split(/[/\\]+/).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : "";
}
function renderTitle(raw, config) {
  if (!config.showTitle) return "";
  const clipped = sanitizePlainText(raw, titleColumns);
  if (clipped === "") return "";
  return colorize(clipped, colorMuted, config.color);
}
function renderCost(cost, config) {
  const usd = cost?.total_usd;
  if (!config.showCost || typeof usd !== "number" || !Number.isFinite(usd) || usd < 0) return "";
  return colorize(`${cost?.estimated === true ? "~" : ""}${formatCost(usd)}`, colorCyan, config.color);
}
function render(payload, opts) {
  const config = opts.config;
  const width = typeof payload.terminal_width === "number" && Number.isFinite(payload.terminal_width) && payload.terminal_width > 0 ? Math.trunc(payload.terminal_width) : 80;
  const rawModel = payload.model?.display_name || payload.model?.id || "Gemini";
  const modelDisplay = sanitizePlainText(rawModel, 64) || "Gemini";
  const modelSegment = renderModelSegment(shortModelName(modelDisplay), typeof payload.plan_tier === "string" ? payload.plan_tier : "", config) + renderMode(payload.cycle_mode, config);
  const ctxPct = contextPercent(payload.context_window);
  const stateLabel = state(sanitizePlainText(payload.agent_state ?? "", stateMaxColumns));
  const branch = config.showGitBranch ? sanitizePlainText(opts.gitBranch ?? payload.vcs?.branch ?? "", branchMaxColumns) : "";
  const now = opts.now ?? /* @__PURE__ */ new Date();
  const quota = normalizeQuota(payload.quota, modelDisplay, now, {
    locale: config.locale,
    timeZone: config.timeZone
  });
  if (config.multiline) {
    return renderMultiline(payload, config, width, modelSegment, ctxPct, quota, branch, stateLabel);
  }
  return renderSingleLine(payload, config, width, modelSegment, ctxPct, quota, branch, stateLabel);
}
function renderHeaderLine(payload, config, width, modelSegment, branch, stateLabel) {
  const dirName = config.showCWD ? sanitizePlainText(baseName(payload.cwd), cwdMaxColumns) : "";
  const line1Parts = [colorize(modelSegment, colorBlue, config.color)];
  if (dirName !== "") {
    line1Parts.push(colorize(`${withIcon(config, "\uF07C ", "")}${dirName}`, colorYellow, config.color));
  }
  if (branch !== "") {
    line1Parts.push(colorize(renderGitSegment(branch, config), colorMagenta, config.color));
  }
  const stateText = config.showAgentState ? colorize(stateLabel, stateColor(stateLabel), config.color) : "";
  const titleText = renderTitle(payload.conversation_title, config);
  const costText = renderCost(payload.cost, config);
  let line1 = joinHeader(...line1Parts, titleText, stateText, costText);
  if (visibleLen(line1) > width) {
    line1 = joinHeader(...line1Parts, stateText, costText);
  }
  if (visibleLen(line1) > width) {
    line1 = joinHeader(...line1Parts, stateText);
  }
  if (visibleLen(line1) > width) {
    const git = branch !== "" ? colorize(renderGitSegment(branch, config), colorMagenta, config.color) : "";
    line1 = joinHeader(colorize(modelSegment, colorBlue, config.color), git, stateText);
  }
  if (visibleLen(line1) > width) {
    line1 = joinHeader(colorize(modelSegment, colorBlue, config.color), stateText);
  }
  if (visibleLen(line1) > width) {
    line1 = colorize(modelSegment, colorBlue, config.color);
  }
  return fit(line1, width);
}
function renderMultiline(payload, config, width, modelSegment, ctxPct, quota, branch, stateLabel) {
  const line1 = renderHeaderLine(payload, config, width, modelSegment, branch, stateLabel);
  if (quota.groups.length > 1 || quota.buckets.length > 1) {
    const ctxLine = fitContextLine(payload.context_window, config, ctxPct, width);
    const groupLabelWidth = Math.min(14, Math.max(...quota.groups.map((g) => visibleLen(g.groupLabel))));
    const quotaLines = renderUniformQuotaGroupLines(quota.groups, config, width, groupLabelWidth);
    return [line1, ctxLine, ...quotaLines].join("\n");
  }
  const line2 = fitSingleQuotaLine2(payload.context_window, config, ctxPct, quota, width);
  return `${line1}
${line2}`;
}
function fitContextLine(ctxWindow, config, ctxPct, width) {
  const candidates = [
    `Context ${config.showProgressBar ? `${progressBar(ctxPct, 10, config.color)} ` : ""}${contextValue(config, ctxWindow, ctxPct)}`,
    `Context ${contextValue(config, ctxWindow, ctxPct)}`,
    `Ctx ${formatInt(ctxPct)}%`,
    `${formatInt(ctxPct)}%`
  ];
  for (const candidate of candidates) {
    if (visibleLen(candidate) <= width) return candidate;
  }
  return fit(`${formatInt(ctxPct)}%`, width);
}
function fitSingleQuotaLine2(ctxWindow, config, ctxPct, quota, width) {
  const ctxFull = `Context ${config.showProgressBar ? `${progressBar(ctxPct, 10, config.color)} ` : ""}${contextValue(config, ctxWindow, ctxPct)}`;
  const ctxNoBar = `Context ${contextValue(config, ctxWindow, ctxPct)}`;
  const ctxPctOnly = `Context ${formatInt(ctxPct)}%`;
  const ctxTiny = `Ctx ${formatInt(ctxPct)}%`;
  if (!quota.hasQuota || quota.buckets.length === 0) {
    const naText = colorize("Quota N/A", colorMuted, config.color);
    const candidates2 = [
      joinHeader(ctxFull, naText),
      joinHeader(ctxNoBar, naText),
      joinHeader(ctxPctOnly, naText),
      join(ctxTiny, "Quota N/A"),
      join(ctxTiny, "Q N/A"),
      `${formatInt(ctxPct)}%`
    ];
    for (const c of candidates2) {
      if (visibleLen(c) <= width) return c;
    }
    return fit(`${formatInt(ctxPct)}%`, width);
  }
  const bucket = quota.buckets[0];
  const qFull = formatSingleBucket(bucket, config, { dateMode: "full", prefix: "Quota: " });
  const qShortDate = formatSingleBucket(bucket, config, { dateMode: "short", prefix: "Quota: " });
  const qCountdownOnly = formatSingleBucket(bucket, config, { dateMode: "none", prefix: "Quota: " });
  const qPctOnly = `Quota: ${bucket.label}: ${quotaAmountText(bucket, config)}`;
  const qCompact = `${bucket.label}: ${quotaAmountText(bucket, config)}`;
  const qTiny = `${bucket.label}: ${quotaCompactPct(bucket, config)}`;
  const candidates = [
    joinHeader(ctxFull, qFull),
    joinHeader(ctxNoBar, qFull),
    joinHeader(ctxPctOnly, qFull),
    joinHeader(ctxPctOnly, qShortDate),
    joinHeader(ctxPctOnly, qCountdownOnly),
    joinHeader(ctxTiny, qCountdownOnly),
    join(ctxTiny, qPctOnly),
    join(ctxTiny, qCompact),
    join(ctxTiny, qTiny),
    `${formatInt(ctxPct)}%`
  ];
  for (const c of candidates) {
    if (visibleLen(c) <= width) return c;
  }
  return fit(`${formatInt(ctxPct)}%`, width);
}
function formatGroupWindow(win, config, opts) {
  const labelPart = win.windowLabel !== "" ? `${win.windowLabel}: ` : "";
  const pctPart = config.usageValue === "percent" ? `${formatInt(win.usedPct)}%${opts.includeLeftWord ? " used" : ""}` : `${formatInt(win.remainingPct)}%${opts.includeLeftWord ? " left" : ""}`;
  let resetPart = "";
  if (opts.dateMode !== "omit") {
    if (win.resetPastDue) {
      resetPart = opts.pastDueShort ? " (Reset due)" : " (Reset due / awaiting update)";
    } else if (win.resetAt !== null) {
      if (opts.dateMode === "full") {
        resetPart = ` (${win.countdownText}, ${win.absoluteText})`;
      } else if (opts.dateMode === "short") {
        resetPart = ` (${win.countdownText}, ${win.shortAbsoluteText})`;
      } else {
        resetPart = ` (${win.countdownText})`;
      }
    }
  }
  return `${labelPart}${pctPart}${resetPart}`;
}
var groupTiers = [
  {
    padded: true,
    sep: " \u2502 ",
    opts: { includeLeftWord: true, dateMode: "full", pastDueShort: false }
  },
  {
    padded: true,
    sep: " \u2502 ",
    opts: { includeLeftWord: true, dateMode: "short", pastDueShort: false }
  },
  {
    padded: true,
    sep: " \u2502 ",
    opts: { includeLeftWord: false, dateMode: "short", pastDueShort: true }
  },
  {
    padded: true,
    sep: " \u2502 ",
    opts: { includeLeftWord: true, dateMode: "none", pastDueShort: true }
  },
  {
    padded: false,
    sep: " | ",
    opts: { includeLeftWord: true, dateMode: "none", pastDueShort: true }
  },
  {
    padded: false,
    sep: " | ",
    opts: { includeLeftWord: false, dateMode: "none", pastDueShort: true }
  },
  {
    padded: false,
    sep: " | ",
    opts: { includeLeftWord: false, dateMode: "omit", pastDueShort: true }
  }
];
function renderGroupLinesAtTier(groups, config, groupLabelWidth, tier) {
  if (tier.padded) {
    const has5h = groups.some((g) => g.windows.some((w) => w.windowLabel === "5h"));
    const hasSecondary = groups.some((g) => g.windows.some((w) => w.windowLabel !== "5h"));
    if (has5h && hasSecondary) {
      const rows = groups.map((group) => {
        const win5h = group.windows.find((w) => w.windowLabel === "5h");
        const otherWins = group.windows.filter((w) => w.windowLabel !== "5h");
        return {
          group,
          col5hText: win5h ? formatGroupWindow(win5h, config, tier.opts) : "",
          otherTexts: otherWins.map((w) => formatGroupWindow(w, config, tier.opts))
        };
      });
      const col5hWidth = Math.max(0, ...rows.map((r) => visibleLen(r.col5hText)));
      if (col5hWidth > 0) {
        return rows.map((row) => {
          const header = ` ${padRightColumns(row.group.groupLabel, groupLabelWidth)} \u2502 `;
          const col5hCell = padRightColumns(row.col5hText, col5hWidth);
          return `${header}${col5hCell}${row.otherTexts.length > 0 ? tier.sep + row.otherTexts.join(tier.sep) : ""}`;
        });
      }
    }
  }
  return groups.map((group) => {
    const header = tier.padded ? ` ${padRightColumns(group.groupLabel, groupLabelWidth)} \u2502 ` : `${group.groupLabel}: `;
    const body = group.windows.map((win) => formatGroupWindow(win, config, tier.opts)).join(tier.sep);
    return `${header}${body}`;
  });
}
function renderUniformQuotaGroupLines(groups, config, width, groupLabelWidth) {
  for (const tier of groupTiers) {
    const rendered = renderGroupLinesAtTier(groups, config, groupLabelWidth, tier);
    if (rendered.every((line) => visibleLen(line) <= width)) {
      return rendered;
    }
  }
  const fallbackTier = groupTiers[groupTiers.length - 1];
  return renderGroupLinesAtTier(groups, config, groupLabelWidth, fallbackTier).map((line) => fit(line, width));
}
function renderSingleLine(payload, config, width, modelSegment, ctxPct, quota, branch, stateLabel) {
  const coloredBadge = colorize(modelSegment, colorBlue, config.color);
  const ctx = `Ctx ${contextValue(config, payload.context_window, ctxPct)}`;
  const ctxSimple = `Ctx ${formatInt(ctxPct)}%`;
  const tokens = config.contextValue === "percent" ? colorize(tokenDetail(payload.context_window), colorMuted, config.color) : "";
  const bar = config.showProgressBar ? progressBar(ctxPct, 10, config.color) : "";
  const branchText = branch !== "" ? colorize(renderGitSegment(branch, config), colorMagenta, config.color) : "";
  const stateText = config.showAgentState ? colorize(stateLabel, stateColor(stateLabel), config.color) : "";
  const costText = renderCost(payload.cost, config);
  const titleText = renderTitle(payload.conversation_title, config);
  const qFull = singleLineQuotaText(quota, config, "full");
  const qShort = singleLineQuotaText(quota, config, "short");
  const qCountdown = singleLineQuotaText(quota, config, "none");
  const qCompact = singleLineQuotaText(quota, config, "pct-only");
  const levels = [
    [coloredBadge, ctx, tokens, bar, qFull, branchText, titleText, stateText, costText],
    [coloredBadge, ctx, tokens, bar, qFull, titleText, stateText, costText],
    [coloredBadge, ctx, tokens, bar, qFull, stateText, costText],
    [coloredBadge, ctx, bar, qFull, stateText],
    [coloredBadge, ctx, qFull, stateText],
    [coloredBadge, ctxSimple, qShort, stateText],
    [coloredBadge, ctxSimple, qCountdown, stateText],
    [coloredBadge, ctxSimple, qCompact, stateText],
    [coloredBadge, ctxSimple, stateText],
    [ctxSimple, qCompact, stateText],
    [ctxSimple, stateText],
    [`${formatInt(ctxPct)}%`, stateLabel]
  ];
  for (const parts of levels) {
    const line = join(...parts);
    if (visibleLen(line) <= width) {
      return line;
    }
  }
  return fit(`${formatInt(ctxPct)}% ${stateLabel}`, width);
}
function singleLineQuotaText(quota, config, mode) {
  if (!quota.hasQuota || quota.buckets.length === 0) {
    return colorize(mode === "pct-only" ? "Q N/A" : "Quota N/A", colorMuted, config.color);
  }
  if (quota.groups.length === 1 && quota.buckets.length === 1) {
    const b = quota.buckets[0];
    if (mode === "pct-only") return `Quota: ${b.label}: ${quotaAmountText(b, config)}`;
    return formatSingleBucket(b, config, { dateMode: mode, prefix: "Quota: " });
  }
  if (mode === "pct-only") {
    return `Quota ${quota.groups.map(
      (g) => `${g.groupLabel}: ${g.windows.map((w) => `${w.windowLabel ? `${w.windowLabel}: ` : ""}${quotaCompactPct(w, config)}`).join(" / ")}`
    ).join(" | ")}`;
  }
  return `Quota ${quota.groups.map((g) => {
    const windows = g.windows.map(
      (w) => formatGroupWindow(w, config, {
        includeLeftWord: true,
        dateMode: mode,
        pastDueShort: true
      })
    ).join(" / ");
    return `${g.groupLabel}: ${windows}`;
  }).join(" | ")}`;
}
function formatSingleBucket(bucket, config, opts) {
  const amount = quotaAmountText(bucket, config);
  const reset = formatBucketResetPart(bucket, opts.dateMode);
  return `${opts.prefix}${bucket.label}: ${amount}${reset ? ` (${reset})` : ""}`;
}
function formatBucketResetPart(bucket, dateMode) {
  if (bucket.resetPastDue) {
    return dateMode === "short" ? "Reset due" : bucket.absoluteText;
  }
  if (bucket.resetAt === null) {
    return "";
  }
  if (dateMode === "full") {
    return `${bucket.countdownText}, ${bucket.absoluteText}`;
  }
  if (dateMode === "short") {
    return `${bucket.countdownText}, ${bucket.shortAbsoluteText}`;
  }
  return bucket.countdownText;
}
function quotaAmountText(bucket, config) {
  if (config.usageValue === "percent") {
    return `${formatInt(bucket.usedPct)}% used`;
  }
  return `${formatInt(bucket.remainingPct)}% left`;
}
function quotaCompactPct(bucket, config) {
  if (config.usageValue === "percent") {
    return `${formatInt(bucket.usedPct)}% used`;
  }
  return `${formatInt(bucket.remainingPct)}%`;
}
function renderModelSegment(shortModel, rawPlan, config) {
  const trimmed = rawPlan.trim();
  const knownTier = trimmed.match(/^(?:Google AI\s+)?(Pro|Ultra|Free)$/i);
  const plan = knownTier ? title(knownTier[1]) : "Plan ?";
  if (config.showModel && shortModel !== "") {
    return `${withIcon(config, "\uEE9C ", "")}${shortModel} | ${renderPlan(plan, config)}`;
  }
  if (plan === "Pro") {
    return `${withIcon(config, "\uEE9C ", "")}${renderPlan(plan, config)} Tier`;
  }
  return `${withIcon(config, "\uEE9C ", "")}${plan}`;
}
var modeLabels = /* @__PURE__ */ new Map([
  ["plan", ["Plan", colorCyan]],
  ["accept-edits", ["Accept Edits", colorYellow]],
  ["auto", ["Auto", colorOrange]]
]);
function renderMode(raw, config) {
  if (!config.showMode || typeof raw !== "string") return "";
  const mode = raw.toLowerCase();
  if (mode === "" || mode === "default") return "";
  const known = modeLabels.get(mode);
  if (known) return ` | ${colorize(known[0], known[1], config.color)}`;
  if (!/^[a-z][a-z0-9-]{0,23}$/.test(mode)) return "";
  const label = mode.split("-").filter(Boolean).map(title).join(" ");
  return ` | ${colorize(label, colorYellow, config.color)}`;
}
function renderPlan(plan, config) {
  if (plan === "Pro") {
    return `${withIcon(config, "\uF0A3 ", "")}Pro`;
  }
  return plan;
}
function renderGitSegment(branch, config) {
  return `${withIcon(config, "\uE725 ", "")}${branch}`;
}
function withIcon(config, icon, fallback) {
  return config.showIcons ? icon : fallback;
}
function contextValue(config, ctx, pct) {
  const tokens = tokenDetail(ctx);
  switch (config.contextValue) {
    case "tokens":
      if (tokens !== "") {
        return tokens.replace(/^\(/, "").replace(/\)$/, "");
      }
      break;
    case "both":
      if (tokens !== "") {
        return `${formatInt(pct)}% ${tokens}`;
      }
      break;
  }
  return `${formatInt(pct)}%`;
}
function contextPercent(ctx) {
  const inputTokens = ctx?.total_input_tokens ?? 0;
  const windowSize = ctx?.context_window_size ?? 0;
  if (Number.isFinite(inputTokens) && Number.isFinite(windowSize) && inputTokens > 0 && windowSize > 0) {
    return clampInt(Math.trunc(inputTokens / windowSize * 100 + 0.5));
  }
  const upstream = ctx?.used_percentage ?? 0;
  if (!Number.isFinite(upstream)) {
    return 0;
  }
  return clampInt(Math.trunc(upstream + 0.5));
}
function tokenDetail(ctx) {
  const total = ctx?.total_input_tokens;
  const windowSize = ctx?.context_window_size ?? 0;
  if (typeof total !== "number" || !Number.isFinite(total) || total <= 0 || !Number.isFinite(windowSize) || windowSize <= 0) {
    return "";
  }
  return `(${formatTokens(total)}/${formatTokens(windowSize)})`;
}
function formatTokens(n) {
  if (n >= 1e6) {
    if (n % 1e6 === 0) {
      return `${formatInt(n / 1e6)}M`;
    }
    return `${Number((n / 1e6).toFixed(1))}M`;
  }
  if (n >= 1e3) {
    return `${formatInt((n + 500) / 1e3)}k`;
  }
  return formatInt(n);
}
function progressBar(pct, width, color) {
  return progressBarWithColor(pct, pct, width, color);
}
function progressBarWithColor(fillPct, colorPct, width, color) {
  fillPct = clampInt(fillPct);
  colorPct = clampInt(colorPct);
  let filled = Math.trunc(fillPct / 100 * width + 0.5);
  if (filled < 0) filled = 0;
  if (filled > width) filled = width;
  const bar = `${"\u2588".repeat(filled)}${"\u2591".repeat(width - filled)}`;
  if (!color) {
    return bar;
  }
  return colorize(bar, percentageColor(colorPct), true);
}
function percentageColor(pct) {
  if (pct >= 90) return colorRed;
  if (pct >= 75) return colorOrange;
  if (pct >= 50) return colorYellow;
  return colorGreen;
}
function state(raw) {
  switch (raw.toLowerCase()) {
    case "":
    case "idle":
      return "Idle";
    case "thinking":
      return "Thinking";
    case "authenticating":
      return "Auth";
    default:
      return title(raw);
  }
}
function stateColor(label) {
  switch (label) {
    case "Idle":
      return colorGreen;
    case "Thinking":
      return colorYellow;
    case "Auth":
      return colorCyan;
    default:
      return colorCyan;
  }
}
function colorize(input, colorCode, enabled) {
  if (!enabled || input === "") {
    return input;
  }
  return `${colorCode}${input}${colorReset}`;
}
function join(...parts) {
  return parts.filter((part) => part !== "").join("  ");
}
function joinHeader(...parts) {
  return parts.filter((part) => part !== "").join(" \u2502 ");
}
function fit(input, width) {
  if (width <= 0 || visibleLen(input) <= width) {
    return input;
  }
  return truncateColumns(input, width);
}
function padRightColumns(input, targetCols) {
  const len = visibleLen(input);
  if (len >= targetCols) return input;
  return `${input}${" ".repeat(targetCols - len)}`;
}
function clampInt(n) {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}
function formatInt(n) {
  return Math.trunc(n).toString(10);
}
function title(raw) {
  const fields = raw.trim().split(/\s+/).filter(Boolean);
  for (let i = 0; i < fields.length; i++) {
    const runes = Array.from(fields[i].toLowerCase());
    if (runes.length > 0 && runes[0] >= "a" && runes[0] <= "z") {
      runes[0] = runes[0].toUpperCase();
    }
    fields[i] = runes.join("");
  }
  if (fields.length === 0) {
    return "Active";
  }
  return fields.join(" ");
}

// src/main.ts
var version = "0.2.0-passive";
var maxStdinBytes = 1024 * 1024;
var stdinTimeoutMs = 1e3;
var utf8Fatal = new TextDecoder("utf-8", { fatal: true });
function parsePayloadObject(input) {
  if (input.trim() === "") return null;
  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  return parsed;
}
function renderStatusline(input, cfg = defaultConfig(), now = /* @__PURE__ */ new Date()) {
  if (Buffer.byteLength(input, "utf8") > maxStdinBytes) {
    return "agy-hud";
  }
  const payload = parsePayloadObject(input);
  if (payload === null) {
    return "agy-hud";
  }
  try {
    return render(payload, {
      config: cfg,
      now
    });
  } catch {
    return "agy-hud";
  }
}
function usage(write) {
  write("usage: agy-hud [statusline [flags]|doctor [--json]|version]\n");
}
function isCompleteJsonObjectBytes(buf) {
  let decoded;
  try {
    decoded = utf8Fatal.decode(buf);
  } catch {
    return { complete: false, text: "" };
  }
  const text = decoded.trim();
  if (!text.startsWith("{") || !text.endsWith("}")) {
    return { complete: false, text: "" };
  }
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return { complete: true, text };
    }
    return { complete: true, text: "" };
  } catch {
    return { complete: false, text: "" };
  }
}
function readStdinBounded(stdin, timeoutMs, maxBytes = maxStdinBytes) {
  return new Promise((resolve) => {
    const chunks = [];
    let totalBytes = 0;
    let settled = false;
    const cleanup = () => {
      clearTimeout(timer);
      stdin.removeListener("data", onData);
      stdin.removeListener("end", onEnd);
      stdin.removeListener("error", onError);
      stdin.on("error", () => {
      });
      stdin.pause();
      stdin.destroy?.();
    };
    const settle = (result) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };
    const decodeFinal = (timeout) => {
      if (totalBytes === 0) {
        return { ok: false, text: "", reason: timeout ? "timeout" : "empty" };
      }
      const combined = Buffer.concat(chunks);
      let text;
      try {
        text = utf8Fatal.decode(combined);
      } catch {
        return { ok: false, text: "", reason: "invalid_utf8" };
      }
      if (text.trim() === "") {
        return { ok: false, text: "", reason: timeout ? "timeout" : "empty" };
      }
      return { ok: true, text };
    };
    const onData = (chunk) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, "utf8");
      totalBytes += buf.length;
      if (totalBytes > maxBytes) {
        settle({ ok: false, text: "", reason: "too_large" });
        return;
      }
      chunks.push(buf);
      const probe = isCompleteJsonObjectBytes(Buffer.concat(chunks));
      if (probe.complete) {
        settle(probe.text !== "" ? { ok: true, text: probe.text } : { ok: false, text: "", reason: "empty" });
      }
    };
    const onEnd = () => settle(decodeFinal(false));
    const onError = () => settle(decodeFinal(false));
    const timer = setTimeout(() => settle(decodeFinal(true)), timeoutMs);
    stdin.on("data", onData);
    stdin.on("end", onEnd);
    stdin.on("error", onError);
  });
}
async function runCli(args, deps = {}) {
  const stdout = deps.stdout ?? ((chunk) => {
    process.stdout.write(chunk);
  });
  const stderr = deps.stderr ?? ((chunk) => {
    process.stderr.write(chunk);
  });
  const first = args[0] ?? "statusline";
  if (first === "version" || first === "--version" || first === "-v") {
    stdout(`${version}
`);
    return 0;
  }
  if (first === "help" || first === "--help" || first === "-h") {
    usage(stderr);
    return 0;
  }
  if (first === "doctor") {
    const rest = args.slice(1);
    const json = rest.length === 1 && rest[0] === "--json";
    if (rest.length > 0 && !json) {
      usage(stderr);
      return 2;
    }
    const report = collectPassiveDoctorReport(version);
    stdout(json ? `${JSON.stringify(report, null, 2)}
` : formatPassiveDoctorReport(report));
    return 0;
  }
  if (first === "statusline" || first.startsWith("--")) {
    const flagArgs = first === "statusline" ? args.slice(1) : args;
    const parsedFlags = parseCliConfig(flagArgs);
    if (parsedFlags.error) {
      stderr(`agy-hud: ${parsedFlags.error}
`);
      return 2;
    }
    const timeout = deps.stdinTimeoutMs ?? parsedFlags.config.stdinTimeoutMs ?? stdinTimeoutMs;
    const maxBytes = deps.maxStdinBytes ?? maxStdinBytes;
    if (process.env.AGY_HUD_NESTED === "1") {
      await readStdinBounded(deps.stdin ?? process.stdin, timeout, maxBytes);
      return 0;
    }
    const input = await readStdinBounded(deps.stdin ?? process.stdin, timeout, maxBytes);
    if (!input.ok) {
      stdout("agy-hud\n");
      return 0;
    }
    stdout(`${renderStatusline(input.text, parsedFlags.config, deps.now ?? /* @__PURE__ */ new Date())}
`);
    return 0;
  }
  usage(stderr);
  return 2;
}
if (require.main === module) {
  runCli(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  maxStdinBytes,
  parsePayloadObject,
  readStdinBounded,
  renderStatusline,
  runCli,
  stdinTimeoutMs,
  version
});
