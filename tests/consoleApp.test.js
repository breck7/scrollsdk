#! /usr/local/bin/node --use_strict

const quack = require("./quack.js")

const ConsoleApp = require("../consoleApp.js")

quack.quickTest("basics", equal => {
  // Arrange
  const app = new ConsoleApp()

  // Act/Assert
  equal(typeof app.getGrammars().toString(), "string")
  equal(typeof app.help(), "string")
  equal(typeof app.history(), "string")
  equal(typeof app.history("grammar"), "string")
  equal(typeof app.list(), "string")
  equal(typeof app.version(), "string")
  equal(typeof app.usage("grammar"), "string")

  app.check(__dirname + "/../TreeGrammar.grammar")
})
