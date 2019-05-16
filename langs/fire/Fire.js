const jtree = require("../../index.js")

module.exports = {
  Program: jtree.getProgramConstructor(__dirname + "/fire.grammar"),
  Constants: require("./FireConstants.js"),
  Nodes: require("./FireNodes.js")
}
