"use strict"

class AbstractNodeJsNode {
  _getNow() {
    return parseFloat(process.hrtime().join(""))
  }
}

module.exports = AbstractNodeJsNode
