const jtree = require("../../index.js")

module.exports = {
  Program: jtree.getProgramConstructor(__dirname + "/numbers.grammar")
}
