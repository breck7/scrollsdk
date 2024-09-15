#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { Particle } = require("./Particle.js")
  const { HandParsersProgram } = require("./Parsers.js")
  const { ParserBackedParticle } = require("./Parsers.js")

  class projectParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(errorParser, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { file: fileParser }), undefined)
    }
    getScriptPathsInCorrectDependencyOrder() {
      const cloned = this.clone()
      const sorted = []
      const included = {}
      let lastLength
      while (cloned.length) {
        if (lastLength === cloned.length) {
          const missing = cloned.map(
            file => `${file.getLine()}
 missing ${file.getMissingDependencies(included).join("\n missing ")}`
          )
          throw new Error(`Circular dependency or other error detected with ${cloned.length} remaining
${cloned.toString()}
-----
${missing.join("\n")}
-----
`)
        }
        lastLength = cloned.length
        for (let index = 0; index < cloned.length; index++) {
          const file = cloned.particleAt(index)
          const missingDependencies = file.getMissingDependencies(included)
          if (missingDependencies.length === 0) {
            const path = file.getFilePath()
            file.destroy()
            sorted.push(path)
            included[path] = true
            break
          }
        }
      }
      return sorted
    }
    static _extractImports(sourceCode, regex) {
      const matches = sourceCode.match(regex)
      if (!matches) return []
      const regex2 = /"(.+)"/
      return matches.map(match => match.match(regex2)[1])
    }
    static _getImportsCommonJs(sourceCode) {
      return this._extractImports(sourceCode, /(\n|^)const .* \= require\("([^"]+)"\)/g)
    }
    static _getImportsTypescript(sourceCode) {
      return this._extractImports(sourceCode, /(\n|^)import .* from "([^"]+)"/g)
    }
    static getTypeScriptAndJavaScriptImportsFromSourceCode(sourceCode) {
      const files = this._getImportsCommonJs(sourceCode).concat(this._getImportsTypescript(sourceCode))
      return files.map(file => {
        let type = "external"
        if (file.startsWith(".")) type = "relative"
        else if (file.startsWith("/")) type = "absolute"
        return `${type} ${file}`
      })
    }
    static makeProjectProgramFromArrayOfScripts(arrayOfScriptPaths) {
      const fs = require("fs")
      const files = new Particle(arrayOfScriptPaths.join("\n"))
      const requiredFileList = new Particle()
      files.forEach(subparticle => {
        const line = subparticle.getLine()
        const requiredFiles = this.getTypeScriptAndJavaScriptImportsFromSourceCode(fs.readFileSync(line, "utf8"))
        requiredFileList.appendLineAndSubparticles(`file ${line}`, requiredFiles.length ? requiredFiles.join("\n") : undefined)
      })
      return requiredFileList.toString()
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// Atom Parsers
anyAtom
filepathAtom
 paint string
termAtom
 paint variable.parameter
fileConstantAtom
 paint keyword.control

// Line Parsers
projectParser
 root
 description A prefix Language for project dependency management in Javascript and Typescript.
 javascript
  getScriptPathsInCorrectDependencyOrder() {
   const cloned = this.clone()
   const sorted = []
   const included = {}
   let lastLength
   while (cloned.length) {
    if (lastLength === cloned.length) {
     const missing = cloned.map(
      file => \`\${file.getLine()}
   missing \${file.getMissingDependencies(included).join("\\n missing ")}\`
     )
     throw new Error(\`Circular dependency or other error detected with \${cloned.length} remaining
  \${cloned.toString()}
  -----
  \${missing.join("\\n")}
  -----
  \`)
    }
    lastLength = cloned.length
    for (let index = 0; index < cloned.length; index++) {
     const file = cloned.particleAt(index)
     const missingDependencies = file.getMissingDependencies(included)
     if (missingDependencies.length === 0) {
      const path = file.getFilePath()
      file.destroy()
      sorted.push(path)
      included[path] = true
      break
     }
    }
   }
   return sorted
  }
  static _extractImports(sourceCode, regex) {
   const matches = sourceCode.match(regex)
   if (!matches) return []
   const regex2 = /"(.+)"/
   return matches.map(match => match.match(regex2)[1])
  }
  static _getImportsCommonJs(sourceCode) {
   return this._extractImports(sourceCode, /(\\n|^)const .* \\= require\\("([^"]+)"\\)/g)
  }
  static _getImportsTypescript(sourceCode) {
   return this._extractImports(sourceCode, /(\\n|^)import .* from "([^"]+)"/g)
  }
  static getTypeScriptAndJavaScriptImportsFromSourceCode(sourceCode) {
   const files = this._getImportsCommonJs(sourceCode).concat(this._getImportsTypescript(sourceCode))
   return files.map(file => {
    let type = "external"
    if (file.startsWith(".")) type = "relative"
    else if (file.startsWith("/")) type = "absolute"
    return \`\${type} \${file}\`
   })
  }
  static makeProjectProgramFromArrayOfScripts(arrayOfScriptPaths) {
   const fs = require("fs")
   const files = new Particle(arrayOfScriptPaths.join("\\n"))
   const requiredFileList = new Particle()
   files.forEach(subparticle => {
    const line = subparticle.getLine()
    const requiredFiles = this.getTypeScriptAndJavaScriptImportsFromSourceCode(fs.readFileSync(line, "utf8"))
    requiredFileList.appendLineAndSubparticles(\`file \${line}\`, requiredFiles.length ? requiredFiles.join("\\n") : undefined)
   })
   return requiredFileList.toString()
  }
 inScope fileParser
 catchAllParser errorParser
abstractTermParser
 catchAllAtomType filepathAtom
 atoms termAtom
absoluteParser
 extends abstractTermParser
 crux absolute
externalParser
 extends abstractTermParser
 crux external
relativeParser
 extends abstractTermParser
 crux relative
errorParser
 baseParser errorParser
fileParser
 catchAllAtomType filepathAtom
 inScope externalParser absoluteParser relativeParser
 javascript
  getFilePath() {
   return this.filepathAtom.join(" ")
  }
  _getDependencies() {
   return this.getSubparticles()
    .map(subparticle => {
     const firstWord = subparticle.firstWord
     const subparticleFilePath = subparticle.filepathAtom.join(" ")
     if (firstWord === "external") return ""
     if (firstWord === "absolute") return subparticleFilePath
     const link = subparticleFilePath
     const folderPath = Utils.getPathWithoutFileName(this.getFilePath())
     const resolvedPath = require("path").resolve(folderPath + "/" + link)
     return resolvedPath
    })
    .filter(identity => identity)
  }
  getMissingDependencies(includedMap) {
   return this._getDependencies().filter(file => includedMap[file] === undefined)
  }
 atoms fileConstantAtom
 crux file`)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = projectParser
  }

  class abstractTermParser extends ParserBackedParticle {
    get termAtom() {
      return this.getWord(0)
    }
    get filepathAtom() {
      return this.getWordsFrom(1)
    }
  }

  class absoluteParser extends abstractTermParser {}

  class externalParser extends abstractTermParser {}

  class relativeParser extends abstractTermParser {}

  class errorParser extends ParserBackedParticle {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  class fileParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { absolute: absoluteParser, external: externalParser, relative: relativeParser }), undefined)
    }
    get fileConstantAtom() {
      return this.getWord(0)
    }
    get filepathAtom() {
      return this.getWordsFrom(1)
    }
    getFilePath() {
      return this.filepathAtom.join(" ")
    }
    _getDependencies() {
      return this.getSubparticles()
        .map(subparticle => {
          const firstWord = subparticle.firstWord
          const subparticleFilePath = subparticle.filepathAtom.join(" ")
          if (firstWord === "external") return ""
          if (firstWord === "absolute") return subparticleFilePath
          const link = subparticleFilePath
          const folderPath = Utils.getPathWithoutFileName(this.getFilePath())
          const resolvedPath = require("path").resolve(folderPath + "/" + link)
          return resolvedPath
        })
        .filter(identity => identity)
    }
    getMissingDependencies(includedMap) {
      return this._getDependencies().filter(file => includedMap[file] === undefined)
    }
  }

  module.exports = projectParser
  projectParser

  if (!module.parent) new projectParser(Particle.fromDisk(process.argv[2]).toString()).execute()
}
