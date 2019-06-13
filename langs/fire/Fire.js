const jtree = require("../../index.js")

module.exports = {
  Program: jtree.getProgramConstructor(__dirname + "/fire.grammar"),
  Constants: require("./FireLang.js").FireConstants,
  Nodes: require("./FireLang.js")
}
