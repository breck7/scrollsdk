#! /usr/local/bin/node --use_strict

const quack = require("./quack.js")

const ConsoleApp = require("../consoleApp.js")

quack.quickTest("basics", equal => {
  // Arrange
  const app = new ConsoleApp()

  // Act/Assert
  equal(app.getGrammars().length > 0, true)
  equal(app.getHelp().length > 0, true)
  equal(!!app.getHistory(), true)
  equal(!!app.getHistory("grammar"), true)

  app.check(__dirname + "/../TreeGrammar.grammar")
  app.list()
  app.version()
  equal(!!app.getUsage("grammar"), true)
})
