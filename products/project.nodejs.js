#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { TreeNode } = require("./TreeNode.js")
  const { HandGrammarProgram } = require("./GrammarLanguage.js")
  const { GrammarBackedNode } = require("./GrammarLanguage.js")

  class projectParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(errorParser, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { file: fileParser }), undefined)
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
          const file = cloned.nodeAt(index)
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
      const files = new TreeNode(arrayOfScriptPaths.join("\n"))
      const requiredFileList = new TreeNode()
      files.forEach(child => {
        const line = child.getLine()
        const requiredFiles = this.getTypeScriptAndJavaScriptImportsFromSourceCode(fs.readFileSync(line, "utf8"))
        requiredFileList.appendLineAndChildren(`file ${line}`, requiredFiles.length ? requiredFiles.join("\n") : undefined)
      })
      return requiredFileList.toString()
    }
    static cachedHandGrammarProgramRoot = new HandGrammarProgram(`// Cell Parsers
anyCell
filepathCell
 highlightScope string
termCell
 highlightScope variable.parameter
fileConstantCell
 highlightScope keyword.control

// Line Parsers
projectParser
 root
 version 2.0.0
 description A prefix Tree Language for project dependency management in Javascript and Typescript.
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
     const file = cloned.nodeAt(index)
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
   const files = new TreeNode(arrayOfScriptPaths.join("\\n"))
   const requiredFileList = new TreeNode()
   files.forEach(child => {
    const line = child.getLine()
    const requiredFiles = this.getTypeScriptAndJavaScriptImportsFromSourceCode(fs.readFileSync(line, "utf8"))
    requiredFileList.appendLineAndChildren(\`file \${line}\`, requiredFiles.length ? requiredFiles.join("\\n") : undefined)
   })
   return requiredFileList.toString()
  }
 inScope fileParser
 catchAllParser errorParser
abstractTermParser
 catchAllCellType filepathCell
 cells termCell
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
 catchAllCellType filepathCell
 inScope externalParser absoluteParser relativeParser
 javascript
  getFilePath() {
   return this.filepathCell.join(" ")
  }
  _getDependencies() {
   return this.getChildren()
    .map(child => {
     const firstWord = child.firstWord
     const childFilePath = child.filepathCell.join(" ")
     if (firstWord === "external") return ""
     if (firstWord === "absolute") return childFilePath
     const link = childFilePath
     const folderPath = Utils.getPathWithoutFileName(this.getFilePath())
     const resolvedPath = require("path").resolve(folderPath + "/" + link)
     return resolvedPath
    })
    .filter(identity => identity)
  }
  getMissingDependencies(includedMap) {
   return this._getDependencies().filter(file => includedMap[file] === undefined)
  }
 cells fileConstantCell
 crux file`)
    get handGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static rootParser = projectParser
  }

  class abstractTermParser extends GrammarBackedNode {
    get termCell() {
      return this.getWord(0)
    }
    get filepathCell() {
      return this.getWordsFrom(1)
    }
  }

  class absoluteParser extends abstractTermParser {}

  class externalParser extends abstractTermParser {}

  class relativeParser extends abstractTermParser {}

  class errorParser extends GrammarBackedNode {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  class fileParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { absolute: absoluteParser, external: externalParser, relative: relativeParser }), undefined)
    }
    get fileConstantCell() {
      return this.getWord(0)
    }
    get filepathCell() {
      return this.getWordsFrom(1)
    }
    getFilePath() {
      return this.filepathCell.join(" ")
    }
    _getDependencies() {
      return this.getChildren()
        .map(child => {
          const firstWord = child.firstWord
          const childFilePath = child.filepathCell.join(" ")
          if (firstWord === "external") return ""
          if (firstWord === "absolute") return childFilePath
          const link = childFilePath
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

  if (!module.parent) new projectParser(TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
