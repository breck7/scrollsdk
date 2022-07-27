import { treeNotationTypes } from "../products/treeNotationTypes"

class Timer {
  constructor() {
    this._tickTime = Date.now() - (TreeUtils.isNodeJs() ? 1000 * process.uptime() : 0)
    this._firstTickTime = this._tickTime
  }

  private _tickTime: number
  private _firstTickTime: number

  tick(msg?: string) {
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

  static Timer = Timer

  static findProjectRoot(startingDirName: string, projectName: string) {
    const fs = require("fs")
    const getProjectName = (dirName: string) => {
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

  static escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }

  static sum(arr: number[]) {
    return arr.reduce((curr, next) => curr + next, 0)
  }

  static makeVector(length: number, fill: any = 0) {
    return new Array(length).fill(fill)
  }

  static makeMatrix(cols: number, rows: number, fill = 0) {
    const matrix: number[][] = []
    while (rows) {
      matrix.push(TreeUtils.makeVector(cols, fill))
      rows--
    }
    return matrix
  }

  static removeNonAscii(str: string) {
    // https://stackoverflow.com/questions/20856197/remove-non-ascii-character-in-string
    return str.replace(/[^\x00-\x7F]/g, "")
  }

  //http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links#21925491
  static linkify = (text: string, target = "_blank") => {
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

  static getMethodFromDotPath(context: any, str: string) {
    const methodParts = str.split(".")
    while (methodParts.length > 1) {
      const methodName = methodParts.shift()
      if (!context[methodName]) throw new Error(`${methodName} is not a method on ${context}`)
      context = context[methodName]()
    }
    const final = methodParts.shift()
    return [context, final]
  }

  static requireAbsOrRelative(filePath: treeNotationTypes.filepath, contextFilePath: treeNotationTypes.filepath) {
    if (!filePath.startsWith(".")) return require(filePath)
    const path = require("path")
    const folder = this.getPathWithoutFileName(contextFilePath)
    const file = path.resolve(folder + "/" + filePath)
    return require(file)
  }

  // Removes last ".*" from this string
  static removeFileExtension(filename: treeNotationTypes.filepath) {
    return filename ? filename.replace(/\.[^\.]+$/, "") : ""
  }

  static getFileName(path: treeNotationTypes.filepath) {
    const parts = path.split("/") // todo: change for windows?
    return parts.pop()
  }

  static getPathWithoutFileName(path: treeNotationTypes.filepath) {
    const parts = path.split("/") // todo: change for windows?
    parts.pop()
    return parts.join("/")
  }

  // todo: switch algo to: http://indiegamr.com/generate-repeatable-random-numbers-in-js/?
  static makeSemiRandomFn = (seed = Date.now()) => {
    return () => {
      const semiRand = Math.sin(seed++) * 10000
      return semiRand - Math.floor(semiRand)
    }
  }

  static randomUniformInt = (min: treeNotationTypes.int, max: treeNotationTypes.int, seed = Date.now()) => {
    return Math.floor(TreeUtils.randomUniformFloat(min, max, seed))
  }

  static randomUniformFloat = (min: number, max: number, seed = Date.now()) => {
    const randFn = TreeUtils.makeSemiRandomFn(seed)
    return min + (max - min) * randFn()
  }

  static getRange = (startIndex: number, endIndexExclusive: number, increment = 1) => {
    const range = []
    for (let index = startIndex; index < endIndexExclusive; index = index + increment) {
      range.push(index)
    }
    return range
  }

  static shuffleInPlace(arr: any[], seed = Date.now()) {
    // https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
    const randFn = TreeUtils._getPseudoRandom0to1FloatGenerator(seed)
    for (let index = arr.length - 1; index > 0; index--) {
      const tempIndex = Math.floor(randFn() * (index + 1))
      ;[arr[index], arr[tempIndex]] = [arr[tempIndex], arr[index]]
    }
    return arr
  }

  // Only allows a-zA-Z0-9-_  (And optionally .)
  static _permalink(str: string, reg: RegExp) {
    return str.length
      ? str
          .toLowerCase()
          .replace(reg, "")
          .replace(/ /g, "-")
      : ""
  }

  static isValueEmpty(value: any) {
    return value === undefined || value === "" || (typeof value === "number" && isNaN(value)) || (value instanceof Date && isNaN(<any>value))
  }

  static stringToPermalink(str: string) {
    return this._permalink(str, /[^a-z0-9- _\.]/gi)
  }

  static getAvailablePermalink(permalink: string, doesFileExistSyncFn: (permalink: string) => boolean) {
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

  static getNextOrPrevious(arr: any[], item: any) {
    const length = arr.length
    const index = arr.indexOf(item)
    if (length === 1) return undefined
    if (index === length - 1) return arr[index - 1]
    return arr[index + 1]
  }

  static toggle(currentValue: any, values: any[]) {
    const index = values.indexOf(currentValue)
    return index === -1 || index + 1 === values.length ? values[0] : values[index + 1]
  }

  static getClassNameFromFilePath(filepath: treeNotationTypes.filepath) {
    return this.removeFileExtension(this.getFileName(filepath))
  }

  static joinArraysOn(joinOn: string, arrays: any[], columns: string[][]) {
    const rows: any = {}
    let index = 0
    if (!columns) columns = arrays.map(arr => Object.keys(arr[0]))
    arrays.forEach((arr, index) => {
      const cols = columns[index]

      arr.forEach((row: any) => {
        const key = joinOn ? row[joinOn] : index++
        if (!rows[key]) rows[key] = {}
        const obj = rows[key]
        cols.forEach(col => (obj[col] = row[col]))
      })
    })
    return Object.values(rows)
  }
  static getParentFolder(path: string) {
    if (path.endsWith("/")) path = this._removeLastSlash(path)
    return path.replace(/\/[^\/]*$/, "") + "/"
  }

  static _removeLastSlash(path: string) {
    return path.replace(/\/$/, "")
  }

  static _listToEnglishText(list: string[], limit = 5) {
    const len = list.length
    if (!len) return ""
    if (len === 1) return `'${list[0]}'`
    const clone = list.slice(0, limit).map(item => `'${item}'`)
    const last = clone.pop()
    if (len <= limit) return clone.join(", ") + ` and ${last}`
    return clone.join(", ") + ` and ${len - limit} more`
  }

  // todo: refactor so instead of str input takes an array of cells(strings) and scans each indepndently.
  static _chooseDelimiter(str: string) {
    const del = " ,|\t;^%$!#@~*&+-=_:?.{}[]()<>/".split("").find(idea => !str.includes(idea))
    if (!del) throw new Error("Could not find a delimiter")
    return del
  }

  static flatten(arr: any) {
    if (arr.flat) return arr.flat()
    return arr.reduce((acc: any, val: any) => acc.concat(val), [])
  }

  static escapeBackTicks(str: string) {
    return str.replace(/\`/g, "\\`").replace(/\$\{/g, "\\${")
  }

  static ucfirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Adapted from: https://github.com/dcporter/didyoumean.js/blob/master/didYouMean-1.2.1.js
  static didYouMean(str: string = "", options: string[] = [], caseSensitive = false, threshold = 0.4, thresholdAbsolute = 20) {
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

  private static MAX_INT: treeNotationTypes.positiveInt = Math.pow(2, 32) - 1

  // Adapted from: https://github.com/dcporter/didyoumean.js/blob/master/didYouMean-1.2.1.js
  private static _getEditDistance(stringA: string, stringB: string, maxInt: treeNotationTypes.positiveInt) {
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

  static getLineIndexAtCharacterPosition(str: string, index: number): number {
    const lines = str.split("\n")
    const len = lines.length
    let position = 0
    for (let lineNumber = 0; lineNumber < len; lineNumber++) {
      position += lines[lineNumber].length
      if (position >= index) return lineNumber
    }
  }

  static resolvePath(filePath: string, programFilepath: string) {
    // For use in Node.js only
    if (!filePath.startsWith(".")) return filePath
    const path = require("path")
    const folder = this.getPathWithoutFileName(programFilepath)
    return path.resolve(folder + "/" + filePath)
  }

  static resolveProperty(obj: Object, path: string | string[], separator = ".") {
    const properties = Array.isArray(path) ? path : path.split(separator)
    return properties.reduce((prev: any, curr) => prev && prev[curr], obj)
  }

  static appendCodeAndReturnValueOnWindow(code: treeNotationTypes.javascriptCode, name: string): any {
    const script = document.createElement("script")
    script.innerHTML = code
    document.head.appendChild(script)
    return (<any>window)[name]
  }

  static formatStr(str: string, catchAllCellDelimiter = " ", parameterMap: treeNotationTypes.stringMap) {
    return str.replace(/{([^\}]+)}/g, (match, path) => {
      const val = parameterMap[path]
      if (!val) return ""
      return Array.isArray(val) ? val.join(catchAllCellDelimiter) : val
    })
  }

  static stripHtml(text: string) {
    return text && text.replace ? text.replace(/<(?:.|\n)*?>/gm, "") : text
  }

  static getUniqueWordsArray(allWords: string) {
    const words = allWords.replace(/\n/g, " ").split(" ")
    const index: treeNotationTypes.stringMap = {}
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
  static _getPseudoRandom0to1FloatGenerator(seed: number) {
    return function() {
      seed = Math.imul(48271, seed) | 0 % 2147483647
      return (seed & 2147483647) / 2147483648
    }
  }

  static sampleWithoutReplacement(population: any[] = [], quantity: number, seed: number) {
    const prng = this._getPseudoRandom0to1FloatGenerator(seed)
    const sampled: { [index: number]: boolean } = {}
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

  static arrayToMap(arr: Array<any>) {
    const map: treeNotationTypes.stringMap = {}
    arr.forEach(val => (map[val] = true))
    return map
  }

  static _replaceNonAlphaNumericCharactersWithCharCodes(str: string) {
    return str
      .replace(/[^a-zA-Z0-9]/g, (sub: string) => {
        return "_" + sub.charCodeAt(0).toString()
      })
      .replace(/^([0-9])/, "number$1")
  }

  static mapValues<T>(object: Object, fn: (key: string) => T) {
    const result: { [key: string]: T } = {}
    Object.keys(object).forEach(key => {
      result[key] = fn(key)
    })
    return result
  }

  static javascriptTableWithHeaderRowToObjects(dataTable: Array<any>): treeNotationTypes.rawRowJavascriptObject[] {
    dataTable = dataTable.slice()
    const header = dataTable.shift()
    return dataTable.map((row: any) => {
      const obj: any = {}
      header.forEach((colName: string, index: treeNotationTypes.int) => (obj[colName] = row[index]))
      return obj
    })
  }

  static interweave(arrayOfArrays: any[][]) {
    const lineCount = Math.max(...arrayOfArrays.map(arr => arr.length))
    const totalArrays = arrayOfArrays.length
    const result: any[] = []
    arrayOfArrays.forEach((lineArray, arrayIndex) => {
      for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
        result[lineIndex * totalArrays + arrayIndex] = lineArray[lineIndex]
      }
    })
    return result
  }

  static makeSortByFn(accessorOrAccessors: Function | Function[]): treeNotationTypes.sortFn {
    const arrayOfFns = Array.isArray(accessorOrAccessors) ? accessorOrAccessors : [accessorOrAccessors]
    return (objectA: Object, objectB: Object) => {
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

  static _makeGraphSortFunctionFromGraph(idAccessor: treeNotationTypes.idAccessorFunction, graph: { [id: string]: Set<string> }) {
    return (nodeA: treeNotationTypes.treeNode, nodeB: treeNotationTypes.treeNode) => {
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

  static removeAll(str: string, needle: string) {
    return str.split(needle).join("")
  }

  static _makeGraphSortFunction(idAccessor: treeNotationTypes.idAccessorFunction, extendsIdAccessor: treeNotationTypes.idAccessorFunction) {
    return (nodeA: treeNotationTypes.treeNode, nodeB: treeNotationTypes.treeNode) => {
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

export { TreeUtils }
