{
  class projectNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        errorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { file: fileNode }),
        undefined
      )
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
      const files = new jtree.TreeNode(arrayOfScriptPaths.join("\n"))
      const requiredFileList = new jtree.TreeNode()
      files.forEach(child => {
        const line = child.getLine()
        const requiredFiles = this.getTypeScriptAndJavaScriptImportsFromSourceCode(fs.readFileSync(line, "utf8"))
        requiredFileList.appendLineAndChildren(`file ${line}`, requiredFiles.length ? requiredFiles.join("\n") : undefined)
      })
      return requiredFileList.toString()
    }
    static cachedHandGrammarProgramRoot = new jtree.HandGrammarProgram(`tooling onsave jtree build produceLang project
anyCell
filepathCell
 highlightScope string
termCell
 highlightScope variable.parameter
fileConstantCell
 highlightScope keyword.control
projectNode
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
   const files = new jtree.TreeNode(arrayOfScriptPaths.join("\\n"))
   const requiredFileList = new jtree.TreeNode()
   files.forEach(child => {
    const line = child.getLine()
    const requiredFiles = this.getTypeScriptAndJavaScriptImportsFromSourceCode(fs.readFileSync(line, "utf8"))
    requiredFileList.appendLineAndChildren(\`file \${line}\`, requiredFiles.length ? requiredFiles.join("\\n") : undefined)
   })
   return requiredFileList.toString()
  }
 inScope fileNode
 catchAllNodeType errorNode
abstractTermNode
 catchAllCellType filepathCell
 cells termCell
absoluteNode
 extends abstractTermNode
 crux absolute
externalNode
 extends abstractTermNode
 crux external
relativeNode
 extends abstractTermNode
 crux relative
errorNode
 baseNodeType errorNode
fileNode
 catchAllCellType filepathCell
 inScope externalNode absoluteNode relativeNode
 javascript
  getFilePath() {
   return this.filepathCell.join(" ")
  }
  _getDependencies() {
   return this.getChildren()
    .map(child => {
     const firstWord = child.getFirstWord()
     const childFilePath = child.filepathCell.join(" ")
     if (firstWord === "external") return ""
     if (firstWord === "absolute") return childFilePath
     const link = childFilePath
     const folderPath = jtree.Utils.getPathWithoutFileName(this.getFilePath())
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
    getHandGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        projectNode: projectNode,
        abstractTermNode: abstractTermNode,
        absoluteNode: absoluteNode,
        externalNode: externalNode,
        relativeNode: relativeNode,
        errorNode: errorNode,
        fileNode: fileNode
      }
    }
  }

  class abstractTermNode extends jtree.GrammarBackedNode {
    get termCell() {
      return this.getWord(0)
    }
    get filepathCell() {
      return this.getWordsFrom(1)
    }
  }

  class absoluteNode extends abstractTermNode {}

  class externalNode extends abstractTermNode {}

  class relativeNode extends abstractTermNode {}

  class errorNode extends jtree.GrammarBackedNode {
    getErrors() {
      return this._getErrorNodeErrors()
    }
  }

  class fileNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          absolute: absoluteNode,
          external: externalNode,
          relative: relativeNode
        }),
        undefined
      )
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
          const firstWord = child.getFirstWord()
          const childFilePath = child.filepathCell.join(" ")
          if (firstWord === "external") return ""
          if (firstWord === "absolute") return childFilePath
          const link = childFilePath
          const folderPath = jtree.Utils.getPathWithoutFileName(this.getFilePath())
          const resolvedPath = require("path").resolve(folderPath + "/" + link)
          return resolvedPath
        })
        .filter(identity => identity)
    }
    getMissingDependencies(includedMap) {
      return this._getDependencies().filter(file => includedMap[file] === undefined)
    }
  }

  window.projectNode = projectNode
}
