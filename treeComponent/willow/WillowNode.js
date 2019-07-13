const { AbstractWillowProgram } = require("./Willow.js")

class WillowProgram extends AbstractWillowProgram {
  constructor(baseUrl) {
    super(baseUrl)
    this._offlineMode = true
  }
}

module.exports = { WillowProgram }
