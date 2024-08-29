const fs = require("fs")
const path = require("path")

const { Utils } = require("../products/Utils.js")
const { Particle } = require("../products/Particle.js")
const { HandParsersProgram } = require("./Parsers.js")
import { scrollNotationTypes } from "../products/scrollNotationTypes"

enum CompileTarget {
  nodejs = "nodejs",
  browser = "browser"
}

class ParsersCompiler {
  static compileParsersAndCreateProgram = (programPath: scrollNotationTypes.filepath, parsersPath: scrollNotationTypes.filepath) => {
    // tod: remove?
    const rootParser = this.compileParsersFileAtPathAndReturnRootParser(parsersPath)
    return new rootParser(fs.readFileSync(programPath, "utf8"))
  }

  static compileParsersForNodeJs(pathToParsers: scrollNotationTypes.absoluteFilePath, outputFolder: scrollNotationTypes.absoluteFolderPath, usePrettier = true, scrollsdkProductsPath = __dirname) {
    return this._compileParsers(pathToParsers, outputFolder, CompileTarget.nodejs, usePrettier, scrollsdkProductsPath)
  }

  static formatCode = (programCode: string, parsersPath: scrollNotationTypes.filepath) => {
    // tod: remove?
    const rootParser = this.compileParsersFileAtPathAndReturnRootParser(parsersPath)
    const program = new rootParser(programCode)
    return program.format().toString()
  }

  static formatFileInPlace = (programPath: scrollNotationTypes.filepath, parsersPath: scrollNotationTypes.filepath) => {
    // tod: remove?
    const original = Particle.fromDisk(programPath)
    const formatted = this.formatCode(original.toString(), parsersPath)
    if (original === formatted) return false
    new Particle(formatted).toDisk(programPath)
    return true
  }

  private static _compileParsers(
    pathToParsers: scrollNotationTypes.absoluteFilePath,
    outputFolder: scrollNotationTypes.absoluteFolderPath,
    target: CompileTarget,
    usePrettier: boolean,
    scrollsdkProductsPath?: scrollNotationTypes.requirePath
  ) {
    const isNodeJs = CompileTarget.nodejs === target
    const parsersCode = Particle.fromDisk(pathToParsers)
    const program = new HandParsersProgram(parsersCode.toString())
    const outputFilePath = path.join(outputFolder, `${program.parsersName}.${target}.js`)

    let result = isNodeJs ? program.toNodeJsJavascript(scrollsdkProductsPath) : program.toBrowserJavascript()

    if (isNodeJs)
      result =
        "#! /usr/bin/env node\n" +
        result.replace(
          /}\s*$/,
          `
if (!module.parent) new ${program.rootParserId}(Particle.fromDisk(process.argv[2]).toString()).execute()
}
`
        )

    if (usePrettier) result = require("prettier").format(result, require("../package.json").prettier)

    fs.writeFileSync(outputFilePath, result, "utf8")

    if (isNodeJs) fs.chmodSync(outputFilePath, 0o755)
    return outputFilePath
  }

  static compileParsersForBrowser(pathToParsers: scrollNotationTypes.absoluteFilePath, outputFolder: scrollNotationTypes.absoluteFolderPath, usePrettier = true) {
    return this._compileParsers(pathToParsers, outputFolder, CompileTarget.browser, usePrettier)
  }

  static compileParsersFileAtPathAndReturnRootParser = (parsersPath: scrollNotationTypes.filepath) => {
    // todo: remove
    if (!fs.existsSync(parsersPath)) throw new Error(`Parsers file does not exist: ${parsersPath}`)
    const parsersCode = fs.readFileSync(parsersPath, "utf8")
    const parsersProgram = new HandParsersProgram(parsersCode)
    return <any>parsersProgram.compileAndReturnRootParser()
  }

  static combineFiles = (globPatterns: scrollNotationTypes.globPattern[]) => {
    const glob = require("glob")
    const files = Utils.flatten(<any>globPatterns.map(pattern => glob.sync(pattern)))
    const content = files.map((path: scrollNotationTypes.filepath) => fs.readFileSync(path, "utf8")).join("\n")

    return new Particle(content)
  }
}

export { ParsersCompiler }
