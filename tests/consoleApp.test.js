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
  equal(typeof app.list(), "string", "list works")
  equal(typeof app.version(), "string", "version ok")
  equal(typeof app.usage("grammar"), "string", "usage")

  // Act
  const grammarErrors = app.check(__dirname + "/../TreeGrammar.grammar")
  const jibErrors = app.check(__dirname + "/jibberish/jibberish.grammar")

  // Assert
  equal(grammarErrors.includes("0 errors"), true, "no errors in TreeGrammar")
  equal(jibErrors.includes("0 errors"), true, jibErrors)
})
