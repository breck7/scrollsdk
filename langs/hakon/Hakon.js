const jtree = require("../../index.js")

module.exports = {
  Program: jtree.getProgramConstructor(__dirname + "/hakon.grammar"),
  Nodes: require("./HakonLang.js")
}
