const jtree = require("../../index.js")

module.exports = {
  Program: jtree.getProgramConstructor(__dirname + "/project.grammar"),
  Nodes: require("./ProjectLang.js")
}
