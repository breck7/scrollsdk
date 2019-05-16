const jtree = require("../../index.js")

module.exports = {
  Program: jtree.getProgramConstructor(__dirname + "/stump.grammar"),
  Nodes: require("./StumpNodes.js"),
  Constants: require("./StumpConstants.js")
}
