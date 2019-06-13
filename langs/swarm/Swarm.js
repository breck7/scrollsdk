const jtree = require("../../index.js")

module.exports = {
  Program: jtree.getProgramConstructor(__dirname + "/swarm.grammar"),
  Constants: require("./SwarmLang.js").SwarmConstants
}
