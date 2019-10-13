const { jtree } = require("../index.js")
// This is a temporary class until we move off TypeScript
class TypeScriptRewriter {
  constructor(fileStr) {
    this._str = fileStr
  }
  addUseStrict() {
    this._str = `"use strict";\n` + this._str
    return this
  }
  removeRequireTrees() {
    this._str = this._str.replace(/(\n|^)const .* \= requireTree\(.*/g, "$1")
    return this
  }
  removeTsGeneratedCrap() {
    this._str = this._str.replace(`Object.defineProperty(exports, "__esModule", { value: true })`, "")
    return this
  }
  removeRequires() {
    this._str = this._str.replace(/(\n|^)const .* \= require\(.*/g, "$1")
    return this
  }
  _removeAllLinesStartingWith(prefix) {
    this._str = this._str
      .split("\n")
      .filter(line => !line.startsWith(prefix))
      .join("\n")
    return this
  }
  removeNodeJsOnlyLines() {
    return this._removeAllLinesStartingWith("/*NODE_JS_ONLY*/")
  }
  removeHashBang() {
    this._str = this._str.replace(/^\#\![^\n]+\n/, "")
    return this
  }
  removeUseStrict() {
    const strict = `"use strict";\n`
    this._str = this._str.replace(strict, "")
    return this
  }
  addUseStrictIfNotPresent() {
    const str = `"use strict"`
    this._str = this._str.startsWith(str) ? this._str : str + ";\n" + this._str
    return this
  }
  removeNodeJsOnly() {
    this._str = this._str.replace(/\/\*NODE_JS_ONLY\*\/[^\n]+\n/g, "\n")
    return this
  }
  removeImports() {
    // todo: what if this spans multiple lines?
    this._str = this._str.replace(/(\n|^)import .* from .*/g, "$1")
    this._str = this._str.replace(/(\n|^)\/\*FOR_TYPES_ONLY\*\/ import .* from .*/g, "$1")
    this._str = this._str.replace(/(\n|^)import {[^\}]+} ?from ?"[^\"]+"/g, "$1")
    return this
  }
  removeExports() {
    this._str = this._str.replace(/(\n|^)export default .*/g, "$1")
    this._str = this._str.replace(/(\n|^)export {[^\}]+}/g, "$1")
    return this
  }
  changeDefaultExportsToWindowExports() {
    this._str = this._str.replace(/\nexport default ([^;]*)/g, "\nwindow.$1 = $1")
    // todo: should we just switch to some bundler?
    const matches = this._str.match(/\nexport { [^\}]+ }/g)
    if (matches)
      this._str = this._str.replace(
        /\nexport { ([^\}]+) }/g,
        matches[0]
          .replace("export {", "")
          .replace("}", "")
          .trim()
          .split(/ /g)
          .map(name => name.replace(",", "").trim())
          .map(mod => `\nwindow.${mod} = ${mod}`)
          .join("\n")
      )
    return this
  }
  static treeToJs(filepath, file) {
    const TreeUtils = jtree.Utils
    const filename = TreeUtils.getFileName(filepath)
    const baseName = TreeUtils.removeFileExtension(filename)
    const extension = TreeUtils.getFileExtension(filename)
    const varName = baseName + extension.charAt(0).toUpperCase() + extension.substr(1)
    const basePath = TreeUtils.getPathWithoutFileName(filepath)
    // const newPath = basePath + "/" + varName + ".compiled.js"
    const lines = file.split(/\n/)
    const jsCode = `"use strict";
window.${varName} = \`${TreeUtils.escapeBackTicks(lines.join("\n"))}\``
    return jsCode
  }
  changeNodeExportsToWindowExports() {
    // todo: should we just switch to some bundler?
    const reg = /\nmodule\.exports = { ?([^\}]+) ?}/
    const matches = this._str.match(reg)
    if (matches) {
      this._str = this._str.replace(
        reg,
        matches[1]
          .split(/,/g)
          .map(mod => mod.replace(/\s/g, ""))
          .map(mod => `\nwindow.${mod} = ${mod}`)
          .join("\n")
      )
    }
    this._str = this._str.replace(/\nmodule\.exports \= ([^;^{]*)/g, "\nwindow.$1 = $1")
    this._str = this._str.replace(/\nexports\.default \= ([^;]*)/g, "\nwindow.$1 = $1")
    return this
  }
  getString() {
    return this._str
  }
}

module.exports = { TypeScriptRewriter }
