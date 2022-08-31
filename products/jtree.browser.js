"use strict"
class Timer {
  constructor() {
    this._tickTime = Date.now() - (TreeUtils.isNodeJs() ? 1000 * process.uptime() : 0)
    this._firstTickTime = this._tickTime
  }
  tick(msg) {
    const elapsed = Date.now() - this._tickTime
    if (msg) console.log(`${elapsed}ms ${msg}`)
    this._tickTime = Date.now()
    return elapsed
  }
  getTotalElapsedTime() {
    return Date.now() - this._firstTickTime
  }
}
class TreeUtils {
  static getFileExtension(filepath = "") {
    const match = filepath.match(/\.([^\.]+)$/)
    return (match && match[1]) || ""
  }
  static isNodeJs() {
    return typeof exports !== "undefined"
  }
  static findProjectRoot(startingDirName, projectName) {
    const fs = require("fs")
    const getProjectName = dirName => {
      if (!dirName) throw new Error(`dirName undefined when attempting to findProjectRoot for project "${projectName}" starting in "${startingDirName}"`)
      const parts = dirName.split("/")
      const filename = parts.join("/") + "/" + "package.json"
      if (fs.existsSync(filename) && JSON.parse(fs.readFileSync(filename, "utf8")).name === projectName) return parts.join("/") + "/"
      parts.pop()
      return parts
    }
    let result = getProjectName(startingDirName)
    while (typeof result !== "string" && result.length > 0) {
      result = getProjectName(result.join("/"))
    }
    if (result.length === 0) throw new Error(`Project root "${projectName}" in folder ${startingDirName} not found.`)
    return result
  }
  static escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }
  static sum(arr) {
    return arr.reduce((curr, next) => curr + next, 0)
  }
  static makeVector(length, fill = 0) {
    return new Array(length).fill(fill)
  }
  static makeMatrix(cols, rows, fill = 0) {
    const matrix = []
    while (rows) {
      matrix.push(TreeUtils.makeVector(cols, fill))
      rows--
    }
    return matrix
  }
  static removeNonAscii(str) {
    // https://stackoverflow.com/questions/20856197/remove-non-ascii-character-in-string
    return str.replace(/[^\x00-\x7F]/g, "")
  }
  static getMethodFromDotPath(context, str) {
    const methodParts = str.split(".")
    while (methodParts.length > 1) {
      const methodName = methodParts.shift()
      if (!context[methodName]) throw new Error(`${methodName} is not a method on ${context}`)
      context = context[methodName]()
    }
    const final = methodParts.shift()
    return [context, final]
  }
  static requireAbsOrRelative(filePath, contextFilePath) {
    if (!filePath.startsWith(".")) return require(filePath)
    const path = require("path")
    const folder = this.getPathWithoutFileName(contextFilePath)
    const file = path.resolve(folder + "/" + filePath)
    return require(file)
  }
  // Removes last ".*" from this string
  static removeFileExtension(filename) {
    return filename ? filename.replace(/\.[^\.]+$/, "") : ""
  }
  static getFileName(path) {
    const parts = path.split("/") // todo: change for windows?
    return parts.pop()
  }
  static getPathWithoutFileName(path) {
    const parts = path.split("/") // todo: change for windows?
    parts.pop()
    return parts.join("/")
  }
  static shuffleInPlace(arr, seed = Date.now()) {
    // https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
    const randFn = TreeUtils._getPseudoRandom0to1FloatGenerator(seed)
    for (let index = arr.length - 1; index > 0; index--) {
      const tempIndex = Math.floor(randFn() * (index + 1))
      ;[arr[index], arr[tempIndex]] = [arr[tempIndex], arr[index]]
    }
    return arr
  }
  // Only allows a-zA-Z0-9-_  (And optionally .)
  static _permalink(str, reg) {
    return str.length
      ? str
          .toLowerCase()
          .replace(reg, "")
          .replace(/ /g, "-")
      : ""
  }
  static isValueEmpty(value) {
    return value === undefined || value === "" || (typeof value === "number" && isNaN(value)) || (value instanceof Date && isNaN(value))
  }
  static stringToPermalink(str) {
    return this._permalink(str, /[^a-z0-9- _\.]/gi)
  }
  static getAvailablePermalink(permalink, doesFileExistSyncFn) {
    const extension = this.getFileExtension(permalink)
    permalink = this.removeFileExtension(permalink)
    const originalPermalink = permalink
    let num = 2
    let suffix = ""
    let filename = `${originalPermalink}${suffix}.${extension}`
    while (doesFileExistSyncFn(filename)) {
      filename = `${originalPermalink}${suffix}.${extension}`
      suffix = "-" + num
      num++
    }
    return filename
  }
  static getNextOrPrevious(arr, item) {
    const length = arr.length
    const index = arr.indexOf(item)
    if (length === 1) return undefined
    if (index === length - 1) return arr[index - 1]
    return arr[index + 1]
  }
  static toggle(currentValue, values) {
    const index = values.indexOf(currentValue)
    return index === -1 || index + 1 === values.length ? values[0] : values[index + 1]
  }
  static getClassNameFromFilePath(filepath) {
    return this.removeFileExtension(this.getFileName(filepath))
  }
  static joinArraysOn(joinOn, arrays, columns) {
    const rows = {}
    let index = 0
    if (!columns) columns = arrays.map(arr => Object.keys(arr[0]))
    arrays.forEach((arr, index) => {
      const cols = columns[index]
      arr.forEach(row => {
        const key = joinOn ? row[joinOn] : index++
        if (!rows[key]) rows[key] = {}
        const obj = rows[key]
        cols.forEach(col => (obj[col] = row[col]))
      })
    })
    return Object.values(rows)
  }
  static getParentFolder(path) {
    if (path.endsWith("/")) path = this._removeLastSlash(path)
    return path.replace(/\/[^\/]*$/, "") + "/"
  }
  static _removeLastSlash(path) {
    return path.replace(/\/$/, "")
  }
  static _listToEnglishText(list, limit = 5) {
    const len = list.length
    if (!len) return ""
    if (len === 1) return `'${list[0]}'`
    const clone = list.slice(0, limit).map(item => `'${item}'`)
    const last = clone.pop()
    if (len <= limit) return clone.join(", ") + ` and ${last}`
    return clone.join(", ") + ` and ${len - limit} more`
  }
  // todo: refactor so instead of str input takes an array of cells(strings) and scans each indepndently.
  static _chooseDelimiter(str) {
    const del = " ,|\t;^%$!#@~*&+-=_:?.{}[]()<>/".split("").find(idea => !str.includes(idea))
    if (!del) throw new Error("Could not find a delimiter")
    return del
  }
  static flatten(arr) {
    if (arr.flat) return arr.flat()
    return arr.reduce((acc, val) => acc.concat(val), [])
  }
  static escapeBackTicks(str) {
    return str.replace(/\`/g, "\\`").replace(/\$\{/g, "\\${")
  }
  static ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  // Adapted from: https://github.com/dcporter/didyoumean.js/blob/master/didYouMean-1.2.1.js
  static didYouMean(str = "", options = [], caseSensitive = false, threshold = 0.4, thresholdAbsolute = 20) {
    if (!caseSensitive) str = str.toLowerCase()
    // Calculate the initial value (the threshold) if present.
    const thresholdRelative = threshold * str.length
    let maximumEditDistanceToBeBestMatch
    if (thresholdRelative !== null && thresholdAbsolute !== null) maximumEditDistanceToBeBestMatch = Math.min(thresholdRelative, thresholdAbsolute)
    else if (thresholdRelative !== null) maximumEditDistanceToBeBestMatch = thresholdRelative
    else if (thresholdAbsolute !== null) maximumEditDistanceToBeBestMatch = thresholdAbsolute
    // Get the edit distance to each option. If the closest one is less than 40% (by default) of str's length, then return it.
    let closestMatch
    const len = options.length
    for (let optionIndex = 0; optionIndex < len; optionIndex++) {
      const candidate = options[optionIndex]
      if (!candidate) continue
      const editDistance = TreeUtils._getEditDistance(str, caseSensitive ? candidate : candidate.toLowerCase(), maximumEditDistanceToBeBestMatch)
      if (editDistance < maximumEditDistanceToBeBestMatch) {
        maximumEditDistanceToBeBestMatch = editDistance
        closestMatch = candidate
      }
    }
    return closestMatch
  }
  // Adapted from: https://github.com/dcporter/didyoumean.js/blob/master/didYouMean-1.2.1.js
  static _getEditDistance(stringA, stringB, maxInt) {
    // Handle null or undefined max.
    maxInt = maxInt || maxInt === 0 ? maxInt : TreeUtils.MAX_INT
    const aLength = stringA.length
    const bLength = stringB.length
    // Fast path - no A or B.
    if (aLength === 0) return Math.min(maxInt + 1, bLength)
    if (bLength === 0) return Math.min(maxInt + 1, aLength)
    // Fast path - length diff larger than max.
    if (Math.abs(aLength - bLength) > maxInt) return maxInt + 1
    // Slow path.
    const matrix = []
    // Set up the first row ([0, 1, 2, 3, etc]).
    for (let bIndex = 0; bIndex <= bLength; bIndex++) {
      matrix[bIndex] = [bIndex]
    }
    // Set up the first column (same).
    for (let aIndex = 0; aIndex <= aLength; aIndex++) {
      matrix[0][aIndex] = aIndex
    }
    let colMin
    let minJ
    let maxJ
    // Loop over the rest of the columns.
    for (let bIndex = 1; bIndex <= bLength; bIndex++) {
      colMin = TreeUtils.MAX_INT
      minJ = 1
      if (bIndex > maxInt) minJ = bIndex - maxInt
      maxJ = bLength + 1
      if (maxJ > maxInt + bIndex) maxJ = maxInt + bIndex
      // Loop over the rest of the rows.
      for (let aIndex = 1; aIndex <= aLength; aIndex++) {
        // If j is out of bounds, just put a large value in the slot.
        if (aIndex < minJ || aIndex > maxJ) matrix[bIndex][aIndex] = maxInt + 1
        // Otherwise do the normal Levenshtein thing.
        else {
          // If the characters are the same, there's no change in edit distance.
          if (stringB.charAt(bIndex - 1) === stringA.charAt(aIndex - 1)) matrix[bIndex][aIndex] = matrix[bIndex - 1][aIndex - 1]
          // Otherwise, see if we're substituting, inserting or deleting.
          else
            matrix[bIndex][aIndex] = Math.min(
              matrix[bIndex - 1][aIndex - 1] + 1, // Substitute
              Math.min(
                matrix[bIndex][aIndex - 1] + 1, // Insert
                matrix[bIndex - 1][aIndex] + 1
              )
            ) // Delete
        }
        // Either way, update colMin.
        if (matrix[bIndex][aIndex] < colMin) colMin = matrix[bIndex][aIndex]
      }
      // If this column's minimum is greater than the allowed maximum, there's no point
      // in going on with life.
      if (colMin > maxInt) return maxInt + 1
    }
    // If we made it this far without running into the max, then return the final matrix value.
    return matrix[bLength][aLength]
  }
  static getLineIndexAtCharacterPosition(str, index) {
    const lines = str.split("\n")
    const len = lines.length
    let position = 0
    for (let lineNumber = 0; lineNumber < len; lineNumber++) {
      position += lines[lineNumber].length
      if (position >= index) return lineNumber
    }
  }
  static resolvePath(filePath, programFilepath) {
    // For use in Node.js only
    if (!filePath.startsWith(".")) return filePath
    const path = require("path")
    const folder = this.getPathWithoutFileName(programFilepath)
    return path.resolve(folder + "/" + filePath)
  }
  static resolveProperty(obj, path, separator = ".") {
    const properties = Array.isArray(path) ? path : path.split(separator)
    return properties.reduce((prev, curr) => prev && prev[curr], obj)
  }
  static appendCodeAndReturnValueOnWindow(code, name) {
    const script = document.createElement("script")
    script.innerHTML = code
    document.head.appendChild(script)
    return window[name]
  }
  static formatStr(str, catchAllCellDelimiter = " ", parameterMap) {
    return str.replace(/{([^\}]+)}/g, (match, path) => {
      const val = parameterMap[path]
      if (!val) return ""
      return Array.isArray(val) ? val.join(catchAllCellDelimiter) : val
    })
  }
  static stripHtml(text) {
    return text && text.replace ? text.replace(/<(?:.|\n)*?>/gm, "") : text
  }
  static getUniqueWordsArray(allWords) {
    const words = allWords.replace(/\n/g, " ").split(" ")
    const index = {}
    words.forEach(word => {
      if (!index[word]) index[word] = 0
      index[word]++
    })
    return Object.keys(index).map(key => {
      return {
        word: key,
        count: index[key]
      }
    })
  }
  static getRandomString(length = 30, letters = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), seed = Date.now()) {
    let str = ""
    const randFn = TreeUtils._getPseudoRandom0to1FloatGenerator(seed)
    while (length) {
      str += letters[Math.round(Math.min(randFn() * letters.length, letters.length - 1))]
      length--
    }
    return str
  }
  // todo: add seed!
  static makeRandomTree(lines = 1000, seed = Date.now()) {
    let str = ""
    let letters = " 123abc".split("")
    const randFn = TreeUtils._getPseudoRandom0to1FloatGenerator(seed)
    while (lines) {
      let indent = " ".repeat(Math.round(randFn() * 6))
      let bit = indent
      let rand = Math.floor(randFn() * 30)
      while (rand) {
        bit += letters[Math.round(Math.min(randFn() * letters.length, letters.length - 1))]
        rand--
      }
      bit += "\n"
      str += bit
      lines--
    }
    return str
  }
  // adapted from https://gist.github.com/blixt/f17b47c62508be59987b
  // 1993 Park-Miller LCG
  static _getPseudoRandom0to1FloatGenerator(seed) {
    return function() {
      seed = Math.imul(48271, seed) | 0 % 2147483647
      return (seed & 2147483647) / 2147483648
    }
  }
  static sampleWithoutReplacement(population = [], quantity, seed) {
    const prng = this._getPseudoRandom0to1FloatGenerator(seed)
    const sampled = {}
    const populationSize = population.length
    if (quantity >= populationSize) return population.slice(0)
    const picked = []
    while (picked.length < quantity) {
      const index = Math.floor(prng() * populationSize)
      if (sampled[index]) continue
      sampled[index] = true
      picked.push(population[index])
    }
    return picked
  }
  static arrayToMap(arr) {
    const map = {}
    arr.forEach(val => (map[val] = true))
    return map
  }
  static _replaceNonAlphaNumericCharactersWithCharCodes(str) {
    return str
      .replace(/[^a-zA-Z0-9]/g, sub => {
        return "_" + sub.charCodeAt(0).toString()
      })
      .replace(/^([0-9])/, "number$1")
  }
  static mapValues(object, fn) {
    const result = {}
    Object.keys(object).forEach(key => {
      result[key] = fn(key)
    })
    return result
  }
  static javascriptTableWithHeaderRowToObjects(dataTable) {
    dataTable = dataTable.slice()
    const header = dataTable.shift()
    return dataTable.map(row => {
      const obj = {}
      header.forEach((colName, index) => (obj[colName] = row[index]))
      return obj
    })
  }
  static interweave(arrayOfArrays) {
    const lineCount = Math.max(...arrayOfArrays.map(arr => arr.length))
    const totalArrays = arrayOfArrays.length
    const result = []
    arrayOfArrays.forEach((lineArray, arrayIndex) => {
      for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
        result[lineIndex * totalArrays + arrayIndex] = lineArray[lineIndex]
      }
    })
    return result
  }
  static makeSortByFn(accessorOrAccessors) {
    const arrayOfFns = Array.isArray(accessorOrAccessors) ? accessorOrAccessors : [accessorOrAccessors]
    return (objectA, objectB) => {
      const nodeAFirst = -1
      const nodeBFirst = 1
      const accessor = arrayOfFns[0] // todo: handle accessors
      const av = accessor(objectA)
      const bv = accessor(objectB)
      let result = av < bv ? nodeAFirst : av > bv ? nodeBFirst : 0
      if (av === undefined && bv !== undefined) result = nodeAFirst
      else if (bv === undefined && av !== undefined) result = nodeBFirst
      return result
    }
  }
  static _makeGraphSortFunctionFromGraph(idAccessor, graph) {
    return (nodeA, nodeB) => {
      const nodeAFirst = -1
      const nodeBFirst = 1
      const nodeAUniqueId = idAccessor(nodeA)
      const nodeBUniqueId = idAccessor(nodeB)
      const nodeAExtendsNodeB = graph[nodeAUniqueId].has(nodeBUniqueId)
      const nodeBExtendsNodeA = graph[nodeBUniqueId].has(nodeAUniqueId)
      if (nodeAExtendsNodeB) return nodeBFirst
      else if (nodeBExtendsNodeA) return nodeAFirst
      const nodeAExtendsSomething = graph[nodeAUniqueId].size > 1
      const nodeBExtendsSomething = graph[nodeBUniqueId].size > 1
      if (!nodeAExtendsSomething && nodeBExtendsSomething) return nodeAFirst
      else if (!nodeBExtendsSomething && nodeAExtendsSomething) return nodeBFirst
      if (nodeAUniqueId > nodeBUniqueId) return nodeBFirst
      else if (nodeAUniqueId < nodeBUniqueId) return nodeAFirst
      return 0
    }
  }
  static removeAll(str, needle) {
    return str.split(needle).join("")
  }
  static _makeGraphSortFunction(idAccessor, extendsIdAccessor) {
    return (nodeA, nodeB) => {
      // -1 === a before b
      const nodeAUniqueId = idAccessor(nodeA)
      const nodeAExtends = extendsIdAccessor(nodeA)
      const nodeBUniqueId = idAccessor(nodeB)
      const nodeBExtends = extendsIdAccessor(nodeB)
      const nodeAExtendsNodeB = nodeAExtends === nodeBUniqueId
      const nodeBExtendsNodeA = nodeBExtends === nodeAUniqueId
      const nodeAFirst = -1
      const nodeBFirst = 1
      if (!nodeAExtends && !nodeBExtends) {
        // If neither extends, sort by firstWord
        if (nodeAUniqueId > nodeBUniqueId) return nodeBFirst
        else if (nodeAUniqueId < nodeBUniqueId) return nodeAFirst
        return 0
      }
      // If only one extends, the other comes first
      else if (!nodeAExtends) return nodeAFirst
      else if (!nodeBExtends) return nodeBFirst
      // If A extends B, B should come first
      if (nodeAExtendsNodeB) return nodeBFirst
      else if (nodeBExtendsNodeA) return nodeAFirst
      // Sort by what they extend
      if (nodeAExtends > nodeBExtends) return nodeBFirst
      else if (nodeAExtends < nodeBExtends) return nodeAFirst
      // Finally sort by firstWord
      if (nodeAUniqueId > nodeBUniqueId) return nodeBFirst
      else if (nodeAUniqueId < nodeBUniqueId) return nodeAFirst
      // Should never hit this, unless we have a duplicate line.
      return 0
    }
  }
}
TreeUtils.Timer = Timer
//http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links#21925491
TreeUtils.linkify = (text, target = "_blank") => {
  let replacedText
  let replacePattern1
  let replacePattern2
  let replacePattern3
  //URLs starting with http://, https://, or ftp://
  replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z\(\)0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+\(\)&@#\/%=~_|])/gim
  replacedText = text.replace(replacePattern1, `<a href="$1" target="${target}">$1</a>`)
  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim
  replacedText = replacedText.replace(replacePattern2, `$1<a href="http://$2" target="${target}">$2</a>`)
  //Change email addresses to mailto:: links.
  replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim
  replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>')
  return replacedText
}
// todo: switch algo to: http://indiegamr.com/generate-repeatable-random-numbers-in-js/?
TreeUtils.makeSemiRandomFn = (seed = Date.now()) => {
  return () => {
    const semiRand = Math.sin(seed++) * 10000
    return semiRand - Math.floor(semiRand)
  }
}
TreeUtils.randomUniformInt = (min, max, seed = Date.now()) => {
  return Math.floor(TreeUtils.randomUniformFloat(min, max, seed))
}
TreeUtils.randomUniformFloat = (min, max, seed = Date.now()) => {
  const randFn = TreeUtils.makeSemiRandomFn(seed)
  return min + (max - min) * randFn()
}
TreeUtils.getRange = (startIndex, endIndexExclusive, increment = 1) => {
  const range = []
  for (let index = startIndex; index < endIndexExclusive; index = index + increment) {
    range.push(index)
  }
  return range
}
TreeUtils.MAX_INT = Math.pow(2, 32) - 1
window.TreeUtils = TreeUtils
class TestRacerTestBlock {
  constructor(testFile, testName, fn) {
    this._parentFile = testFile
    this._testName = testName
    this._testFn = fn
  }
  _emitMessage(message) {
    this._parentFile.getRunner()._emitMessage(message)
    return message
  }
  async execute() {
    let passes = []
    let failures = []
    const assertEqual = (actual, expected, message = "") => {
      if (expected === actual) {
        passes.push(message)
      } else {
        failures.push([actual, expected, message])
      }
    }
    try {
      await this._testFn(assertEqual)
    } catch (err) {
      failures.push([
        "1",
        "0",
        `Should not have uncaught errors but in ${this._testName} got error:
 toString:
  ${new TreeNode(err.toString()).toString(2)}
 stack:
  ${new TreeNode(err.stack).toString(2)}`
      ])
    }
    failures.length ? this._emitBlockFailedMessage(failures) : this._emitBlockPassedMessage(passes)
    return {
      passes,
      failures
    }
  }
  _emitBlockPassedMessage(passes) {
    this._emitMessage(`ok block ${this._testName} - ${passes.length} passed`)
  }
  _emitBlockFailedMessage(failures) {
    // todo: should replace not replace last newline?
    // todo: do side by side.
    // todo: add diff.
    this._emitMessage(`failed block ${this._testName}`)
    this._emitMessage(
      failures
        .map(failure => {
          const actualVal = failure[0] === undefined ? "undefined" : failure[0].toString()
          const expectedVal = failure[1] === undefined ? "undefined" : failure[1].toString()
          const actual = new TreeNode(`actual\n${new TreeNode(actualVal).toString(1)}`)
          const expected = new TreeNode(`expected\n${new TreeNode(expectedVal.toString()).toString(1)}`)
          const comparison = actual.toComparison(expected)
          return new TreeNode(` assertion ${failure[2]}\n${comparison.toSideBySide([actual, expected]).toString(2)}`)
        })
        .join("\n")
    )
  }
}
class TestRacerFile {
  constructor(runner, testTree, fileName) {
    this._runner = runner
    this._testTree = {}
    this._fileName = fileName
    Object.keys(testTree).forEach(key => {
      this._testTree[key] = new TestRacerTestBlock(this, key, testTree[key])
    })
  }
  getRunner() {
    return this._runner
  }
  getFileName() {
    return this._fileName
  }
  get length() {
    return Object.values(this._testTree).length
  }
  get skippedTestBlockNames() {
    const testsToRun = this._filterSkippedTestBlocks()
    return Object.keys(this._testTree).filter(blockName => !testsToRun.includes(blockName))
  }
  _emitMessage(message) {
    this.getRunner()._emitMessage(message)
  }
  _filterSkippedTestBlocks() {
    // _ prefix = run on these tests block
    // $ prefix = skip this test
    const runOnlyTheseTestBlocks = Object.keys(this._testTree).filter(key => key.startsWith("_"))
    if (runOnlyTheseTestBlocks.length) return runOnlyTheseTestBlocks
    return Object.keys(this._testTree).filter(key => !key.startsWith("$"))
  }
  async execute() {
    const testBlockNames = this._filterSkippedTestBlocks()
    this._emitStartFileMessage(testBlockNames.length)
    const fileTimer = new TreeUtils.Timer()
    const blockResults = {}
    const blockPromises = testBlockNames.map(async testName => {
      const results = await this._testTree[testName].execute()
      blockResults[testName] = results
    })
    await Promise.all(blockPromises)
    const fileStats = this._aggregateBlockResultsIntoFileResults(blockResults)
    const fileTimeElapsed = fileTimer.tick()
    fileStats.blocksFailed ? this._emitFileFailedMessage(fileStats, fileTimeElapsed, testBlockNames.length) : this._emitFilePassedMessage(fileStats, fileTimeElapsed, testBlockNames.length)
    return fileStats
  }
  _aggregateBlockResultsIntoFileResults(fileBlockResults) {
    const fileStats = {
      assertionsPassed: 0,
      assertionsFailed: 0,
      blocksPassed: 0,
      blocksFailed: 0,
      failedBlocks: []
    }
    Object.keys(fileBlockResults).forEach(blockName => {
      const results = fileBlockResults[blockName]
      fileStats.assertionsPassed += results.passes.length
      fileStats.assertionsFailed += results.failures.length
      if (results.failures.length) {
        fileStats.blocksFailed++
        fileStats.failedBlocks.push(blockName)
      } else fileStats.blocksPassed++
    })
    return fileStats
  }
  _emitStartFileMessage(blockCount) {
    this._emitMessage(`start file ${blockCount} test blocks in file ${this._fileName}`)
  }
  _emitFilePassedMessage(fileStats, fileTimeElapsed, blockCount) {
    this._emitMessage(`ok file ${this._fileName} in ${fileTimeElapsed}ms. ${blockCount} blocks and ${fileStats.assertionsPassed} assertions passed.`)
  }
  _emitFileFailedMessage(fileStats, fileTimeElapsed, blockCount) {
    this._emitMessage(
      `failed file ${this._fileName} over ${fileTimeElapsed}ms. ${fileStats.blocksFailed} blocks and ${fileStats.assertionsFailed} failed. ${blockCount - fileStats.blocksFailed} blocks and ${fileStats.assertionsPassed} assertions passed`
    )
  }
}
class TestRacer {
  constructor(fileTestTree) {
    this._logFunction = console.log
    this._timer = new TreeUtils.Timer()
    this._sessionFilesPassed = 0
    this._sessionFilesFailed = {}
    this._sessionBlocksFailed = 0
    this._sessionBlocksPassed = 0
    this._sessionAssertionsFailed = 0
    this._sessionAssertionsPassed = 0
    this._fileTestTree = {}
    Object.keys(fileTestTree).forEach(fileName => {
      this._fileTestTree[fileName] = new TestRacerFile(this, fileTestTree[fileName], fileName)
    })
  }
  setLogFunction(logFunction) {
    this._logFunction = logFunction
    return this
  }
  _addFileResultsToSessionResults(fileStats, fileName) {
    this._sessionAssertionsPassed += fileStats.assertionsPassed
    this._sessionAssertionsFailed += fileStats.assertionsFailed
    this._sessionBlocksPassed += fileStats.blocksPassed
    this._sessionBlocksFailed += fileStats.blocksFailed
    if (!fileStats.blocksFailed) this._sessionFilesPassed++
    else {
      this._sessionFilesFailed[fileName] = fileStats.failedBlocks
    }
  }
  async execute() {
    this._emitSessionPlanMessage()
    const proms = Object.values(this._fileTestTree).map(async testFile => {
      const results = await testFile.execute()
      this._addFileResultsToSessionResults(results, testFile.getFileName())
    })
    await Promise.all(proms)
    return this
  }
  finish() {
    return this._emitSessionFinishMessage()
  }
  _emitMessage(message) {
    this._logFunction(message)
    return message
  }
  get length() {
    return Object.values(this._fileTestTree).length
  }
  _emitSessionPlanMessage() {
    let blocks = 0
    Object.values(this._fileTestTree).forEach(value => (blocks += value.length))
    this._emitMessage(`${this.length} files and ${blocks} blocks to run. ${this._getSkippedBlockNames().length} skipped blocks.`)
  }
  _getSkippedBlockNames() {
    const skippedBlocks = []
    Object.values(this._fileTestTree).forEach(file => {
      file.skippedTestBlockNames.forEach(blockName => {
        skippedBlocks.push(blockName)
      })
    })
    return skippedBlocks
  }
  _getFailures() {
    if (!Object.keys(this._sessionFilesFailed).length) return ""
    return `
 failures
${new TreeNode(this._sessionFilesFailed).forEach(row => row.forEach(line => line.deleteWordAt(0))).toString(2)}`
  }
  _emitSessionFinishMessage() {
    const skipped = this._getSkippedBlockNames()
    return this._emitMessage(`finished in ${this._timer.getTotalElapsedTime()}ms
 skipped
  ${skipped.length} blocks${skipped ? " " + skipped.join(" ") : ""}
 passed
  ${this._sessionFilesPassed} files
  ${this._sessionBlocksPassed} blocks
  ${this._sessionAssertionsPassed} assertions
 failed
  ${Object.keys(this._sessionFilesFailed).length} files
  ${this._sessionBlocksFailed} blocks
  ${this._sessionAssertionsFailed} assertions${this._getFailures()}`)
  }
  static async testSingleFile(fileName, testTree) {
    const obj = {}
    obj[fileName] = testTree
    const session = new TestRacer(obj)
    await session.execute()
    session.finish()
  }
}
window.TestRacer = TestRacer
let _jtreeLatestTime = 0
let _jtreeMinTimeIncrement = 0.000000000001
class AbstractNode {
  _getProcessTimeInMilliseconds() {
    // We add this loop to restore monotonically increasing .now():
    // https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
    let time = performance.now()
    while (time <= _jtreeLatestTime) {
      if (time === time + _jtreeMinTimeIncrement)
        // Some browsers have different return values for perf.now()
        _jtreeMinTimeIncrement = 10 * _jtreeMinTimeIncrement
      time += _jtreeMinTimeIncrement
    }
    _jtreeLatestTime = time
    return time
  }
}
var FileFormat
;(function(FileFormat) {
  FileFormat["csv"] = "csv"
  FileFormat["tsv"] = "tsv"
  FileFormat["tree"] = "tree"
})(FileFormat || (FileFormat = {}))
class AbstractTreeEvent {
  constructor(targetNode) {
    this.targetNode = targetNode
  }
}
class ChildAddedTreeEvent extends AbstractTreeEvent {}
class ChildRemovedTreeEvent extends AbstractTreeEvent {}
class DescendantChangedTreeEvent extends AbstractTreeEvent {}
class LineChangedTreeEvent extends AbstractTreeEvent {}
class TreeWord {
  constructor(node, cellIndex) {
    this._node = node
    this._cellIndex = cellIndex
  }
  replace(newWord) {
    this._node.setWord(this._cellIndex, newWord)
  }
  get word() {
    return this._node.getWord(this._cellIndex)
  }
}
const TreeEvents = { ChildAddedTreeEvent, ChildRemovedTreeEvent, DescendantChangedTreeEvent, LineChangedTreeEvent }
var WhereOperators
;(function(WhereOperators) {
  WhereOperators["equal"] = "="
  WhereOperators["notEqual"] = "!="
  WhereOperators["lessThan"] = "<"
  WhereOperators["lessThanOrEqual"] = "<="
  WhereOperators["greaterThan"] = ">"
  WhereOperators["greaterThanOrEqual"] = ">="
  WhereOperators["includes"] = "includes"
  WhereOperators["doesNotInclude"] = "doesNotInclude"
  WhereOperators["in"] = "in"
  WhereOperators["notIn"] = "notIn"
  WhereOperators["empty"] = "empty"
  WhereOperators["notEmpty"] = "notEmpty"
})(WhereOperators || (WhereOperators = {}))
var TreeNotationConstants
;(function(TreeNotationConstants) {
  TreeNotationConstants["extends"] = "extends"
})(TreeNotationConstants || (TreeNotationConstants = {}))
class Parser {
  constructor(catchAllNodeConstructor, firstWordMap = {}, regexTests = undefined) {
    this._catchAllNodeConstructor = catchAllNodeConstructor
    this._firstWordMap = new Map(Object.entries(firstWordMap))
    this._regexTests = regexTests
  }
  getFirstWordOptions() {
    return Array.from(this._getFirstWordMap().keys())
  }
  // todo: remove
  _getFirstWordMap() {
    return this._firstWordMap
  }
  // todo: remove
  _getFirstWordMapAsObject() {
    let obj = {}
    const map = this._getFirstWordMap()
    for (let [key, val] of map.entries()) {
      obj[key] = val
    }
    return obj
  }
  _getNodeConstructor(line, contextNode, wordBreakSymbol = " ") {
    return this._getFirstWordMap().get(this._getFirstWord(line, wordBreakSymbol)) || this._getConstructorFromRegexTests(line) || this._getCatchAllNodeConstructor(contextNode)
  }
  _getCatchAllNodeConstructor(contextNode) {
    if (this._catchAllNodeConstructor) return this._catchAllNodeConstructor
    const parent = contextNode.getParent()
    if (parent) return parent._getParser()._getCatchAllNodeConstructor(parent)
    return contextNode.constructor
  }
  _getConstructorFromRegexTests(line) {
    if (!this._regexTests) return undefined
    const hit = this._regexTests.find(test => test.regex.test(line))
    if (hit) return hit.nodeConstructor
    return undefined
  }
  _getFirstWord(line, wordBreakSymbol) {
    const firstBreak = line.indexOf(wordBreakSymbol)
    return line.substr(0, firstBreak > -1 ? firstBreak : undefined)
  }
}
class TreeNode extends AbstractNode {
  constructor(children, line, parent) {
    super()
    // BEGIN MUTABLE METHODS BELOw
    this._nodeCreationTime = this._getProcessTimeInMilliseconds()
    this._parent = parent
    this._setLine(line)
    this._setChildren(children)
  }
  execute() {}
  async loadRequirements(context) {
    // todo: remove
    await Promise.all(this.map(node => node.loadRequirements(context)))
  }
  getErrors() {
    return []
  }
  getLineCellTypes() {
    // todo: make this any a constant
    return "undefinedCellType ".repeat(this.getWords().length).trim()
  }
  isNodeJs() {
    return typeof exports !== "undefined"
  }
  isBrowser() {
    return !this.isNodeJs()
  }
  getOlderSiblings() {
    if (this.isRoot()) return []
    return this.getParent().slice(0, this.getIndex())
  }
  _getClosestOlderSibling() {
    const olderSiblings = this.getOlderSiblings()
    return olderSiblings[olderSiblings.length - 1]
  }
  getYoungerSiblings() {
    if (this.isRoot()) return []
    return this.getParent().slice(this.getIndex() + 1)
  }
  getSiblings() {
    if (this.isRoot()) return []
    return this.getParent().filter(node => node !== this)
  }
  _getUid() {
    if (!this._uid) this._uid = TreeNode._makeUniqueId()
    return this._uid
  }
  // todo: rename getMother? grandMother et cetera?
  getParent() {
    return this._parent
  }
  getIndentLevel(relativeTo) {
    return this._getIndentLevel(relativeTo)
  }
  getIndentation(relativeTo) {
    const indentLevel = this._getIndentLevel(relativeTo) - 1
    if (indentLevel < 0) return ""
    return this.getEdgeSymbol().repeat(indentLevel)
  }
  _getTopDownArray(arr) {
    this.forEach(child => {
      arr.push(child)
      child._getTopDownArray(arr)
    })
  }
  getTopDownArray() {
    const arr = []
    this._getTopDownArray(arr)
    return arr
  }
  *getTopDownArrayIterator() {
    for (let child of this.getChildren()) {
      yield child
      yield* child.getTopDownArrayIterator()
    }
  }
  nodeAtLine(lineNumber) {
    let index = 0
    for (let node of this.getTopDownArrayIterator()) {
      if (lineNumber === index) return node
      index++
    }
  }
  getNumberOfLines() {
    let lineCount = 0
    for (let node of this.getTopDownArrayIterator()) {
      lineCount++
    }
    return lineCount
  }
  _getMaxUnitsOnALine() {
    let max = 0
    for (let node of this.getTopDownArrayIterator()) {
      const count = node.getWords().length + node.getIndentLevel()
      if (count > max) max = count
    }
    return max
  }
  getNumberOfWords() {
    let wordCount = 0
    for (let node of this.getTopDownArrayIterator()) {
      wordCount += node.getWords().length
    }
    return wordCount
  }
  getLineNumber() {
    return this._getLineNumberRelativeTo()
  }
  _getLineNumber(target = this) {
    if (this._cachedLineNumber) return this._cachedLineNumber
    let lineNumber = 1
    for (let node of this.getRootNode().getTopDownArrayIterator()) {
      if (node === target) return lineNumber
      lineNumber++
    }
    return lineNumber
  }
  isBlankLine() {
    return !this.length && !this.getLine()
  }
  hasDuplicateFirstWords() {
    return this.length ? new Set(this.getFirstWords()).size !== this.length : false
  }
  isEmpty() {
    return !this.length && !this.getContent()
  }
  _getLineNumberRelativeTo(relativeTo) {
    if (this.isRoot(relativeTo)) return 0
    const start = relativeTo || this.getRootNode()
    return start._getLineNumber(this)
  }
  isRoot(relativeTo) {
    return relativeTo === this || !this.getParent()
  }
  getRootNode() {
    return this._getRootNode()
  }
  _getRootNode(relativeTo) {
    if (this.isRoot(relativeTo)) return this
    return this.getParent()._getRootNode(relativeTo)
  }
  toString(indentCount = 0, language = this) {
    if (this.isRoot()) return this._childrenToString(indentCount, language)
    return language.getEdgeSymbol().repeat(indentCount) + this.getLine(language) + (this.length ? language.getNodeBreakSymbol() + this._childrenToString(indentCount + 1, language) : "")
  }
  printLinesFrom(start, quantity) {
    return this._printLinesFrom(start, quantity, false)
  }
  printLinesWithLineNumbersFrom(start, quantity) {
    return this._printLinesFrom(start, quantity, true)
  }
  _printLinesFrom(start, quantity, printLineNumbers) {
    // todo: use iterator for better perf?
    const end = start + quantity
    this.toString()
      .split("\n")
      .slice(start, end)
      .forEach((line, index) => {
        if (printLineNumbers) console.log(`${start + index} ${line}`)
        else console.log(line)
      })
    return this
  }
  getWord(index) {
    const words = this._getWords(0)
    if (index < 0) index = words.length + index
    return words[index]
  }
  _toHtml(indentCount) {
    const path = this.getPathVector().join(" ")
    const classes = {
      nodeLine: "nodeLine",
      edgeSymbol: "edgeSymbol",
      nodeBreakSymbol: "nodeBreakSymbol",
      nodeChildren: "nodeChildren"
    }
    const edge = this.getEdgeSymbol().repeat(indentCount)
    // Set up the firstWord part of the node
    const edgeHtml = `<span class="${classes.nodeLine}" data-pathVector="${path}"><span class="${classes.edgeSymbol}">${edge}</span>`
    const lineHtml = this._getLineHtml()
    const childrenHtml = this.length ? `<span class="${classes.nodeBreakSymbol}">${this.getNodeBreakSymbol()}</span>` + `<span class="${classes.nodeChildren}">${this._childrenToHtml(indentCount + 1)}</span>` : ""
    return `${edgeHtml}${lineHtml}${childrenHtml}</span>`
  }
  _getWords(startFrom) {
    if (!this._words) this._words = this._getLine().split(this.getWordBreakSymbol())
    return startFrom ? this._words.slice(startFrom) : this._words
  }
  getWords() {
    return this._getWords(0)
  }
  doesExtend(nodeTypeId) {
    return false
  }
  require(moduleName, filePath) {
    if (!this.isNodeJs()) return window[moduleName]
    return require(filePath || moduleName)
  }
  getWordsFrom(startFrom) {
    return this._getWords(startFrom)
  }
  getFirstAncestor() {
    const parent = this.getParent()
    return parent.isRoot() ? this : parent.getFirstAncestor()
  }
  isLoaded() {
    return true
  }
  getRunTimePhaseErrors() {
    if (!this._runTimePhaseErrors) this._runTimePhaseErrors = {}
    return this._runTimePhaseErrors
  }
  setRunTimePhaseError(phase, errorObject) {
    if (errorObject === undefined) delete this.getRunTimePhaseErrors()[phase]
    else this.getRunTimePhaseErrors()[phase] = errorObject
    return this
  }
  _getJavascriptPrototypeChainUpTo(stopAtClassName = "TreeNode") {
    // todo: cross browser test this
    let constructor = this.constructor
    const chain = []
    while (constructor.name !== stopAtClassName) {
      chain.unshift(constructor.name)
      constructor = constructor.__proto__
    }
    chain.unshift(stopAtClassName)
    return chain
  }
  _getProjectRootDir() {
    return this.isRoot() ? "" : this.getRootNode()._getProjectRootDir()
  }
  getSparsity() {
    const nodes = this.getChildren()
    const fields = this._getUnionNames()
    let count = 0
    this.getChildren().forEach(node => {
      fields.forEach(field => {
        if (node.has(field)) count++
      })
    })
    return 1 - count / (nodes.length * fields.length)
  }
  // todo: rename. what is the proper term from set/cat theory?
  getBiDirectionalMaps(propertyNameOrFn, propertyNameOrFn2 = node => node.getWord(0)) {
    const oneToTwo = {}
    const twoToOne = {}
    const is1Str = typeof propertyNameOrFn === "string"
    const is2Str = typeof propertyNameOrFn2 === "string"
    const children = this.getChildren()
    this.forEach((node, index) => {
      const value1 = is1Str ? node.get(propertyNameOrFn) : propertyNameOrFn(node, index, children)
      const value2 = is2Str ? node.get(propertyNameOrFn2) : propertyNameOrFn2(node, index, children)
      if (value1 !== undefined) {
        if (!oneToTwo[value1]) oneToTwo[value1] = []
        oneToTwo[value1].push(value2)
      }
      if (value2 !== undefined) {
        if (!twoToOne[value2]) twoToOne[value2] = []
        twoToOne[value2].push(value1)
      }
    })
    return [oneToTwo, twoToOne]
  }
  _getWordIndexCharacterStartPosition(wordIndex) {
    const xiLength = this.getEdgeSymbol().length
    const numIndents = this._getIndentLevel(undefined) - 1
    const indentPosition = xiLength * numIndents
    if (wordIndex < 1) return xiLength * (numIndents + wordIndex)
    return (
      indentPosition +
      this.getWords()
        .slice(0, wordIndex)
        .join(this.getWordBreakSymbol()).length +
      this.getWordBreakSymbol().length
    )
  }
  getNodeInScopeAtCharIndex(charIndex) {
    if (this.isRoot()) return this
    let wordIndex = this.getWordIndexAtCharacterIndex(charIndex)
    if (wordIndex > 0) return this
    let node = this
    while (wordIndex < 1) {
      node = node.getParent()
      wordIndex++
    }
    return node
  }
  getWordProperties(wordIndex) {
    const start = this._getWordIndexCharacterStartPosition(wordIndex)
    const word = wordIndex < 0 ? "" : this.getWord(wordIndex)
    return {
      startCharIndex: start,
      endCharIndex: start + word.length,
      word: word
    }
  }
  fill(fill = "") {
    this.getTopDownArray().forEach(line => {
      line.getWords().forEach((word, index) => {
        line.setWord(index, fill)
      })
    })
    return this
  }
  getAllWordBoundaryCoordinates() {
    const coordinates = []
    let lineIndex = 0
    for (let node of this.getTopDownArrayIterator()) {
      node.getWordBoundaryCharIndices().forEach((charIndex, wordIndex) => {
        coordinates.push({
          lineIndex: lineIndex,
          charIndex: charIndex,
          wordIndex: wordIndex
        })
      })
      lineIndex++
    }
    return coordinates
  }
  getWordBoundaryCharIndices() {
    let indentLevel = this._getIndentLevel()
    const wordBreakSymbolLength = this.getWordBreakSymbol().length
    let elapsed = indentLevel
    return this.getWords().map((word, wordIndex) => {
      const boundary = elapsed
      elapsed += word.length + wordBreakSymbolLength
      return boundary
    })
  }
  getWordIndexAtCharacterIndex(charIndex) {
    // todo: is this correct thinking for handling root?
    if (this.isRoot()) return 0
    const numberOfIndents = this._getIndentLevel(undefined) - 1
    // todo: probably want to rewrite this in a performant way.
    const spots = []
    while (spots.length < numberOfIndents) {
      spots.push(-(numberOfIndents - spots.length))
    }
    this.getWords().forEach((word, wordIndex) => {
      word.split("").forEach(letter => {
        spots.push(wordIndex)
      })
      spots.push(wordIndex)
    })
    return spots[charIndex]
  }
  // Note: This currently does not return any errors resulting from "required" or "single"
  getAllErrors(lineStartsAt = 1) {
    const errors = []
    for (let node of this.getTopDownArray()) {
      node._cachedLineNumber = lineStartsAt // todo: cleanup
      const errs = node.getErrors()
      errs.forEach(err => errors.push(err))
      // delete node._cachedLineNumber
      lineStartsAt++
    }
    return errors
  }
  *getAllErrorsIterator() {
    let line = 1
    for (let node of this.getTopDownArrayIterator()) {
      node._cachedLineNumber = line
      const errs = node.getErrors()
      // delete node._cachedLineNumber
      if (errs.length) yield errs
      line++
    }
  }
  getFirstWord() {
    return this.getWords()[0]
  }
  getContent() {
    const words = this.getWordsFrom(1)
    return words.length ? words.join(this.getWordBreakSymbol()) : undefined
  }
  getContentWithChildren() {
    // todo: deprecate
    const content = this.getContent()
    return (content ? content : "") + (this.length ? this.getNodeBreakSymbol() + this._childrenToString() : "")
  }
  getFirstNode() {
    return this.nodeAt(0)
  }
  getStack() {
    return this._getStack()
  }
  _getStack(relativeTo) {
    if (this.isRoot(relativeTo)) return []
    const parent = this.getParent()
    if (parent.isRoot(relativeTo)) return [this]
    else return parent._getStack(relativeTo).concat([this])
  }
  getStackString() {
    return this._getStack()
      .map((node, index) => this.getEdgeSymbol().repeat(index) + node.getLine())
      .join(this.getNodeBreakSymbol())
  }
  getLine(language) {
    if (!this._words && !language) return this._getLine() // todo: how does this interact with "language" param?
    return this.getWords().join((language || this).getWordBreakSymbol())
  }
  getColumnNames() {
    return this._getUnionNames()
  }
  getOneHot(column) {
    const clone = this.clone()
    const cols = Array.from(new Set(clone.getColumn(column)))
    clone.forEach(node => {
      const val = node.get(column)
      node.delete(column)
      cols.forEach(col => {
        node.set(column + "_" + col, val === col ? "1" : "0")
      })
    })
    return clone
  }
  // todo: return array? getPathArray?
  _getFirstWordPath(relativeTo) {
    if (this.isRoot(relativeTo)) return ""
    else if (this.getParent().isRoot(relativeTo)) return this.getFirstWord()
    return this.getParent()._getFirstWordPath(relativeTo) + this.getEdgeSymbol() + this.getFirstWord()
  }
  getFirstWordPathRelativeTo(relativeTo) {
    return this._getFirstWordPath(relativeTo)
  }
  getFirstWordPath() {
    return this._getFirstWordPath()
  }
  getPathVector() {
    return this._getPathVector()
  }
  getPathVectorRelativeTo(relativeTo) {
    return this._getPathVector(relativeTo)
  }
  _getPathVector(relativeTo) {
    if (this.isRoot(relativeTo)) return []
    const path = this.getParent()._getPathVector(relativeTo)
    path.push(this.getIndex())
    return path
  }
  getIndex() {
    return this.getParent()._indexOfNode(this)
  }
  isTerminal() {
    return !this.length
  }
  _getLineHtml() {
    return this.getWords()
      .map((word, index) => `<span class="word${index}">${TreeUtils.stripHtml(word)}</span>`)
      .join(`<span class="zIncrement">${this.getWordBreakSymbol()}</span>`)
  }
  _getXmlContent(indentCount) {
    if (this.getContent() !== undefined) return this.getContentWithChildren()
    return this.length ? `${indentCount === -1 ? "" : "\n"}${this._childrenToXml(indentCount > -1 ? indentCount + 2 : -1)}${" ".repeat(indentCount)}` : ""
  }
  _toXml(indentCount) {
    const indent = " ".repeat(indentCount)
    const tag = this.getFirstWord()
    return `${indent}<${tag}>${this._getXmlContent(indentCount)}</${tag}>${indentCount === -1 ? "" : "\n"}`
  }
  _toObjectTuple() {
    const content = this.getContent()
    const length = this.length
    const hasChildrenNoContent = content === undefined && length
    const hasContentAndHasChildren = content !== undefined && length
    // If the node has a content and a subtree return it as a string, as
    // Javascript object values can't be both a leaf and a tree.
    const tupleValue = hasChildrenNoContent ? this.toObject() : hasContentAndHasChildren ? this.getContentWithChildren() : content
    return [this.getFirstWord(), tupleValue]
  }
  _indexOfNode(needleNode) {
    let result = -1
    this.find((node, index) => {
      if (node === needleNode) {
        result = index
        return true
      }
    })
    return result
  }
  getMaxLineWidth() {
    let maxWidth = 0
    for (let node of this.getTopDownArrayIterator()) {
      const lineWidth = node.getLine().length
      if (lineWidth > maxWidth) maxWidth = lineWidth
    }
    return maxWidth
  }
  toTreeNode() {
    return new TreeNode(this.toString())
  }
  _rightPad(newWidth, padCharacter) {
    const line = this.getLine()
    this.setLine(line + padCharacter.repeat(newWidth - line.length))
    return this
  }
  rightPad(padCharacter = " ") {
    const newWidth = this.getMaxLineWidth()
    this.getTopDownArray().forEach(node => node._rightPad(newWidth, padCharacter))
    return this
  }
  lengthen(numberOfLines) {
    let linesToAdd = numberOfLines - this.getNumberOfLines()
    while (linesToAdd > 0) {
      this.appendLine("")
      linesToAdd--
    }
    return this
  }
  toSideBySide(treesOrStrings, delimiter = " ") {
    treesOrStrings = treesOrStrings.map(tree => (tree instanceof TreeNode ? tree : new TreeNode(tree)))
    const clone = this.toTreeNode()
    const nodeBreakSymbol = "\n"
    let next
    while ((next = treesOrStrings.shift())) {
      clone.lengthen(next.getNumberOfLines())
      clone.rightPad()
      next
        .toString()
        .split(nodeBreakSymbol)
        .forEach((line, index) => {
          const node = clone.nodeAtLine(index)
          node.setLine(node.getLine() + delimiter + line)
        })
    }
    return clone
  }
  toComparison(treeNode) {
    const nodeBreakSymbol = "\n"
    const lines = treeNode.toString().split(nodeBreakSymbol)
    return new TreeNode(
      this.toString()
        .split(nodeBreakSymbol)
        .map((line, index) => (lines[index] === line ? "" : "x"))
        .join(nodeBreakSymbol)
    )
  }
  toBraid(treesOrStrings) {
    treesOrStrings.unshift(this)
    const nodeDelimiter = this.getNodeBreakSymbol()
    return new TreeNode(
      TreeUtils.interweave(treesOrStrings.map(tree => tree.toString().split(nodeDelimiter)))
        .map(line => (line === undefined ? "" : line))
        .join(nodeDelimiter)
    )
  }
  getSlice(startIndexInclusive, stopIndexExclusive) {
    return new TreeNode(
      this.slice(startIndexInclusive, stopIndexExclusive)
        .map(child => child.toString())
        .join("\n")
    )
  }
  _hasColumns(columns) {
    const words = this.getWords()
    return columns.every((searchTerm, index) => searchTerm === words[index])
  }
  hasWord(index, word) {
    return this.getWord(index) === word
  }
  getNodeByColumns(...columns) {
    return this.getTopDownArray().find(node => node._hasColumns(columns))
  }
  getNodeByColumn(index, name) {
    return this.find(node => node.getWord(index) === name)
  }
  _getNodesByColumn(index, name) {
    return this.filter(node => node.getWord(index) === name)
  }
  // todo: preserve subclasses!
  select(columnNames) {
    columnNames = Array.isArray(columnNames) ? columnNames : [columnNames]
    const result = new TreeNode()
    this.forEach(node => {
      const tree = result.appendLine(node.getLine())
      columnNames.forEach(name => {
        const valueNode = node.getNode(name)
        if (valueNode) tree.appendNode(valueNode)
      })
    })
    return result
  }
  selectionToString() {
    return this.getSelectedNodes()
      .map(node => node.toString())
      .join("\n")
  }
  getSelectedNodes() {
    return this.getTopDownArray().filter(node => node.isSelected())
  }
  clearSelection() {
    this.getSelectedNodes().forEach(node => node.unselectNode())
  }
  // Note: this is for debugging select chains
  print(message = "") {
    if (message) console.log(message)
    console.log(this.toString())
    return this
  }
  // todo: preserve subclasses!
  // todo: preserve links back to parent so you could edit as normal?
  where(columnName, operator, fixedValue) {
    const isArray = Array.isArray(fixedValue)
    const valueType = isArray ? typeof fixedValue[0] : typeof fixedValue
    let parser
    if (valueType === "number") parser = parseFloat
    const fn = node => {
      const cell = node.get(columnName)
      const typedCell = parser ? parser(cell) : cell
      if (operator === WhereOperators.equal) return fixedValue === typedCell
      else if (operator === WhereOperators.notEqual) return fixedValue !== typedCell
      else if (operator === WhereOperators.includes) return typedCell !== undefined && typedCell.includes(fixedValue)
      else if (operator === WhereOperators.doesNotInclude) return typedCell === undefined || !typedCell.includes(fixedValue)
      else if (operator === WhereOperators.greaterThan) return typedCell > fixedValue
      else if (operator === WhereOperators.lessThan) return typedCell < fixedValue
      else if (operator === WhereOperators.greaterThanOrEqual) return typedCell >= fixedValue
      else if (operator === WhereOperators.lessThanOrEqual) return typedCell <= fixedValue
      else if (operator === WhereOperators.empty) return !node.has(columnName)
      else if (operator === WhereOperators.notEmpty) return node.has(columnName) || (cell !== "" && cell !== undefined)
      else if (operator === WhereOperators.in && isArray) return fixedValue.includes(typedCell)
      else if (operator === WhereOperators.notIn && isArray) return !fixedValue.includes(typedCell)
    }
    const result = new TreeNode()
    this.filter(fn).forEach(node => {
      result.appendNode(node)
    })
    return result
  }
  with(firstWord) {
    return this.filter(node => node.has(firstWord))
  }
  without(firstWord) {
    return this.filter(node => !node.has(firstWord))
  }
  first(quantity = 1) {
    return this.limit(quantity, 0)
  }
  last(quantity = 1) {
    return this.limit(quantity, this.length - quantity)
  }
  // todo: preserve subclasses!
  limit(quantity, offset = 0) {
    const result = new TreeNode()
    this.getChildren()
      .slice(offset, quantity + offset)
      .forEach(node => {
        result.appendNode(node)
      })
    return result
  }
  getChildrenFirstArray() {
    const arr = []
    this._getChildrenFirstArray(arr)
    return arr
  }
  _getChildrenFirstArray(arr) {
    this.forEach(child => {
      child._getChildrenFirstArray(arr)
      arr.push(child)
    })
  }
  _getIndentLevel(relativeTo) {
    return this._getStack(relativeTo).length
  }
  getParentFirstArray() {
    const levels = this._getLevels()
    const arr = []
    Object.values(levels).forEach(level => {
      level.forEach(item => arr.push(item))
    })
    return arr
  }
  _getLevels() {
    const levels = {}
    this.getTopDownArray().forEach(node => {
      const level = node._getIndentLevel()
      if (!levels[level]) levels[level] = []
      levels[level].push(node)
    })
    return levels
  }
  _getChildrenArray() {
    if (!this._children) this._children = []
    return this._children
  }
  getLines() {
    return this.map(node => node.getLine())
  }
  getChildren() {
    return this._getChildrenArray().slice(0)
  }
  get length() {
    return this._getChildrenArray().length
  }
  _nodeAt(index) {
    if (index < 0) index = this.length + index
    return this._getChildrenArray()[index]
  }
  nodeAt(indexOrIndexArray) {
    if (typeof indexOrIndexArray === "number") return this._nodeAt(indexOrIndexArray)
    if (indexOrIndexArray.length === 1) return this._nodeAt(indexOrIndexArray[0])
    const first = indexOrIndexArray[0]
    const node = this._nodeAt(first)
    if (!node) return undefined
    return node.nodeAt(indexOrIndexArray.slice(1))
  }
  _toObject() {
    const obj = {}
    this.forEach(node => {
      const tuple = node._toObjectTuple()
      obj[tuple[0]] = tuple[1]
    })
    return obj
  }
  toHtml() {
    return this._childrenToHtml(0)
  }
  _toHtmlCubeLine(indents = 0, lineIndex = 0, planeIndex = 0) {
    const getLine = (cellIndex, word = "") =>
      `<span class="htmlCubeSpan" style="top: calc(var(--topIncrement) * ${planeIndex} + var(--rowHeight) * ${lineIndex}); left:calc(var(--leftIncrement) * ${planeIndex} + var(--cellWidth) * ${cellIndex});">${word}</span>`
    let cells = []
    this.getWords().forEach((word, index) => (word ? cells.push(getLine(index + indents, word)) : ""))
    return cells.join("")
  }
  toHtmlCube() {
    return this.map((plane, planeIndex) =>
      plane
        .getTopDownArray()
        .map((line, lineIndex) => line._toHtmlCubeLine(line.getIndentLevel() - 2, lineIndex, planeIndex))
        .join("")
    ).join("")
  }
  _getHtmlJoinByCharacter() {
    return `<span class="nodeBreakSymbol">${this.getNodeBreakSymbol()}</span>`
  }
  _childrenToHtml(indentCount) {
    const joinBy = this._getHtmlJoinByCharacter()
    return this.map(node => node._toHtml(indentCount)).join(joinBy)
  }
  _childrenToString(indentCount, language = this) {
    return this.map(node => node.toString(indentCount, language)).join(language.getNodeBreakSymbol())
  }
  childrenToString(indentCount = 0) {
    return this._childrenToString(indentCount)
  }
  // todo: implement
  _getChildJoinCharacter() {
    return "\n"
  }
  format() {
    this.forEach(child => child.format())
    return this
  }
  compile() {
    return this.map(child => child.compile()).join(this._getChildJoinCharacter())
  }
  toXml() {
    return this._childrenToXml(0)
  }
  toDisk(path) {
    if (!this.isNodeJs()) throw new Error("This method only works in Node.js")
    const format = TreeNode._getFileFormat(path)
    const formats = {
      tree: tree => tree.toString(),
      csv: tree => tree.toCsv(),
      tsv: tree => tree.toTsv()
    }
    this.require("fs").writeFileSync(path, formats[format](this), "utf8")
    return this
  }
  _lineToYaml(indentLevel, listTag = "") {
    let prefix = " ".repeat(indentLevel)
    if (listTag && indentLevel > 1) prefix = " ".repeat(indentLevel - 2) + listTag + " "
    return prefix + `${this.getFirstWord()}:` + (this.getContent() ? " " + this.getContent() : "")
  }
  _isYamlList() {
    return this.hasDuplicateFirstWords()
  }
  toYaml() {
    return `%YAML 1.2
---\n${this._childrenToYaml(0).join("\n")}`
  }
  _childrenToYaml(indentLevel) {
    if (this._isYamlList()) return this._childrenToYamlList(indentLevel)
    else return this._childrenToYamlAssociativeArray(indentLevel)
  }
  // if your code-to-be-yaml has a list of associative arrays of type N and you don't
  // want the type N to print
  _collapseYamlLine() {
    return false
  }
  _toYamlListElement(indentLevel) {
    const children = this._childrenToYaml(indentLevel + 1)
    if (this._collapseYamlLine()) {
      if (indentLevel > 1) return children.join("\n").replace(" ".repeat(indentLevel), " ".repeat(indentLevel - 2) + "- ")
      return children.join("\n")
    } else {
      children.unshift(this._lineToYaml(indentLevel, "-"))
      return children.join("\n")
    }
  }
  _childrenToYamlList(indentLevel) {
    return this.map(node => node._toYamlListElement(indentLevel + 2))
  }
  _toYamlAssociativeArrayElement(indentLevel) {
    const children = this._childrenToYaml(indentLevel + 1)
    children.unshift(this._lineToYaml(indentLevel))
    return children.join("\n")
  }
  _childrenToYamlAssociativeArray(indentLevel) {
    return this.map(node => node._toYamlAssociativeArrayElement(indentLevel))
  }
  toJsonSubset() {
    return JSON.stringify(this.toObject(), null, " ")
  }
  _toObjectForSerialization() {
    return this.length
      ? {
          cells: this.getWords(),
          children: this.map(child => child._toObjectForSerialization())
        }
      : {
          cells: this.getWords()
        }
  }
  toJson() {
    return JSON.stringify({ children: this.map(child => child._toObjectForSerialization()) }, null, " ")
  }
  toGrid() {
    const WordBreakSymbol = this.getWordBreakSymbol()
    return this.toString()
      .split(this.getNodeBreakSymbol())
      .map(line => line.split(WordBreakSymbol))
  }
  toGridJson() {
    return JSON.stringify(this.toGrid(), null, 2)
  }
  findNodes(firstWordPath) {
    // todo: can easily speed this up
    const map = {}
    if (!Array.isArray(firstWordPath)) firstWordPath = [firstWordPath]
    firstWordPath.forEach(path => (map[path] = true))
    return this.getTopDownArray().filter(node => {
      if (map[node._getFirstWordPath(this)]) return true
      return false
    })
  }
  evalTemplateString(str) {
    const that = this
    return str.replace(/{([^\}]+)}/g, (match, path) => that.get(path) || "")
  }
  emitLogMessage(message) {
    console.log(message)
  }
  getColumn(path) {
    return this.map(node => node.get(path))
  }
  getFiltered(fn) {
    const clone = this.clone()
    clone
      .filter((node, index) => !fn(node, index))
      .forEach(node => {
        node.destroy()
      })
    return clone
  }
  getNode(firstWordPath) {
    return this._getNodeByPath(firstWordPath)
  }
  getFrom(prefix) {
    const hit = this.filter(node => node.getLine().startsWith(prefix))[0]
    if (hit) return hit.getLine().substr((prefix + this.getWordBreakSymbol()).length)
  }
  get(firstWordPath) {
    const node = this._getNodeByPath(firstWordPath)
    return node === undefined ? undefined : node.getContent()
  }
  getOneOf(keys) {
    for (let i = 0; i < keys.length; i++) {
      const value = this.get(keys[i])
      if (value) return value
    }
    return ""
  }
  // move to treenode
  pick(fields) {
    const newTree = new TreeNode(this.toString()) // todo: why not clone?
    const map = TreeUtils.arrayToMap(fields)
    newTree.nodeAt(0).forEach(node => {
      if (!map[node.getWord(0)]) node.destroy()
    })
    return newTree
  }
  getNodesByGlobPath(query) {
    return this._getNodesByGlobPath(query)
  }
  _getNodesByGlobPath(globPath) {
    const edgeSymbol = this.getEdgeSymbol()
    if (!globPath.includes(edgeSymbol)) {
      if (globPath === "*") return this.getChildren()
      return this.filter(node => node.getFirstWord() === globPath)
    }
    const parts = globPath.split(edgeSymbol)
    const current = parts.shift()
    const rest = parts.join(edgeSymbol)
    const matchingNodes = current === "*" ? this.getChildren() : this.filter(child => child.getFirstWord() === current)
    return [].concat.apply([], matchingNodes.map(node => node._getNodesByGlobPath(rest)))
  }
  _getNodeByPath(firstWordPath) {
    const edgeSymbol = this.getEdgeSymbol()
    if (!firstWordPath.includes(edgeSymbol)) {
      const index = this.indexOfLast(firstWordPath)
      return index === -1 ? undefined : this._nodeAt(index)
    }
    const parts = firstWordPath.split(edgeSymbol)
    const current = parts.shift()
    const currentNode = this._getChildrenArray()[this._getIndex()[current]]
    return currentNode ? currentNode._getNodeByPath(parts.join(edgeSymbol)) : undefined
  }
  getNext() {
    if (this.isRoot()) return this
    const index = this.getIndex()
    const parent = this.getParent()
    const length = parent.length
    const next = index + 1
    return next === length ? parent._getChildrenArray()[0] : parent._getChildrenArray()[next]
  }
  getPrevious() {
    if (this.isRoot()) return this
    const index = this.getIndex()
    const parent = this.getParent()
    const length = parent.length
    const prev = index - 1
    return prev === -1 ? parent._getChildrenArray()[length - 1] : parent._getChildrenArray()[prev]
  }
  _getUnionNames() {
    if (!this.length) return []
    const obj = {}
    this.forEach(node => {
      if (!node.length) return undefined
      node.forEach(node => {
        obj[node.getFirstWord()] = 1
      })
    })
    return Object.keys(obj)
  }
  getAncestorNodesByInheritanceViaExtendsKeyword(key) {
    const ancestorNodes = this._getAncestorNodes((node, id) => node._getNodesByColumn(0, id), node => node.get(key), this)
    ancestorNodes.push(this)
    return ancestorNodes
  }
  // Note: as you can probably tell by the name of this method, I don't recommend using this as it will likely be replaced by something better.
  getAncestorNodesByInheritanceViaColumnIndices(thisColumnNumber, extendsColumnNumber) {
    const ancestorNodes = this._getAncestorNodes((node, id) => node._getNodesByColumn(thisColumnNumber, id), node => node.getWord(extendsColumnNumber), this)
    ancestorNodes.push(this)
    return ancestorNodes
  }
  _getAncestorNodes(getPotentialParentNodesByIdFn, getParentIdFn, cannotContainNode) {
    const parentId = getParentIdFn(this)
    if (!parentId) return []
    const potentialParentNodes = getPotentialParentNodesByIdFn(this.getParent(), parentId)
    if (!potentialParentNodes.length) throw new Error(`"${this.getLine()} tried to extend "${parentId}" but "${parentId}" not found.`)
    if (potentialParentNodes.length > 1) throw new Error(`Invalid inheritance family tree. Multiple unique ids found for "${parentId}"`)
    const parentNode = potentialParentNodes[0]
    // todo: detect loops
    if (parentNode === cannotContainNode) throw new Error(`Loop detected between '${this.getLine()}' and '${parentNode.getLine()}'`)
    const ancestorNodes = parentNode._getAncestorNodes(getPotentialParentNodesByIdFn, getParentIdFn, cannotContainNode)
    ancestorNodes.push(parentNode)
    return ancestorNodes
  }
  pathVectorToFirstWordPath(pathVector) {
    const path = pathVector.slice() // copy array
    const names = []
    let node = this
    while (path.length) {
      if (!node) return names
      names.push(node.nodeAt(path[0]).getFirstWord())
      node = node.nodeAt(path.shift())
    }
    return names
  }
  toStringWithLineNumbers() {
    return this.toString()
      .split("\n")
      .map((line, index) => `${index + 1} ${line}`)
      .join("\n")
  }
  toCsv() {
    return this.toDelimited(",")
  }
  _getTypes(header) {
    const matrix = this._getMatrix(header)
    const types = header.map(i => "int")
    matrix.forEach(row => {
      row.forEach((value, index) => {
        const type = types[index]
        if (type === "string") return 1
        if (value === undefined || value === "") return 1
        if (type === "float") {
          if (value.match(/^\-?[0-9]*\.?[0-9]*$/)) return 1
          types[index] = "string"
        }
        if (value.match(/^\-?[0-9]+$/)) return 1
        types[index] = "string"
      })
    })
    return types
  }
  toDataTable(header = this._getUnionNames()) {
    const types = this._getTypes(header)
    const parsers = {
      string: str => str,
      float: parseFloat,
      int: parseInt
    }
    const cellFn = (cellValue, rowIndex, columnIndex) => (rowIndex ? parsers[types[columnIndex]](cellValue) : cellValue)
    const arrays = this._toArrays(header, cellFn)
    arrays.rows.unshift(arrays.header)
    return arrays.rows
  }
  toDelimited(delimiter, header = this._getUnionNames(), escapeSpecialChars = true) {
    const regex = new RegExp(`(\\n|\\"|\\${delimiter})`)
    const cellFn = (str, row, column) => (!str.toString().match(regex) ? str : `"` + str.replace(/\"/g, `""`) + `"`)
    return this._toDelimited(delimiter, header, escapeSpecialChars ? cellFn : str => str)
  }
  _getMatrix(columns) {
    const matrix = []
    this.forEach(child => {
      const row = []
      columns.forEach(col => {
        row.push(child.get(col))
      })
      matrix.push(row)
    })
    return matrix
  }
  _toArrays(header, cellFn) {
    const skipHeaderRow = 1
    const headerArray = header.map((columnName, index) => cellFn(columnName, 0, index))
    const rows = this.map((node, rowNumber) =>
      header.map((columnName, columnIndex) => {
        const childNode = node.getNode(columnName)
        const content = childNode ? childNode.getContentWithChildren() : ""
        return cellFn(content, rowNumber + skipHeaderRow, columnIndex)
      })
    )
    return {
      rows: rows,
      header: headerArray
    }
  }
  _toDelimited(delimiter, header, cellFn) {
    const data = this._toArrays(header, cellFn)
    return data.header.join(delimiter) + "\n" + data.rows.map(row => row.join(delimiter)).join("\n")
  }
  toTable() {
    // Output a table for printing
    return this._toTable(100, false)
  }
  toFormattedTable(maxCharactersPerColumn, alignRight = false) {
    return this._toTable(maxCharactersPerColumn, alignRight)
  }
  _toTable(maxCharactersPerColumn, alignRight = false) {
    const header = this._getUnionNames()
    // Set initial column widths
    const widths = header.map(col => (col.length > maxCharactersPerColumn ? maxCharactersPerColumn : col.length))
    // Expand column widths if needed
    this.forEach(node => {
      if (!node.length) return true
      header.forEach((col, index) => {
        const cellValue = node.get(col)
        if (!cellValue) return true
        const length = cellValue.toString().length
        if (length > widths[index]) widths[index] = length > maxCharactersPerColumn ? maxCharactersPerColumn : length
      })
    })
    const cellFn = (cellText, row, col) => {
      const width = widths[col]
      // Strip newlines in fixedWidth output
      const cellValue = cellText.toString().replace(/\n/g, "\\n")
      const cellLength = cellValue.length
      if (cellLength > width) return cellValue.substr(0, width) + "..."
      const padding = " ".repeat(width - cellLength)
      return alignRight ? padding + cellValue : cellValue + padding
    }
    return this._toDelimited(" ", header, cellFn)
  }
  toSsv() {
    return this.toDelimited(" ")
  }
  toOutline() {
    return this._toOutline(node => node.getLine())
  }
  toMappedOutline(nodeFn) {
    return this._toOutline(nodeFn)
  }
  // Adapted from: https://github.com/notatestuser/treeify.js
  _toOutline(nodeFn) {
    const growBranch = (outlineTreeNode, last, lastStates, nodeFn, callback) => {
      let lastStatesCopy = lastStates.slice(0)
      const node = outlineTreeNode.node
      if (lastStatesCopy.push([outlineTreeNode, last]) && lastStates.length > 0) {
        let line = ""
        // firstWordd on the "was last element" states of whatever we're nested within,
        // we need to append either blankness or a branch to our line
        lastStates.forEach((lastState, idx) => {
          if (idx > 0) line += lastState[1] ? " " : "│"
        })
        // the prefix varies firstWordd on whether the key contains something to show and
        // whether we're dealing with the last element in this collection
        // the extra "-" just makes things stand out more.
        line += (last ? "└" : "├") + nodeFn(node)
        callback(line)
      }
      if (!node) return
      const length = node.length
      let index = 0
      node.forEach(node => {
        let lastKey = ++index === length
        growBranch({ node: node }, lastKey, lastStatesCopy, nodeFn, callback)
      })
    }
    let output = ""
    growBranch({ node: this }, false, [], nodeFn, line => (output += line + "\n"))
    return output
  }
  copyTo(node, index) {
    return node._insertLineAndChildren(this.getLine(), this.childrenToString(), index)
  }
  // Note: Splits using a positive lookahead
  // this.split("foo").join("\n") === this.toString()
  split(firstWord) {
    const constructor = this.constructor
    const NodeBreakSymbol = this.getNodeBreakSymbol()
    const WordBreakSymbol = this.getWordBreakSymbol()
    // todo: cleanup. the escaping is wierd.
    return this.toString()
      .split(new RegExp(`\\${NodeBreakSymbol}(?=${firstWord}(?:${WordBreakSymbol}|\\${NodeBreakSymbol}))`, "g"))
      .map(str => new constructor(str))
  }
  toMarkdownTable() {
    return this.toMarkdownTableAdvanced(this._getUnionNames(), val => val)
  }
  toMarkdownTableAdvanced(columns, formatFn) {
    const matrix = this._getMatrix(columns)
    const empty = columns.map(col => "-")
    matrix.unshift(empty)
    matrix.unshift(columns)
    const lines = matrix.map((row, rowIndex) => {
      const formattedValues = row.map((val, colIndex) => formatFn(val, rowIndex, colIndex))
      return `|${formattedValues.join("|")}|`
    })
    return lines.join("\n")
  }
  toTsv() {
    return this.toDelimited("\t")
  }
  getNodeBreakSymbol() {
    return "\n"
  }
  getWordBreakSymbol() {
    return " "
  }
  getNodeBreakSymbolRegex() {
    return new RegExp(this.getNodeBreakSymbol(), "g")
  }
  getEdgeSymbol() {
    return " "
  }
  _textToContentAndChildrenTuple(text) {
    const lines = text.split(this.getNodeBreakSymbolRegex())
    const firstLine = lines.shift()
    const children = !lines.length
      ? undefined
      : lines
          .map(line => (line.substr(0, 1) === this.getEdgeSymbol() ? line : this.getEdgeSymbol() + line))
          .map(line => line.substr(1))
          .join(this.getNodeBreakSymbol())
    return [firstLine, children]
  }
  _getLine() {
    return this._line
  }
  _setLine(line = "") {
    this._line = line
    if (this._words) delete this._words
    return this
  }
  _clearChildren() {
    this._deleteByIndexes(TreeUtils.getRange(0, this.length))
    delete this._children
    return this
  }
  _setChildren(content, circularCheckArray) {
    this._clearChildren()
    if (!content) return this
    // set from string
    if (typeof content === "string") {
      this._appendChildrenFromString(content)
      return this
    }
    // set from tree object
    if (content instanceof TreeNode) {
      content.forEach(node => this._insertLineAndChildren(node.getLine(), node.childrenToString()))
      return this
    }
    // If we set from object, create an array of inserted objects to avoid circular loops
    if (!circularCheckArray) circularCheckArray = [content]
    return this._setFromObject(content, circularCheckArray)
  }
  _setFromObject(content, circularCheckArray) {
    for (let firstWord in content) {
      if (!content.hasOwnProperty(firstWord)) continue
      // Branch the circularCheckArray, as we only have same branch circular arrays
      this._appendFromJavascriptObjectTuple(firstWord, content[firstWord], circularCheckArray.slice(0))
    }
    return this
  }
  // todo: refactor the below.
  _appendFromJavascriptObjectTuple(firstWord, content, circularCheckArray) {
    const type = typeof content
    let line
    let children
    if (content === null) line = firstWord + " " + null
    else if (content === undefined) line = firstWord
    else if (type === "string") {
      const tuple = this._textToContentAndChildrenTuple(content)
      line = firstWord + " " + tuple[0]
      children = tuple[1]
    } else if (type === "function") line = firstWord + " " + content.toString()
    else if (type !== "object") line = firstWord + " " + content
    else if (content instanceof Date) line = firstWord + " " + content.getTime().toString()
    else if (content instanceof TreeNode) {
      line = firstWord
      children = new TreeNode(content.childrenToString(), content.getLine())
    } else if (circularCheckArray.indexOf(content) === -1) {
      circularCheckArray.push(content)
      line = firstWord
      const length = content instanceof Array ? content.length : Object.keys(content).length
      if (length) children = new TreeNode()._setChildren(content, circularCheckArray)
    } else {
      // iirc this is return early from circular
      return
    }
    this._insertLineAndChildren(line, children)
  }
  _insertLineAndChildren(line, children, index = this.length) {
    const nodeConstructor = this._getParser()._getNodeConstructor(line, this)
    const newNode = new nodeConstructor(children, line, this)
    const adjustedIndex = index < 0 ? this.length + index : index
    this._getChildrenArray().splice(adjustedIndex, 0, newNode)
    if (this._index) this._makeIndex(adjustedIndex)
    return newNode
  }
  _appendChildrenFromString(str) {
    const lines = str.split(this.getNodeBreakSymbolRegex())
    const parentStack = []
    let currentIndentCount = -1
    let lastNode = this
    lines.forEach(line => {
      const indentCount = this._getIndentCount(line)
      if (indentCount > currentIndentCount) {
        currentIndentCount++
        parentStack.push(lastNode)
      } else if (indentCount < currentIndentCount) {
        // pop things off stack
        while (indentCount < currentIndentCount) {
          parentStack.pop()
          currentIndentCount--
        }
      }
      const lineContent = line.substr(currentIndentCount)
      const parent = parentStack[parentStack.length - 1]
      const nodeConstructor = parent._getParser()._getNodeConstructor(lineContent, parent)
      lastNode = new nodeConstructor(undefined, lineContent, parent)
      parent._getChildrenArray().push(lastNode)
    })
  }
  _getIndex() {
    // StringMap<int> {firstWord: index}
    // When there are multiple tails with the same firstWord, _index stores the last content.
    // todo: change the above behavior: when a collision occurs, create an array.
    return this._index || this._makeIndex()
  }
  getContentsArray() {
    return this.map(node => node.getContent())
  }
  // todo: rename to getChildrenByConstructor(?)
  getChildrenByNodeConstructor(constructor) {
    return this.filter(child => child instanceof constructor)
  }
  getAncestorByNodeConstructor(constructor) {
    if (this instanceof constructor) return this
    if (this.isRoot()) return undefined
    const parent = this.getParent()
    return parent instanceof constructor ? parent : parent.getAncestorByNodeConstructor(constructor)
  }
  // todo: rename to getNodeByConstructor(?)
  getNodeByType(constructor) {
    return this.find(child => child instanceof constructor)
  }
  indexOfLast(firstWord) {
    const result = this._getIndex()[firstWord]
    return result === undefined ? -1 : result
  }
  // todo: renmae to indexOfFirst?
  indexOf(firstWord) {
    if (!this.has(firstWord)) return -1
    const length = this.length
    const nodes = this._getChildrenArray()
    for (let index = 0; index < length; index++) {
      if (nodes[index].getFirstWord() === firstWord) return index
    }
  }
  // todo: rename this. it is a particular type of object.
  toObject() {
    return this._toObject()
  }
  getFirstWords() {
    return this.map(node => node.getFirstWord())
  }
  _makeIndex(startAt = 0) {
    if (!this._index || !startAt) this._index = {}
    const nodes = this._getChildrenArray()
    const newIndex = this._index
    const length = nodes.length
    for (let index = startAt; index < length; index++) {
      newIndex[nodes[index].getFirstWord()] = index
    }
    return newIndex
  }
  _childrenToXml(indentCount) {
    return this.map(node => node._toXml(indentCount)).join("")
  }
  _getIndentCount(str) {
    let level = 0
    const edgeChar = this.getEdgeSymbol()
    while (str[level] === edgeChar) {
      level++
    }
    return level
  }
  clone() {
    return new this.constructor(this.childrenToString(), this.getLine())
  }
  // todo: rename to hasFirstWord
  has(firstWord) {
    return this._hasFirstWord(firstWord)
  }
  hasNode(node) {
    const needle = node.toString()
    return this.getChildren().some(node => node.toString() === needle)
  }
  _hasFirstWord(firstWord) {
    return this._getIndex()[firstWord] !== undefined
  }
  map(fn) {
    return this.getChildren().map(fn)
  }
  filter(fn = item => item) {
    return this.getChildren().filter(fn)
  }
  find(fn) {
    return this.getChildren().find(fn)
  }
  findLast(fn) {
    return this.getChildren()
      .reverse()
      .find(fn)
  }
  every(fn) {
    let index = 0
    for (let node of this.getTopDownArrayIterator()) {
      if (!fn(node, index)) return false
      index++
    }
    return true
  }
  forEach(fn) {
    this.getChildren().forEach(fn)
    return this
  }
  // Recurse if predicate passes
  deepVisit(predicate) {
    this.forEach(node => {
      if (predicate(node) !== false) node.deepVisit(predicate)
    })
  }
  // todo: protected?
  _clearIndex() {
    delete this._index
  }
  slice(start, end) {
    return this.getChildren().slice(start, end)
  }
  // todo: make 0 and 1 a param
  getInheritanceTree() {
    const paths = {}
    const result = new TreeNode()
    this.forEach(node => {
      const key = node.getWord(0)
      const parentKey = node.getWord(1)
      const parentPath = paths[parentKey]
      paths[key] = parentPath ? [parentPath, key].join(" ") : key
      result.touchNode(paths[key])
    })
    return result
  }
  _getGrandParent() {
    return this.isRoot() || this.getParent().isRoot() ? undefined : this.getParent().getParent()
  }
  _getParser() {
    if (!TreeNode._parsers.has(this.constructor)) TreeNode._parsers.set(this.constructor, this.createParser())
    return TreeNode._parsers.get(this.constructor)
  }
  createParser() {
    return new Parser(this.constructor)
  }
  static _makeUniqueId() {
    if (this._uniqueId === undefined) this._uniqueId = 0
    this._uniqueId++
    return this._uniqueId
  }
  static _getFileFormat(path) {
    const format = path.split(".").pop()
    return FileFormat[format] ? format : FileFormat.tree
  }
  getLineModifiedTime() {
    return this._lineModifiedTime || this._nodeCreationTime
  }
  getChildArrayModifiedTime() {
    return this._childArrayModifiedTime || this._nodeCreationTime
  }
  _setChildArrayMofifiedTime(value) {
    this._childArrayModifiedTime = value
    return this
  }
  getLineOrChildrenModifiedTime() {
    return Math.max(this.getLineModifiedTime(), this.getChildArrayModifiedTime(), Math.max.apply(null, this.map(child => child.getLineOrChildrenModifiedTime())))
  }
  _setVirtualParentTree(tree) {
    this._virtualParentTree = tree
    return this
  }
  _getVirtualParentTreeNode() {
    return this._virtualParentTree
  }
  _setVirtualAncestorNodesByInheritanceViaColumnIndicesAndThenExpand(nodes, thisIdColumnNumber, extendsIdColumnNumber) {
    const map = {}
    for (let node of nodes) {
      const nodeId = node.getWord(thisIdColumnNumber)
      if (map[nodeId]) throw new Error(`Tried to define a node with id "${nodeId}" but one is already defined.`)
      map[nodeId] = {
        nodeId: nodeId,
        node: node,
        parentId: node.getWord(extendsIdColumnNumber)
      }
    }
    // Add parent Nodes
    Object.values(map).forEach(nodeInfo => {
      const parentId = nodeInfo.parentId
      const parentNode = map[parentId]
      if (parentId && !parentNode) throw new Error(`Node "${nodeInfo.nodeId}" tried to extend "${parentId}" but "${parentId}" not found.`)
      if (parentId) nodeInfo.node._setVirtualParentTree(parentNode.node)
    })
    nodes.forEach(node => node._expandFromVirtualParentTree())
    return this
  }
  _expandFromVirtualParentTree() {
    if (this._isVirtualExpanded) return this
    this._isExpanding = true
    let parentNode = this._getVirtualParentTreeNode()
    if (parentNode) {
      if (parentNode._isExpanding) throw new Error(`Loop detected: '${this.getLine()}' is the ancestor of one of its ancestors.`)
      parentNode._expandFromVirtualParentTree()
      const clone = this.clone()
      this._setChildren(parentNode.childrenToString())
      this.extend(clone)
    }
    this._isExpanding = false
    this._isVirtualExpanded = true
  }
  // todo: solve issue related to whether extend should overwrite or append.
  _expandChildren(thisIdColumnNumber, extendsIdColumnNumber, childrenThatNeedExpanding = this.getChildren()) {
    return this._setVirtualAncestorNodesByInheritanceViaColumnIndicesAndThenExpand(childrenThatNeedExpanding, thisIdColumnNumber, extendsIdColumnNumber)
  }
  // todo: add more testing.
  // todo: solve issue with where extend should overwrite or append
  // todo: should take a grammar? to decide whether to overwrite or append.
  // todo: this is slow.
  extend(nodeOrStr) {
    const node = nodeOrStr instanceof TreeNode ? nodeOrStr : new TreeNode(nodeOrStr)
    const usedFirstWords = new Set()
    node.forEach(sourceNode => {
      const firstWord = sourceNode.getFirstWord()
      let targetNode
      const isAnArrayNotMap = usedFirstWords.has(firstWord)
      if (!this.has(firstWord)) {
        usedFirstWords.add(firstWord)
        this.appendLineAndChildren(sourceNode.getLine(), sourceNode.childrenToString())
        return true
      }
      if (isAnArrayNotMap) targetNode = this.appendLine(sourceNode.getLine())
      else {
        targetNode = this.touchNode(firstWord).setContent(sourceNode.getContent())
        usedFirstWords.add(firstWord)
      }
      if (sourceNode.length) targetNode.extend(sourceNode)
    })
    return this
  }
  lastNode() {
    return this.getChildren()[this.length - 1]
  }
  expandLastFromTopMatter() {
    const clone = this.clone()
    const map = new Map()
    const lastNode = clone.lastNode()
    lastNode.getOlderSiblings().forEach(node => map.set(node.getWord(0), node))
    lastNode.getTopDownArray().forEach(node => {
      const replacement = map.get(node.getWord(0))
      if (!replacement) return
      node.replaceNode(str => replacement.toString())
    })
    return lastNode
  }
  macroExpand(macroDefinitionWord, macroUsageWord) {
    const clone = this.clone()
    const defs = clone.findNodes(macroDefinitionWord)
    const allUses = clone.findNodes(macroUsageWord)
    const wordBreakSymbol = clone.getWordBreakSymbol()
    defs.forEach(def => {
      const macroName = def.getWord(1)
      const uses = allUses.filter(node => node.hasWord(1, macroName))
      const params = def.getWordsFrom(2)
      const replaceFn = str => {
        const paramValues = str.split(wordBreakSymbol).slice(2)
        let newTree = def.childrenToString()
        params.forEach((param, index) => {
          newTree = newTree.replace(new RegExp(param, "g"), paramValues[index])
        })
        return newTree
      }
      uses.forEach(node => {
        node.replaceNode(replaceFn)
      })
      def.destroy()
    })
    return clone
  }
  setChildren(children) {
    return this._setChildren(children)
  }
  _updateLineModifiedTimeAndTriggerEvent() {
    this._lineModifiedTime = this._getProcessTimeInMilliseconds()
  }
  insertWord(index, word) {
    const wi = this.getWordBreakSymbol()
    const words = this._getLine().split(wi)
    words.splice(index, 0, word)
    this.setLine(words.join(wi))
    return this
  }
  deleteDuplicates() {
    const set = new Set()
    this.getTopDownArray().forEach(node => {
      const str = node.toString()
      if (set.has(str)) node.destroy()
      else set.add(str)
    })
    return this
  }
  setWord(index, word) {
    const wi = this.getWordBreakSymbol()
    const words = this._getLine().split(wi)
    words[index] = word
    this.setLine(words.join(wi))
    return this
  }
  deleteChildren() {
    return this._clearChildren()
  }
  setContent(content) {
    if (content === this.getContent()) return this
    const newArray = [this.getFirstWord()]
    if (content !== undefined) {
      content = content.toString()
      if (content.match(this.getNodeBreakSymbol())) return this.setContentWithChildren(content)
      newArray.push(content)
    }
    this._setLine(newArray.join(this.getWordBreakSymbol()))
    this._updateLineModifiedTimeAndTriggerEvent()
    return this
  }
  prependSibling(line, children) {
    return this.getParent().insertLineAndChildren(line, children, this.getIndex())
  }
  appendSibling(line, children) {
    return this.getParent().insertLineAndChildren(line, children, this.getIndex() + 1)
  }
  setContentWithChildren(text) {
    // todo: deprecate
    if (!text.includes(this.getNodeBreakSymbol())) {
      this._clearChildren()
      return this.setContent(text)
    }
    const lines = text.split(this.getNodeBreakSymbolRegex())
    const firstLine = lines.shift()
    this.setContent(firstLine)
    // tood: cleanup.
    const remainingString = lines.join(this.getNodeBreakSymbol())
    const children = new TreeNode(remainingString)
    if (!remainingString) children.appendLine("")
    this.setChildren(children)
    return this
  }
  setFirstWord(firstWord) {
    return this.setWord(0, firstWord)
  }
  setLine(line) {
    if (line === this.getLine()) return this
    // todo: clear parent TMTimes
    this.getParent()._clearIndex()
    this._setLine(line)
    this._updateLineModifiedTimeAndTriggerEvent()
    return this
  }
  duplicate() {
    return this.getParent()._insertLineAndChildren(this.getLine(), this.childrenToString(), this.getIndex() + 1)
  }
  trim() {
    // todo: could do this so only the trimmed rows are deleted.
    this.setChildren(this.childrenToString().trim())
    return this
  }
  destroy() {
    this.getParent()._deleteNode(this)
  }
  set(firstWordPath, text) {
    return this.touchNode(firstWordPath).setContentWithChildren(text)
  }
  setFromText(text) {
    if (this.toString() === text) return this
    const tuple = this._textToContentAndChildrenTuple(text)
    this.setLine(tuple[0])
    return this._setChildren(tuple[1])
  }
  setPropertyIfMissing(prop, value) {
    if (this.has(prop)) return true
    return this.touchNode(prop).setContent(value)
  }
  setProperties(propMap) {
    const props = Object.keys(propMap)
    const values = Object.values(propMap)
    // todo: is there a built in tree method to do this?
    props.forEach((prop, index) => {
      const value = values[index]
      if (!value) return true
      if (this.get(prop) === value) return true
      this.touchNode(prop).setContent(value)
    })
    return this
  }
  // todo: throw error if line contains a \n
  appendLine(line) {
    return this._insertLineAndChildren(line)
  }
  appendLineAndChildren(line, children) {
    return this._insertLineAndChildren(line, children)
  }
  getNodesByRegex(regex) {
    const matches = []
    regex = regex instanceof RegExp ? [regex] : regex
    this._getNodesByLineRegex(matches, regex)
    return matches
  }
  // todo: remove?
  getNodesByLinePrefixes(columns) {
    const matches = []
    this._getNodesByLineRegex(matches, columns.map(str => new RegExp("^" + str)))
    return matches
  }
  nodesThatStartWith(prefix) {
    return this.filter(node => node.getLine().startsWith(prefix))
  }
  _getNodesByLineRegex(matches, regs) {
    const rgs = regs.slice(0)
    const reg = rgs.shift()
    const candidates = this.filter(child => child.getLine().match(reg))
    if (!rgs.length) return candidates.forEach(cand => matches.push(cand))
    candidates.forEach(cand => cand._getNodesByLineRegex(matches, rgs))
  }
  concat(node) {
    if (typeof node === "string") node = new TreeNode(node)
    return node.map(node => this._insertLineAndChildren(node.getLine(), node.childrenToString()))
  }
  _deleteByIndexes(indexesToDelete) {
    if (!indexesToDelete.length) return this
    this._clearIndex()
    // note: assumes indexesToDelete is in ascending order
    const deletedNodes = indexesToDelete.reverse().map(index => this._getChildrenArray().splice(index, 1)[0])
    this._setChildArrayMofifiedTime(this._getProcessTimeInMilliseconds())
    return this
  }
  _deleteNode(node) {
    const index = this._indexOfNode(node)
    return index > -1 ? this._deleteByIndexes([index]) : 0
  }
  reverse() {
    this._clearIndex()
    this._getChildrenArray().reverse()
    return this
  }
  shift() {
    if (!this.length) return null
    const node = this._getChildrenArray().shift()
    return node.copyTo(new this.constructor(), 0)
  }
  sort(fn) {
    this._getChildrenArray().sort(fn)
    this._clearIndex()
    return this
  }
  invert() {
    this.forEach(node => node.getWords().reverse())
    return this
  }
  _rename(oldFirstWord, newFirstWord) {
    const index = this.indexOf(oldFirstWord)
    if (index === -1) return this
    const node = this._getChildrenArray()[index]
    node.setFirstWord(newFirstWord)
    this._clearIndex()
    return this
  }
  // Does not recurse.
  remap(map) {
    this.forEach(node => {
      const firstWord = node.getFirstWord()
      if (map[firstWord] !== undefined) node.setFirstWord(map[firstWord])
    })
    return this
  }
  rename(oldFirstWord, newFirstWord) {
    this._rename(oldFirstWord, newFirstWord)
    return this
  }
  renameAll(oldName, newName) {
    this.findNodes(oldName).forEach(node => node.setFirstWord(newName))
    return this
  }
  _deleteAllChildNodesWithFirstWord(firstWord) {
    if (!this.has(firstWord)) return this
    const allNodes = this._getChildrenArray()
    const indexesToDelete = []
    allNodes.forEach((node, index) => {
      if (node.getFirstWord() === firstWord) indexesToDelete.push(index)
    })
    return this._deleteByIndexes(indexesToDelete)
  }
  delete(path = "") {
    const edgeSymbol = this.getEdgeSymbol()
    if (!path.includes(edgeSymbol)) return this._deleteAllChildNodesWithFirstWord(path)
    const parts = path.split(edgeSymbol)
    const nextFirstWord = parts.pop()
    const targetNode = this.getNode(parts.join(edgeSymbol))
    return targetNode ? targetNode._deleteAllChildNodesWithFirstWord(nextFirstWord) : 0
  }
  deleteColumn(firstWord = "") {
    this.forEach(node => node.delete(firstWord))
    return this
  }
  _getNonMaps() {
    const results = this.getTopDownArray().filter(node => node.hasDuplicateFirstWords())
    if (this.hasDuplicateFirstWords()) results.unshift(this)
    return results
  }
  replaceNode(fn) {
    const parent = this.getParent()
    const index = this.getIndex()
    const newNodes = new TreeNode(fn(this.toString()))
    const returnedNodes = []
    newNodes.forEach((child, childIndex) => {
      const newNode = parent.insertLineAndChildren(child.getLine(), child.childrenToString(), index + childIndex)
      returnedNodes.push(newNode)
    })
    this.destroy()
    return returnedNodes
  }
  insertLineAndChildren(line, children, index) {
    return this._insertLineAndChildren(line, children, index)
  }
  insertLine(line, index) {
    return this._insertLineAndChildren(line, undefined, index)
  }
  prependLine(line) {
    return this.insertLine(line, 0)
  }
  pushContentAndChildren(content, children) {
    let index = this.length
    while (this.has(index.toString())) {
      index++
    }
    const line = index.toString() + (content === undefined ? "" : this.getWordBreakSymbol() + content)
    return this.appendLineAndChildren(line, children)
  }
  deleteBlanks() {
    this.getChildren()
      .filter(node => node.isBlankLine())
      .forEach(node => node.destroy())
    return this
  }
  // todo: add "globalReplace" method? Which runs a global regex or string replace on the Tree doc as a string?
  firstWordSort(firstWordOrder) {
    return this._firstWordSort(firstWordOrder)
  }
  deleteWordAt(wordIndex) {
    const words = this.getWords()
    words.splice(wordIndex, 1)
    return this.setWords(words)
  }
  trigger(event) {
    if (this._listeners && this._listeners.has(event.constructor)) {
      const listeners = this._listeners.get(event.constructor)
      const listenersToRemove = []
      for (let index = 0; index < listeners.length; index++) {
        const listener = listeners[index]
        if (listener(event) === true) listenersToRemove.push(index)
      }
      listenersToRemove.reverse().forEach(index => listenersToRemove.splice(index, 1))
    }
  }
  triggerAncestors(event) {
    if (this.isRoot()) return
    const parent = this.getParent()
    parent.trigger(event)
    parent.triggerAncestors(event)
  }
  onLineChanged(eventHandler) {
    return this._addEventListener(LineChangedTreeEvent, eventHandler)
  }
  onDescendantChanged(eventHandler) {
    return this._addEventListener(DescendantChangedTreeEvent, eventHandler)
  }
  onChildAdded(eventHandler) {
    return this._addEventListener(ChildAddedTreeEvent, eventHandler)
  }
  onChildRemoved(eventHandler) {
    return this._addEventListener(ChildRemovedTreeEvent, eventHandler)
  }
  _addEventListener(eventClass, eventHandler) {
    if (!this._listeners) this._listeners = new Map()
    if (!this._listeners.has(eventClass)) this._listeners.set(eventClass, [])
    this._listeners.get(eventClass).push(eventHandler)
    return this
  }
  setWords(words) {
    return this.setLine(words.join(this.getWordBreakSymbol()))
  }
  setWordsFrom(index, words) {
    this.setWords(
      this.getWords()
        .slice(0, index)
        .concat(words)
    )
    return this
  }
  appendWord(word) {
    const words = this.getWords()
    words.push(word)
    return this.setWords(words)
  }
  _firstWordSort(firstWordOrder, secondarySortFn) {
    const nodeAFirst = -1
    const nodeBFirst = 1
    const map = {}
    firstWordOrder.forEach((word, index) => {
      map[word] = index
    })
    this.sort((nodeA, nodeB) => {
      const valA = map[nodeA.getFirstWord()]
      const valB = map[nodeB.getFirstWord()]
      if (valA > valB) return nodeBFirst
      if (valA < valB) return nodeAFirst
      return secondarySortFn ? secondarySortFn(nodeA, nodeB) : 0
    })
    return this
  }
  _touchNode(firstWordPathArray) {
    let contextNode = this
    firstWordPathArray.forEach(firstWord => {
      contextNode = contextNode.getNode(firstWord) || contextNode.appendLine(firstWord)
    })
    return contextNode
  }
  _touchNodeByString(str) {
    str = str.replace(this.getNodeBreakSymbolRegex(), "") // todo: do we want to do this sanitization?
    return this._touchNode(str.split(this.getWordBreakSymbol()))
  }
  touchNode(str) {
    return this._touchNodeByString(str)
  }
  appendNode(node) {
    return this.appendLineAndChildren(node.getLine(), node.childrenToString())
  }
  hasLine(line) {
    return this.getChildren().some(node => node.getLine() === line)
  }
  getNodesByLine(line) {
    return this.filter(node => node.getLine() === line)
  }
  toggleLine(line) {
    const lines = this.getNodesByLine(line)
    if (lines.length) {
      lines.map(line => line.destroy())
      return this
    }
    return this.appendLine(line)
  }
  // todo: remove?
  sortByColumns(indexOrIndices) {
    const indices = indexOrIndices instanceof Array ? indexOrIndices : [indexOrIndices]
    const length = indices.length
    this.sort((nodeA, nodeB) => {
      const wordsA = nodeA.getWords()
      const wordsB = nodeB.getWords()
      for (let index = 0; index < length; index++) {
        const col = indices[index]
        const av = wordsA[col]
        const bv = wordsB[col]
        if (av === undefined) return -1
        if (bv === undefined) return 1
        if (av > bv) return 1
        else if (av < bv) return -1
      }
      return 0
    })
    return this
  }
  getWordsAsSet() {
    return new Set(this.getWordsFrom(1))
  }
  appendWordIfMissing(word) {
    if (this.getWordsAsSet().has(word)) return this
    return this.appendWord(word)
  }
  // todo: check to ensure identical objects
  addObjectsAsDelimited(arrayOfObjects, delimiter = TreeUtils._chooseDelimiter(new TreeNode(arrayOfObjects).toString())) {
    const header = Object.keys(arrayOfObjects[0])
      .join(delimiter)
      .replace(/[\n\r]/g, "")
    const rows = arrayOfObjects.map(item =>
      Object.values(item)
        .join(delimiter)
        .replace(/[\n\r]/g, "")
    )
    return this.addUniqueRowsToNestedDelimited(header, rows)
  }
  setChildrenAsDelimited(tree, delimiter = TreeUtils._chooseDelimiter(tree.toString())) {
    tree = tree instanceof TreeNode ? tree : new TreeNode(tree)
    return this.setChildren(tree.toDelimited(delimiter))
  }
  convertChildrenToDelimited(delimiter = TreeUtils._chooseDelimiter(this.childrenToString())) {
    // todo: handle newlines!!!
    return this.setChildren(this.toDelimited(delimiter))
  }
  addUniqueRowsToNestedDelimited(header, rowsAsStrings) {
    if (!this.length) this.appendLine(header)
    // todo: this looks brittle
    rowsAsStrings.forEach(row => {
      if (!this.toString().includes(row)) this.appendLine(row)
    })
    return this
  }
  shiftLeft() {
    const grandParent = this._getGrandParent()
    if (!grandParent) return this
    const parentIndex = this.getParent().getIndex()
    const newNode = grandParent.insertLineAndChildren(this.getLine(), this.length ? this.childrenToString() : undefined, parentIndex + 1)
    this.destroy()
    return newNode
  }
  pasteText(text) {
    const parent = this.getParent()
    const index = this.getIndex()
    const newNodes = new TreeNode(text)
    const firstNode = newNodes.nodeAt(0)
    if (firstNode) {
      this.setLine(firstNode.getLine())
      if (firstNode.length) this.setChildren(firstNode.childrenToString())
    } else {
      this.setLine("")
    }
    newNodes.forEach((child, childIndex) => {
      if (!childIndex)
        // skip first
        return true
      parent.insertLineAndChildren(child.getLine(), child.childrenToString(), index + childIndex)
    })
    return this
  }
  templateToString(obj) {
    // todo: compile/cache for perf?
    const tree = this.clone()
    tree.getTopDownArray().forEach(node => {
      const line = node.getLine().replace(/{([^\}]+)}/g, (match, path) => {
        const replacement = obj[path]
        if (replacement === undefined) throw new Error(`In string template no match found on line "${node.getLine()}"`)
        return replacement
      })
      node.pasteText(line)
    })
    return tree.toString()
  }
  shiftRight() {
    const olderSibling = this._getClosestOlderSibling()
    if (!olderSibling) return this
    const newNode = olderSibling.appendLineAndChildren(this.getLine(), this.length ? this.childrenToString() : undefined)
    this.destroy()
    return newNode
  }
  shiftYoungerSibsRight() {
    const nodes = this.getYoungerSiblings()
    nodes.forEach(node => node.shiftRight())
    return this
  }
  sortBy(nameOrNames) {
    const names = nameOrNames instanceof Array ? nameOrNames : [nameOrNames]
    const length = names.length
    this.sort((nodeA, nodeB) => {
      if (!nodeB.length && !nodeA.length) return 0
      else if (!nodeA.length) return -1
      else if (!nodeB.length) return 1
      for (let index = 0; index < length; index++) {
        const firstWord = names[index]
        const av = nodeA.get(firstWord)
        const bv = nodeB.get(firstWord)
        if (av > bv) return 1
        else if (av < bv) return -1
      }
      return 0
    })
    return this
  }
  selectNode() {
    this._selected = true
  }
  unselectNode() {
    delete this._selected
  }
  isSelected() {
    return !!this._selected
  }
  async saveVersion() {
    const newVersion = this.toString()
    const topUndoVersion = this._getTopUndoVersion()
    if (newVersion === topUndoVersion) return undefined
    this._recordChange(newVersion)
    this._setSavedVersion(this.toString())
    return this
  }
  hasUnsavedChanges() {
    return this.toString() !== this._getSavedVersion()
  }
  async redo() {
    const undoStack = this._getUndoStack()
    const redoStack = this._getRedoStack()
    if (!redoStack.length) return undefined
    undoStack.push(redoStack.pop())
    return this._reloadFromUndoTop()
  }
  async undo() {
    const undoStack = this._getUndoStack()
    const redoStack = this._getRedoStack()
    if (undoStack.length === 1) return undefined
    redoStack.push(undoStack.pop())
    return this._reloadFromUndoTop()
  }
  _getSavedVersion() {
    return this._savedVersion
  }
  _setSavedVersion(str) {
    this._savedVersion = str
    return this
  }
  _clearRedoStack() {
    const redoStack = this._getRedoStack()
    redoStack.splice(0, redoStack.length)
  }
  getChangeHistory() {
    return this._getUndoStack().slice(0)
  }
  _getUndoStack() {
    if (!this._undoStack) this._undoStack = []
    return this._undoStack
  }
  _getRedoStack() {
    if (!this._redoStack) this._redoStack = []
    return this._redoStack
  }
  _getTopUndoVersion() {
    const undoStack = this._getUndoStack()
    return undoStack[undoStack.length - 1]
  }
  async _reloadFromUndoTop() {
    this.setChildren(this._getTopUndoVersion())
  }
  _recordChange(newVersion) {
    this._clearRedoStack()
    this._getUndoStack().push(newVersion) // todo: use diffs?
  }
  static fromCsv(str) {
    return this.fromDelimited(str, ",", '"')
  }
  // todo: jeez i think we can come up with a better name than "JsonSubset"
  static fromJsonSubset(str) {
    return new TreeNode(JSON.parse(str))
  }
  static serializedTreeNodeToTree(treeNode) {
    const language = new TreeNode()
    const cellDelimiter = language.getWordBreakSymbol()
    const nodeDelimiter = language.getNodeBreakSymbol()
    const line = treeNode.cells ? treeNode.cells.join(cellDelimiter) : undefined
    const tree = new TreeNode(undefined, line)
    if (treeNode.children)
      treeNode.children.forEach(child => {
        tree.appendNode(this.serializedTreeNodeToTree(child))
      })
    return tree
  }
  static fromJson(str) {
    return this.serializedTreeNodeToTree(JSON.parse(str))
  }
  static fromGridJson(str) {
    const lines = JSON.parse(str)
    const language = new TreeNode()
    const cellDelimiter = language.getWordBreakSymbol()
    const nodeDelimiter = language.getNodeBreakSymbol()
    return new TreeNode(lines.map(line => line.join(cellDelimiter)).join(nodeDelimiter))
  }
  static fromSsv(str) {
    return this.fromDelimited(str, " ", '"')
  }
  static fromTsv(str) {
    return this.fromDelimited(str, "\t", '"')
  }
  static fromDelimited(str, delimiter, quoteChar = '"') {
    str = str.replace(/\r/g, "") // remove windows newlines if present
    const rows = this._getEscapedRows(str, delimiter, quoteChar)
    return this._rowsToTreeNode(rows, delimiter, true)
  }
  static _getEscapedRows(str, delimiter, quoteChar) {
    return str.includes(quoteChar) ? this._strToRows(str, delimiter, quoteChar) : str.split("\n").map(line => line.split(delimiter))
  }
  static fromDelimitedNoHeaders(str, delimiter, quoteChar) {
    str = str.replace(/\r/g, "") // remove windows newlines if present
    const rows = this._getEscapedRows(str, delimiter, quoteChar)
    return this._rowsToTreeNode(rows, delimiter, false)
  }
  static _strToRows(str, delimiter, quoteChar, newLineChar = "\n") {
    const rows = [[]]
    const newLine = "\n"
    const length = str.length
    let currentCell = ""
    let inQuote = str.substr(0, 1) === quoteChar
    let currentPosition = inQuote ? 1 : 0
    let nextChar
    let isLastChar
    let currentRow = 0
    let char
    let isNextCharAQuote
    while (currentPosition < length) {
      char = str[currentPosition]
      isLastChar = currentPosition + 1 === length
      nextChar = str[currentPosition + 1]
      isNextCharAQuote = nextChar === quoteChar
      if (inQuote) {
        if (char !== quoteChar) currentCell += char
        else if (isNextCharAQuote) {
          // Both the current and next char are ", so the " is escaped
          currentCell += nextChar
          currentPosition++ // Jump 2
        } else {
          // If the current char is a " and the next char is not, it's the end of the quotes
          inQuote = false
          if (isLastChar) rows[currentRow].push(currentCell)
        }
      } else {
        if (char === delimiter) {
          rows[currentRow].push(currentCell)
          currentCell = ""
          if (isNextCharAQuote) {
            inQuote = true
            currentPosition++ // Jump 2
          }
        } else if (char === newLine) {
          rows[currentRow].push(currentCell)
          currentCell = ""
          currentRow++
          if (nextChar) rows[currentRow] = []
          if (isNextCharAQuote) {
            inQuote = true
            currentPosition++ // Jump 2
          }
        } else if (isLastChar) rows[currentRow].push(currentCell + char)
        else currentCell += char
      }
      currentPosition++
    }
    return rows
  }
  static multiply(nodeA, nodeB) {
    const productNode = nodeA.clone()
    productNode.forEach((node, index) => {
      node.setChildren(node.length ? this.multiply(node, nodeB) : nodeB.clone())
    })
    return productNode
  }
  // Given an array return a tree
  static _rowsToTreeNode(rows, delimiter, hasHeaders) {
    const numberOfColumns = rows[0].length
    const treeNode = new TreeNode()
    const names = this._getHeader(rows, hasHeaders)
    const rowCount = rows.length
    for (let rowIndex = hasHeaders ? 1 : 0; rowIndex < rowCount; rowIndex++) {
      let row = rows[rowIndex]
      // If the row contains too many columns, shift the extra columns onto the last one.
      // This allows you to not have to escape delimiter characters in the final column.
      if (row.length > numberOfColumns) {
        row[numberOfColumns - 1] = row.slice(numberOfColumns - 1).join(delimiter)
        row = row.slice(0, numberOfColumns)
      } else if (row.length < numberOfColumns) {
        // If the row is missing columns add empty columns until it is full.
        // This allows you to make including delimiters for empty ending columns in each row optional.
        while (row.length < numberOfColumns) {
          row.push("")
        }
      }
      const obj = {}
      row.forEach((cellValue, index) => {
        obj[names[index]] = cellValue
      })
      treeNode.pushContentAndChildren(undefined, obj)
    }
    return treeNode
  }
  static _initializeXmlParser() {
    if (this._xmlParser) return
    const windowObj = window
    if (typeof windowObj.DOMParser !== "undefined") this._xmlParser = xmlStr => new windowObj.DOMParser().parseFromString(xmlStr, "text/xml")
    else if (typeof windowObj.ActiveXObject !== "undefined" && new windowObj.ActiveXObject("Microsoft.XMLDOM")) {
      this._xmlParser = xmlStr => {
        const xmlDoc = new windowObj.ActiveXObject("Microsoft.XMLDOM")
        xmlDoc.async = "false"
        xmlDoc.loadXML(xmlStr)
        return xmlDoc
      }
    } else throw new Error("No XML parser found")
  }
  static fromXml(str) {
    this._initializeXmlParser()
    const xml = this._xmlParser(str)
    try {
      return this._treeNodeFromXml(xml).getNode("children")
    } catch (err) {
      return this._treeNodeFromXml(this._parseXml2(str)).getNode("children")
    }
  }
  static _zipObject(keys, values) {
    const obj = {}
    keys.forEach((key, index) => (obj[key] = values[index]))
    return obj
  }
  static fromShape(shapeArr, rootNode = new TreeNode()) {
    const part = shapeArr.shift()
    if (part !== undefined) {
      for (let index = 0; index < part; index++) {
        rootNode.appendLine(index.toString())
      }
    }
    if (shapeArr.length) rootNode.forEach(node => TreeNode.fromShape(shapeArr.slice(0), node))
    return rootNode
  }
  static fromDataTable(table) {
    const header = table.shift()
    return new TreeNode(table.map(row => this._zipObject(header, row)))
  }
  static _parseXml2(str) {
    const el = document.createElement("div")
    el.innerHTML = str
    return el
  }
  // todo: cleanup typings
  static _treeNodeFromXml(xml) {
    const result = new TreeNode()
    const children = new TreeNode()
    // Set attributes
    if (xml.attributes) {
      for (let index = 0; index < xml.attributes.length; index++) {
        result.set(xml.attributes[index].name, xml.attributes[index].value)
      }
    }
    if (xml.data) children.pushContentAndChildren(xml.data)
    // Set content
    if (xml.childNodes && xml.childNodes.length > 0) {
      for (let index = 0; index < xml.childNodes.length; index++) {
        const child = xml.childNodes[index]
        if (child.tagName && child.tagName.match(/parsererror/i)) throw new Error("Parse Error")
        if (child.childNodes.length > 0 && child.tagName) children.appendLineAndChildren(child.tagName, this._treeNodeFromXml(child))
        else if (child.tagName) children.appendLine(child.tagName)
        else if (child.data) {
          const data = child.data.trim()
          if (data) children.pushContentAndChildren(data)
        }
      }
    }
    if (children.length > 0) result.touchNode("children").setChildren(children)
    return result
  }
  static _getHeader(rows, hasHeaders) {
    const numberOfColumns = rows[0].length
    const headerRow = hasHeaders ? rows[0] : []
    const WordBreakSymbol = " "
    const ziRegex = new RegExp(WordBreakSymbol, "g")
    if (hasHeaders) {
      // Strip any WordBreakSymbols from column names in the header row.
      // This makes the mapping not quite 1 to 1 if there are any WordBreakSymbols in names.
      for (let index = 0; index < numberOfColumns; index++) {
        headerRow[index] = headerRow[index].replace(ziRegex, "")
      }
    } else {
      // If str has no headers, create them as 0,1,2,3
      for (let index = 0; index < numberOfColumns; index++) {
        headerRow.push(index.toString())
      }
    }
    return headerRow
  }
  static nest(str, xValue) {
    const NodeBreakSymbol = "\n"
    const WordBreakSymbol = " "
    const indent = NodeBreakSymbol + WordBreakSymbol.repeat(xValue)
    return str ? indent + str.replace(/\n/g, indent) : ""
  }
  static fromDisk(path) {
    const format = this._getFileFormat(path)
    const content = require("fs").readFileSync(path, "utf8")
    const methods = {
      tree: content => new TreeNode(content),
      csv: content => this.fromCsv(content),
      tsv: content => this.fromTsv(content)
    }
    return methods[format](content)
  }
}
TreeNode._parsers = new Map()
TreeNode.Parser = Parser
TreeNode.iris = `sepal_length,sepal_width,petal_length,petal_width,species
6.1,3,4.9,1.8,virginica
5.6,2.7,4.2,1.3,versicolor
5.6,2.8,4.9,2,virginica
6.2,2.8,4.8,1.8,virginica
7.7,3.8,6.7,2.2,virginica
5.3,3.7,1.5,0.2,setosa
6.2,3.4,5.4,2.3,virginica
4.9,2.5,4.5,1.7,virginica
5.1,3.5,1.4,0.2,setosa
5,3.4,1.5,0.2,setosa`
TreeNode.getVersion = () => "56.0.0"
class AbstractExtendibleTreeNode extends TreeNode {
  _getFromExtended(firstWordPath) {
    const hit = this._getNodeFromExtended(firstWordPath)
    return hit ? hit.get(firstWordPath) : undefined
  }
  _getFamilyTree() {
    const tree = new TreeNode()
    this.forEach(node => {
      const path = node._getAncestorsArray().map(node => node._getId())
      path.reverse()
      tree.touchNode(path.join(" "))
    })
    return tree
  }
  // todo: be more specific with the param
  _getChildrenByNodeConstructorInExtended(constructor) {
    return TreeUtils.flatten(this._getAncestorsArray().map(node => node.getChildrenByNodeConstructor(constructor)))
  }
  _getExtendedParent() {
    return this._getAncestorsArray()[1]
  }
  _hasFromExtended(firstWordPath) {
    return !!this._getNodeFromExtended(firstWordPath)
  }
  _getNodeFromExtended(firstWordPath) {
    return this._getAncestorsArray().find(node => node.has(firstWordPath))
  }
  _getConcatBlockStringFromExtended(firstWordPath) {
    return this._getAncestorsArray()
      .filter(node => node.has(firstWordPath))
      .map(node => node.getNode(firstWordPath).childrenToString())
      .reverse()
      .join("\n")
  }
  _doesExtend(nodeTypeId) {
    return this._getAncestorSet().has(nodeTypeId)
  }
  _getAncestorSet() {
    if (!this._cache_ancestorSet) this._cache_ancestorSet = new Set(this._getAncestorsArray().map(def => def._getId()))
    return this._cache_ancestorSet
  }
  // Note: the order is: [this, parent, grandParent, ...]
  _getAncestorsArray(cannotContainNodes) {
    this._initAncestorsArrayCache(cannotContainNodes)
    return this._cache_ancestorsArray
  }
  _getIdThatThisExtends() {
    return this.get(TreeNotationConstants.extends)
  }
  _initAncestorsArrayCache(cannotContainNodes) {
    if (this._cache_ancestorsArray) return undefined
    if (cannotContainNodes && cannotContainNodes.includes(this)) throw new Error(`Loop detected: '${this.getLine()}' is the ancestor of one of its ancestors.`)
    cannotContainNodes = cannotContainNodes || [this]
    let ancestors = [this]
    const extendedId = this._getIdThatThisExtends()
    if (extendedId) {
      const parentNode = this._getIdToNodeMap()[extendedId]
      if (!parentNode) throw new Error(`${extendedId} not found`)
      ancestors = ancestors.concat(parentNode._getAncestorsArray(cannotContainNodes))
    }
    this._cache_ancestorsArray = ancestors
  }
}
class ExtendibleTreeNode extends AbstractExtendibleTreeNode {
  _getIdToNodeMap() {
    if (!this.isRoot()) return this.getRootNode()._getIdToNodeMap()
    if (!this._nodeMapCache) {
      this._nodeMapCache = {}
      this.forEach(child => {
        this._nodeMapCache[child._getId()] = child
      })
    }
    return this._nodeMapCache
  }
  _getId() {
    return this.getWord(0)
  }
}
window.TreeNode = TreeNode
window.ExtendibleTreeNode = ExtendibleTreeNode
window.AbstractExtendibleTreeNode = AbstractExtendibleTreeNode
window.TreeEvents = TreeEvents
window.TreeWord = TreeWord
var GrammarConstantsCompiler
;(function(GrammarConstantsCompiler) {
  GrammarConstantsCompiler["stringTemplate"] = "stringTemplate"
  GrammarConstantsCompiler["indentCharacter"] = "indentCharacter"
  GrammarConstantsCompiler["catchAllCellDelimiter"] = "catchAllCellDelimiter"
  GrammarConstantsCompiler["openChildren"] = "openChildren"
  GrammarConstantsCompiler["joinChildrenWith"] = "joinChildrenWith"
  GrammarConstantsCompiler["closeChildren"] = "closeChildren"
})(GrammarConstantsCompiler || (GrammarConstantsCompiler = {}))
var SQLiteTypes
;(function(SQLiteTypes) {
  SQLiteTypes["integer"] = "INTEGER"
  SQLiteTypes["float"] = "FLOAT"
  SQLiteTypes["text"] = "TEXT"
})(SQLiteTypes || (SQLiteTypes = {}))
var GrammarConstantsMisc
;(function(GrammarConstantsMisc) {
  GrammarConstantsMisc["doNotSynthesize"] = "doNotSynthesize"
  GrammarConstantsMisc["tableName"] = "tableName"
})(GrammarConstantsMisc || (GrammarConstantsMisc = {}))
var PreludeCellTypeIds
;(function(PreludeCellTypeIds) {
  PreludeCellTypeIds["anyCell"] = "anyCell"
  PreludeCellTypeIds["keywordCell"] = "keywordCell"
  PreludeCellTypeIds["extraWordCell"] = "extraWordCell"
  PreludeCellTypeIds["floatCell"] = "floatCell"
  PreludeCellTypeIds["numberCell"] = "numberCell"
  PreludeCellTypeIds["bitCell"] = "bitCell"
  PreludeCellTypeIds["boolCell"] = "boolCell"
  PreludeCellTypeIds["intCell"] = "intCell"
})(PreludeCellTypeIds || (PreludeCellTypeIds = {}))
var GrammarConstantsConstantTypes
;(function(GrammarConstantsConstantTypes) {
  GrammarConstantsConstantTypes["boolean"] = "boolean"
  GrammarConstantsConstantTypes["string"] = "string"
  GrammarConstantsConstantTypes["int"] = "int"
  GrammarConstantsConstantTypes["float"] = "float"
})(GrammarConstantsConstantTypes || (GrammarConstantsConstantTypes = {}))
var GrammarBundleFiles
;(function(GrammarBundleFiles) {
  GrammarBundleFiles["package"] = "package.json"
  GrammarBundleFiles["readme"] = "readme.md"
  GrammarBundleFiles["indexHtml"] = "index.html"
  GrammarBundleFiles["indexJs"] = "index.js"
  GrammarBundleFiles["testJs"] = "test.js"
})(GrammarBundleFiles || (GrammarBundleFiles = {}))
var GrammarCellParser
;(function(GrammarCellParser) {
  GrammarCellParser["prefix"] = "prefix"
  GrammarCellParser["postfix"] = "postfix"
  GrammarCellParser["omnifix"] = "omnifix"
})(GrammarCellParser || (GrammarCellParser = {}))
var GrammarConstants
;(function(GrammarConstants) {
  // node types
  GrammarConstants["extensions"] = "extensions"
  GrammarConstants["toolingDirective"] = "tooling"
  GrammarConstants["todoComment"] = "todo"
  GrammarConstants["version"] = "version"
  GrammarConstants["nodeType"] = "nodeType"
  GrammarConstants["cellType"] = "cellType"
  GrammarConstants["grammarFileExtension"] = "grammar"
  GrammarConstants["abstractNodeTypePrefix"] = "abstract"
  GrammarConstants["nodeTypeSuffix"] = "Node"
  GrammarConstants["cellTypeSuffix"] = "Cell"
  // error check time
  GrammarConstants["regex"] = "regex"
  GrammarConstants["reservedWords"] = "reservedWords"
  GrammarConstants["enumFromCellTypes"] = "enumFromCellTypes"
  GrammarConstants["enum"] = "enum"
  GrammarConstants["examples"] = "examples"
  GrammarConstants["min"] = "min"
  GrammarConstants["max"] = "max"
  // baseNodeTypes
  GrammarConstants["baseNodeType"] = "baseNodeType"
  GrammarConstants["blobNode"] = "blobNode"
  GrammarConstants["errorNode"] = "errorNode"
  // parse time
  GrammarConstants["extends"] = "extends"
  GrammarConstants["root"] = "root"
  GrammarConstants["crux"] = "crux"
  GrammarConstants["cruxFromId"] = "cruxFromId"
  GrammarConstants["pattern"] = "pattern"
  GrammarConstants["inScope"] = "inScope"
  GrammarConstants["cells"] = "cells"
  GrammarConstants["contentDelimiter"] = "contentDelimiter"
  GrammarConstants["contentKey"] = "contentKey"
  GrammarConstants["childrenKey"] = "childrenKey"
  GrammarConstants["uniqueFirstWord"] = "uniqueFirstWord"
  GrammarConstants["catchAllCellType"] = "catchAllCellType"
  GrammarConstants["cellParser"] = "cellParser"
  GrammarConstants["catchAllNodeType"] = "catchAllNodeType"
  GrammarConstants["constants"] = "constants"
  GrammarConstants["required"] = "required"
  GrammarConstants["single"] = "single"
  GrammarConstants["tags"] = "tags"
  GrammarConstants["_extendsJsClass"] = "_extendsJsClass"
  GrammarConstants["_rootNodeJsHeader"] = "_rootNodeJsHeader"
  // default catchAll nodeType
  GrammarConstants["BlobNode"] = "BlobNode"
  GrammarConstants["defaultRootNode"] = "defaultRootNode"
  // code
  GrammarConstants["javascript"] = "javascript"
  // compile time
  GrammarConstants["compilerNodeType"] = "compiler"
  GrammarConstants["compilesTo"] = "compilesTo"
  // develop time
  GrammarConstants["description"] = "description"
  GrammarConstants["example"] = "example"
  GrammarConstants["frequency"] = "frequency"
  GrammarConstants["highlightScope"] = "highlightScope"
})(GrammarConstants || (GrammarConstants = {}))
class TypedWord extends TreeWord {
  constructor(node, cellIndex, type) {
    super(node, cellIndex)
    this._type = type
  }
  get type() {
    return this._type
  }
  toString() {
    return this.word + ":" + this.type
  }
}
// todo: can we merge these methods into base TreeNode and ditch this class?
class GrammarBackedNode extends TreeNode {
  getDefinition() {
    const handGrammarProgram = this.getHandGrammarProgram()
    return this.isRoot() ? handGrammarProgram : handGrammarProgram.getNodeTypeDefinitionByNodeTypeId(this.constructor.name)
  }
  toSQLiteInsertStatement(id) {
    const def = this.getDefinition()
    const tableName = this.tableName || def.getTableNameIfAny() || def._getId()
    const columns = def.getSQLiteTableColumns()
    const hits = columns.filter(colDef => this.has(colDef.columnName))
    const values = hits.map(colDef => {
      const node = this.getNode(colDef.columnName)
      let content = node.getContent()
      const hasChildren = node.length
      const isText = colDef.type === SQLiteTypes.text
      if (content && hasChildren) content = node.getContentWithChildren().replace(/\n/g, "\\n")
      else if (hasChildren) content = node.childrenToString().replace(/\n/g, "\\n")
      return isText || hasChildren ? `"${content}"` : content
    })
    hits.unshift({ columnName: "id", type: SQLiteTypes.text })
    values.unshift(`"${id}"`)
    return `INSERT INTO ${tableName} (${hits.map(col => col.columnName).join(",")}) VALUES (${values.join(",")});`
  }
  getAutocompleteResults(partialWord, cellIndex) {
    return cellIndex === 0 ? this._getAutocompleteResultsForFirstWord(partialWord) : this._getAutocompleteResultsForCell(partialWord, cellIndex)
  }
  getChildInstancesOfNodeTypeId(nodeTypeId) {
    return this.filter(node => node.doesExtend(nodeTypeId))
  }
  doesExtend(nodeTypeId) {
    return this.getDefinition()._doesExtend(nodeTypeId)
  }
  _getErrorNodeErrors() {
    return [this.getFirstWord() ? new UnknownNodeTypeError(this) : new BlankLineError(this)]
  }
  _getBlobNodeCatchAllNodeType() {
    return BlobNode
  }
  _getAutocompleteResultsForFirstWord(partialWord) {
    const keywordMap = this.getDefinition().getFirstWordMapWithDefinitions()
    let keywords = Object.keys(keywordMap)
    if (partialWord) keywords = keywords.filter(keyword => keyword.includes(partialWord))
    return keywords.map(keyword => {
      const def = keywordMap[keyword]
      const description = def.getDescription()
      return {
        text: keyword,
        displayText: keyword + (description ? " " + description : "")
      }
    })
  }
  _getAutocompleteResultsForCell(partialWord, cellIndex) {
    // todo: root should be [] correct?
    const cell = this._getParsedCells()[cellIndex]
    return cell ? cell.getAutoCompleteWords(partialWord) : []
  }
  // note: this is overwritten by the root node of a runtime grammar program.
  // some of the magic that makes this all work. but maybe there's a better way.
  getHandGrammarProgram() {
    if (this.isRoot()) throw new Error(`Root node without getHandGrammarProgram defined.`)
    return this.getRootNode().getHandGrammarProgram()
  }
  getRunTimeEnumOptions(cell) {
    return undefined
  }
  _sortNodesByInScopeOrder() {
    const nodeTypeOrder = this.getDefinition()._getMyInScopeNodeTypeIds()
    if (!nodeTypeOrder.length) return this
    const orderMap = {}
    nodeTypeOrder.forEach((word, index) => {
      orderMap[word] = index
    })
    this.sort(
      TreeUtils.makeSortByFn(runtimeNode => {
        return orderMap[runtimeNode.getDefinition().getNodeTypeIdFromDefinition()]
      })
    )
    return this
  }
  get requiredNodeErrors() {
    const errors = []
    Object.values(this.getDefinition().getFirstWordMapWithDefinitions()).forEach(def => {
      if (def.isRequired()) if (!this.getChildren().some(node => node.getDefinition() === def)) errors.push(new MissingRequiredNodeTypeError(this, def.getNodeTypeIdFromDefinition()))
    })
    return errors
  }
  getProgramAsCells() {
    // todo: what is this?
    return this.getTopDownArray().map(node => {
      const cells = node._getParsedCells()
      let indents = node.getIndentLevel() - 1
      while (indents) {
        cells.unshift(undefined)
        indents--
      }
      return cells
    })
  }
  getProgramWidth() {
    return Math.max(...this.getProgramAsCells().map(line => line.length))
  }
  getAllTypedWords() {
    const words = []
    this.getTopDownArray().forEach(node => {
      node.getWordTypes().forEach((cell, index) => {
        words.push(new TypedWord(node, index, cell.getCellTypeId()))
      })
    })
    return words
  }
  findAllWordsWithCellType(cellTypeId) {
    return this.getAllTypedWords().filter(typedWord => typedWord.type === cellTypeId)
  }
  findAllNodesWithNodeType(nodeTypeId) {
    return this.getTopDownArray().filter(node => node.getDefinition().getNodeTypeIdFromDefinition() === nodeTypeId)
  }
  toCellTypeTree() {
    return this.getTopDownArray()
      .map(child => child.getIndentation() + child.getLineCellTypes())
      .join("\n")
  }
  getParseTable(maxColumnWidth = 40) {
    const tree = new TreeNode(this.toCellTypeTree())
    return new TreeNode(
      tree.getTopDownArray().map((node, lineNumber) => {
        const sourceNode = this.nodeAtLine(lineNumber)
        const errs = sourceNode.getErrors()
        const errorCount = errs.length
        const obj = {
          lineNumber: lineNumber,
          source: sourceNode.getIndentation() + sourceNode.getLine(),
          nodeType: sourceNode.constructor.name,
          cellTypes: node.getContent(),
          errorCount: errorCount
        }
        if (errorCount) obj.errorMessages = errs.map(err => err.getMessage()).join(";")
        return obj
      })
    ).toFormattedTable(maxColumnWidth)
  }
  // Helper method for selecting potential nodeTypes needed to update grammar file.
  getInvalidNodeTypes() {
    return Array.from(
      new Set(
        this.getAllErrors()
          .filter(err => err instanceof UnknownNodeTypeError)
          .map(err => err.getNode().getFirstWord())
      )
    )
  }
  _getAllAutoCompleteWords() {
    return this.getAllWordBoundaryCoordinates().map(coordinate => {
      const results = this.getAutocompleteResultsAt(coordinate.lineIndex, coordinate.charIndex)
      return {
        lineIndex: coordinate.lineIndex,
        charIndex: coordinate.charIndex,
        wordIndex: coordinate.wordIndex,
        word: results.word,
        suggestions: results.matches
      }
    })
  }
  toAutoCompleteCube(fillChar = "") {
    const trees = [this.clone()]
    const filled = this.clone().fill(fillChar)
    this._getAllAutoCompleteWords().forEach(hole => {
      hole.suggestions.forEach((suggestion, index) => {
        if (!trees[index + 1]) trees[index + 1] = filled.clone()
        trees[index + 1].nodeAtLine(hole.lineIndex).setWord(hole.wordIndex, suggestion.text)
      })
    })
    return new TreeNode(trees)
  }
  toAutoCompleteTable() {
    return new TreeNode(
      this._getAllAutoCompleteWords().map(result => {
        result.suggestions = result.suggestions.map(node => node.text).join(" ")
        return result
      })
    ).toTable()
  }
  getAutocompleteResultsAt(lineIndex, charIndex) {
    const lineNode = this.nodeAtLine(lineIndex) || this
    const nodeInScope = lineNode.getNodeInScopeAtCharIndex(charIndex)
    // todo: add more tests
    // todo: second param this.childrenToString()
    // todo: change to getAutocomplete definitions
    const wordIndex = lineNode.getWordIndexAtCharacterIndex(charIndex)
    const wordProperties = lineNode.getWordProperties(wordIndex)
    return {
      startCharIndex: wordProperties.startCharIndex,
      endCharIndex: wordProperties.endCharIndex,
      word: wordProperties.word,
      matches: nodeInScope.getAutocompleteResults(wordProperties.word, wordIndex)
    }
  }
  _sortWithParentNodeTypesUpTop() {
    const familyTree = new HandGrammarProgram(this.toString()).getNodeTypeFamilyTree()
    const rank = {}
    familyTree.getTopDownArray().forEach((node, index) => {
      rank[node.getWord(0)] = index
    })
    const nodeAFirst = -1
    const nodeBFirst = 1
    this.sort((nodeA, nodeB) => {
      const nodeARank = rank[nodeA.getWord(0)]
      const nodeBRank = rank[nodeB.getWord(0)]
      return nodeARank < nodeBRank ? nodeAFirst : nodeBFirst
    })
    return this
  }
  format() {
    if (this.isRoot()) {
      this._sortNodesByInScopeOrder()
      try {
        this._sortWithParentNodeTypesUpTop()
      } catch (err) {
        console.log(`Warning: ${err}`)
      }
    }
    this.getTopDownArray().forEach(child => {
      child.format()
    })
    return this
  }
  getNodeTypeUsage(filepath = "") {
    // returns a report on what nodeTypes from its language the program uses
    const usage = new TreeNode()
    const handGrammarProgram = this.getHandGrammarProgram()
    handGrammarProgram.getValidConcreteAndAbstractNodeTypeDefinitions().forEach(def => {
      const requiredCellTypeIds = def.getCellParser().getRequiredCellTypeIds()
      usage.appendLine([def.getNodeTypeIdFromDefinition(), "line-id", "nodeType", requiredCellTypeIds.join(" ")].join(" "))
    })
    this.getTopDownArray().forEach((node, lineNumber) => {
      const stats = usage.getNode(node.getNodeTypeId())
      stats.appendLine([filepath + "-" + lineNumber, node.getWords().join(" ")].join(" "))
    })
    return usage
  }
  toHighlightScopeTree() {
    return this.getTopDownArray()
      .map(child => child.getIndentation() + child.getLineHighlightScopes())
      .join("\n")
  }
  toDefinitionLineNumberTree() {
    return this.getTopDownArray()
      .map(child => child.getDefinition().getLineNumber() + " " + child.getIndentation() + child.getCellDefinitionLineNumbers().join(" "))
      .join("\n")
  }
  toCellTypeTreeWithNodeConstructorNames() {
    return this.getTopDownArray()
      .map(child => child.constructor.name + this.getWordBreakSymbol() + child.getIndentation() + child.getLineCellTypes())
      .join("\n")
  }
  toPreludeCellTypeTreeWithNodeConstructorNames() {
    return this.getTopDownArray()
      .map(child => child.constructor.name + this.getWordBreakSymbol() + child.getIndentation() + child.getLineCellPreludeTypes())
      .join("\n")
  }
  getTreeWithNodeTypes() {
    return this.getTopDownArray()
      .map(child => child.constructor.name + this.getWordBreakSymbol() + child.getIndentation() + child.getLine())
      .join("\n")
  }
  getCellHighlightScopeAtPosition(lineIndex, wordIndex) {
    this._initCellTypeCache()
    const typeNode = this._cache_highlightScopeTree.getTopDownArray()[lineIndex - 1]
    return typeNode ? typeNode.getWord(wordIndex - 1) : undefined
  }
  _initCellTypeCache() {
    const treeMTime = this.getLineOrChildrenModifiedTime()
    if (this._cache_programCellTypeStringMTime === treeMTime) return undefined
    this._cache_typeTree = new TreeNode(this.toCellTypeTree())
    this._cache_highlightScopeTree = new TreeNode(this.toHighlightScopeTree())
    this._cache_programCellTypeStringMTime = treeMTime
  }
  createParser() {
    return this.isRoot()
      ? new TreeNode.Parser(BlobNode)
      : new TreeNode.Parser(
          this.getParent()
            ._getParser()
            ._getCatchAllNodeConstructor(this.getParent()),
          {}
        )
  }
  getNodeTypeId() {
    return this.getDefinition().getNodeTypeIdFromDefinition()
  }
  getWordTypes() {
    return this._getParsedCells().filter(cell => cell.getWord() !== undefined)
  }
  get cellErrors() {
    return this._getParsedCells()
      .map(check => check.getErrorIfAny())
      .filter(identity => identity)
  }
  get singleNodeUsedTwiceErrors() {
    const errors = []
    const parent = this.getParent()
    const hits = parent.getChildInstancesOfNodeTypeId(this.getDefinition().id)
    if (hits.length > 1)
      hits.forEach((node, index) => {
        if (node === this) errors.push(new NodeTypeUsedMultipleTimesError(node))
      })
    return errors
  }
  get scopeErrors() {
    let errors = []
    if (this.getDefinition().isSingle) errors = errors.concat(this.singleNodeUsedTwiceErrors)
    const { requiredNodeErrors } = this
    if (requiredNodeErrors.length) errors = errors.concat(requiredNodeErrors)
    return errors
  }
  getErrors() {
    return this.cellErrors.concat(this.scopeErrors)
  }
  _getParsedCells() {
    return this.getDefinition()
      .getCellParser()
      .getCellArray(this)
  }
  // todo: just make a fn that computes proper spacing and then is given a node to print
  getLineCellTypes() {
    return this._getParsedCells()
      .map(slot => slot.getCellTypeId())
      .join(" ")
  }
  getLineCellPreludeTypes() {
    return this._getParsedCells()
      .map(slot => {
        const def = slot._getCellTypeDefinition()
        //todo: cleanup
        return def ? def._getPreludeKindId() : PreludeCellTypeIds.anyCell
      })
      .join(" ")
  }
  getLineHighlightScopes(defaultScope = "source") {
    return this._getParsedCells()
      .map(slot => slot.getHighlightScope() || defaultScope)
      .join(" ")
  }
  getCellDefinitionLineNumbers() {
    return this._getParsedCells().map(cell => cell.getDefinitionLineNumber())
  }
  _getCompiledIndentation() {
    const indentCharacter = this.getDefinition()._getCompilerObject()[GrammarConstantsCompiler.indentCharacter]
    const indent = this.getIndentation()
    return indentCharacter !== undefined ? indentCharacter.repeat(indent.length) : indent
  }
  _getFields() {
    // fields are like cells
    const fields = {}
    this.forEach(node => {
      const def = node.getDefinition()
      if (def.isRequired() || def.isSingle) fields[node.getWord(0)] = node.getContent()
    })
    return fields
  }
  _getCompiledLine() {
    const compiler = this.getDefinition()._getCompilerObject()
    const catchAllCellDelimiter = compiler[GrammarConstantsCompiler.catchAllCellDelimiter]
    const str = compiler[GrammarConstantsCompiler.stringTemplate]
    return str !== undefined ? TreeUtils.formatStr(str, catchAllCellDelimiter, Object.assign(this._getFields(), this.cells)) : this.getLine()
  }
  get contentDelimiter() {
    return this.getDefinition()._getFromExtended(GrammarConstants.contentDelimiter)
  }
  get contentKey() {
    return this.getDefinition()._getFromExtended(GrammarConstants.contentKey)
  }
  get childrenKey() {
    return this.getDefinition()._getFromExtended(GrammarConstants.childrenKey)
  }
  get childrenAreTextBlob() {
    return this.getDefinition()._isBlobNodeType()
  }
  get isArrayElement() {
    return this.getDefinition()._hasFromExtended(GrammarConstants.uniqueFirstWord) ? false : !this.getDefinition().isSingle
  }
  get typedContent() {
    const cells = this._getParsedCells()
    // todo: probably a better way to do this, perhaps by defining a cellDelimiter at the node level
    // todo: this currently parse anything other than string types
    if (this.contentDelimiter) return this.getContent().split(this.contentDelimiter)
    if (cells.length === 2) return cells[1].getParsed()
    return this.getContent()
  }
  get typedTuple() {
    const key = this.getFirstWord()
    const { typedContent, contentKey, childrenKey } = this
    const hasChildren = this.length > 0
    const hasChildrenNoContent = typedContent === undefined && hasChildren
    const hasChildrenAndContent = typedContent !== undefined && hasChildren
    const shouldReturnValueAsObject = hasChildrenNoContent
    if (contentKey || childrenKey) {
      let obj = {}
      if (childrenKey) obj[childrenKey] = this.childrenToString()
      else obj = this.typedMap
      if (contentKey) {
        obj[contentKey] = typedContent
      }
      return [key, obj]
    }
    if (this.childrenAreTextBlob) return [key, this.childrenToString()]
    if (shouldReturnValueAsObject) return [key, this.typedMap]
    const shouldReturnValueAsContentPlusChildren = hasChildrenAndContent
    // If the node has a content and a subtree return it as a string, as
    // Javascript object values can't be both a leaf and a tree.
    if (shouldReturnValueAsContentPlusChildren) return [key, this.getContentWithChildren()]
    return [key, typedContent]
  }
  get _shouldSerialize() {
    const should = this.shouldSerialize
    return should === undefined ? true : should
  }
  get typedMap() {
    const obj = {}
    this.forEach(node => {
      if (!node._shouldSerialize) return true
      const tuple = node.typedTuple
      if (!node.isArrayElement) obj[tuple[0]] = tuple[1]
      else {
        if (!obj[tuple[0]]) obj[tuple[0]] = []
        obj[tuple[0]].push(tuple[1])
      }
    })
    return obj
  }
  fromTypedMap() {}
  compile() {
    if (this.isRoot()) return super.compile()
    const def = this.getDefinition()
    const indent = this._getCompiledIndentation()
    const compiledLine = this._getCompiledLine()
    if (def.isTerminalNodeType()) return indent + compiledLine
    const compiler = def._getCompilerObject()
    const openChildrenString = compiler[GrammarConstantsCompiler.openChildren] || ""
    const closeChildrenString = compiler[GrammarConstantsCompiler.closeChildren] || ""
    const childJoinCharacter = compiler[GrammarConstantsCompiler.joinChildrenWith] || "\n"
    const compiledChildren = this.map(child => child.compile()).join(childJoinCharacter)
    return `${indent + compiledLine}${openChildrenString}
${compiledChildren}
${indent}${closeChildrenString}`
  }
  // todo: remove
  get cells() {
    const cells = {}
    this._getParsedCells().forEach(cell => {
      const cellTypeId = cell.getCellTypeId()
      if (!cell.isCatchAll()) cells[cellTypeId] = cell.getParsed()
      else {
        if (!cells[cellTypeId]) cells[cellTypeId] = []
        cells[cellTypeId].push(cell.getParsed())
      }
    })
    return cells
  }
}
class BlobNode extends GrammarBackedNode {
  createParser() {
    return new TreeNode.Parser(BlobNode, {})
  }
  getErrors() {
    return []
  }
}
// todo: can we remove this? hard to extend.
class UnknownNodeTypeNode extends GrammarBackedNode {
  createParser() {
    return new TreeNode.Parser(UnknownNodeTypeNode, {})
  }
  getErrors() {
    return [new UnknownNodeTypeError(this)]
  }
}
/*
A cell contains a word but also the type information for that word.
*/
class AbstractGrammarBackedCell {
  constructor(node, index, typeDef, cellTypeId, isCatchAll, nodeTypeDef) {
    this._typeDef = typeDef
    this._node = node
    this._isCatchAll = isCatchAll
    this._index = index
    this._cellTypeId = cellTypeId
    this._nodeTypeDefinition = nodeTypeDef
  }
  getWord() {
    return this._node.getWord(this._index)
  }
  getDefinitionLineNumber() {
    return this._typeDef.getLineNumber()
  }
  getSQLiteType() {
    return SQLiteTypes.text
  }
  getCellTypeId() {
    return this._cellTypeId
  }
  getNode() {
    return this._node
  }
  getCellIndex() {
    return this._index
  }
  isCatchAll() {
    return this._isCatchAll
  }
  get min() {
    return this._getCellTypeDefinition().get(GrammarConstants.min) || "0"
  }
  get max() {
    return this._getCellTypeDefinition().get(GrammarConstants.max) || "100"
  }
  get placeholder() {
    return this._getCellTypeDefinition().get(GrammarConstants.examples) || ""
  }
  getHighlightScope() {
    const definition = this._getCellTypeDefinition()
    if (definition) return definition.getHighlightScope() // todo: why the undefined?
  }
  getAutoCompleteWords(partialWord = "") {
    const cellDef = this._getCellTypeDefinition()
    let words = cellDef ? cellDef._getAutocompleteWordOptions(this.getNode().getRootNode()) : []
    const runTimeOptions = this.getNode().getRunTimeEnumOptions(this)
    if (runTimeOptions) words = runTimeOptions.concat(words)
    if (partialWord) words = words.filter(word => word.includes(partialWord))
    return words.map(word => {
      return {
        text: word,
        displayText: word
      }
    })
  }
  synthesizeCell(seed = Date.now()) {
    // todo: cleanup
    const cellDef = this._getCellTypeDefinition()
    const enumOptions = cellDef._getFromExtended(GrammarConstants.enum)
    if (enumOptions) return TreeUtils.getRandomString(1, enumOptions.split(" "))
    return this._synthesizeCell(seed)
  }
  _getStumpEnumInput(crux) {
    const cellDef = this._getCellTypeDefinition()
    const enumOptions = cellDef._getFromExtended(GrammarConstants.enum)
    if (!enumOptions) return undefined
    const options = new TreeNode(
      enumOptions
        .split(" ")
        .map(option => `option ${option}`)
        .join("\n")
    )
    return `select
 name ${crux}
${options.toString(1)}`
  }
  _toStumpInput(crux) {
    // todo: remove
    const enumInput = this._getStumpEnumInput(crux)
    if (enumInput) return enumInput
    // todo: cleanup. We shouldn't have these dual cellType classes.
    return `input
 name ${crux}
 placeholder ${this.placeholder}`
  }
  _getCellTypeDefinition() {
    return this._typeDef
  }
  _getFullLine() {
    return this.getNode().getLine()
  }
  _getErrorContext() {
    return this._getFullLine().split(" ")[0] // todo: WordBreakSymbol
  }
  isValid() {
    const runTimeOptions = this.getNode().getRunTimeEnumOptions(this)
    const word = this.getWord()
    if (runTimeOptions) return runTimeOptions.includes(word)
    return this._getCellTypeDefinition().isValid(word, this.getNode().getRootNode()) && this._isValid()
  }
  getErrorIfAny() {
    const word = this.getWord()
    if (word !== undefined && this.isValid()) return undefined
    // todo: refactor invalidwordError. We want better error messages.
    return word === undefined || word === "" ? new MissingWordError(this) : new InvalidWordError(this)
  }
}
AbstractGrammarBackedCell.parserFunctionName = ""
class GrammarBitCell extends AbstractGrammarBackedCell {
  _isValid() {
    const word = this.getWord()
    return word === "0" || word === "1"
  }
  _synthesizeCell() {
    return TreeUtils.getRandomString(1, "01".split(""))
  }
  getRegexString() {
    return "[01]"
  }
  getParsed() {
    const word = this.getWord()
    return !!parseInt(word)
  }
}
GrammarBitCell.defaultHighlightScope = "constant.numeric"
class GrammarNumericCell extends AbstractGrammarBackedCell {
  _toStumpInput(crux) {
    return `input
 name ${crux}
 type number
 placeholder ${this.placeholder}
 min ${this.min}
 max ${this.max}`
  }
}
class GrammarIntCell extends GrammarNumericCell {
  _isValid() {
    const word = this.getWord()
    const num = parseInt(word)
    if (isNaN(num)) return false
    return num.toString() === word
  }
  _synthesizeCell(seed) {
    return TreeUtils.randomUniformInt(parseInt(this.min), parseInt(this.max), seed).toString()
  }
  getRegexString() {
    return "-?[0-9]+"
  }
  getSQLiteType() {
    return SQLiteTypes.integer
  }
  getParsed() {
    const word = this.getWord()
    return parseInt(word)
  }
}
GrammarIntCell.defaultHighlightScope = "constant.numeric.integer"
GrammarIntCell.parserFunctionName = "parseInt"
class GrammarFloatCell extends GrammarNumericCell {
  _isValid() {
    const word = this.getWord()
    const num = parseFloat(word)
    return !isNaN(num) && /^-?\d*(\.\d+)?$/.test(word)
  }
  getSQLiteType() {
    return SQLiteTypes.float
  }
  _synthesizeCell(seed) {
    return TreeUtils.randomUniformFloat(parseFloat(this.min), parseFloat(this.max), seed).toString()
  }
  getRegexString() {
    return "-?d*(.d+)?"
  }
  getParsed() {
    const word = this.getWord()
    return parseFloat(word)
  }
}
GrammarFloatCell.defaultHighlightScope = "constant.numeric.float"
GrammarFloatCell.parserFunctionName = "parseFloat"
// ErrorCellType => grammar asks for a '' cell type here but the grammar does not specify a '' cell type. (todo: bring in didyoumean?)
class GrammarBoolCell extends AbstractGrammarBackedCell {
  constructor() {
    super(...arguments)
    this._trues = new Set(["1", "true", "t", "yes"])
    this._falses = new Set(["0", "false", "f", "no"])
  }
  _isValid() {
    const word = this.getWord()
    const str = word.toLowerCase()
    return this._trues.has(str) || this._falses.has(str)
  }
  getSQLiteType() {
    return SQLiteTypes.integer
  }
  _synthesizeCell() {
    return TreeUtils.getRandomString(1, ["1", "true", "t", "yes", "0", "false", "f", "no"])
  }
  _getOptions() {
    return Array.from(this._trues).concat(Array.from(this._falses))
  }
  getRegexString() {
    return "(?:" + this._getOptions().join("|") + ")"
  }
  getParsed() {
    const word = this.getWord()
    return this._trues.has(word.toLowerCase())
  }
}
GrammarBoolCell.defaultHighlightScope = "constant.numeric"
class GrammarAnyCell extends AbstractGrammarBackedCell {
  _isValid() {
    return true
  }
  _synthesizeCell() {
    const examples = this._getCellTypeDefinition()._getFromExtended(GrammarConstants.examples)
    if (examples) return TreeUtils.getRandomString(1, examples.split(" "))
    return this._nodeTypeDefinition.getNodeTypeIdFromDefinition() + "-" + this.constructor.name
  }
  getRegexString() {
    return "[^ ]+"
  }
  getParsed() {
    return this.getWord()
  }
}
class GrammarKeywordCell extends GrammarAnyCell {
  _synthesizeCell() {
    return this._nodeTypeDefinition._getCruxIfAny()
  }
}
GrammarKeywordCell.defaultHighlightScope = "keyword"
class GrammarExtraWordCellTypeCell extends AbstractGrammarBackedCell {
  _isValid() {
    return false
  }
  synthesizeCell() {
    throw new Error(`Trying to synthesize a GrammarExtraWordCellTypeCell`)
    return this._synthesizeCell()
  }
  _synthesizeCell() {
    return "extraWord" // should never occur?
  }
  getParsed() {
    return this.getWord()
  }
  getErrorIfAny() {
    return new ExtraWordError(this)
  }
}
class GrammarUnknownCellTypeCell extends AbstractGrammarBackedCell {
  _isValid() {
    return false
  }
  synthesizeCell() {
    throw new Error(`Trying to synthesize an GrammarUnknownCellTypeCell`)
    return this._synthesizeCell()
  }
  _synthesizeCell() {
    return "extraWord" // should never occur?
  }
  getParsed() {
    return this.getWord()
  }
  getErrorIfAny() {
    return new UnknownCellTypeError(this)
  }
}
class AbstractTreeError {
  constructor(node) {
    this._node = node
  }
  getLineIndex() {
    return this.getLineNumber() - 1
  }
  getLineNumber() {
    return this.getNode()._getLineNumber() // todo: handle sourcemaps
  }
  isCursorOnWord(lineIndex, characterIndex) {
    return lineIndex === this.getLineIndex() && this._doesCharacterIndexFallOnWord(characterIndex)
  }
  _doesCharacterIndexFallOnWord(characterIndex) {
    return this.getCellIndex() === this.getNode().getWordIndexAtCharacterIndex(characterIndex)
  }
  // convenience method. may be removed.
  isBlankLineError() {
    return false
  }
  // convenience method. may be removed.
  isMissingWordError() {
    return false
  }
  getIndent() {
    return this.getNode().getIndentation()
  }
  getCodeMirrorLineWidgetElement(onApplySuggestionCallBack = () => {}) {
    const suggestion = this.getSuggestionMessage()
    if (this.isMissingWordError()) return this._getCodeMirrorLineWidgetElementCellTypeHints()
    if (suggestion) return this._getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack, suggestion)
    return this._getCodeMirrorLineWidgetElementWithoutSuggestion()
  }
  getNodeTypeId() {
    return this.getNode()
      .getDefinition()
      .getNodeTypeIdFromDefinition()
  }
  _getCodeMirrorLineWidgetElementCellTypeHints() {
    const el = document.createElement("div")
    el.appendChild(
      document.createTextNode(
        this.getIndent() +
          this.getNode()
            .getDefinition()
            .getLineHints()
      )
    )
    el.className = "LintCellTypeHints"
    return el
  }
  _getCodeMirrorLineWidgetElementWithoutSuggestion() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + this.getMessage()))
    el.className = "LintError"
    return el
  }
  _getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack, suggestion) {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + `${this.getErrorTypeName()}. Suggestion: ${suggestion}`))
    el.className = "LintErrorWithSuggestion"
    el.onclick = () => {
      this.applySuggestion()
      onApplySuggestionCallBack()
    }
    return el
  }
  getLine() {
    return this.getNode().getLine()
  }
  getExtension() {
    return this.getNode()
      .getHandGrammarProgram()
      .getExtensionName()
  }
  getNode() {
    return this._node
  }
  getErrorTypeName() {
    return this.constructor.name.replace("Error", "")
  }
  getCellIndex() {
    return 0
  }
  toObject() {
    return {
      type: this.getErrorTypeName(),
      line: this.getLineNumber(),
      cell: this.getCellIndex(),
      suggestion: this.getSuggestionMessage(),
      path: this.getNode().getFirstWordPath(),
      message: this.getMessage()
    }
  }
  hasSuggestion() {
    return this.getSuggestionMessage() !== ""
  }
  getSuggestionMessage() {
    return ""
  }
  toString() {
    return this.getMessage()
  }
  applySuggestion() {}
  getMessage() {
    return `${this.getErrorTypeName()} at line ${this.getLineNumber()} cell ${this.getCellIndex()}.`
  }
}
class AbstractCellError extends AbstractTreeError {
  constructor(cell) {
    super(cell.getNode())
    this._cell = cell
  }
  getCell() {
    return this._cell
  }
  getCellIndex() {
    return this._cell.getCellIndex()
  }
  _getWordSuggestion() {
    return TreeUtils.didYouMean(
      this.getCell().getWord(),
      this.getCell()
        .getAutoCompleteWords()
        .map(option => option.text)
    )
  }
}
class UnknownNodeTypeError extends AbstractTreeError {
  getMessage() {
    const node = this.getNode()
    const parentNode = node.getParent()
    const options = parentNode._getParser().getFirstWordOptions()
    return super.getMessage() + ` Invalid nodeType "${node.getFirstWord()}". Valid nodeTypes are: ${TreeUtils._listToEnglishText(options, 7)}.`
  }
  _getWordSuggestion() {
    const node = this.getNode()
    const parentNode = node.getParent()
    return TreeUtils.didYouMean(node.getFirstWord(), parentNode.getAutocompleteResults("", 0).map(option => option.text))
  }
  getSuggestionMessage() {
    const suggestion = this._getWordSuggestion()
    const node = this.getNode()
    if (suggestion) return `Change "${node.getFirstWord()}" to "${suggestion}"`
    return ""
  }
  applySuggestion() {
    const suggestion = this._getWordSuggestion()
    if (suggestion) this.getNode().setWord(this.getCellIndex(), suggestion)
    return this
  }
}
class BlankLineError extends UnknownNodeTypeError {
  getMessage() {
    return super.getMessage() + ` Line: "${this.getNode().getLine()}". Blank lines are errors.`
  }
  // convenience method
  isBlankLineError() {
    return true
  }
  getSuggestionMessage() {
    return `Delete line ${this.getLineNumber()}`
  }
  applySuggestion() {
    this.getNode().destroy()
    return this
  }
}
class MissingRequiredNodeTypeError extends AbstractTreeError {
  constructor(node, missingNodeTypeId) {
    super(node)
    this._missingNodeTypeId = missingNodeTypeId
  }
  getMessage() {
    return super.getMessage() + ` A "${this._missingNodeTypeId}" is required.`
  }
}
class NodeTypeUsedMultipleTimesError extends AbstractTreeError {
  getMessage() {
    return super.getMessage() + ` Multiple "${this.getNode().getFirstWord()}" found.`
  }
  getSuggestionMessage() {
    return `Delete line ${this.getLineNumber()}`
  }
  applySuggestion() {
    return this.getNode().destroy()
  }
}
class UnknownCellTypeError extends AbstractCellError {
  getMessage() {
    return super.getMessage() + ` No cellType "${this.getCell().getCellTypeId()}" found. Language grammar for "${this.getExtension()}" may need to be fixed.`
  }
}
class InvalidWordError extends AbstractCellError {
  getMessage() {
    return super.getMessage() + ` "${this.getCell().getWord()}" does not fit in cellType "${this.getCell().getCellTypeId()}".`
  }
  getSuggestionMessage() {
    const suggestion = this._getWordSuggestion()
    if (suggestion) return `Change "${this.getCell().getWord()}" to "${suggestion}"`
    return ""
  }
  applySuggestion() {
    const suggestion = this._getWordSuggestion()
    if (suggestion) this.getNode().setWord(this.getCellIndex(), suggestion)
    return this
  }
}
class ExtraWordError extends AbstractCellError {
  getMessage() {
    return super.getMessage() + ` Extra word "${this.getCell().getWord()}" in ${this.getNodeTypeId()}.`
  }
  getSuggestionMessage() {
    return `Delete word "${this.getCell().getWord()}" at cell ${this.getCellIndex()}`
  }
  applySuggestion() {
    return this.getNode().deleteWordAt(this.getCellIndex())
  }
}
class MissingWordError extends AbstractCellError {
  // todo: autocomplete suggestion
  getMessage() {
    return super.getMessage() + ` Missing word for cell "${this.getCell().getCellTypeId()}".`
  }
  isMissingWordError() {
    return true
  }
}
// todo: add standard types, enum types, from disk types
class AbstractGrammarWordTestNode extends TreeNode {}
class GrammarRegexTestNode extends AbstractGrammarWordTestNode {
  isValid(str) {
    if (!this._regex) this._regex = new RegExp("^" + this.getContent() + "$")
    return !!str.match(this._regex)
  }
}
class GrammarReservedWordsTestNode extends AbstractGrammarWordTestNode {
  isValid(str) {
    if (!this._set) this._set = new Set(this.getContent().split(" "))
    return !this._set.has(str)
  }
}
// todo: remove in favor of custom word type constructors
class EnumFromCellTypesTestNode extends AbstractGrammarWordTestNode {
  _getEnumFromCellTypes(programRootNode) {
    const cellTypeIds = this.getWordsFrom(1)
    const enumGroup = cellTypeIds.join(" ")
    // note: hack where we store it on the program. otherwise has global effects.
    if (!programRootNode._enumMaps) programRootNode._enumMaps = {}
    if (programRootNode._enumMaps[enumGroup]) return programRootNode._enumMaps[enumGroup]
    const wordIndex = 1
    const map = {}
    const cellTypeMap = {}
    cellTypeIds.forEach(typeId => (cellTypeMap[typeId] = true))
    programRootNode
      .getAllTypedWords()
      .filter(typedWord => cellTypeMap[typedWord.type])
      .forEach(typedWord => {
        map[typedWord.word] = true
      })
    programRootNode._enumMaps[enumGroup] = map
    return map
  }
  // todo: remove
  isValid(str, programRootNode) {
    return this._getEnumFromCellTypes(programRootNode)[str] === true
  }
}
class GrammarEnumTestNode extends AbstractGrammarWordTestNode {
  isValid(str) {
    // enum c c++ java
    return !!this.getOptions()[str]
  }
  getOptions() {
    if (!this._map) this._map = TreeUtils.arrayToMap(this.getWordsFrom(1))
    return this._map
  }
}
class cellTypeDefinitionNode extends AbstractExtendibleTreeNode {
  createParser() {
    const types = {}
    types[GrammarConstants.regex] = GrammarRegexTestNode
    types[GrammarConstants.reservedWords] = GrammarReservedWordsTestNode
    types[GrammarConstants.enumFromCellTypes] = EnumFromCellTypesTestNode
    types[GrammarConstants.enum] = GrammarEnumTestNode
    types[GrammarConstants.highlightScope] = TreeNode
    types[GrammarConstants.todoComment] = TreeNode
    types[GrammarConstants.examples] = TreeNode
    types[GrammarConstants.min] = TreeNode
    types[GrammarConstants.max] = TreeNode
    types[GrammarConstants.description] = TreeNode
    types[GrammarConstants.extends] = TreeNode
    return new TreeNode.Parser(undefined, types)
  }
  _getId() {
    return this.getWord(0)
  }
  _getIdToNodeMap() {
    return this.getParent().getCellTypeDefinitions()
  }
  getGetter(wordIndex) {
    const wordToNativeJavascriptTypeParser = this.getCellConstructor().parserFunctionName
    return `get ${this.getCellTypeId()}() {
      return ${wordToNativeJavascriptTypeParser ? wordToNativeJavascriptTypeParser + `(this.getWord(${wordIndex}))` : `this.getWord(${wordIndex})`}
    }`
  }
  getCatchAllGetter(wordIndex) {
    const wordToNativeJavascriptTypeParser = this.getCellConstructor().parserFunctionName
    return `get ${this.getCellTypeId()}() {
      return ${wordToNativeJavascriptTypeParser ? `this.getWordsFrom(${wordIndex}).map(val => ${wordToNativeJavascriptTypeParser}(val))` : `this.getWordsFrom(${wordIndex})`}
    }`
  }
  // `this.getWordsFrom(${requireds.length + 1})`
  // todo: cleanup typings. todo: remove this hidden logic. have a "baseType" property?
  getCellConstructor() {
    return this._getPreludeKind() || GrammarAnyCell
  }
  _getPreludeKind() {
    return PreludeKinds[this.getWord(0)] || PreludeKinds[this._getExtendedCellTypeId()]
  }
  _getPreludeKindId() {
    if (PreludeKinds[this.getWord(0)]) return this.getWord(0)
    else if (PreludeKinds[this._getExtendedCellTypeId()]) return this._getExtendedCellTypeId()
    return PreludeCellTypeIds.anyCell
  }
  _getExtendedCellTypeId() {
    const arr = this._getAncestorsArray()
    return arr[arr.length - 1]._getId()
  }
  getHighlightScope() {
    const hs = this._getFromExtended(GrammarConstants.highlightScope)
    if (hs) return hs
    const preludeKind = this._getPreludeKind()
    if (preludeKind) return preludeKind.defaultHighlightScope
  }
  _getEnumOptions() {
    const enumNode = this._getNodeFromExtended(GrammarConstants.enum)
    if (!enumNode) return undefined
    // we sort by longest first to capture longest match first. todo: add test
    const options = Object.keys(enumNode.getNode(GrammarConstants.enum).getOptions())
    options.sort((a, b) => b.length - a.length)
    return options
  }
  _getEnumFromCellTypeOptions(program) {
    const node = this._getNodeFromExtended(GrammarConstants.enumFromCellTypes)
    return node ? Object.keys(node.getNode(GrammarConstants.enumFromCellTypes)._getEnumFromCellTypes(program)) : undefined
  }
  _getAutocompleteWordOptions(program) {
    return this._getEnumOptions() || this._getEnumFromCellTypeOptions(program) || []
  }
  getRegexString() {
    // todo: enum
    const enumOptions = this._getEnumOptions()
    return this._getFromExtended(GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*")
  }
  isValid(str, programRootNode) {
    return this._getChildrenByNodeConstructorInExtended(AbstractGrammarWordTestNode).every(node => node.isValid(str, programRootNode))
  }
  getCellTypeId() {
    return this.getWord(0)
  }
}
class AbstractCellParser {
  constructor(definition) {
    this._definition = definition
  }
  getCatchAllCellTypeId() {
    return this._definition._getFromExtended(GrammarConstants.catchAllCellType)
  }
  // todo: improve layout (use bold?)
  getLineHints() {
    const catchAllCellTypeId = this.getCatchAllCellTypeId()
    const nodeTypeId = this._definition._getCruxIfAny() || this._definition._getId() // todo: cleanup
    return `${nodeTypeId}: ${this.getRequiredCellTypeIds().join(" ")}${catchAllCellTypeId ? ` ${catchAllCellTypeId}...` : ""}`
  }
  getRequiredCellTypeIds() {
    const parameters = this._definition._getFromExtended(GrammarConstants.cells)
    return parameters ? parameters.split(" ") : []
  }
  _getCellTypeId(cellIndex, requiredCellTypeIds, totalWordCount) {
    return requiredCellTypeIds[cellIndex]
  }
  _isCatchAllCell(cellIndex, numberOfRequiredCells, totalWordCount) {
    return cellIndex >= numberOfRequiredCells
  }
  getCellArray(node = undefined) {
    const wordCount = node ? node.getWords().length : 0
    const def = this._definition
    const grammarProgram = def.getLanguageDefinitionProgram()
    const requiredCellTypeIds = this.getRequiredCellTypeIds()
    const numberOfRequiredCells = requiredCellTypeIds.length
    const actualWordCountOrRequiredCellCount = Math.max(wordCount, numberOfRequiredCells)
    const cells = []
    // A for loop instead of map because "numberOfCellsToFill" can be longer than words.length
    for (let cellIndex = 0; cellIndex < actualWordCountOrRequiredCellCount; cellIndex++) {
      const isCatchAll = this._isCatchAllCell(cellIndex, numberOfRequiredCells, wordCount)
      let cellTypeId = isCatchAll ? this.getCatchAllCellTypeId() : this._getCellTypeId(cellIndex, requiredCellTypeIds, wordCount)
      let cellTypeDefinition = grammarProgram.getCellTypeDefinitionById(cellTypeId)
      let cellConstructor
      if (cellTypeDefinition) cellConstructor = cellTypeDefinition.getCellConstructor()
      else if (cellTypeId) cellConstructor = GrammarUnknownCellTypeCell
      else {
        cellConstructor = GrammarExtraWordCellTypeCell
        cellTypeId = PreludeCellTypeIds.extraWordCell
        cellTypeDefinition = grammarProgram.getCellTypeDefinitionById(cellTypeId)
      }
      const anyCellConstructor = cellConstructor
      cells[cellIndex] = new anyCellConstructor(node, cellIndex, cellTypeDefinition, cellTypeId, isCatchAll, def)
    }
    return cells
  }
}
class PrefixCellParser extends AbstractCellParser {}
class PostfixCellParser extends AbstractCellParser {
  _isCatchAllCell(cellIndex, numberOfRequiredCells, totalWordCount) {
    return cellIndex < totalWordCount - numberOfRequiredCells
  }
  _getCellTypeId(cellIndex, requiredCellTypeIds, totalWordCount) {
    const catchAllWordCount = Math.max(totalWordCount - requiredCellTypeIds.length, 0)
    return requiredCellTypeIds[cellIndex - catchAllWordCount]
  }
}
class OmnifixCellParser extends AbstractCellParser {
  getCellArray(node = undefined) {
    const cells = []
    const def = this._definition
    const program = node ? node.getRootNode() : undefined
    const grammarProgram = def.getLanguageDefinitionProgram()
    const words = node ? node.getWords() : []
    const requiredCellTypeDefs = this.getRequiredCellTypeIds().map(cellTypeId => grammarProgram.getCellTypeDefinitionById(cellTypeId))
    const catchAllCellTypeId = this.getCatchAllCellTypeId()
    const catchAllCellTypeDef = catchAllCellTypeId && grammarProgram.getCellTypeDefinitionById(catchAllCellTypeId)
    words.forEach((word, wordIndex) => {
      let cellConstructor
      for (let index = 0; index < requiredCellTypeDefs.length; index++) {
        const cellTypeDefinition = requiredCellTypeDefs[index]
        if (cellTypeDefinition.isValid(word, program)) {
          // todo: cleanup cellIndex/wordIndex stuff
          cellConstructor = cellTypeDefinition.getCellConstructor()
          cells.push(new cellConstructor(node, wordIndex, cellTypeDefinition, cellTypeDefinition._getId(), false, def))
          requiredCellTypeDefs.splice(index, 1)
          return true
        }
      }
      if (catchAllCellTypeDef && catchAllCellTypeDef.isValid(word, program)) {
        cellConstructor = catchAllCellTypeDef.getCellConstructor()
        cells.push(new cellConstructor(node, wordIndex, catchAllCellTypeDef, catchAllCellTypeId, true, def))
        return true
      }
      cells.push(new GrammarUnknownCellTypeCell(node, wordIndex, undefined, undefined, false, def))
    })
    const wordCount = words.length
    requiredCellTypeDefs.forEach((cellTypeDef, index) => {
      let cellConstructor = cellTypeDef.getCellConstructor()
      cells.push(new cellConstructor(node, wordCount + index, cellTypeDef, cellTypeDef._getId(), false, def))
    })
    return cells
  }
}
class GrammarExampleNode extends TreeNode {}
class GrammarCompilerNode extends TreeNode {
  createParser() {
    const types = [
      GrammarConstantsCompiler.stringTemplate,
      GrammarConstantsCompiler.indentCharacter,
      GrammarConstantsCompiler.catchAllCellDelimiter,
      GrammarConstantsCompiler.joinChildrenWith,
      GrammarConstantsCompiler.openChildren,
      GrammarConstantsCompiler.closeChildren
    ]
    const map = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    return new TreeNode.Parser(undefined, map)
  }
}
class GrammarNodeTypeConstant extends TreeNode {
  getGetter() {
    return `get ${this.getIdentifier()}() { return ${this.getConstantValueAsJsText()} }`
  }
  getIdentifier() {
    return this.getWord(1)
  }
  getConstantValueAsJsText() {
    const words = this.getWordsFrom(2)
    return words.length > 1 ? `[${words.join(",")}]` : words[0]
  }
  getConstantValue() {
    return JSON.parse(this.getConstantValueAsJsText())
  }
}
class GrammarNodeTypeConstantInt extends GrammarNodeTypeConstant {}
class GrammarNodeTypeConstantString extends GrammarNodeTypeConstant {
  getConstantValueAsJsText() {
    return "`" + TreeUtils.escapeBackTicks(this.getConstantValue()) + "`"
  }
  getConstantValue() {
    return this.length ? this.childrenToString() : this.getWordsFrom(2).join(" ")
  }
}
class GrammarNodeTypeConstantFloat extends GrammarNodeTypeConstant {}
class GrammarNodeTypeConstantBoolean extends GrammarNodeTypeConstant {}
class AbstractGrammarDefinitionNode extends AbstractExtendibleTreeNode {
  createParser() {
    // todo: some of these should just be on nonRootNodes
    const types = [
      GrammarConstants.frequency,
      GrammarConstants.inScope,
      GrammarConstants.cells,
      GrammarConstants.extends,
      GrammarConstants.description,
      GrammarConstants.catchAllNodeType,
      GrammarConstants.catchAllCellType,
      GrammarConstants.cellParser,
      GrammarConstants.extensions,
      GrammarConstants.version,
      GrammarConstants.tags,
      GrammarConstants.crux,
      GrammarConstants.cruxFromId,
      GrammarConstants.contentDelimiter,
      GrammarConstants.contentKey,
      GrammarConstants.childrenKey,
      GrammarConstants.uniqueFirstWord,
      GrammarConstants.pattern,
      GrammarConstants.baseNodeType,
      GrammarConstants.required,
      GrammarConstants.root,
      GrammarConstants._extendsJsClass,
      GrammarConstants._rootNodeJsHeader,
      GrammarConstants.javascript,
      GrammarConstants.compilesTo,
      GrammarConstants.javascript,
      GrammarConstants.single,
      GrammarConstants.todoComment
    ]
    const map = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    map[GrammarConstantsConstantTypes.boolean] = GrammarNodeTypeConstantBoolean
    map[GrammarConstantsConstantTypes.int] = GrammarNodeTypeConstantInt
    map[GrammarConstantsConstantTypes.string] = GrammarNodeTypeConstantString
    map[GrammarConstantsConstantTypes.float] = GrammarNodeTypeConstantFloat
    map[GrammarConstants.compilerNodeType] = GrammarCompilerNode
    map[GrammarConstants.example] = GrammarExampleNode
    return new TreeNode.Parser(undefined, map)
  }
  toTypeScriptInterface(used = new Set()) {
    let childrenInterfaces = []
    let properties = []
    const inScope = this.getFirstWordMapWithDefinitions()
    const thisId = this._getId()
    used.add(thisId)
    Object.keys(inScope).forEach(key => {
      const def = inScope[key]
      const map = def.getFirstWordMapWithDefinitions()
      const id = def._getId()
      const optionalTag = def.isRequired() ? "" : "?"
      const escapedKey = key.match(/\?/) ? `"${key}"` : key
      const description = def.getDescription()
      if (Object.keys(map).length && !used.has(id)) {
        childrenInterfaces.push(def.toTypeScriptInterface(used))
        properties.push(` ${escapedKey}${optionalTag}: ${id}`)
      } else properties.push(` ${escapedKey}${optionalTag}: any${description ? " // " + description : ""}`)
    })
    properties.sort()
    const description = this.getDescription()
    const myInterface = ""
    return `${childrenInterfaces.join("\n")}
${description ? "// " + description : ""}
interface ${thisId} {
${properties.join("\n")}
}`.trim()
  }
  getTableNameIfAny() {
    return this.getFrom(`${GrammarConstantsConstantTypes.string} ${GrammarConstantsMisc.tableName}`)
  }
  getSQLiteTableColumns() {
    return this._getConcreteNonErrorInScopeNodeDefinitions(this._getInScopeNodeTypeIds()).map(def => {
      const firstNonKeywordCellType = def.getCellParser().getCellArray()[1]
      let type = firstNonKeywordCellType ? firstNonKeywordCellType.getSQLiteType() : SQLiteTypes.text
      // For now if it can have children serialize it as text in SQLite
      if (!def.isTerminalNodeType()) type = SQLiteTypes.text
      return {
        columnName: def._getIdWithoutSuffix(),
        type
      }
    })
  }
  toSQLiteTableSchema() {
    const columns = this.getSQLiteTableColumns().map(columnDef => `${columnDef.columnName} ${columnDef.type}`)
    return `create table ${this.getTableNameIfAny() || this._getId()} (
 id TEXT NOT NULL PRIMARY KEY,
 ${columns.join(",\n ")}
);`
  }
  _getId() {
    return this.getWord(0)
  }
  get id() {
    return this._getId()
  }
  _getIdWithoutSuffix() {
    return this._getId().replace(HandGrammarProgram.nodeTypeSuffixRegex, "")
  }
  getConstantsObject() {
    const obj = this._getUniqueConstantNodes()
    Object.keys(obj).forEach(key => {
      obj[key] = obj[key].getConstantValue()
    })
    return obj
  }
  _getUniqueConstantNodes(extended = true) {
    const obj = {}
    const items = extended ? this._getChildrenByNodeConstructorInExtended(GrammarNodeTypeConstant) : this.getChildrenByNodeConstructor(GrammarNodeTypeConstant)
    items.reverse() // Last definition wins.
    items.forEach(node => {
      obj[node.getIdentifier()] = node
    })
    return obj
  }
  getExamples() {
    return this._getChildrenByNodeConstructorInExtended(GrammarExampleNode)
  }
  getNodeTypeIdFromDefinition() {
    return this.getWord(0)
  }
  // todo: remove? just reused nodeTypeId
  _getGeneratedClassName() {
    return this.getNodeTypeIdFromDefinition()
  }
  _hasValidNodeTypeId() {
    return !!this._getGeneratedClassName()
  }
  _isAbstract() {
    return this.id.startsWith(GrammarConstants.abstractNodeTypePrefix)
  }
  _getConcreteDescendantDefinitions() {
    const defs = this._getProgramNodeTypeDefinitionCache()
    const id = this._getId()
    return Object.values(defs).filter(def => {
      return def._doesExtend(id) && !def._isAbstract()
    })
  }
  _getCruxIfAny() {
    return this.get(GrammarConstants.crux) || (this._hasFromExtended(GrammarConstants.cruxFromId) ? this._getIdWithoutSuffix() : undefined)
  }
  _getRegexMatch() {
    return this.get(GrammarConstants.pattern)
  }
  _getFirstCellEnumOptions() {
    const firstCellDef = this._getMyCellTypeDefs()[0]
    return firstCellDef ? firstCellDef._getEnumOptions() : undefined
  }
  getLanguageDefinitionProgram() {
    return this.getParent()
  }
  _getCustomJavascriptMethods() {
    const hasJsCode = this.has(GrammarConstants.javascript)
    return hasJsCode ? this.getNode(GrammarConstants.javascript).childrenToString() : ""
  }
  getFirstWordMapWithDefinitions() {
    if (!this._cache_firstWordToNodeDefMap) this._cache_firstWordToNodeDefMap = this._createParserInfo(this._getInScopeNodeTypeIds()).firstWordMap
    return this._cache_firstWordToNodeDefMap
  }
  // todo: remove
  getRunTimeFirstWordsInScope() {
    return this._getParser().getFirstWordOptions()
  }
  _getMyCellTypeDefs() {
    const requiredCells = this.get(GrammarConstants.cells)
    if (!requiredCells) return []
    const grammarProgram = this.getLanguageDefinitionProgram()
    return requiredCells.split(" ").map(cellTypeId => {
      const cellTypeDef = grammarProgram.getCellTypeDefinitionById(cellTypeId)
      if (!cellTypeDef) throw new Error(`No cellType "${cellTypeId}" found`)
      return cellTypeDef
    })
  }
  // todo: what happens when you have a cell getter and constant with same name?
  _getCellGettersAndNodeTypeConstants() {
    // todo: add cellType parsings
    const grammarProgram = this.getLanguageDefinitionProgram()
    const getters = this._getMyCellTypeDefs().map((cellTypeDef, index) => cellTypeDef.getGetter(index))
    const catchAllCellTypeId = this.get(GrammarConstants.catchAllCellType)
    if (catchAllCellTypeId) getters.push(grammarProgram.getCellTypeDefinitionById(catchAllCellTypeId).getCatchAllGetter(getters.length))
    // Constants
    Object.values(this._getUniqueConstantNodes(false)).forEach(node => {
      getters.push(node.getGetter())
    })
    return getters.join("\n")
  }
  _createParserInfo(nodeTypeIdsInScope) {
    const result = {
      firstWordMap: {},
      regexTests: []
    }
    if (!nodeTypeIdsInScope.length) return result
    const allProgramNodeTypeDefinitionsMap = this._getProgramNodeTypeDefinitionCache()
    Object.keys(allProgramNodeTypeDefinitionsMap)
      .filter(nodeTypeId => allProgramNodeTypeDefinitionsMap[nodeTypeId].isOrExtendsANodeTypeInScope(nodeTypeIdsInScope))
      .filter(nodeTypeId => !allProgramNodeTypeDefinitionsMap[nodeTypeId]._isAbstract())
      .forEach(nodeTypeId => {
        const def = allProgramNodeTypeDefinitionsMap[nodeTypeId]
        const regex = def._getRegexMatch()
        const crux = def._getCruxIfAny()
        const enumOptions = def._getFirstCellEnumOptions()
        if (regex) result.regexTests.push({ regex: regex, nodeConstructor: def.getNodeTypeIdFromDefinition() })
        else if (crux) result.firstWordMap[crux] = def
        else if (enumOptions) {
          enumOptions.forEach(option => {
            result.firstWordMap[option] = def
          })
        }
      })
    return result
  }
  getTopNodeTypeDefinitions() {
    const arr = Object.values(this.getFirstWordMapWithDefinitions())
    arr.sort(TreeUtils.makeSortByFn(definition => definition.getFrequency()))
    arr.reverse()
    return arr
  }
  _getMyInScopeNodeTypeIds() {
    const nodeTypesNode = this.getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }
  _getInScopeNodeTypeIds() {
    // todo: allow multiple of these if we allow mixins?
    const ids = this._getMyInScopeNodeTypeIds()
    const parentDef = this._getExtendedParent()
    return parentDef ? ids.concat(parentDef._getInScopeNodeTypeIds()) : ids
  }
  // Should only one of these node types be present in the parent node?
  get isSingle() {
    return this._hasFromExtended(GrammarConstants.single) && this._getFromExtended(GrammarConstants.single) !== "false"
  }
  isRequired() {
    return this._hasFromExtended(GrammarConstants.required)
  }
  getNodeTypeDefinitionByNodeTypeId(nodeTypeId) {
    // todo: return catch all?
    const def = this._getProgramNodeTypeDefinitionCache()[nodeTypeId]
    if (def) return def
    // todo: cleanup
    this.getLanguageDefinitionProgram()._addDefaultCatchAllBlobNode()
    return this._getProgramNodeTypeDefinitionCache()[nodeTypeId]
  }
  isDefined(nodeTypeId) {
    return !!this._getProgramNodeTypeDefinitionCache()[nodeTypeId]
  }
  _getIdToNodeMap() {
    return this._getProgramNodeTypeDefinitionCache()
  }
  _amIRoot() {
    if (this._cache_isRoot === undefined) this._cache_isRoot = this._getLanguageRootNode() === this
    return this._cache_isRoot
  }
  _getLanguageRootNode() {
    return this.getParent().getRootNodeTypeDefinitionNode()
  }
  _isErrorNodeType() {
    return this.get(GrammarConstants.baseNodeType) === GrammarConstants.errorNode
  }
  _isBlobNodeType() {
    // Do not check extended classes. Only do once.
    return this._getFromExtended(GrammarConstants.baseNodeType) === GrammarConstants.blobNode
  }
  _getErrorMethodToJavascript() {
    if (this._isBlobNodeType()) return "getErrors() { return [] }" // Skips parsing child nodes for perf gains.
    if (this._isErrorNodeType()) return "getErrors() { return this._getErrorNodeErrors() }"
    return ""
  }
  _getParserToJavascript() {
    if (this._isBlobNodeType())
      // todo: do we need this?
      return "createParser() { return new jtree.TreeNode.Parser(this._getBlobNodeCatchAllNodeType())}"
    const parserInfo = this._createParserInfo(this._getMyInScopeNodeTypeIds())
    const myFirstWordMap = parserInfo.firstWordMap
    const regexRules = parserInfo.regexTests
    // todo: use constants in first word maps?
    // todo: cache the super extending?
    const firstWords = Object.keys(myFirstWordMap)
    const hasFirstWords = firstWords.length
    const catchAllConstructor = this._getCatchAllNodeConstructorToJavascript()
    if (!hasFirstWords && !catchAllConstructor && !regexRules.length) return ""
    const firstWordsStr = hasFirstWords
      ? `Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {` + firstWords.map(firstWord => `"${firstWord}" : ${myFirstWordMap[firstWord].getNodeTypeIdFromDefinition()}`).join(",\n") + "})"
      : "undefined"
    const regexStr = regexRules.length
      ? `[${regexRules
          .map(rule => {
            return `{regex: /${rule.regex}/, nodeConstructor: ${rule.nodeConstructor}}`
          })
          .join(",")}]`
      : "undefined"
    const catchAllStr = catchAllConstructor ? catchAllConstructor : this._amIRoot() ? `this._getBlobNodeCatchAllNodeType()` : "undefined"
    return `createParser() {
  return new jtree.TreeNode.Parser(${catchAllStr}, ${firstWordsStr}, ${regexStr})
  }`
  }
  _getCatchAllNodeConstructorToJavascript() {
    if (this._isBlobNodeType()) return "this._getBlobNodeCatchAllNodeType()"
    const nodeTypeId = this.get(GrammarConstants.catchAllNodeType)
    if (!nodeTypeId) return ""
    const nodeDef = this.getNodeTypeDefinitionByNodeTypeId(nodeTypeId)
    if (!nodeDef) throw new Error(`No definition found for nodeType id "${nodeTypeId}"`)
    return nodeDef._getGeneratedClassName()
  }
  _nodeDefToJavascriptClass() {
    const components = [this._getParserToJavascript(), this._getErrorMethodToJavascript(), this._getCellGettersAndNodeTypeConstants(), this._getCustomJavascriptMethods()].filter(identity => identity)
    if (this._amIRoot()) {
      components.push(`static cachedHandGrammarProgramRoot = new jtree.HandGrammarProgram(\`${TreeUtils.escapeBackTicks(
        this.getParent()
          .toString()
          .replace(/\\/g, "\\\\")
      )}\`)
        getHandGrammarProgram() {
          return this.constructor.cachedHandGrammarProgramRoot
      }`)
      const nodeTypeMap = this.getLanguageDefinitionProgram()
        .getValidConcreteAndAbstractNodeTypeDefinitions()
        .map(def => {
          const id = def.getNodeTypeIdFromDefinition()
          return `"${id}": ${id}`
        })
        .join(",\n")
      components.push(`static getNodeTypeMap() { return {${nodeTypeMap} }}`)
    }
    return `class ${this._getGeneratedClassName()} extends ${this._getExtendsClassName()} {
      ${components.join("\n")}
    }`
  }
  _getExtendsClassName() {
    // todo: this is hopefully a temporary line in place for now for the case where you want your base class to extend something other than another treeclass
    const hardCodedExtend = this.get(GrammarConstants._extendsJsClass)
    if (hardCodedExtend) return hardCodedExtend
    const extendedDef = this._getExtendedParent()
    return extendedDef ? extendedDef._getGeneratedClassName() : "jtree.GrammarBackedNode"
  }
  _getCompilerObject() {
    let obj = {}
    const items = this._getChildrenByNodeConstructorInExtended(GrammarCompilerNode)
    items.reverse() // Last definition wins.
    items.forEach(node => {
      obj = Object.assign(obj, node.toObject()) // todo: what about multiline strings?
    })
    return obj
  }
  // todo: improve layout (use bold?)
  getLineHints() {
    return this.getCellParser().getLineHints()
  }
  isOrExtendsANodeTypeInScope(firstWordsInScope) {
    const chain = this._getNodeTypeInheritanceSet()
    return firstWordsInScope.some(firstWord => chain.has(firstWord))
  }
  isTerminalNodeType() {
    return !this._getFromExtended(GrammarConstants.inScope) && !this._getFromExtended(GrammarConstants.catchAllNodeType)
  }
  _getSublimeMatchLine() {
    const regexMatch = this._getRegexMatch()
    if (regexMatch) return `'${regexMatch}'`
    const cruxMatch = this._getCruxIfAny()
    if (cruxMatch) return `'^ *${TreeUtils.escapeRegExp(cruxMatch)}(?: |$)'`
    const enumOptions = this._getFirstCellEnumOptions()
    if (enumOptions) return `'^ *(${TreeUtils.escapeRegExp(enumOptions.join("|"))})(?: |$)'`
  }
  // todo: refactor. move some parts to cellParser?
  _toSublimeMatchBlock() {
    const defaultHighlightScope = "source"
    const program = this.getLanguageDefinitionProgram()
    const cellParser = this.getCellParser()
    const requiredCellTypeIds = cellParser.getRequiredCellTypeIds()
    const catchAllCellTypeId = cellParser.getCatchAllCellTypeId()
    const firstCellTypeDef = program.getCellTypeDefinitionById(requiredCellTypeIds[0])
    const firstWordHighlightScope = (firstCellTypeDef ? firstCellTypeDef.getHighlightScope() : defaultHighlightScope) + "." + this.getNodeTypeIdFromDefinition()
    const topHalf = ` '${this.getNodeTypeIdFromDefinition()}':
  - match: ${this._getSublimeMatchLine()}
    scope: ${firstWordHighlightScope}`
    if (catchAllCellTypeId) requiredCellTypeIds.push(catchAllCellTypeId)
    if (!requiredCellTypeIds.length) return topHalf
    const captures = requiredCellTypeIds
      .map((cellTypeId, index) => {
        const cellTypeDefinition = program.getCellTypeDefinitionById(cellTypeId) // todo: cleanup
        if (!cellTypeDefinition) throw new Error(`No ${GrammarConstants.cellType} ${cellTypeId} found`) // todo: standardize error/capture error at grammar time
        return `        ${index + 1}: ${(cellTypeDefinition.getHighlightScope() || defaultHighlightScope) + "." + cellTypeDefinition.getCellTypeId()}`
      })
      .join("\n")
    const cellTypesToRegex = cellTypeIds => cellTypeIds.map(cellTypeId => `({{${cellTypeId}}})?`).join(" ?")
    return `${topHalf}
    push:
     - match: ${cellTypesToRegex(requiredCellTypeIds)}
       captures:
${captures}
     - match: $
       pop: true`
  }
  _getNodeTypeInheritanceSet() {
    if (!this._cache_nodeTypeInheritanceSet) this._cache_nodeTypeInheritanceSet = new Set(this.getAncestorNodeTypeIdsArray())
    return this._cache_nodeTypeInheritanceSet
  }
  getAncestorNodeTypeIdsArray() {
    if (!this._cache_ancestorNodeTypeIdsArray) {
      this._cache_ancestorNodeTypeIdsArray = this._getAncestorsArray().map(def => def.getNodeTypeIdFromDefinition())
      this._cache_ancestorNodeTypeIdsArray.reverse()
    }
    return this._cache_ancestorNodeTypeIdsArray
  }
  _getProgramNodeTypeDefinitionCache() {
    return this.getLanguageDefinitionProgram()._getProgramNodeTypeDefinitionCache()
  }
  getDescription() {
    return this._getFromExtended(GrammarConstants.description) || ""
  }
  getFrequency() {
    const val = this._getFromExtended(GrammarConstants.frequency)
    return val ? parseFloat(val) : 0
  }
  _getExtendedNodeTypeId() {
    const ancestorIds = this.getAncestorNodeTypeIdsArray()
    if (ancestorIds.length > 1) return ancestorIds[ancestorIds.length - 2]
  }
  _toStumpString() {
    const crux = this._getCruxIfAny()
    const cellArray = this.getCellParser()
      .getCellArray()
      .filter((item, index) => index) // for now this only works for keyword langs
    if (!cellArray.length)
      // todo: remove this! just doing it for now until we refactor getCellArray to handle catchAlls better.
      return ""
    const cells = new TreeNode(cellArray.map((cell, index) => cell._toStumpInput(crux)).join("\n"))
    return `div
 label ${crux}
${cells.toString(1)}`
  }
  toStumpString() {
    const nodeBreakSymbol = "\n"
    return this._getConcreteNonErrorInScopeNodeDefinitions(this._getInScopeNodeTypeIds())
      .map(def => def._toStumpString())
      .filter(identity => identity)
      .join(nodeBreakSymbol)
  }
  _generateSimulatedLine(seed) {
    // todo: generate simulated data from catch all
    const crux = this._getCruxIfAny()
    return this.getCellParser()
      .getCellArray()
      .map((cell, index) => (!index && crux ? crux : cell.synthesizeCell(seed)))
      .join(" ")
  }
  _shouldSynthesize(def, nodeTypeChain) {
    if (def._isErrorNodeType() || def._isAbstract()) return false
    if (nodeTypeChain.includes(def._getId())) return false
    const tags = def.get(GrammarConstants.tags)
    if (tags && tags.includes(GrammarConstantsMisc.doNotSynthesize)) return false
    return true
  }
  _getConcreteNonErrorInScopeNodeDefinitions(nodeTypeIds) {
    const results = []
    nodeTypeIds.forEach(nodeTypeId => {
      const def = this.getNodeTypeDefinitionByNodeTypeId(nodeTypeId)
      if (def._isErrorNodeType()) return true
      else if (def._isAbstract()) {
        def._getConcreteDescendantDefinitions().forEach(def => results.push(def))
      } else {
        results.push(def)
      }
    })
    return results
  }
  // todo: refactor
  synthesizeNode(nodeCount = 1, indentCount = -1, nodeTypesAlreadySynthesized = [], seed = Date.now()) {
    let inScopeNodeTypeIds = this._getInScopeNodeTypeIds()
    const catchAllNodeTypeId = this._getFromExtended(GrammarConstants.catchAllNodeType)
    if (catchAllNodeTypeId) inScopeNodeTypeIds.push(catchAllNodeTypeId)
    const thisId = this._getId()
    if (!nodeTypesAlreadySynthesized.includes(thisId)) nodeTypesAlreadySynthesized.push(thisId)
    const lines = []
    while (nodeCount) {
      const line = this._generateSimulatedLine(seed)
      if (line) lines.push(" ".repeat(indentCount >= 0 ? indentCount : 0) + line)
      this._getConcreteNonErrorInScopeNodeDefinitions(inScopeNodeTypeIds.filter(nodeTypeId => !nodeTypesAlreadySynthesized.includes(nodeTypeId)))
        .filter(def => this._shouldSynthesize(def, nodeTypesAlreadySynthesized))
        .forEach(def => {
          const chain = nodeTypesAlreadySynthesized // .slice(0)
          chain.push(def._getId())
          def.synthesizeNode(1, indentCount + 1, chain, seed).forEach(line => {
            lines.push(line)
          })
        })
      nodeCount--
    }
    return lines
  }
  getCellParser() {
    if (!this._cellParser) {
      const cellParsingStrategy = this._getFromExtended(GrammarConstants.cellParser)
      if (cellParsingStrategy === GrammarCellParser.postfix) this._cellParser = new PostfixCellParser(this)
      else if (cellParsingStrategy === GrammarCellParser.omnifix) this._cellParser = new OmnifixCellParser(this)
      else this._cellParser = new PrefixCellParser(this)
    }
    return this._cellParser
  }
}
// todo: remove?
class nodeTypeDefinitionNode extends AbstractGrammarDefinitionNode {}
// HandGrammarProgram is a constructor that takes a grammar file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class HandGrammarProgram extends AbstractGrammarDefinitionNode {
  createParser() {
    const map = {}
    map[GrammarConstants.toolingDirective] = TreeNode
    map[GrammarConstants.todoComment] = TreeNode
    return new TreeNode.Parser(UnknownNodeTypeNode, map, [{ regex: HandGrammarProgram.nodeTypeFullRegex, nodeConstructor: nodeTypeDefinitionNode }, { regex: HandGrammarProgram.cellTypeFullRegex, nodeConstructor: cellTypeDefinitionNode }])
  }
  // Note: this is some so far unavoidable tricky code. We need to eval the transpiled JS, in a NodeJS or browser environment.
  _compileAndEvalGrammar() {
    if (!this.isNodeJs()) this._cache_compiledLoadedNodeTypes = TreeUtils.appendCodeAndReturnValueOnWindow(this.toBrowserJavascript(), this.getRootNodeTypeId()).getNodeTypeMap()
    else {
      const path = require("path")
      const code = this.toNodeJsJavascript(path.join(__dirname, "..", "index.js"))
      try {
        const rootNode = this._requireInVmNodeJsRootNodeTypeConstructor(code)
        this._cache_compiledLoadedNodeTypes = rootNode.getNodeTypeMap()
        if (!this._cache_compiledLoadedNodeTypes) throw new Error(`Failed to getNodeTypeMap`)
      } catch (err) {
        // todo: figure out best error pattern here for debugging
        console.log(err)
        // console.log(`Error in code: `)
        // console.log(new TreeNode(code).toStringWithLineNumbers())
      }
    }
  }
  trainModel(programs, programConstructor = this.compileAndReturnRootConstructor()) {
    const nodeDefs = this.getValidConcreteAndAbstractNodeTypeDefinitions()
    const nodeDefCountIncludingRoot = nodeDefs.length + 1
    const matrix = TreeUtils.makeMatrix(nodeDefCountIncludingRoot, nodeDefCountIncludingRoot, 0)
    const idToIndex = {}
    const indexToId = {}
    nodeDefs.forEach((def, index) => {
      const id = def._getId()
      idToIndex[id] = index + 1
      indexToId[index + 1] = id
    })
    programs.forEach(code => {
      const exampleProgram = new programConstructor(code)
      exampleProgram.getTopDownArray().forEach(node => {
        const nodeIndex = idToIndex[node.getDefinition()._getId()]
        const parentNode = node.getParent()
        if (!nodeIndex) return undefined
        if (parentNode.isRoot()) matrix[0][nodeIndex]++
        else {
          const parentIndex = idToIndex[parentNode.getDefinition()._getId()]
          if (!parentIndex) return undefined
          matrix[parentIndex][nodeIndex]++
        }
      })
    })
    return {
      idToIndex,
      indexToId,
      matrix
    }
  }
  _mapPredictions(predictionsVector, model) {
    const total = TreeUtils.sum(predictionsVector)
    const predictions = predictionsVector.slice(1).map((count, index) => {
      const id = model.indexToId[index + 1]
      return {
        id: id,
        def: this.getNodeTypeDefinitionByNodeTypeId(id),
        count,
        prob: count / total
      }
    })
    predictions.sort(TreeUtils.makeSortByFn(prediction => prediction.count)).reverse()
    return predictions
  }
  predictChildren(model, node) {
    return this._mapPredictions(this._predictChildren(model, node), model)
  }
  predictParents(model, node) {
    return this._mapPredictions(this._predictParents(model, node), model)
  }
  _predictChildren(model, node) {
    return model.matrix[node.isRoot() ? 0 : model.idToIndex[node.getDefinition()._getId()]]
  }
  _predictParents(model, node) {
    if (node.isRoot()) return []
    const nodeIndex = model.idToIndex[node.getDefinition()._getId()]
    return model.matrix.map(row => row[nodeIndex])
  }
  _compileAndReturnNodeTypeMap() {
    if (!this._cache_compiledLoadedNodeTypes) this._compileAndEvalGrammar()
    return this._cache_compiledLoadedNodeTypes
  }
  _setDirName(name) {
    this._dirName = name
    return this
  }
  _requireInVmNodeJsRootNodeTypeConstructor(code) {
    const vm = require("vm")
    const path = require("path")
    const jtreePath = path.join(__dirname, "..", "index.js")
    // todo: cleanup up
    try {
      global.jtree = require(jtreePath)
      global.require = require
      global.__dirname = this._dirName
      global.module = {}
      return vm.runInThisContext(code)
    } catch (err) {
      // todo: figure out best error pattern here for debugging
      console.log(`Error in compiled grammar code for language "${this.getGrammarName()}"`)
      // console.log(new TreeNode(code).toStringWithLineNumbers())
      console.log(`jtreePath: "${jtreePath}"`)
      console.log(err)
      throw err
    }
  }
  examplesToTestBlocks(programConstructor = this.compileAndReturnRootConstructor(), expectedErrorMessage = "") {
    const testBlocks = {}
    this.getValidConcreteAndAbstractNodeTypeDefinitions().forEach(def =>
      def.getExamples().forEach(example => {
        const id = def._getId() + example.getContent()
        testBlocks[id] = equal => {
          const exampleProgram = new programConstructor(example.childrenToString())
          const errors = exampleProgram.getAllErrors(example._getLineNumber() + 1)
          equal(errors.join("\n"), expectedErrorMessage, `Expected no errors in ${id}`)
        }
      })
    )
    return testBlocks
  }
  toReadMe() {
    const languageName = this.getExtensionName()
    const rootNodeDef = this.getRootNodeTypeDefinitionNode()
    const cellTypes = this.getCellTypeDefinitions()
    const nodeTypeFamilyTree = this.getNodeTypeFamilyTree()
    const exampleNode = rootNodeDef.getExamples()[0]
    return `title ${languageName} Readme

paragraph ${rootNodeDef.getDescription()}

subtitle Quick Example

code
${exampleNode ? exampleNode.childrenToString(1) : ""}

subtitle Quick facts about ${languageName}

list
 - ${languageName} has ${nodeTypeFamilyTree.getTopDownArray().length} node types.
 - ${languageName} has ${Object.keys(cellTypes).length} cell types
 - The source code for ${languageName} is ${this.getTopDownArray().length} lines long.

subtitle Installing

code
 npm install .

subtitle Testing

code
 node test.js

subtitle Node Types

code
${nodeTypeFamilyTree.toString(1)}

subtitle Cell Types

code
${new TreeNode(Object.keys(cellTypes).join("\n")).toString(1)}

subtitle Road Map

paragraph Here are the "todos" present in the source code for ${languageName}:

list
${this.getTopDownArray()
  .filter(node => node.getWord(0) === "todo")
  .map(node => ` - ${node.getLine()}`)
  .join("\n")}

paragraph This readme was auto-generated using the
 link https://github.com/treenotation/jtree JTree library.`
  }
  toBundle() {
    const files = {}
    const rootNodeDef = this.getRootNodeTypeDefinitionNode()
    const languageName = this.getExtensionName()
    const example = rootNodeDef.getExamples()[0]
    const sampleCode = example ? example.childrenToString() : ""
    files[GrammarBundleFiles.package] = JSON.stringify(
      {
        name: languageName,
        private: true,
        dependencies: {
          jtree: TreeNode.getVersion()
        }
      },
      null,
      2
    )
    files[GrammarBundleFiles.readme] = this.toReadMe()
    const testCode = `const program = new ${languageName}(sampleCode)
const errors = program.getAllErrors()
console.log("Sample program compiled with " + errors.length + " errors.")
if (errors.length)
 console.log(errors.map(error => error.getMessage()))`
    const nodePath = `${languageName}.node.js`
    files[nodePath] = this.toNodeJsJavascript()
    files[GrammarBundleFiles.indexJs] = `module.exports = require("./${nodePath}")`
    const browserPath = `${languageName}.browser.js`
    files[browserPath] = this.toBrowserJavascript()
    files[GrammarBundleFiles.indexHtml] = `<script src="node_modules/jtree/products/jtree.browser.js"></script>
<script src="${browserPath}"></script>
<script>
const sampleCode = \`${sampleCode.toString()}\`
${testCode}
</script>`
    const samplePath = "sample." + this.getExtensionName()
    files[samplePath] = sampleCode.toString()
    files[GrammarBundleFiles.testJs] = `const ${languageName} = require("./index.js")
/*keep-line*/ const sampleCode = require("fs").readFileSync("${samplePath}", "utf8")
${testCode}`
    return files
  }
  getTargetExtension() {
    return this.getRootNodeTypeDefinitionNode().get(GrammarConstants.compilesTo)
  }
  getCellTypeDefinitions() {
    if (!this._cache_cellTypes) this._cache_cellTypes = this._getCellTypeDefinitions()
    return this._cache_cellTypes
  }
  getCellTypeDefinitionById(cellTypeId) {
    // todo: return unknownCellTypeDefinition? or is that handled somewhere else?
    return this.getCellTypeDefinitions()[cellTypeId]
  }
  getNodeTypeFamilyTree() {
    const tree = new TreeNode()
    Object.values(this.getValidConcreteAndAbstractNodeTypeDefinitions()).forEach(node => {
      const path = node.getAncestorNodeTypeIdsArray().join(" ")
      tree.touchNode(path)
    })
    return tree
  }
  _getCellTypeDefinitions() {
    const types = {}
    // todo: add built in word types?
    this.getChildrenByNodeConstructor(cellTypeDefinitionNode).forEach(type => (types[type.getCellTypeId()] = type))
    return types
  }
  getLanguageDefinitionProgram() {
    return this
  }
  getValidConcreteAndAbstractNodeTypeDefinitions() {
    return this.getChildrenByNodeConstructor(nodeTypeDefinitionNode).filter(node => node._hasValidNodeTypeId())
  }
  _getLastRootNodeTypeDefinitionNode() {
    return this.findLast(def => def instanceof AbstractGrammarDefinitionNode && def.has(GrammarConstants.root) && def._hasValidNodeTypeId())
  }
  _initRootNodeTypeDefinitionNode() {
    if (this._cache_rootNodeTypeNode) return
    if (!this._cache_rootNodeTypeNode) this._cache_rootNodeTypeNode = this._getLastRootNodeTypeDefinitionNode()
    // By default, have a very permissive basic root node.
    // todo: whats the best design pattern to use for this sort of thing?
    if (!this._cache_rootNodeTypeNode) {
      this._cache_rootNodeTypeNode = this.concat(`${GrammarConstants.defaultRootNode}
 ${GrammarConstants.root}
 ${GrammarConstants.catchAllNodeType} ${GrammarConstants.BlobNode}`)[0]
      this._addDefaultCatchAllBlobNode()
    }
  }
  getRootNodeTypeDefinitionNode() {
    this._initRootNodeTypeDefinitionNode()
    return this._cache_rootNodeTypeNode
  }
  // todo: whats the best design pattern to use for this sort of thing?
  _addDefaultCatchAllBlobNode() {
    delete this._cache_nodeTypeDefinitions
    this.concat(`${GrammarConstants.BlobNode}
 ${GrammarConstants.baseNodeType} ${GrammarConstants.blobNode}`)
  }
  getExtensionName() {
    return this.getGrammarName()
  }
  _getId() {
    return this.getRootNodeTypeId()
  }
  getRootNodeTypeId() {
    return this.getRootNodeTypeDefinitionNode().getNodeTypeIdFromDefinition()
  }
  getGrammarName() {
    return this.getRootNodeTypeId().replace(HandGrammarProgram.nodeTypeSuffixRegex, "")
  }
  _getMyInScopeNodeTypeIds() {
    const nodeTypesNode = this.getRootNodeTypeDefinitionNode().getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }
  _getInScopeNodeTypeIds() {
    const nodeTypesNode = this.getRootNodeTypeDefinitionNode().getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }
  _initProgramNodeTypeDefinitionCache() {
    if (this._cache_nodeTypeDefinitions) return undefined
    this._cache_nodeTypeDefinitions = {}
    this.getChildrenByNodeConstructor(nodeTypeDefinitionNode).forEach(nodeTypeDefinitionNode => {
      this._cache_nodeTypeDefinitions[nodeTypeDefinitionNode.getNodeTypeIdFromDefinition()] = nodeTypeDefinitionNode
    })
  }
  _getProgramNodeTypeDefinitionCache() {
    this._initProgramNodeTypeDefinitionCache()
    return this._cache_nodeTypeDefinitions
  }
  compileAndReturnRootConstructor() {
    if (!this._cache_rootConstructorClass) {
      const def = this.getRootNodeTypeDefinitionNode()
      const rootNodeTypeId = def.getNodeTypeIdFromDefinition()
      this._cache_rootConstructorClass = def.getLanguageDefinitionProgram()._compileAndReturnNodeTypeMap()[rootNodeTypeId]
    }
    return this._cache_rootConstructorClass
  }
  _getFileExtensions() {
    return this.getRootNodeTypeDefinitionNode().get(GrammarConstants.extensions)
      ? this.getRootNodeTypeDefinitionNode()
          .get(GrammarConstants.extensions)
          .split(" ")
          .join(",")
      : this.getExtensionName()
  }
  toNodeJsJavascript(normalizedJtreePath = "jtree") {
    return this._rootNodeDefToJavascriptClass(normalizedJtreePath, true).trim()
  }
  toBrowserJavascript() {
    return this._rootNodeDefToJavascriptClass("", false).trim()
  }
  _getProperName() {
    return TreeUtils.ucfirst(this.getExtensionName())
  }
  _rootNodeDefToJavascriptClass(normalizedJtreePath, forNodeJs = true) {
    const defs = this.getValidConcreteAndAbstractNodeTypeDefinitions()
    // todo: throw if there is no root node defined
    const nodeTypeClasses = defs.map(def => def._nodeDefToJavascriptClass()).join("\n\n")
    const rootDef = this.getRootNodeTypeDefinitionNode()
    const rootNodeJsHeader = forNodeJs && rootDef._getConcatBlockStringFromExtended(GrammarConstants._rootNodeJsHeader)
    const rootName = rootDef._getGeneratedClassName()
    if (!rootName) throw new Error(`Root Node Type Has No Name`)
    let exportScript = ""
    if (forNodeJs) {
      exportScript = `module.exports = ${rootName};
${rootName}`
    } else {
      exportScript = `window.${rootName} = ${rootName}`
    }
    // todo: we can expose the previous "constants" export, if needed, via the grammar, which we preserve.
    return `{
${forNodeJs ? `const {jtree} = require("${normalizedJtreePath.replace(/\\/g, "\\\\")}")` : ""}
${rootNodeJsHeader ? rootNodeJsHeader : ""}
${nodeTypeClasses}

${exportScript}
}
`
  }
  toSublimeSyntaxFile() {
    const cellTypeDefs = this.getCellTypeDefinitions()
    const variables = Object.keys(cellTypeDefs)
      .map(name => ` ${name}: '${cellTypeDefs[name].getRegexString()}'`)
      .join("\n")
    const defs = this.getValidConcreteAndAbstractNodeTypeDefinitions().filter(kw => !kw._isAbstract())
    const nodeTypeContexts = defs.map(def => def._toSublimeMatchBlock()).join("\n\n")
    const includes = defs.map(nodeTypeDef => `  - include: '${nodeTypeDef.getNodeTypeIdFromDefinition()}'`).join("\n")
    return `%YAML 1.2
---
name: ${this.getExtensionName()}
file_extensions: [${this._getFileExtensions()}]
scope: source.${this.getExtensionName()}

variables:
${variables}

contexts:
 main:
${includes}

${nodeTypeContexts}`
  }
}
HandGrammarProgram.makeNodeTypeId = str => TreeUtils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(HandGrammarProgram.nodeTypeSuffixRegex, "") + GrammarConstants.nodeTypeSuffix
HandGrammarProgram.makeCellTypeId = str => TreeUtils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(HandGrammarProgram.cellTypeSuffixRegex, "") + GrammarConstants.cellTypeSuffix
HandGrammarProgram.nodeTypeSuffixRegex = new RegExp(GrammarConstants.nodeTypeSuffix + "$")
HandGrammarProgram.nodeTypeFullRegex = new RegExp("^[a-zA-Z0-9_]+" + GrammarConstants.nodeTypeSuffix + "$")
HandGrammarProgram.cellTypeSuffixRegex = new RegExp(GrammarConstants.cellTypeSuffix + "$")
HandGrammarProgram.cellTypeFullRegex = new RegExp("^[a-zA-Z0-9_]+" + GrammarConstants.cellTypeSuffix + "$")
HandGrammarProgram._languages = {}
HandGrammarProgram._nodeTypes = {}
const PreludeKinds = {}
PreludeKinds[PreludeCellTypeIds.anyCell] = GrammarAnyCell
PreludeKinds[PreludeCellTypeIds.keywordCell] = GrammarKeywordCell
PreludeKinds[PreludeCellTypeIds.floatCell] = GrammarFloatCell
PreludeKinds[PreludeCellTypeIds.numberCell] = GrammarFloatCell
PreludeKinds[PreludeCellTypeIds.bitCell] = GrammarBitCell
PreludeKinds[PreludeCellTypeIds.boolCell] = GrammarBoolCell
PreludeKinds[PreludeCellTypeIds.intCell] = GrammarIntCell
window.GrammarConstants = GrammarConstants
window.PreludeCellTypeIds = PreludeCellTypeIds
window.HandGrammarProgram = HandGrammarProgram
window.GrammarBackedNode = GrammarBackedNode
window.UnknownNodeTypeError = UnknownNodeTypeError
class Upgrader extends TreeNode {
  upgradeManyInPlace(globPatterns, fromVersion, toVersion) {
    this._upgradeMany(globPatterns, fromVersion, toVersion).forEach(file => file.tree.toDisk(file.path))
    return this
  }
  upgradeManyPreview(globPatterns, fromVersion, toVersion) {
    return this._upgradeMany(globPatterns, fromVersion, toVersion)
  }
  _upgradeMany(globPatterns, fromVersion, toVersion) {
    const glob = this.require("glob")
    const files = TreeUtils.flatten(globPatterns.map(pattern => glob.sync(pattern)))
    console.log(`${files.length} files to upgrade`)
    return files.map(path => {
      console.log("Upgrading " + path)
      return {
        tree: this.upgrade(TreeNode.fromDisk(path), fromVersion, toVersion),
        path: path
      }
    })
  }
  upgrade(code, fromVersion, toVersion) {
    const updateFromMap = this.getUpgradeFromMap()
    const semver = this.require("semver")
    let fromMap
    while ((fromMap = updateFromMap[fromVersion])) {
      const toNextVersion = Object.keys(fromMap)[0] // todo: currently we just assume 1 step at a time
      if (semver.lt(toVersion, toNextVersion)) break
      const fn = Object.values(fromMap)[0]
      code = fn(code)
      fromVersion = toNextVersion
    }
    return code
  }
}
window.Upgrader = Upgrader
class UnknownGrammarProgram extends TreeNode {
  _inferRootNodeForAPrefixLanguage(grammarName) {
    grammarName = HandGrammarProgram.makeNodeTypeId(grammarName)
    const rootNode = new TreeNode(`${grammarName}
 ${GrammarConstants.root}`)
    // note: right now we assume 1 global cellTypeMap and nodeTypeMap per grammar. But we may have scopes in the future?
    const rootNodeNames = this.getFirstWords()
      .filter(identity => identity)
      .map(word => HandGrammarProgram.makeNodeTypeId(word))
    rootNode
      .nodeAt(0)
      .touchNode(GrammarConstants.inScope)
      .setWordsFrom(1, Array.from(new Set(rootNodeNames)))
    return rootNode
  }
  _renameIntegerKeywords(clone) {
    // todo: why are we doing this?
    for (let node of clone.getTopDownArrayIterator()) {
      const firstWordIsAnInteger = !!node.getFirstWord().match(/^\d+$/)
      const parentFirstWord = node.getParent().getFirstWord()
      if (firstWordIsAnInteger && parentFirstWord) node.setFirstWord(HandGrammarProgram.makeNodeTypeId(parentFirstWord + UnknownGrammarProgram._childSuffix))
    }
  }
  _getKeywordMaps(clone) {
    const keywordsToChildKeywords = {}
    const keywordsToNodeInstances = {}
    for (let node of clone.getTopDownArrayIterator()) {
      const firstWord = node.getFirstWord()
      if (!keywordsToChildKeywords[firstWord]) keywordsToChildKeywords[firstWord] = {}
      if (!keywordsToNodeInstances[firstWord]) keywordsToNodeInstances[firstWord] = []
      keywordsToNodeInstances[firstWord].push(node)
      node.forEach(child => {
        keywordsToChildKeywords[firstWord][child.getFirstWord()] = true
      })
    }
    return { keywordsToChildKeywords: keywordsToChildKeywords, keywordsToNodeInstances: keywordsToNodeInstances }
  }
  _inferNodeTypeDef(firstWord, globalCellTypeMap, childFirstWords, instances) {
    const edgeSymbol = this.getEdgeSymbol()
    const nodeTypeId = HandGrammarProgram.makeNodeTypeId(firstWord)
    const nodeDefNode = new TreeNode(nodeTypeId).nodeAt(0)
    const childNodeTypeIds = childFirstWords.map(word => HandGrammarProgram.makeNodeTypeId(word))
    if (childNodeTypeIds.length) nodeDefNode.touchNode(GrammarConstants.inScope).setWordsFrom(1, childNodeTypeIds)
    const cellsForAllInstances = instances
      .map(line => line.getContent())
      .filter(identity => identity)
      .map(line => line.split(edgeSymbol))
    const instanceCellCounts = new Set(cellsForAllInstances.map(cells => cells.length))
    const maxCellsOnLine = Math.max(...Array.from(instanceCellCounts))
    const minCellsOnLine = Math.min(...Array.from(instanceCellCounts))
    let catchAllCellType
    let cellTypeIds = []
    for (let cellIndex = 0; cellIndex < maxCellsOnLine; cellIndex++) {
      const cellType = this._getBestCellType(firstWord, instances.length, maxCellsOnLine, cellsForAllInstances.map(cells => cells[cellIndex]))
      if (!globalCellTypeMap.has(cellType.cellTypeId)) globalCellTypeMap.set(cellType.cellTypeId, cellType.cellTypeDefinition)
      cellTypeIds.push(cellType.cellTypeId)
    }
    if (maxCellsOnLine > minCellsOnLine) {
      //columns = columns.slice(0, min)
      catchAllCellType = cellTypeIds.pop()
      while (cellTypeIds[cellTypeIds.length - 1] === catchAllCellType) {
        cellTypeIds.pop()
      }
    }
    const needsCruxProperty = !firstWord.endsWith(UnknownGrammarProgram._childSuffix + "Node") // todo: cleanup
    if (needsCruxProperty) nodeDefNode.set(GrammarConstants.crux, firstWord)
    if (catchAllCellType) nodeDefNode.set(GrammarConstants.catchAllCellType, catchAllCellType)
    const cellLine = cellTypeIds.slice()
    cellLine.unshift(PreludeCellTypeIds.keywordCell)
    if (cellLine.length > 0) nodeDefNode.set(GrammarConstants.cells, cellLine.join(edgeSymbol))
    //if (!catchAllCellType && cellTypeIds.length === 1) nodeDefNode.set(GrammarConstants.cells, cellTypeIds[0])
    // Todo: add conditional frequencies
    return nodeDefNode.getParent().toString()
  }
  //  inferGrammarFileForAnSSVLanguage(grammarName: string): string {
  //     grammarName = HandGrammarProgram.makeNodeTypeId(grammarName)
  //    const rootNode = new TreeNode(`${grammarName}
  // ${GrammarConstants.root}`)
  //    // note: right now we assume 1 global cellTypeMap and nodeTypeMap per grammar. But we may have scopes in the future?
  //    const rootNodeNames = this.getFirstWords().map(word => HandGrammarProgram.makeNodeTypeId(word))
  //    rootNode
  //      .nodeAt(0)
  //      .touchNode(GrammarConstants.inScope)
  //      .setWordsFrom(1, Array.from(new Set(rootNodeNames)))
  //    return rootNode
  //  }
  inferGrammarFileForAKeywordLanguage(grammarName) {
    const clone = this.clone()
    this._renameIntegerKeywords(clone)
    const { keywordsToChildKeywords, keywordsToNodeInstances } = this._getKeywordMaps(clone)
    const globalCellTypeMap = new Map()
    globalCellTypeMap.set(PreludeCellTypeIds.keywordCell, undefined)
    const nodeTypeDefs = Object.keys(keywordsToChildKeywords)
      .filter(identity => identity)
      .map(firstWord => this._inferNodeTypeDef(firstWord, globalCellTypeMap, Object.keys(keywordsToChildKeywords[firstWord]), keywordsToNodeInstances[firstWord]))
    const cellTypeDefs = []
    globalCellTypeMap.forEach((def, id) => cellTypeDefs.push(def ? def : id))
    const nodeBreakSymbol = this.getNodeBreakSymbol()
    return this._formatCode([this._inferRootNodeForAPrefixLanguage(grammarName).toString(), cellTypeDefs.join(nodeBreakSymbol), nodeTypeDefs.join(nodeBreakSymbol)].filter(identity => identity).join("\n"))
  }
  _formatCode(code) {
    // todo: make this run in browser too
    if (!this.isNodeJs()) return code
    const grammarProgram = new HandGrammarProgram(TreeNode.fromDisk(__dirname + "/../langs/grammar/grammar.grammar"))
    const programConstructor = grammarProgram.compileAndReturnRootConstructor()
    const program = new programConstructor(code)
    return program.format().toString()
  }
  _getBestCellType(firstWord, instanceCount, maxCellsOnLine, allValues) {
    const asSet = new Set(allValues)
    const edgeSymbol = this.getEdgeSymbol()
    const values = Array.from(asSet).filter(identity => identity)
    const every = fn => {
      for (let index = 0; index < values.length; index++) {
        if (!fn(values[index])) return false
      }
      return true
    }
    if (every(str => str === "0" || str === "1")) return { cellTypeId: PreludeCellTypeIds.bitCell }
    if (
      every(str => {
        const num = parseInt(str)
        if (isNaN(num)) return false
        return num.toString() === str
      })
    ) {
      return { cellTypeId: PreludeCellTypeIds.intCell }
    }
    if (every(str => str.match(/^-?\d*.?\d+$/))) return { cellTypeId: PreludeCellTypeIds.floatCell }
    const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"])
    if (every(str => bools.has(str.toLowerCase()))) return { cellTypeId: PreludeCellTypeIds.boolCell }
    // todo: cleanup
    const enumLimit = 30
    if (instanceCount > 1 && maxCellsOnLine === 1 && allValues.length > asSet.size && asSet.size < enumLimit)
      return {
        cellTypeId: HandGrammarProgram.makeCellTypeId(firstWord),
        cellTypeDefinition: `${HandGrammarProgram.makeCellTypeId(firstWord)}
 enum ${values.join(edgeSymbol)}`
      }
    return { cellTypeId: PreludeCellTypeIds.anyCell }
  }
}
UnknownGrammarProgram._childSuffix = "Child"
window.UnknownGrammarProgram = UnknownGrammarProgram
// Adapted from https://github.com/NeekSandhu/codemirror-textmate/blob/master/src/tmToCm.ts
var CmToken
;(function(CmToken) {
  CmToken["Atom"] = "atom"
  CmToken["Attribute"] = "attribute"
  CmToken["Bracket"] = "bracket"
  CmToken["Builtin"] = "builtin"
  CmToken["Comment"] = "comment"
  CmToken["Def"] = "def"
  CmToken["Error"] = "error"
  CmToken["Header"] = "header"
  CmToken["HR"] = "hr"
  CmToken["Keyword"] = "keyword"
  CmToken["Link"] = "link"
  CmToken["Meta"] = "meta"
  CmToken["Number"] = "number"
  CmToken["Operator"] = "operator"
  CmToken["Property"] = "property"
  CmToken["Qualifier"] = "qualifier"
  CmToken["Quote"] = "quote"
  CmToken["String"] = "string"
  CmToken["String2"] = "string-2"
  CmToken["Tag"] = "tag"
  CmToken["Type"] = "type"
  CmToken["Variable"] = "variable"
  CmToken["Variable2"] = "variable-2"
  CmToken["Variable3"] = "variable-3"
})(CmToken || (CmToken = {}))
const tmToCm = {
  comment: {
    $: CmToken.Comment
  },
  constant: {
    // TODO: Revision
    $: CmToken.Def,
    character: {
      escape: {
        $: CmToken.String2
      }
    },
    language: {
      $: CmToken.Atom
    },
    numeric: {
      $: CmToken.Number
    },
    other: {
      email: {
        link: {
          $: CmToken.Link
        }
      },
      symbol: {
        // TODO: Revision
        $: CmToken.Def
      }
    }
  },
  entity: {
    name: {
      class: {
        $: CmToken.Def
      },
      function: {
        $: CmToken.Def
      },
      tag: {
        $: CmToken.Tag
      },
      type: {
        $: CmToken.Type,
        class: {
          $: CmToken.Variable
        }
      }
    },
    other: {
      "attribute-name": {
        $: CmToken.Attribute
      },
      "inherited-class": {
        // TODO: Revision
        $: CmToken.Def
      }
    },
    support: {
      function: {
        // TODO: Revision
        $: CmToken.Def
      }
    }
  },
  invalid: {
    $: CmToken.Error,
    illegal: { $: CmToken.Error },
    deprecated: {
      $: CmToken.Error
    }
  },
  keyword: {
    $: CmToken.Keyword,
    operator: {
      $: CmToken.Operator
    },
    other: {
      "special-method": CmToken.Def
    }
  },
  punctuation: {
    $: CmToken.Operator,
    definition: {
      comment: {
        $: CmToken.Comment
      },
      tag: {
        $: CmToken.Bracket
      }
      // 'template-expression': {
      //     $: CodeMirrorToken.Operator,
      // },
    }
    // terminator: {
    //     $: CodeMirrorToken.Operator,
    // },
  },
  storage: {
    $: CmToken.Keyword
  },
  string: {
    $: CmToken.String,
    regexp: {
      $: CmToken.String2
    }
  },
  support: {
    class: {
      $: CmToken.Def
    },
    constant: {
      $: CmToken.Variable2
    },
    function: {
      $: CmToken.Def
    },
    type: {
      $: CmToken.Type
    },
    variable: {
      $: CmToken.Variable2,
      property: {
        $: CmToken.Property
      }
    }
  },
  variable: {
    $: CmToken.Def,
    language: {
      // TODO: Revision
      $: CmToken.Variable3
    },
    other: {
      object: {
        $: CmToken.Variable,
        property: {
          $: CmToken.Property
        }
      },
      property: {
        $: CmToken.Property
      }
    },
    parameter: {
      $: CmToken.Def
    }
  }
}
const textMateScopeToCodeMirrorStyle = (scopeSegments, styleTree = tmToCm) => {
  const matchingBranch = styleTree[scopeSegments.shift()]
  return matchingBranch ? textMateScopeToCodeMirrorStyle(scopeSegments, matchingBranch) || matchingBranch.$ || null : null
}
class TreeNotationCodeMirrorMode {
  constructor(name, getProgramConstructorFn, getProgramCodeFn, codeMirrorLib = undefined) {
    this._name = name
    this._getProgramConstructorFn = getProgramConstructorFn
    this._getProgramCodeFn = getProgramCodeFn || (instance => (instance ? instance.getValue() : this._originalValue))
    this._codeMirrorLib = codeMirrorLib
  }
  _getParsedProgram() {
    const source = this._getProgramCodeFn(this._cmInstance) || ""
    if (!this._cachedProgram || this._cachedSource !== source) {
      this._cachedSource = source
      this._cachedProgram = new (this._getProgramConstructorFn())(source)
    }
    return this._cachedProgram
  }
  _getExcludedIntelliSenseTriggerKeys() {
    return {
      "8": "backspace",
      "9": "tab",
      "13": "enter",
      "16": "shift",
      "17": "ctrl",
      "18": "alt",
      "19": "pause",
      "20": "capslock",
      "27": "escape",
      "33": "pageup",
      "34": "pagedown",
      "35": "end",
      "36": "home",
      "37": "left",
      "38": "up",
      "39": "right",
      "40": "down",
      "45": "insert",
      "46": "delete",
      "91": "left window key",
      "92": "right window key",
      "93": "select",
      "112": "f1",
      "113": "f2",
      "114": "f3",
      "115": "f4",
      "116": "f5",
      "117": "f6",
      "118": "f7",
      "119": "f8",
      "120": "f9",
      "121": "f10",
      "122": "f11",
      "123": "f12",
      "144": "numlock",
      "145": "scrolllock"
    }
  }
  token(stream, state) {
    return this._advanceStreamAndReturnTokenType(stream, state)
  }
  fromTextAreaWithAutocomplete(area, options) {
    this._originalValue = area.value
    const defaultOptions = {
      lineNumbers: true,
      mode: this._name,
      tabSize: 1,
      indentUnit: 1,
      hintOptions: {
        hint: (cmInstance, options) => this.codeMirrorAutocomplete(cmInstance, options)
      }
    }
    Object.assign(defaultOptions, options)
    this._cmInstance = this._getCodeMirrorLib().fromTextArea(area, defaultOptions)
    this._enableAutoComplete(this._cmInstance)
    return this._cmInstance
  }
  _enableAutoComplete(cmInstance) {
    const excludedKeys = this._getExcludedIntelliSenseTriggerKeys()
    const codeMirrorLib = this._getCodeMirrorLib()
    cmInstance.on("keyup", (cm, event) => {
      // https://stackoverflow.com/questions/13744176/codemirror-autocomplete-after-any-keyup
      if (!cm.state.completionActive && !excludedKeys[event.keyCode.toString()])
        // Todo: get typings for CM autocomplete
        codeMirrorLib.commands.autocomplete(cm, null, { completeSingle: false })
    })
  }
  _getCodeMirrorLib() {
    return this._codeMirrorLib
  }
  async codeMirrorAutocomplete(cmInstance, options) {
    const cursor = cmInstance.getDoc().getCursor()
    const codeMirrorLib = this._getCodeMirrorLib()
    const result = await this._getParsedProgram().getAutocompleteResultsAt(cursor.line, cursor.ch)
    // It seems to be better UX if there's only 1 result, and its the word the user entered, to close autocomplete
    if (result.matches.length === 1 && result.matches[0].text === result.word) return null
    return result.matches.length
      ? {
          list: result.matches,
          from: codeMirrorLib.Pos(cursor.line, result.startCharIndex),
          to: codeMirrorLib.Pos(cursor.line, result.endCharIndex)
        }
      : null
  }
  register() {
    const codeMirrorLib = this._getCodeMirrorLib()
    codeMirrorLib.defineMode(this._name, () => this)
    codeMirrorLib.defineMIME("text/" + this._name, this._name)
    return this
  }
  _advanceStreamAndReturnTokenType(stream, state) {
    let nextCharacter = stream.next()
    const lineNumber = stream.lineOracle.line + 1 // state.lineIndex
    const WordBreakSymbol = " "
    const NodeBreakSymbol = "\n"
    while (typeof nextCharacter === "string") {
      const peek = stream.peek()
      if (nextCharacter === WordBreakSymbol) {
        if (peek === undefined || peek === NodeBreakSymbol) {
          stream.skipToEnd() // advance string to end
          this._incrementLine(state)
        }
        if (peek === WordBreakSymbol && state.cellIndex) {
          // If we are missing a cell.
          // TODO: this is broken for a blank 1st cell. We need to track WordBreakSymbol level.
          state.cellIndex++
        }
        return "bracket"
      }
      if (peek === WordBreakSymbol) {
        state.cellIndex++
        return this._getCellStyle(lineNumber, state.cellIndex)
      }
      nextCharacter = stream.next()
    }
    state.cellIndex++
    const style = this._getCellStyle(lineNumber, state.cellIndex)
    this._incrementLine(state)
    return style
  }
  _getCellStyle(lineIndex, cellIndex) {
    const program = this._getParsedProgram()
    // todo: if the current word is an error, don't show red?
    if (!program.getCellHighlightScopeAtPosition) console.log(program)
    const highlightScope = program.getCellHighlightScopeAtPosition(lineIndex, cellIndex)
    const style = highlightScope ? textMateScopeToCodeMirrorStyle(highlightScope.split(".")) : undefined
    return style || "noHighlightScopeDefinedInGrammar"
  }
  // todo: remove.
  startState() {
    return {
      cellIndex: 0
    }
  }
  _incrementLine(state) {
    state.cellIndex = 0
  }
}
window.TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode
class jtree {}
jtree.GrammarBackedNode = GrammarBackedNode
jtree.GrammarConstants = GrammarConstants
jtree.Utils = TreeUtils
jtree.UnknownNodeTypeError = UnknownNodeTypeError
jtree.TestRacer = TestRacer
jtree.TreeEvents = TreeEvents
jtree.TreeNode = TreeNode
jtree.ExtendibleTreeNode = ExtendibleTreeNode
jtree.HandGrammarProgram = HandGrammarProgram
jtree.UnknownGrammarProgram = UnknownGrammarProgram
jtree.TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode
jtree.getVersion = () => TreeNode.getVersion()
window.jtree = jtree
