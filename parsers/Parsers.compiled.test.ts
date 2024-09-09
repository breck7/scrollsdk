#!/usr/bin/env ts-node

import { particlesTypes } from "../products/particlesTypes"
const path = require("path")
const { TestRacer } = require("../products/TestRacer.js")
const { Disk } = require("../products/Disk.node.js")
const { Particle } = require("../products/Particle.js")
const { HandParsersProgram, UnknownParsersProgram } = require("../products/Parsers.js")
const { ParsersCompiler } = require("../products/ParsersCompiler.js")

const testParticles: particlesTypes.testParticles = {}

// todo: turn prettier off for test running? seems like it might increase test time from 2s to 5s...
// todo: setup: make vms dir. cleanup? delete parsers file when done?

const outputDir = path.join(__dirname, "..", "ignore", "vms")
const langsDir = path.join(__dirname, "..", "langs")

Disk.mkdir(outputDir)

const makeProgram = (parsersCode: string, code: string) => {
  const parsersProgram = new HandParsersProgram(parsersCode)
  const rootParser = parsersProgram.compileAndReturnRootParser()
  return new rootParser(code)
}

testParticles.parsers = equal => {
  // Arrange
  const parsersParsersPath = path.join(langsDir, "parsers", "parsers.parsers")
  try {
    const tempFilePath = ParsersCompiler.compileParsersForNodeJs(parsersParsersPath, outputDir, false)

    // Act
    const parsers = require(tempFilePath)

    // Assert
    equal(!!new parsers(), true, "it compiled")
  } catch (err) {
    console.error(err)
  } finally {
  }
}

testParticles.compileAll = equal => {
  // Arrange/Act
  const langs = "hakon swarm dug stump project jibberish config poop jibjab fire stamp zin newlang chuck"
  langs.split(" ").map(name => {
    try {
      // Act
      const parsersPath = path.join(langsDir, name, `${name}.parsers`)
      const parsersCode = Particle.fromDisk(parsersPath)
      const tempFilePath = ParsersCompiler.compileParsersForNodeJs(parsersPath, outputDir, false)
      const rootClass = require(tempFilePath)

      // Assert
      equal(true, true, `Expected to compile and include "${name}" without error.`)

      // Act
      // todo: should we have an example particle for all langs?
      const exampleProgram = parsersCode.getParticle("parsers example")
      if (exampleProgram) {
        const testProgram = new rootClass(exampleProgram.childrenToString())
        // todo: should we then execute it? compile it?

        // Assert
        equal(testProgram.getAllErrors().length, 0, `no errors in test ${name} program`)
      }

      // Act/ Assert
      equal(new rootClass(Disk.read(path.join(langsDir, name, `sample.${name}`))).getAllErrors().length, 0, `no errors in ${name} sample program`)
    } catch (err) {
      console.log(err)
      equal(true, false, "Hit an error")
    }
  })
}

testParticles.jibberish = equal => {
  // Arrange
  try {
    const tempFilePath = ParsersCompiler.compileParsersForNodeJs(path.join(langsDir, `jibberish/jibberish.parsers`), outputDir, false)

    // Act
    const jibberish = require(tempFilePath)

    // Assert
    equal(!!new jibberish(), true, "it compiled")

    // Arrange
    const program = new jibberish(`particleWithConsts`)

    // Act/Assert
    equal(program.particleAt(0).score1, 28, "constants work")
  } catch (err) {
    console.error(err)
  } finally {
  }
}

testParticles.numbers = equal => {
  // Arrange
  const numbersParsersPath = path.join(langsDir, `numbers/numbers.parsers`)
  const numbersParsersCode = Disk.read(numbersParsersPath)
  const makeNumbersRunTimeProgram = (code: string) => makeProgram(numbersParsersCode, code)
  try {
    const tempFilePath = ParsersCompiler.compileParsersForNodeJs(numbersParsersPath, outputDir, false)

    // Act
    const numbers = require(tempFilePath)

    // Assert
    equal(!!new numbers(), true, "it compiled")

    // Arrange/Act
    const code = `+ 2 3
* 2 3 10`
    const program = new numbers(code)
    const firstParticle = program.particleAt(0)
    const runtimeProgram = makeNumbersRunTimeProgram(code)

    // Assert
    equal(firstParticle.numbersCell.length, 2, "cell getters work")
    equal(firstParticle.numbersCell[0], 2, "typings work")
    equal(program.execute().join(" "), "5 60", "execute works")
    equal(program.getAllErrors().length, 0, "no errors found")
    if (program.getAllErrors().length) console.log(program.getAllErrors())

    equal(firstParticle.definition.lineHints, "+: operatorCell numbersCell...", "line hints work")
    equal(program.toCellTypeParticles(), runtimeProgram.toCellTypeParticles(), "cell types worked")

    // Arrange/Act/Assert
    equal(new numbers(`+ 2 a`).getAllErrors().length, 1, "should be 1 error")
  } catch (err) {
    console.error(err)
  } finally {
  }
}

testParticles.predictParsersFile = equal => {
  // Arrange
  const input = Disk.read(path.join(__dirname, "UnknownParsers.sample.scroll"))

  // Act
  const parsersFile = new UnknownParsersProgram(input).inferParsersFileForAKeywordLanguage("foobar")

  // Assert
  equal(parsersFile, Disk.read(path.join(__dirname, "UnknownParsers.expected.parsers")), "predicted parsers correct")
}

testParticles.emojis = equal => {
  const source = `⌨🕸🌐
 📈
  🏦😎
 📉
  💩`

  // Act
  const parsersFile = new UnknownParsersProgram(source).inferParsersFileForAKeywordLanguage("emojiLang")
  // Assert
  equal(parsersFile, Disk.read(path.join(__dirname, "UnknownParsers.expectedEmoji.parsers")), "predicted emoji parsers correct")
}

const langs = Disk.dir(langsDir)
langs.forEach((name: string) => {
  const folder = path.join(langsDir, `${name}`)
  if (!Disk.isDir(folder)) return
  testParticles[`${name}InferPrefixParsers`] = equal => {
    // Arrange
    const samplePath = path.join(langsDir, name, `sample.${name}`)
    const sampleCode = Particle.fromDisk(samplePath).toString()

    // todo: cleanup
    if (Disk.read(path.join(langsDir, name, `${name}.parsers`)).includes("nonPrefixParsers")) return equal(true, true, `skipped ${name} beause not prefix parsers`)

    // Act
    const inferredPrefixParsersCode = new UnknownParsersProgram(sampleCode).inferParsersFileForAKeywordLanguage("foobar")
    const inferredPrefixParsersProgram = new HandParsersProgram(inferredPrefixParsersCode)
    const rootParser = inferredPrefixParsersProgram.compileAndReturnRootParser()
    const programParsedWithInferredParsers = new rootParser(sampleCode)

    // Assert
    equal(inferredPrefixParsersProgram.getAllErrors().length, 0, `no errors in inferred parsers program for language ${name}`)
    equal(programParsedWithInferredParsers.getAllErrors().length, 0, `no errors in program from inferred parsers for ${name}`)
  }
})

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)

export { testParticles }
