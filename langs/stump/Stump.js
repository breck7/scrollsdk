const jtree = require("../../index.js")

const Nodes = require("./StumpNodes.js")

module.exports = {
  Program: jtree.getProgramConstructor(__dirname + "/stump.grammar"),
  Nodes: Nodes,
  Constants: Nodes.Constants
}
