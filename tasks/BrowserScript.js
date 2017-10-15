class BrowserScript {
  constructor(fileStr) {
    this._str = fileStr
  }

  addUseStrict() {
    this._str = `"use strict";\n` + this._str
    return this
  }

  removeRequires() {
    this._str = this._str.replace(/(\n|^)const .* \= require\(.*/g, "$1")
    return this
  }

  changeNodeExportsToWindowExports() {
    this._str = this._str.replace(/\nmodule\.exports \= (.*)/g, "\nwindow.$1 = $1")
    return this
  }

  getString() {
    return this._str
  }
}

module.exports = BrowserScript
