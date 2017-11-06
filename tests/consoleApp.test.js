#! /usr/local/bin/node --use_strict

const quack = require("./quack.js")

const ConsoleApp = require("../consoleApp.js")

quack.quickTest("basics", equal => {
  // Arrange
  const app = new ConsoleApp()

  // Act/Assert
  equal(app.getGrammars().length > 0, true)
})
