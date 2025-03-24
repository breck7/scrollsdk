class Timer {
  constructor() {
    this._tickTime = Date.now() - (Utils.isNodeJs() ? 1000 * process.uptime() : 0)
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
class Utils {
  static getFileExtension(filepath = "") {
    const match = filepath.match(/\.([^\.]+)$/)
    return (match && match[1]) || ""
  }
  static ensureFolderEndsInSlash(folder) {
    return folder.replace(/\/$/, "") + "/"
  }
  static runCommand(instance, command = "", param = undefined) {
    const run = name => {
      console.log(`Running ${name}:`)
      instance[name](param)
    }
    if (instance[command + "Command"]) return run(command + "Command")
    // Get commands from both the child and parent classes
    const classes = [Object.getPrototypeOf(instance), Object.getPrototypeOf(Object.getPrototypeOf(instance))]
    const allCommands = classes.map(classInstance => Object.getOwnPropertyNames(classInstance).filter(atom => atom.endsWith("Command"))).flat()
    allCommands.sort()
    const commandAsNumber = parseInt(command) - 1
    if (command.match(/^\d+$/) && allCommands[commandAsNumber]) return run(allCommands[commandAsNumber])
    console.log(`\n❌ No command provided. Available commands:\n\n` + allCommands.map((name, index) => `${index + 1}. ${name.replace("Command", "")}`).join("\n") + "\n")
  }
  static removeReturnChars(str = "") {
    return str.replace(/\r/g, "")
  }
  static isAbsoluteUrl(url) {
    return url.startsWith("https://") || url.startsWith("http://")
  }
  static removeEmptyLines(str = "") {
    return str.replace(/\n\n+/g, "\n")
  }
  static shiftRight(str = "", numSpaces = 1) {
    let spaces = " ".repeat(numSpaces)
    return str.replace(/\n/g, `\n${spaces}`)
  }
  static getLinks(str = "") {
    const _re = new RegExp("(^|[ \t\r\n])((ftp|http|https):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))", "g")
    return str.match(_re) || []
  }
  // Only allow text content and inline styling. Don't allow HTML tags or any nested scroll tags or escape characters.
  static escapeScrollAndHtml(content = "") {
    return content.replace(/</g, "&lt;").replace(/\n/g, "").replace(/\r/g, "").replace(/\\/g, "")
  }
  static colorize(message, colorNameOrString = "red") {
    // ANSI: https://en.wikipedia.org/wiki/ANSI_escape_code
    const colors = { red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m" }
    const color = colors[colorNameOrString] || colorNameOrString
    const reset = "\x1b[0m"
    return `${color}${message}${reset}`
  }
  static ensureDelimiterNotFound(strings, delimiter) {
    const hit = strings.find(atom => atom.includes(delimiter))
    if (hit) throw `Delimiter "${delimiter}" found in hit`
  }
  // https://github.com/rigoneri/indefinite-article.js/blob/master/indefinite-article.js
  static getIndefiniteArticle(phrase) {
    // Getting the first atom
    const match = /\w+/.exec(phrase)
    let atom
    if (match) atom = match[0]
    else return "an"
    var l_atom = atom.toLowerCase()
    // Specific start of atoms that should be preceded by 'an'
    var alt_cases = ["honest", "hour", "hono"]
    for (var i in alt_cases) {
      if (l_atom.indexOf(alt_cases[i]) == 0) return "an"
    }
    // Single letter atom which should be preceded by 'an'
    if (l_atom.length == 1) {
      if ("aedhilmnorsx".indexOf(l_atom) >= 0) return "an"
      else return "a"
    }
    // Capital atoms which should likely be preceded by 'an'
    if (atom.match(/(?!FJO|[HLMNS]Y.|RY[EO]|SQU|(F[LR]?|[HL]|MN?|N|RH?|S[CHKLMNPTVW]?|X(YL)?)[AEIOU])[FHLMNRSX][A-Z]/)) {
      return "an"
    }
    // Special cases where a atom that begins with a vowel should be preceded by 'a'
    const regexes = [/^e[uw]/, /^onc?e\b/, /^uni([^nmd]|mo)/, /^u[bcfhjkqrst][aeiou]/]
    for (var i in regexes) {
      if (l_atom.match(regexes[i])) return "a"
    }
    // Special capital atoms (UK, UN)
    if (atom.match(/^U[NK][AIEO]/)) {
      return "a"
    } else if (atom == atom.toUpperCase()) {
      if ("aedhilmnorsx".indexOf(l_atom[0]) >= 0) return "an"
      else return "a"
    }
    // Basic method of atoms that begin with a vowel being preceded by 'an'
    if ("aeiou".indexOf(l_atom[0]) >= 0) return "an"
    // Instances where y follwed by specific letters is preceded by 'an'
    if (l_atom.match(/^y(b[lor]|cl[ea]|fere|gg|p[ios]|rou|tt)/)) return "an"
    return "a"
  }
  static htmlEscaped(content = "") {
    return content.replace(/</g, "&lt;")
  }
  static isValidEmail(email = "") {
    return email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
  }
  static capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  // generate a random alpha numeric hash:
  static getRandomCharacters(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
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
  static titleToPermalink(str) {
    return str
      .replace(/[\/\_\:\\\[\]]/g, "-")
      .replace(/π/g, "pi")
      .replace(/`/g, "tick")
      .replace(/\$/g, "dollar-sign")
      .replace(/\*$/g, "-star")
      .replace(/^\*/g, "star-")
      .replace(/\*/g, "-star-")
      .replace(/\'+$/g, "q")
      .replace(/^@/g, "at-")
      .replace(/@$/g, "-at")
      .replace(/@/g, "-at-")
      .replace(/[\'\"\,\ū]/g, "")
      .replace(/^\#/g, "sharp-")
      .replace(/\#$/g, "-sharp")
      .replace(/\#/g, "-sharp-")
      .replace(/[\(\)]/g, "")
      .replace(/\+\+$/g, "pp")
      .replace(/\+$/g, "p")
      .replace(/^\!/g, "bang-")
      .replace(/\!$/g, "-bang")
      .replace(/\!/g, "-bang-")
      .replace(/\&/g, "-n-")
      .replace(/[\+ ]/g, "-")
      .replace(/[^a-zA-Z0-9\-\.]/g, "")
      .toLowerCase()
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
      matrix.push(Utils.makeVector(cols, fill))
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
    const normalizedPath = path.replace(/\\/g, "/")
    const parts = normalizedPath.split("/")
    return parts.pop()
  }
  static getPathWithoutFileName(path) {
    const normalizedPath = path.replace(/\\/g, "/")
    const parts = normalizedPath.split("/")
    parts.pop()
    return parts.join("/")
  }
  static shuffleInPlace(arr, seed = Date.now()) {
    // https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
    const randFn = Utils._getPseudoRandom0to1FloatGenerator(seed)
    for (let index = arr.length - 1; index > 0; index--) {
      const tempIndex = Math.floor(randFn() * (index + 1))
      ;[arr[index], arr[tempIndex]] = [arr[tempIndex], arr[index]]
    }
    return arr
  }
  // Only allows a-zA-Z0-9-_  (And optionally .)
  static _permalink(str, reg) {
    return str.length ? str.toLowerCase().replace(reg, "").replace(/ /g, "-") : ""
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
  // todo: refactor so instead of str input takes an array of atoms(strings) and scans each indepndently.
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
      const editDistance = Utils._getEditDistance(str, caseSensitive ? candidate : candidate.toLowerCase(), maximumEditDistanceToBeBestMatch)
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
    maxInt = maxInt || maxInt === 0 ? maxInt : Utils.MAX_INT
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
      colMin = Utils.MAX_INT
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
  static formatStr(str, catchAllAtomDelimiter = " ", parameterMap) {
    return str.replace(/{([^\}]+)}/g, (match, path) => {
      const val = parameterMap[path]
      if (val === undefined) return ""
      return Array.isArray(val) ? val.join(catchAllAtomDelimiter) : val
    })
  }
  static stripHtml(text) {
    return text && text.replace ? text.replace(/<(?:.|\n)*?>/gm, "") : text
  }
  static getUniqueAtomsArray(allAtoms) {
    const atoms = allAtoms.replace(/\n/g, " ").split(" ")
    const index = {}
    atoms.forEach(atom => {
      if (!index[atom]) index[atom] = 0
      index[atom]++
    })
    return Object.keys(index).map(key => {
      return {
        atom: key,
        count: index[key]
      }
    })
  }
  static getRandomString(length = 30, letters = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), seed = Date.now()) {
    let str = ""
    const randFn = Utils._getPseudoRandom0to1FloatGenerator(seed)
    while (length) {
      str += letters[Math.round(Math.min(randFn() * letters.length, letters.length - 1))]
      length--
    }
    return str
  }
  // todo: add seed!
  static makeRandomParticles(lines = 1000, seed = Date.now()) {
    let str = ""
    let letters = " 123abc".split("")
    const randFn = Utils._getPseudoRandom0to1FloatGenerator(seed)
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
    return function () {
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
      const particleAFirst = -1
      const particleBFirst = 1
      const accessor = arrayOfFns[0] // todo: handle accessors
      const av = accessor(objectA)
      const bv = accessor(objectB)
      let result = av < bv ? particleAFirst : av > bv ? particleBFirst : 0
      if (av === undefined && bv !== undefined) result = particleAFirst
      else if (bv === undefined && av !== undefined) result = particleBFirst
      return result
    }
  }
  static _makeGraphSortFunctionFromGraph(idAccessor, graph) {
    return (particleA, particleB) => {
      const particleAFirst = -1
      const particleBFirst = 1
      const particleAUniqueId = idAccessor(particleA)
      const particleBUniqueId = idAccessor(particleB)
      const particleAExtendsParticleB = graph[particleAUniqueId].has(particleBUniqueId)
      const particleBExtendsParticleA = graph[particleBUniqueId].has(particleAUniqueId)
      if (particleAExtendsParticleB) return particleBFirst
      else if (particleBExtendsParticleA) return particleAFirst
      const particleAExtendsSomething = graph[particleAUniqueId].size > 1
      const particleBExtendsSomething = graph[particleBUniqueId].size > 1
      if (!particleAExtendsSomething && particleBExtendsSomething) return particleAFirst
      else if (!particleBExtendsSomething && particleAExtendsSomething) return particleBFirst
      if (particleAUniqueId > particleBUniqueId) return particleBFirst
      else if (particleAUniqueId < particleBUniqueId) return particleAFirst
      return 0
    }
  }
  static removeAll(str, needle) {
    return str.split(needle).join("")
  }
  static _makeGraphSortFunction(idAccessor, extendsIdAccessor) {
    return (particleA, particleB) => {
      // -1 === a before b
      const particleAUniqueId = idAccessor(particleA)
      const particleAExtends = extendsIdAccessor(particleA)
      const particleBUniqueId = idAccessor(particleB)
      const particleBExtends = extendsIdAccessor(particleB)
      const particleAExtendsParticleB = particleAExtends === particleBUniqueId
      const particleBExtendsParticleA = particleBExtends === particleAUniqueId
      const particleAFirst = -1
      const particleBFirst = 1
      if (!particleAExtends && !particleBExtends) {
        // If neither extends, sort by cue
        if (particleAUniqueId > particleBUniqueId) return particleBFirst
        else if (particleAUniqueId < particleBUniqueId) return particleAFirst
        return 0
      }
      // If only one extends, the other comes first
      else if (!particleAExtends) return particleAFirst
      else if (!particleBExtends) return particleBFirst
      // If A extends B, B should come first
      if (particleAExtendsParticleB) return particleBFirst
      else if (particleBExtendsParticleA) return particleAFirst
      // Sort by what they extend
      if (particleAExtends > particleBExtends) return particleBFirst
      else if (particleAExtends < particleBExtends) return particleAFirst
      // Finally sort by cue
      if (particleAUniqueId > particleBUniqueId) return particleBFirst
      else if (particleAUniqueId < particleBUniqueId) return particleAFirst
      // Should never hit this, unless we have a duplicate line.
      return 0
    }
  }
}
Utils.Timer = Timer
//http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links#21925491
Utils.linkify = (text, target = "_blank") => {
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
Utils.makeSemiRandomFn = (seed = Date.now()) => {
  return () => {
    const semiRand = Math.sin(seed++) * 10000
    return semiRand - Math.floor(semiRand)
  }
}
Utils.randomUniformInt = (min, max, seed = Date.now()) => {
  return Math.floor(Utils.randomUniformFloat(min, max, seed))
}
Utils.randomUniformFloat = (min, max, seed = Date.now()) => {
  const randFn = Utils.makeSemiRandomFn(seed)
  return min + (max - min) * randFn()
}
Utils.getRange = (startIndex, endIndexExclusive, increment = 1) => {
  const range = []
  for (let index = startIndex; index < endIndexExclusive; index = index + increment) {
    range.push(index)
  }
  return range
}
Utils.MAX_INT = Math.pow(2, 32) - 1
// https://github.com/browserify/path-browserify/blob/master/index.js
function posix_assertPath(path) {
  if (typeof path !== "string") {
    throw new TypeError("Path must be a string. Received " + JSON.stringify(path))
  }
}
// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = ""
  var lastSegmentLength = 0
  var lastSlash = -1
  var dots = 0
  var code
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length) code = path.charCodeAt(i)
    else if (code === 47 /*/*/) break
    else code = 47 /*/*/
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf("/")
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = ""
                lastSegmentLength = 0
              } else {
                res = res.slice(0, lastSlashIndex)
                lastSegmentLength = res.length - 1 - res.lastIndexOf("/")
              }
              lastSlash = i
              dots = 0
              continue
            }
          } else if (res.length === 2 || res.length === 1) {
            res = ""
            lastSegmentLength = 0
            lastSlash = i
            dots = 0
            continue
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0) res += "/.."
          else res = ".."
          lastSegmentLength = 2
        }
      } else {
        if (res.length > 0) res += "/" + path.slice(lastSlash + 1, i)
        else res = path.slice(lastSlash + 1, i)
        lastSegmentLength = i - lastSlash - 1
      }
      lastSlash = i
      dots = 0
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots
    } else {
      dots = -1
    }
  }
  return res
}
function _posixFormat(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root
  var base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "")
  if (!dir) {
    return base
  }
  if (dir === pathObject.root) {
    return dir + base
  }
  return dir + sep + base
}
var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = ""
    var resolvedAbsolute = false
    var cwd
    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path
      if (i >= 0) path = arguments[i]
      else {
        if (cwd === undefined) cwd = process.cwd()
        path = cwd
      }
      posix_assertPath(path)
      // Skip empty entries
      if (path.length === 0) {
        continue
      }
      resolvedPath = path + "/" + resolvedPath
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/
    }
    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute)
    if (resolvedAbsolute) {
      if (resolvedPath.length > 0) return "/" + resolvedPath
      else return "/"
    } else if (resolvedPath.length > 0) {
      return resolvedPath
    } else {
      return "."
    }
  },
  normalize: function normalize(path) {
    posix_assertPath(path)
    if (path.length === 0) return "."
    var isAbsolute = path.charCodeAt(0) === 47 /*/*/
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/
    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute)
    if (path.length === 0 && !isAbsolute) path = "."
    if (path.length > 0 && trailingSeparator) path += "/"
    if (isAbsolute) return "/" + path
    return path
  },
  isAbsolute: function isAbsolute(path) {
    posix_assertPath(path)
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/
  },
  join: function join() {
    if (arguments.length === 0) return "."
    var joined
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i]
      posix_assertPath(arg)
      if (arg.length > 0) {
        if (joined === undefined) joined = arg
        else joined += "/" + arg
      }
    }
    if (joined === undefined) return "."
    return posix.normalize(joined)
  },
  relative: function relative(from, to) {
    posix_assertPath(from)
    posix_assertPath(to)
    if (from === to) return ""
    from = posix.resolve(from)
    to = posix.resolve(to)
    if (from === to) return ""
    // Trim any leading backslashes
    var fromStart = 1
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/) break
    }
    var fromEnd = from.length
    var fromLen = fromEnd - fromStart
    // Trim any leading backslashes
    var toStart = 1
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/) break
    }
    var toEnd = to.length
    var toLen = toEnd - toStart
    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen
    var lastCommonSep = -1
    var i = 0
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1)
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i)
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0
          }
        }
        break
      }
      var fromCode = from.charCodeAt(fromStart + i)
      var toCode = to.charCodeAt(toStart + i)
      if (fromCode !== toCode) break
      else if (fromCode === 47 /*/*/) lastCommonSep = i
    }
    var out = ""
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0) out += ".."
        else out += "/.."
      }
    }
    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep)
    else {
      toStart += lastCommonSep
      if (to.charCodeAt(toStart) === 47 /*/*/) ++toStart
      return to.slice(toStart)
    }
  },
  _makeLong: function _makeLong(path) {
    return path
  },
  dirname: function dirname(path) {
    posix_assertPath(path)
    if (path.length === 0) return "."
    var code = path.charCodeAt(0)
    var hasRoot = code === 47 /*/*/
    var end = -1
    var matchedSlash = true
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i)
      if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i
          break
        }
      } else {
        // We saw the first non-path separator
        matchedSlash = false
      }
    }
    if (end === -1) return hasRoot ? "/" : "."
    if (hasRoot && end === 1) return "//"
    return path.slice(0, end)
  },
  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== "string") throw new TypeError('"ext" argument must be a string')
    posix_assertPath(path)
    var start = 0
    var end = -1
    var matchedSlash = true
    var i
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return ""
      var extIdx = ext.length - 1
      var firstNonSlashEnd = -1
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i)
        if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            start = i + 1
            break
          }
        } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false
            firstNonSlashEnd = i + 1
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1
              end = firstNonSlashEnd
            }
          }
        }
      }
      if (start === end) end = firstNonSlashEnd
      else if (end === -1) end = path.length
      return path.slice(start, end)
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            start = i + 1
            break
          }
        } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false
          end = i + 1
        }
      }
      if (end === -1) return ""
      return path.slice(start, end)
    }
  },
  extname: function extname(path) {
    posix_assertPath(path)
    var startDot = -1
    var startPart = 0
    var end = -1
    var matchedSlash = true
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i)
      if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1
          break
        }
        continue
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false
        end = i + 1
      }
      if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1) startDot = i
        else if (preDotState !== 1) preDotState = 1
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1
      }
    }
    if (
      startDot === -1 ||
      end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
    ) {
      return ""
    }
    return path.slice(startDot, end)
  },
  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject)
    }
    return _posixFormat("/", pathObject)
  },
  parse: function parse(path) {
    posix_assertPath(path)
    var ret = { root: "", dir: "", base: "", ext: "", name: "" }
    if (path.length === 0) return ret
    var code = path.charCodeAt(0)
    var isAbsolute = code === 47 /*/*/
    var start
    if (isAbsolute) {
      ret.root = "/"
      start = 1
    } else {
      start = 0
    }
    var startDot = -1
    var startPart = 0
    var end = -1
    var matchedSlash = true
    var i = path.length - 1
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0
    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i)
      if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1
          break
        }
        continue
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false
        end = i + 1
      }
      if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1) startDot = i
        else if (preDotState !== 1) preDotState = 1
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1
      }
    }
    if (
      startDot === -1 ||
      end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
    ) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end)
        else ret.base = ret.name = path.slice(startPart, end)
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot)
        ret.base = path.slice(1, end)
      } else {
        ret.name = path.slice(startPart, startDot)
        ret.base = path.slice(startPart, end)
      }
      ret.ext = path.slice(startDot, end)
    }
    if (startPart > 0) ret.dir = path.slice(0, startPart - 1)
    else if (isAbsolute) ret.dir = "/"
    return ret
  },
  sep: "/",
  delimiter: ":",
  win32: null,
  posix: null
}
posix.posix = posix
Utils.posix = posix
window.Utils = Utils
;

let _scrollsdkLatestTime = 0
let _scrollsdkMinTimeIncrement = 0.000000000001
class AbstractParticle {
  _getProcessTimeInMilliseconds() {
    // We add this loop to restore monotonically increasing .now():
    // https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
    let time = performance.now()
    while (time <= _scrollsdkLatestTime) {
      if (time === time + _scrollsdkMinTimeIncrement)
        // Some browsers have different return values for perf.now()
        _scrollsdkMinTimeIncrement = 10 * _scrollsdkMinTimeIncrement
      time += _scrollsdkMinTimeIncrement
    }
    _scrollsdkLatestTime = time
    return time
  }
}
var FileFormat
;(function (FileFormat) {
  FileFormat["csv"] = "csv"
  FileFormat["tsv"] = "tsv"
  FileFormat["particles"] = "particles"
})(FileFormat || (FileFormat = {}))
const ATOM_MEMBRANE = " " // The symbol that separates atoms (words)
const PARTICLE_MEMBRANE = "\n" // The symbol that separates particles (lines)
const SUBPARTICLE_MEMBRANE = " " // The symbol, in combination with PARTICLE_MEMBRANE, that makes subparticles
class AbstractParticleEvent {
  constructor(targetParticle) {
    this.targetParticle = targetParticle
  }
}
function _getIndentCount(str, edgeSymbol) {
  let level = 0
  const edgeChar = edgeSymbol
  while (str[level] === edgeChar) {
    level++
  }
  return level
}
class ChildAddedParticleEvent extends AbstractParticleEvent {}
class ChildRemovedParticleEvent extends AbstractParticleEvent {}
class DescendantChangedParticleEvent extends AbstractParticleEvent {}
class LineChangedParticleEvent extends AbstractParticleEvent {}
class ParticleAtom {
  constructor(particle, atomIndex) {
    this._particle = particle
    this._atomIndex = atomIndex
  }
  replace(newAtom) {
    this._particle.setAtom(this._atomIndex, newAtom)
  }
  get atom() {
    return this._particle.getAtom(this._atomIndex)
  }
}
const ParticleEvents = { ChildAddedParticleEvent, ChildRemovedParticleEvent, DescendantChangedParticleEvent, LineChangedParticleEvent }
var WhereOperators
;(function (WhereOperators) {
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
var ParticlesConstants
;(function (ParticlesConstants) {
  ParticlesConstants["extends"] = "extends"
})(ParticlesConstants || (ParticlesConstants = {}))
class ParserPool {
  constructor(catchAllParser, cueMap = {}, regexTests = undefined) {
    this._catchAllParser = catchAllParser
    this._cueMap = new Map(Object.entries(cueMap))
    this._regexTests = regexTests
  }
  getCueOptions() {
    return Array.from(this._getCueMap().keys())
  }
  // todo: remove
  _getCueMap() {
    return this._cueMap
  }
  // todo: remove
  _getCueMapAsObject() {
    let obj = {}
    const map = this._getCueMap()
    for (let [key, val] of map.entries()) {
      obj[key] = val
    }
    return obj
  }
  _getMatchingParser(block, parentParticle, lineNumber, atomBreakSymbol = ATOM_MEMBRANE) {
    return this._getCueMap().get(this._getCue(block, atomBreakSymbol)) || this._getParserFromRegexTests(block) || this._getCatchAllParser(parentParticle)
  }
  _getCatchAllParser(contextParticle) {
    if (this._catchAllParser) return this._catchAllParser
    const parent = contextParticle.parent
    if (parent) return parent._getParserPool()._getCatchAllParser(parent)
    return contextParticle.constructor
  }
  _getParserFromRegexTests(block) {
    if (!this._regexTests) return undefined
    const line = block.split(/\n/)[0]
    const hit = this._regexTests.find(test => test.regex.test(line))
    if (hit) return hit.parser
    return undefined
  }
  _getCue(block, atomBreakSymbol) {
    const line = block.split(/\n/)[0]
    const firstBreak = line.indexOf(atomBreakSymbol)
    return line.substr(0, firstBreak > -1 ? firstBreak : undefined)
  }
  createParticle(parentParticle, block, index) {
    const rootParticle = parentParticle.root
    if (rootParticle.particleTransformers) block = rootParticle._transformStrings(block)
    const parser = this._getMatchingParser(block, parentParticle, index)
    const { particleBreakSymbol } = parentParticle
    const lines = block.split(particleBreakSymbol)
    const subparticles = lines
      .slice(1)
      .map(line => line.substr(1))
      .join(particleBreakSymbol)
    return new parser(subparticles, lines[0], parentParticle, index)
  }
}
class Particle extends AbstractParticle {
  constructor(subparticles, line, parent, index) {
    super()
    // BEGIN MUTABLE METHODS BELOw
    this._particleCreationTime = this._getProcessTimeInMilliseconds()
    this._parent = parent
    this._setLine(line)
    this._setSubparticles(subparticles)
    if (index !== undefined) parent._getSubparticlesArray().splice(index, 0, this)
    else if (parent) parent._getSubparticlesArray().push(this)
    this.wake()
  }
  wake() {}
  execute() {}
  // todo: perhaps if needed in the future we can add more contextual params here
  _transformStrings(block) {
    this.particleTransformers.forEach(fn => {
      block = fn(block)
    })
    return block
  }
  addTransformer(fn) {
    if (!this.particleTransformers) this.particleTransformers = []
    this.particleTransformers.push(fn)
    return this
  }
  async loadRequirements(context) {
    // todo: remove
    await Promise.all(this.map(particle => particle.loadRequirements(context)))
  }
  getErrors() {
    return []
  }
  get lineAtomTypes() {
    // todo: make this any a constant
    return "undefinedAtomType ".repeat(this.atoms.length).trim()
  }
  isNodeJs() {
    return typeof exports !== "undefined"
  }
  isBrowser() {
    return !this.isNodeJs()
  }
  getOlderSiblings() {
    if (this.isRoot()) return []
    return this.parent.slice(0, this.index)
  }
  _getClosestOlderSibling() {
    const olderSiblings = this.getOlderSiblings()
    return olderSiblings[olderSiblings.length - 1]
  }
  getYoungerSiblings() {
    if (this.isRoot()) return []
    return this.parent.slice(this.index + 1)
  }
  getSiblings() {
    if (this.isRoot()) return []
    return this.parent.filter(particle => particle !== this)
  }
  _getUid() {
    if (!this._uid) this._uid = Particle._makeUniqueId()
    return this._uid
  }
  // todo: rename getMother? grandMother et cetera?
  get parent() {
    return this._parent
  }
  getIndentLevel(relativeTo) {
    return this._getIndentLevel(relativeTo)
  }
  get indentation() {
    const indentLevel = this._getIndentLevel() - 1
    if (indentLevel < 0) return ""
    return this.edgeSymbol.repeat(indentLevel)
  }
  _getTopDownArray(arr) {
    this.forEach(subparticle => {
      arr.push(subparticle)
      subparticle._getTopDownArray(arr)
    })
  }
  get topDownArray() {
    const arr = []
    this._getTopDownArray(arr)
    return arr
  }
  *getTopDownArrayIterator() {
    for (let subparticle of this.getSubparticles()) {
      yield subparticle
      yield* subparticle.getTopDownArrayIterator()
    }
  }
  particleAtLine(lineNumber) {
    let index = 0
    for (let particle of this.getTopDownArrayIterator()) {
      if (lineNumber === index) return particle
      index++
    }
  }
  get numberOfLines() {
    let lineCount = 0
    for (let particle of this.getTopDownArrayIterator()) {
      lineCount++
    }
    return lineCount
  }
  _getMaxUnitsOnALine() {
    let max = 0
    for (let particle of this.getTopDownArrayIterator()) {
      const count = particle.atoms.length + particle.getIndentLevel()
      if (count > max) max = count
    }
    return max
  }
  get numberOfAtoms() {
    let atomCount = 0
    for (let particle of this.getTopDownArrayIterator()) {
      atomCount += particle.atoms.length
    }
    return atomCount
  }
  get lineNumber() {
    return this._getLineNumberRelativeTo()
  }
  _getLineNumber(target = this) {
    if (this._cachedLineNumber) return this._cachedLineNumber
    let lineNumber = 1
    for (let particle of this.root.getTopDownArrayIterator()) {
      if (particle === target) return lineNumber
      lineNumber++
    }
    return lineNumber
  }
  isBlankLine() {
    return !this.length && !this.getLine()
  }
  get isBlank() {
    return this.isBlankLine()
  }
  hasDuplicateCues() {
    return this.length ? new Set(this.getCues()).size !== this.length : false
  }
  isEmpty() {
    return !this.length && !this.content
  }
  _getLineNumberRelativeTo(relativeTo) {
    if (this.isRoot(relativeTo)) return 0
    const start = relativeTo || this.root
    return start._getLineNumber(this)
  }
  isRoot(relativeTo) {
    return relativeTo === this || !this.parent
  }
  get root() {
    return this._getRootParticle()
  }
  _getRootParticle(relativeTo) {
    if (this.isRoot(relativeTo)) return this
    return this.parent._getRootParticle(relativeTo)
  }
  toString(indentCount = 0, language = this) {
    if (this.isRoot()) return this._subparticlesToString(indentCount, language)
    return this._toStringWithLine(indentCount, language)
  }
  _toStringWithLine(indentCount = 0, language = this) {
    return language.edgeSymbol.repeat(indentCount) + this.getLine(language) + (this.length ? language.particleBreakSymbol + this._subparticlesToString(indentCount + 1, language) : "")
  }
  get asString() {
    return this.toString()
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
  getAtom(index) {
    const atoms = this._getAtoms(0)
    if (index < 0) index = atoms.length + index
    return atoms[index]
  }
  get list() {
    return this.getAtomsFrom(1)
  }
  _toHtml(indentCount) {
    const path = this.getPathVector().join(" ")
    const classes = {
      particleLine: "particleLine",
      edgeSymbol: "edgeSymbol",
      particleBreakSymbol: "particleBreakSymbol",
      particleSubparticles: "particleSubparticles"
    }
    const edge = this.edgeSymbol.repeat(indentCount)
    // Set up the cue part of the particle
    const edgeHtml = `<span class="${classes.particleLine}" data-pathVector="${path}"><span class="${classes.edgeSymbol}">${edge}</span>`
    const lineHtml = this._getLineHtml()
    const subparticlesHtml = this.length ? `<span class="${classes.particleBreakSymbol}">${this.particleBreakSymbol}</span>` + `<span class="${classes.particleSubparticles}">${this._subparticlesToHtml(indentCount + 1)}</span>` : ""
    return `${edgeHtml}${lineHtml}${subparticlesHtml}</span>`
  }
  _getAtoms(startFrom) {
    if (!this._atoms) this._atoms = this._getLine().split(this.atomBreakSymbol)
    return startFrom ? this._atoms.slice(startFrom) : this._atoms
  }
  get atoms() {
    return this._getAtoms(0)
  }
  doesExtend(parserId) {
    return false
  }
  require(moduleName, filePath) {
    if (!this.isNodeJs()) return window[moduleName]
    return require(filePath || moduleName)
  }
  getAtomsFrom(startFrom) {
    return this._getAtoms(startFrom)
  }
  getFirstAncestor() {
    const parent = this.parent
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
  _getJavascriptPrototypeChainUpTo(stopAtClassName = "Particle") {
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
    return this.isRoot() ? "" : this.root._getProjectRootDir()
  }
  // Concat 2 particles amd return a new particle, but replace any particles
  // in this particle that start with the same particle from the first particle with
  // that patched version. Does not recurse.
  patch(two) {
    const copy = this.clone()
    two.forEach(particle => {
      const hit = copy.getParticle(particle.getAtom(0))
      if (hit) hit.destroy()
    })
    copy.concat(two)
    return copy
  }
  getSparsity() {
    const particles = this.getSubparticles()
    const fields = this._getUnionNames()
    let count = 0
    this.getSubparticles().forEach(particle => {
      fields.forEach(field => {
        if (particle.has(field)) count++
      })
    })
    return 1 - count / (particles.length * fields.length)
  }
  // todo: rename. what is the proper term from set/cat theory?
  getBiDirectionalMaps(propertyNameOrFn, propertyNameOrFn2 = particle => particle.getAtom(0)) {
    const oneToTwo = {}
    const twoToOne = {}
    const is1Str = typeof propertyNameOrFn === "string"
    const is2Str = typeof propertyNameOrFn2 === "string"
    const subparticles = this.getSubparticles()
    this.forEach((particle, index) => {
      const value1 = is1Str ? particle.get(propertyNameOrFn) : propertyNameOrFn(particle, index, subparticles)
      const value2 = is2Str ? particle.get(propertyNameOrFn2) : propertyNameOrFn2(particle, index, subparticles)
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
  _getAtomIndexCharacterStartPosition(atomIndex) {
    const xiLength = this.edgeSymbol.length
    const numIndents = this._getIndentLevel() - 1
    const indentPosition = xiLength * numIndents
    if (atomIndex < 1) return xiLength * (numIndents + atomIndex)
    return indentPosition + this.atoms.slice(0, atomIndex).join(this.atomBreakSymbol).length + this.atomBreakSymbol.length
  }
  getParticleInScopeAtCharIndex(charIndex) {
    if (this.isRoot()) return this
    let atomIndex = this.getAtomIndexAtCharacterIndex(charIndex)
    if (atomIndex > 0) return this
    let particle = this
    while (atomIndex < 1) {
      particle = particle.parent
      atomIndex++
    }
    return particle
  }
  getAtomProperties(atomIndex) {
    const start = this._getAtomIndexCharacterStartPosition(atomIndex)
    const atom = atomIndex < 0 ? "" : this.getAtom(atomIndex)
    return {
      startCharIndex: start,
      endCharIndex: start + atom.length,
      atom: atom
    }
  }
  fill(fill = "") {
    this.topDownArray.forEach(line => {
      line.atoms.forEach((atom, index) => line.setAtom(index, fill))
    })
    return this
  }
  getAllAtomBoundaryCoordinates() {
    const coordinates = []
    let lineIndex = 0
    for (let particle of this.getTopDownArrayIterator()) {
      particle.getAtomBoundaryCharIndices().forEach((charIndex, atomIndex) => {
        coordinates.push({
          lineIndex: lineIndex,
          charIndex: charIndex,
          atomIndex: atomIndex
        })
      })
      lineIndex++
    }
    return coordinates
  }
  getAtomBoundaryCharIndices() {
    let indentLevel = this._getIndentLevel()
    const atomBreakSymbolLength = this.atomBreakSymbol.length
    let elapsed = indentLevel
    return this.atoms.map((atom, atomIndex) => {
      const boundary = elapsed
      elapsed += atom.length + atomBreakSymbolLength
      return boundary
    })
  }
  getAtomIndexAtCharacterIndex(charIndex) {
    // todo: is this correct thinking for handling root?
    if (this.isRoot()) return 0
    const numberOfIndents = this._getIndentLevel(undefined) - 1
    // todo: probably want to rewrite this in a performant way.
    const spots = []
    while (spots.length < numberOfIndents) {
      spots.push(-(numberOfIndents - spots.length))
    }
    this.atoms.forEach((atom, atomIndex) => {
      atom.split("").forEach(letter => {
        spots.push(atomIndex)
      })
      spots.push(atomIndex)
    })
    return spots[charIndex]
  }
  // Note: This currently does not return any errors resulting from "required" or "single"
  getAllErrors(lineStartsAt = 1) {
    const errors = []
    for (let particle of this.topDownArray) {
      particle._cachedLineNumber = lineStartsAt // todo: cleanup
      const errs = particle.getErrors()
      errs.forEach(err => errors.push(err))
      // delete particle._cachedLineNumber
      lineStartsAt++
    }
    return errors
  }
  *getAllErrorsIterator() {
    let line = 1
    for (let particle of this.getTopDownArrayIterator()) {
      particle._cachedLineNumber = line
      const errs = particle.getErrors()
      // delete particle._cachedLineNumber
      if (errs.length) yield errs
      line++
    }
  }
  get cue() {
    return this.atoms[0]
  }
  set cue(atom) {
    this.setAtom(0, atom)
  }
  get content() {
    const atoms = this.getAtomsFrom(1)
    return atoms.length ? atoms.join(this.atomBreakSymbol) : undefined
  }
  get contentWithSubparticles() {
    // todo: deprecate
    const content = this.content
    return (content ? content : "") + (this.length ? this.particleBreakSymbol + this._subparticlesToString() : "")
  }
  getFirstParticle() {
    return this.particleAt(0)
  }
  getStack() {
    return this._getStack()
  }
  _getStack(relativeTo) {
    if (this.isRoot(relativeTo)) return []
    const parent = this.parent
    if (parent.isRoot(relativeTo)) return [this]
    else return parent._getStack(relativeTo).concat([this])
  }
  getStackString() {
    return this._getStack()
      .map((particle, index) => this.edgeSymbol.repeat(index) + particle.getLine())
      .join(this.particleBreakSymbol)
  }
  getLine(language) {
    if (!this._atoms && !language) return this._getLine() // todo: how does this interact with "language" param?
    return this.atoms.join((language || this).atomBreakSymbol)
  }
  getColumnNames() {
    return this._getUnionNames()
  }
  getOneHot(column) {
    const clone = this.clone()
    const cols = Array.from(new Set(clone.getColumn(column)))
    clone.forEach(particle => {
      const val = particle.get(column)
      particle.delete(column)
      cols.forEach(col => {
        particle.set(column + "_" + col, val === col ? "1" : "0")
      })
    })
    return clone
  }
  // todo: return array? getPathArray?
  _getCuePath(relativeTo) {
    if (this.isRoot(relativeTo)) return ""
    else if (this.parent.isRoot(relativeTo)) return this.cue
    return this.parent._getCuePath(relativeTo) + this.edgeSymbol + this.cue
  }
  getCuePathRelativeTo(relativeTo) {
    return this._getCuePath(relativeTo)
  }
  getCuePath() {
    return this._getCuePath()
  }
  getPathVector() {
    return this._getPathVector()
  }
  getPathVectorRelativeTo(relativeTo) {
    return this._getPathVector(relativeTo)
  }
  _getPathVector(relativeTo) {
    if (this.isRoot(relativeTo)) return []
    const path = this.parent._getPathVector(relativeTo)
    path.push(this.index)
    return path
  }
  get index() {
    return this.parent._indexOfParticle(this)
  }
  isTerminal() {
    return !this.length
  }
  _getLineHtml() {
    return this.atoms.map((atom, index) => `<span class="atom${index}">${Utils.stripHtml(atom)}</span>`).join(`<span class="zIncrement">${this.atomBreakSymbol}</span>`)
  }
  _getXmlContent(indentCount) {
    if (this.content !== undefined) return this.contentWithSubparticles
    return this.length ? `${indentCount === -1 ? "" : "\n"}${this._subparticlesToXml(indentCount > -1 ? indentCount + 2 : -1)}${" ".repeat(indentCount)}` : ""
  }
  _toXml(indentCount) {
    const indent = " ".repeat(indentCount)
    const tag = this.cue
    return `${indent}<${tag}>${this._getXmlContent(indentCount)}</${tag}>${indentCount === -1 ? "" : "\n"}`
  }
  _toObjectTuple() {
    const content = this.content
    const length = this.length
    const hasSubparticlesNoContent = content === undefined && length
    const hasContentAndHasSubparticles = content !== undefined && length
    // If the particle has a content and a subparticle return it as a string, as
    // Javascript object values can't be both a leaf and a particle.
    const tupleValue = hasSubparticlesNoContent ? this.toObject() : hasContentAndHasSubparticles ? this.contentWithSubparticles : content
    return [this.cue, tupleValue]
  }
  _indexOfParticle(needleParticle) {
    let result = -1
    this.find((particle, index) => {
      if (particle === needleParticle) {
        result = index
        return true
      }
    })
    return result
  }
  getMaxLineWidth() {
    let maxWidth = 0
    for (let particle of this.getTopDownArrayIterator()) {
      const lineWidth = particle.getLine().length
      if (lineWidth > maxWidth) maxWidth = lineWidth
    }
    return maxWidth
  }
  toParticle() {
    return new Particle(this.toString())
  }
  _rightPad(newWidth, padCharacter) {
    const line = this.getLine()
    this.setLine(line + padCharacter.repeat(newWidth - line.length))
    return this
  }
  rightPad(padCharacter = " ") {
    const newWidth = this.getMaxLineWidth()
    this.topDownArray.forEach(particle => particle._rightPad(newWidth, padCharacter))
    return this
  }
  lengthen(numberOfLines) {
    let linesToAdd = numberOfLines - this.numberOfLines
    while (linesToAdd > 0) {
      this.appendLine("")
      linesToAdd--
    }
    return this
  }
  toSideBySide(particlesOrStrings, delimiter = " ") {
    particlesOrStrings = particlesOrStrings.map(particle => (particle instanceof Particle ? particle : new Particle(particle)))
    const clone = this.toParticle()
    const particleBreakSymbol = "\n"
    let next
    while ((next = particlesOrStrings.shift())) {
      clone.lengthen(next.numberOfLines)
      clone.rightPad()
      next
        .toString()
        .split(particleBreakSymbol)
        .forEach((line, index) => {
          const particle = clone.particleAtLine(index)
          particle.setLine(particle.getLine() + delimiter + line)
        })
    }
    return clone
  }
  toComparison(particle) {
    const particleBreakSymbol = "\n"
    const lines = particle.toString().split(particleBreakSymbol)
    return new Particle(
      this.toString()
        .split(particleBreakSymbol)
        .map((line, index) => (lines[index] === line ? "" : "x"))
        .join(particleBreakSymbol)
    )
  }
  toBraid(particlesOrStrings) {
    particlesOrStrings.unshift(this)
    const particleDelimiter = this.particleBreakSymbol
    return new Particle(
      Utils.interweave(particlesOrStrings.map(particle => particle.toString().split(particleDelimiter)))
        .map(line => (line === undefined ? "" : line))
        .join(particleDelimiter)
    )
  }
  getSlice(startIndexInclusive, stopIndexExclusive) {
    return new Particle(
      this.slice(startIndexInclusive, stopIndexExclusive)
        .map(subparticle => subparticle.toString())
        .join("\n")
    )
  }
  _hasColumns(columns) {
    const atoms = this.atoms
    return columns.every((searchTerm, index) => searchTerm === atoms[index])
  }
  hasAtom(index, atom) {
    return this.getAtom(index) === atom
  }
  getParticleByColumns(...columns) {
    return this.topDownArray.find(particle => particle._hasColumns(columns))
  }
  getParticleByColumn(index, name) {
    return this.find(particle => particle.getAtom(index) === name)
  }
  _getParticlesByColumn(index, name) {
    return this.filter(particle => particle.getAtom(index) === name)
  }
  // todo: preserve subclasses!
  select(columnNames) {
    columnNames = Array.isArray(columnNames) ? columnNames : [columnNames]
    const result = new Particle()
    this.forEach(particle => {
      const newParticle = result.appendLine(particle.getLine())
      columnNames.forEach(name => {
        const valueParticle = particle.getParticle(name)
        if (valueParticle) newParticle.appendParticle(valueParticle)
      })
    })
    return result
  }
  selectionToString() {
    return this.getSelectedParticles()
      .map(particle => particle.toString())
      .join("\n")
  }
  getSelectedParticles() {
    return this.topDownArray.filter(particle => particle.isSelected())
  }
  clearSelection() {
    this.getSelectedParticles().forEach(particle => particle.unselectParticle())
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
    const fn = particle => {
      const atom = particle.get(columnName)
      const typedAtom = parser ? parser(atom) : atom
      if (operator === WhereOperators.equal) return fixedValue === typedAtom
      else if (operator === WhereOperators.notEqual) return fixedValue !== typedAtom
      else if (operator === WhereOperators.includes) return typedAtom !== undefined && typedAtom.includes(fixedValue)
      else if (operator === WhereOperators.doesNotInclude) return typedAtom === undefined || !typedAtom.includes(fixedValue)
      else if (operator === WhereOperators.greaterThan) return typedAtom > fixedValue
      else if (operator === WhereOperators.lessThan) return typedAtom < fixedValue
      else if (operator === WhereOperators.greaterThanOrEqual) return typedAtom >= fixedValue
      else if (operator === WhereOperators.lessThanOrEqual) return typedAtom <= fixedValue
      else if (operator === WhereOperators.empty) return !particle.has(columnName)
      else if (operator === WhereOperators.notEmpty) return particle.has(columnName) || (atom !== "" && atom !== undefined)
      else if (operator === WhereOperators.in && isArray) return fixedValue.includes(typedAtom)
      else if (operator === WhereOperators.notIn && isArray) return !fixedValue.includes(typedAtom)
    }
    const result = new Particle()
    this.filter(fn).forEach(particle => {
      result.appendParticle(particle)
    })
    return result
  }
  with(cue) {
    return this.filter(particle => particle.has(cue))
  }
  without(cue) {
    return this.filter(particle => !particle.has(cue))
  }
  first(quantity = 1) {
    return this.limit(quantity, 0)
  }
  last(quantity = 1) {
    return this.limit(quantity, this.length - quantity)
  }
  // todo: preserve subclasses!
  limit(quantity, offset = 0) {
    const result = new Particle()
    this.getSubparticles()
      .slice(offset, quantity + offset)
      .forEach(particle => {
        result.appendParticle(particle)
      })
    return result
  }
  getSubparticlesFirstArray() {
    const arr = []
    this._getSubparticlesFirstArray(arr)
    return arr
  }
  _getSubparticlesFirstArray(arr) {
    this.forEach(subparticle => {
      subparticle._getSubparticlesFirstArray(arr)
      arr.push(subparticle)
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
    this.topDownArray.forEach(particle => {
      const level = particle._getIndentLevel()
      if (!levels[level]) levels[level] = []
      levels[level].push(particle)
    })
    return levels
  }
  _getSubparticlesArray() {
    if (!this._subparticles) this._subparticles = []
    return this._subparticles
  }
  getLines() {
    return this.map(particle => particle.getLine())
  }
  getSubparticles() {
    return this._getSubparticlesArray().slice(0)
  }
  get length() {
    return this._getSubparticlesArray().length
  }
  _particleAt(index) {
    if (index < 0) index = this.length + index
    return this._getSubparticlesArray()[index]
  }
  particleAt(indexOrIndexArray) {
    if (typeof indexOrIndexArray === "number") return this._particleAt(indexOrIndexArray)
    if (indexOrIndexArray.length === 1) return this._particleAt(indexOrIndexArray[0])
    const first = indexOrIndexArray[0]
    const particle = this._particleAt(first)
    if (!particle) return undefined
    return particle.particleAt(indexOrIndexArray.slice(1))
  }
  // Flatten a particle into an object like {twitter:"pldb", "twitter.followers":123}.
  // Assumes you have a nested key/value list with no multiline strings.
  toFlatObject(delimiter = ".") {
    let newObject = {}
    const { edgeSymbolRegex } = this
    this.forEach((subparticle, index) => {
      newObject[subparticle.getAtom(0)] = subparticle.content
      subparticle.topDownArray.forEach(particle => {
        const newColumnName = particle.getCuePathRelativeTo(this).replace(edgeSymbolRegex, delimiter)
        const value = particle.content
        newObject[newColumnName] = value
      })
    })
    return newObject
  }
  _toObject() {
    const obj = {}
    this.forEach(particle => {
      const tuple = particle._toObjectTuple()
      obj[tuple[0]] = tuple[1]
    })
    return obj
  }
  get asHtml() {
    return this._subparticlesToHtml(0)
  }
  _toHtmlCubeLine(indents = 0, lineIndex = 0, planeIndex = 0) {
    const getLine = (atomIndex, atom = "") =>
      `<span class="htmlCubeSpan" style="top: calc(var(--topIncrement) * ${planeIndex} + var(--rowHeight) * ${lineIndex}); left:calc(var(--leftIncrement) * ${planeIndex} + var(--atomWidth) * ${atomIndex});">${atom.replace(
        /</g,
        "&lt;"
      )}</span>`
    let atoms = []
    this.atoms.forEach((atom, index) => (atom ? atoms.push(getLine(index + indents, atom)) : ""))
    return atoms.join("")
  }
  get asHtmlCube() {
    return this.map((plane, planeIndex) => plane.topDownArray.map((line, lineIndex) => line._toHtmlCubeLine(line.getIndentLevel() - 2, lineIndex, planeIndex)).join("")).join("")
  }
  _getHtmlJoinByCharacter() {
    return `<span class="particleBreakSymbol">${this.particleBreakSymbol}</span>`
  }
  _subparticlesToHtml(indentCount) {
    const joinBy = this._getHtmlJoinByCharacter()
    return this.map(particle => particle._toHtml(indentCount)).join(joinBy)
  }
  _subparticlesToString(indentCount, language = this) {
    return this.map(particle => particle.toString(indentCount, language)).join(language.particleBreakSymbol)
  }
  subparticlesToString(indentCount = 0) {
    return this._subparticlesToString(indentCount)
  }
  get murmurHash() {
    const str = this.toString()
    let h1 = 0xdeadbeef
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      h1 = Math.imul(h1 ^ char, 0x5bd1e995)
    }
    return (h1 >>> 0).toString(16)
  }
  // todo: implement
  _getChildJoinCharacter() {
    return "\n"
  }
  format() {
    this.forEach(subparticle => subparticle.format())
    return this
  }
  compile() {
    return this.map(subparticle => subparticle.compile()).join(this._getChildJoinCharacter())
  }
  get asXml() {
    return this._subparticlesToXml(0)
  }
  toDisk(path) {
    if (!this.isNodeJs()) throw new Error("This method only works in Node.js")
    const format = Particle._getFileFormat(path)
    const formats = {
      particles: particle => particle.toString(),
      csv: particle => particle.asCsv,
      tsv: particle => particle.asTsv
    }
    this.require("fs").writeFileSync(path, formats[format](this), "utf8")
    return this
  }
  _lineToYaml(indentLevel, listTag = "") {
    let prefix = " ".repeat(indentLevel)
    if (listTag && indentLevel > 1) prefix = " ".repeat(indentLevel - 2) + listTag + " "
    return prefix + `${this.cue}:` + (this.content ? " " + this.content : "")
  }
  _isYamlList() {
    return this.hasDuplicateCues()
  }
  get asYaml() {
    return `%YAML 1.2
---\n${this._subparticlesToYaml(0).join("\n")}`
  }
  _subparticlesToYaml(indentLevel) {
    if (this._isYamlList()) return this._subparticlesToYamlList(indentLevel)
    else return this._subparticlesToYamlAssociativeArray(indentLevel)
  }
  // if your code-to-be-yaml has a list of associative arrays of type N and you don't
  // want the type N to print
  _collapseYamlLine() {
    return false
  }
  _toYamlListElement(indentLevel) {
    const subparticles = this._subparticlesToYaml(indentLevel + 1)
    if (this._collapseYamlLine()) {
      if (indentLevel > 1) return subparticles.join("\n").replace(" ".repeat(indentLevel), " ".repeat(indentLevel - 2) + "- ")
      return subparticles.join("\n")
    } else {
      subparticles.unshift(this._lineToYaml(indentLevel, "-"))
      return subparticles.join("\n")
    }
  }
  _subparticlesToYamlList(indentLevel) {
    return this.map(particle => particle._toYamlListElement(indentLevel + 2))
  }
  _toYamlAssociativeArrayElement(indentLevel) {
    const subparticles = this._subparticlesToYaml(indentLevel + 1)
    subparticles.unshift(this._lineToYaml(indentLevel))
    return subparticles.join("\n")
  }
  _subparticlesToYamlAssociativeArray(indentLevel) {
    return this.map(particle => particle._toYamlAssociativeArrayElement(indentLevel))
  }
  get asJsonSubset() {
    return JSON.stringify(this.toObject(), null, " ")
  }
  _toObjectForSerialization() {
    return this.length
      ? {
          atoms: this.atoms,
          subparticles: this.map(subparticle => subparticle._toObjectForSerialization())
        }
      : {
          atoms: this.atoms
        }
  }
  get asSExpression() {
    return this._toSExpression()
  }
  _toSExpression() {
    const thisAtoms = this.atoms.join(" ")
    if (!this.length)
      // For leaf nodes, just return (cue content) or (cue) if no content
      return `(${thisAtoms})`
    // For nodes with children, recursively process each child
    const children = this.map(particle => particle._toSExpression()).join(" ")
    return thisAtoms ? `(${thisAtoms} ${children})` : `(${children})`
  }
  get asJson() {
    return JSON.stringify({ subparticles: this.map(subparticle => subparticle._toObjectForSerialization()) }, null, " ")
  }
  get asGrid() {
    const AtomBreakSymbol = this.atomBreakSymbol
    return this.toString()
      .split(this.particleBreakSymbol)
      .map(line => line.split(AtomBreakSymbol))
  }
  get asGridJson() {
    return JSON.stringify(this.asGrid, null, 2)
  }
  findParticles(cuePath) {
    // todo: can easily speed this up
    const map = {}
    if (!Array.isArray(cuePath)) cuePath = [cuePath]
    cuePath.forEach(path => (map[path] = true))
    return this.topDownArray.filter(particle => {
      if (map[particle._getCuePath(this)]) return true
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
    return this.map(particle => particle.get(path))
  }
  getFiltered(fn) {
    const clone = this.clone()
    clone
      .filter((particle, index) => !fn(particle, index))
      .forEach(particle => {
        particle.destroy()
      })
    return clone
  }
  getParticle(cuePath) {
    return this._getParticleByPath(cuePath)
  }
  getParticles(cuePath) {
    return this.findParticles(cuePath)
  }
  get section() {
    // return all particles after this one to the next blank line or end of file
    const particles = []
    if (this.isLast) return particles
    let next = this.next
    while (!next.isBlank) {
      particles.push(next)
      next = next.next
      if (next.isFirst) break
    }
    return particles
  }
  get isLast() {
    return this.index === this.parent.length - 1
  }
  get isFirst() {
    return this.index === 0
  }
  getFrom(prefix) {
    const hit = this.filter(particle => particle.getLine().startsWith(prefix))[0]
    if (hit) return hit.getLine().substr((prefix + this.atomBreakSymbol).length)
  }
  get(cuePath) {
    const particle = this._getParticleByPath(cuePath)
    return particle === undefined ? undefined : particle.content
  }
  getOneOf(keys) {
    for (let i = 0; i < keys.length; i++) {
      const value = this.get(keys[i])
      if (value) return value
    }
    return ""
  }
  pick(fields) {
    const newParticle = new Particle(this.toString()) // todo: why not clone?
    const map = Utils.arrayToMap(fields)
    newParticle.particleAt(0).forEach(particle => {
      if (!map[particle.getAtom(0)]) particle.destroy()
    })
    return newParticle
  }
  getParticlesByGlobPath(query) {
    return this._getParticlesByGlobPath(query)
  }
  _getParticlesByGlobPath(globPath) {
    const edgeSymbol = this.edgeSymbol
    if (!globPath.includes(edgeSymbol)) {
      if (globPath === "*") return this.getSubparticles()
      return this.filter(particle => particle.cue === globPath)
    }
    const parts = globPath.split(edgeSymbol)
    const current = parts.shift()
    const rest = parts.join(edgeSymbol)
    const matchingParticles = current === "*" ? this.getSubparticles() : this.filter(subparticle => subparticle.cue === current)
    return [].concat.apply(
      [],
      matchingParticles.map(particle => particle._getParticlesByGlobPath(rest))
    )
  }
  _getParticleByPath(cuePath) {
    const edgeSymbol = this.edgeSymbol
    if (!cuePath.includes(edgeSymbol)) {
      const index = this.indexOfLast(cuePath)
      return index === -1 ? undefined : this._particleAt(index)
    }
    const parts = cuePath.split(edgeSymbol)
    const current = parts.shift()
    const currentParticle = this._getSubparticlesArray()[this._getCueIndex()[current]]
    return currentParticle ? currentParticle._getParticleByPath(parts.join(edgeSymbol)) : undefined
  }
  get next() {
    if (this.isRoot()) return this
    const index = this.index
    const parent = this.parent
    const length = parent.length
    const next = index + 1
    return next === length ? parent._getSubparticlesArray()[0] : parent._getSubparticlesArray()[next]
  }
  get previous() {
    if (this.isRoot()) return this
    const index = this.index
    const parent = this.parent
    const length = parent.length
    const prev = index - 1
    return prev === -1 ? parent._getSubparticlesArray()[length - 1] : parent._getSubparticlesArray()[prev]
  }
  _getUnionNames() {
    if (!this.length) return []
    const obj = {}
    this.forEach(particle => {
      if (!particle.length) return undefined
      particle.forEach(particle => {
        obj[particle.cue] = 1
      })
    })
    return Object.keys(obj)
  }
  getAncestorParticlesByInheritanceViaExtendsCue(key) {
    const ancestorParticles = this._getAncestorParticles(
      (particle, id) => particle._getParticlesByColumn(0, id),
      particle => particle.get(key),
      this
    )
    ancestorParticles.push(this)
    return ancestorParticles
  }
  // Note: as you can probably tell by the name of this method, I don't recommend using this as it will likely be replaced by something better.
  getAncestorParticlesByInheritanceViaColumnIndices(thisColumnNumber, extendsColumnNumber) {
    const ancestorParticles = this._getAncestorParticles(
      (particle, id) => particle._getParticlesByColumn(thisColumnNumber, id),
      particle => particle.getAtom(extendsColumnNumber),
      this
    )
    ancestorParticles.push(this)
    return ancestorParticles
  }
  _getAncestorParticles(getPotentialParentParticlesByIdFn, getParentIdFn, cannotContainParticle) {
    const parentId = getParentIdFn(this)
    if (!parentId) return []
    const potentialParentParticles = getPotentialParentParticlesByIdFn(this.parent, parentId)
    if (!potentialParentParticles.length) throw new Error(`"${this.getLine()} tried to extend "${parentId}" but "${parentId}" not found.`)
    if (potentialParentParticles.length > 1) throw new Error(`Invalid inheritance paths. Multiple unique ids found for "${parentId}"`)
    const parentParticle = potentialParentParticles[0]
    // todo: detect loops
    if (parentParticle === cannotContainParticle) throw new Error(`Loop detected between '${this.getLine()}' and '${parentParticle.getLine()}'`)
    const ancestorParticles = parentParticle._getAncestorParticles(getPotentialParentParticlesByIdFn, getParentIdFn, cannotContainParticle)
    ancestorParticles.push(parentParticle)
    return ancestorParticles
  }
  pathVectorToCuePath(pathVector) {
    const path = pathVector.slice() // copy array
    const names = []
    let particle = this
    while (path.length) {
      if (!particle) return names
      names.push(particle.particleAt(path[0]).cue)
      particle = particle.particleAt(path.shift())
    }
    return names
  }
  toStringWithLineNumbers() {
    return this.toString()
      .split("\n")
      .map((line, index) => `${index + 1} ${line}`)
      .join("\n")
  }
  get asCsv() {
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
    const atomFn = (atomValue, rowIndex, columnIndex) => (rowIndex ? parsers[types[columnIndex]](atomValue) : atomValue)
    const arrays = this._toArrays(header, atomFn)
    arrays.rows.unshift(arrays.header)
    return arrays.rows
  }
  toDelimited(delimiter, header = this._getUnionNames(), escapeSpecialChars = true) {
    const regex = new RegExp(`(\\n|\\"|\\${delimiter})`)
    const atomFn = (str, row, column) => (!str.toString().match(regex) ? str : `"` + str.replace(/\"/g, `""`) + `"`)
    return this._toDelimited(delimiter, header, escapeSpecialChars ? atomFn : str => str)
  }
  _getMatrix(columns) {
    const matrix = []
    this.forEach(subparticle => {
      const row = []
      columns.forEach(col => {
        row.push(subparticle.get(col))
      })
      matrix.push(row)
    })
    return matrix
  }
  _toArrays(columnNames, atomFn) {
    const skipHeaderRow = 1
    const header = columnNames.map((columnName, index) => atomFn(columnName, 0, index))
    const rows = this.map((particle, rowNumber) =>
      columnNames.map((columnName, columnIndex) => {
        const subparticleParticle = particle.getParticle(columnName)
        const content = subparticleParticle ? subparticleParticle.contentWithSubparticles : ""
        return atomFn(content, rowNumber + skipHeaderRow, columnIndex)
      })
    )
    return {
      rows,
      header
    }
  }
  _toDelimited(delimiter, header, atomFn) {
    const data = this._toArrays(header, atomFn)
    return data.header.join(delimiter) + "\n" + data.rows.map(row => row.join(delimiter)).join("\n")
  }
  get asTable() {
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
    this.forEach(particle => {
      if (!particle.length) return true
      header.forEach((col, index) => {
        const atomValue = particle.get(col)
        if (!atomValue) return true
        const length = atomValue.toString().length
        if (length > widths[index]) widths[index] = length > maxCharactersPerColumn ? maxCharactersPerColumn : length
      })
    })
    const atomFn = (atomText, row, col) => {
      const width = widths[col]
      // Strip newlines in fixedWidth output
      const atomValue = atomText.toString().replace(/\n/g, "\\n")
      const atomLength = atomValue.length
      if (atomLength > width) return atomValue.substr(0, width) + "..."
      const padding = " ".repeat(width - atomLength)
      return alignRight ? padding + atomValue : atomValue + padding
    }
    return this._toDelimited(" ", header, atomFn)
  }
  get asSsv() {
    return this.toDelimited(" ")
  }
  get asOutline() {
    return this._toOutline(particle => particle.getLine())
  }
  toMappedOutline(particleFn) {
    return this._toOutline(particleFn)
  }
  // Adapted from: https://github.com/notatestuser/treeify.js
  _toOutline(particleFn) {
    const growBranch = (outlineParticle, last, lastStates, particleFn, callback) => {
      let lastStatesCopy = lastStates.slice(0)
      const particle = outlineParticle.particle
      if (lastStatesCopy.push([outlineParticle, last]) && lastStates.length > 0) {
        let line = ""
        // cued on the "was last element" states of whatever we're nested within,
        // we need to append either blankness or a branch to our line
        lastStates.forEach((lastState, idx) => {
          if (idx > 0) line += lastState[1] ? " " : "│"
        })
        // the prefix varies cued on whether the key contains something to show and
        // whether we're dealing with the last element in this collection
        // the extra "-" just makes things stand out more.
        line += (last ? "└" : "├") + particleFn(particle)
        callback(line)
      }
      if (!particle) return
      const length = particle.length
      let index = 0
      particle.forEach(particle => {
        let lastKey = ++index === length
        growBranch({ particle: particle }, lastKey, lastStatesCopy, particleFn, callback)
      })
    }
    let output = ""
    growBranch({ particle: this }, false, [], particleFn, line => (output += line + "\n"))
    return output
  }
  copyTo(particle, index) {
    return particle._insertBlock(this.toString(), index)
  }
  // Note: Splits using a positive lookahead
  // this.split("foo").join("\n") === this.toString()
  split(cue) {
    const constructor = this.constructor
    const ParticleBreakSymbol = this.particleBreakSymbol
    const AtomBreakSymbol = this.atomBreakSymbol
    // todo: cleanup. the escaping is wierd.
    return this.toString()
      .split(new RegExp(`\\${ParticleBreakSymbol}(?=${cue}(?:${AtomBreakSymbol}|\\${ParticleBreakSymbol}))`, "g"))
      .map(str => new constructor(str))
  }
  get asMarkdownTable() {
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
  get asTsv() {
    return this.toDelimited("\t")
  }
  get particleBreakSymbol() {
    return PARTICLE_MEMBRANE
  }
  get atomBreakSymbol() {
    return ATOM_MEMBRANE
  }
  get edgeSymbolRegex() {
    return new RegExp(this.edgeSymbol, "g")
  }
  get particleBreakSymbolRegex() {
    return new RegExp(this.particleBreakSymbol, "g")
  }
  get edgeSymbol() {
    return SUBPARTICLE_MEMBRANE
  }
  _textToContentAndSubparticlesTuple(text) {
    const lines = text.split(this.particleBreakSymbolRegex)
    const firstLine = lines.shift()
    const subparticles = !lines.length
      ? undefined
      : lines
          .map(line => (line.substr(0, 1) === this.edgeSymbol ? line : this.edgeSymbol + line))
          .map(line => line.substr(1))
          .join(this.particleBreakSymbol)
    return [firstLine, subparticles]
  }
  _getLine() {
    return this._line
  }
  _setLine(line = "") {
    this._line = line
    if (this._atoms) delete this._atoms
    return this
  }
  _clearSubparticles() {
    this._deleteByIndexes(Utils.getRange(0, this.length))
    delete this._subparticles
    return this
  }
  _setSubparticles(content, circularCheckArray) {
    this._clearSubparticles()
    // todo: is this correct? seems like `new Particle("").length` should be 1, not 0.
    if (!content) return this
    // set from string
    if (typeof content === "string") {
      this._appendSubparticlesFromString(content)
      return this
    }
    // set from particle
    if (content instanceof Particle) {
      content.forEach(particle => this._insertBlock(particle.toString()))
      return this
    }
    // If we set from object, create an array of inserted objects to avoid circular loops
    if (!circularCheckArray) circularCheckArray = [content]
    return this._setFromObject(content, circularCheckArray)
  }
  _setFromObject(content, circularCheckArray) {
    for (let cue in content) {
      if (!content.hasOwnProperty(cue)) continue
      // Branch the circularCheckArray, as we only have same branch circular arrays
      this._appendFromJavascriptObjectTuple(cue, content[cue], circularCheckArray.slice(0))
    }
    return this
  }
  // todo: refactor the below.
  _appendFromJavascriptObjectTuple(cue, content, circularCheckArray) {
    const type = typeof content
    let line
    let subparticles
    if (content === null) line = cue + " " + null
    else if (content === undefined) line = cue
    else if (type === "string") {
      const tuple = this._textToContentAndSubparticlesTuple(content)
      line = cue + " " + tuple[0]
      subparticles = tuple[1]
    } else if (type === "function") line = cue + " " + content.toString()
    else if (type !== "object") line = cue + " " + content
    else if (content instanceof Date) line = cue + " " + content.getTime().toString()
    else if (content instanceof Particle) {
      line = cue
      subparticles = new Particle(content.subparticlesToString(), content.getLine())
    } else if (circularCheckArray.indexOf(content) === -1) {
      circularCheckArray.push(content)
      line = cue
      const length = content instanceof Array ? content.length : Object.keys(content).length
      if (length) subparticles = new Particle()._setSubparticles(content, circularCheckArray)
    } else {
      // iirc this is return early from circular
      return
    }
    this._insertBlock(this._makeBlock(line, subparticles))
  }
  _insertBlock(block, index = this.length) {
    const adjustedIndex = index < 0 ? this.length + index : index
    const newParticle = this._getParserPool().createParticle(this, block, index)
    if (this._cueIndex) this._makeCueIndex(adjustedIndex)
    this.clearQuickCache()
    return newParticle
  }
  _insertLines(lines, index = this.length) {
    const parser = this.constructor
    const newParticle = new parser()
    if (typeof lines === "string") newParticle._appendSubparticlesFromString(lines)
    const adjustedIndex = index < 0 ? this.length + index : index
    this._getSubparticlesArray().splice(adjustedIndex, 0, ...newParticle.getSubparticles())
    if (this._cueIndex) this._makeCueIndex(adjustedIndex)
    this.clearQuickCache()
    return this.getSubparticles().slice(index, index + newParticle.length)
  }
  insertLinesAfter(lines) {
    return this.parent._insertLines(lines, this.index + 1)
  }
  _appendSubparticlesFromString(str) {
    const { edgeSymbol, particleBreakSymbol } = this
    const regex = new RegExp(`\\${particleBreakSymbol}(?!\\${edgeSymbol})`, "g")
    const blocks = str.split(regex)
    const parserPool = this._getParserPool()
    const startIndex = this._getSubparticlesArray().length
    blocks.forEach((block, index) => parserPool.createParticle(this, block, startIndex + index))
  }
  _getCueIndex() {
    // StringMap<int> {cue: index}
    // When there are multiple tails with the same cue, index stores the last content.
    // todo: change the above behavior: when a collision occurs, create an array.
    return this._cueIndex || this._makeCueIndex()
  }
  getContentsArray() {
    return this.map(particle => particle.content)
  }
  getSubparticlesByParser(parser) {
    return this.filter(subparticle => subparticle instanceof parser)
  }
  getAncestorByParser(parser) {
    if (this instanceof parser) return this
    if (this.isRoot()) return undefined
    const parent = this.parent
    return parent instanceof parser ? parent : parent.getAncestorByParser(parser)
  }
  getParticleByParser(parser) {
    return this.find(subparticle => subparticle instanceof parser)
  }
  indexOfLast(cue) {
    const result = this._getCueIndex()[cue]
    return result === undefined ? -1 : result
  }
  // todo: renmae to indexOfFirst?
  indexOf(cue) {
    if (!this.has(cue)) return -1
    const length = this.length
    const particles = this._getSubparticlesArray()
    for (let index = 0; index < length; index++) {
      if (particles[index].cue === cue) return index
    }
  }
  // todo: rename this. it is a particular type of object.
  toObject() {
    return this._toObject()
  }
  getCues() {
    return this.map(particle => particle.cue)
  }
  _makeCueIndex(startAt = 0) {
    if (!this._cueIndex || !startAt) this._cueIndex = {}
    const particles = this._getSubparticlesArray()
    const newIndex = this._cueIndex
    const length = particles.length
    for (let index = startAt; index < length; index++) {
      newIndex[particles[index].cue] = index
    }
    return newIndex
  }
  _subparticlesToXml(indentCount) {
    return this.map(particle => particle._toXml(indentCount)).join("")
  }
  clone(subparticles = this.subparticlesToString(), line = this.getLine()) {
    return new this.constructor(subparticles, line)
  }
  hasCue(cue) {
    return this._hasCue(cue)
  }
  has(cuePath) {
    const edgeSymbol = this.edgeSymbol
    if (!cuePath.includes(edgeSymbol)) return this.hasCue(cuePath)
    const parts = cuePath.split(edgeSymbol)
    const next = this.getParticle(parts.shift())
    if (!next) return false
    return next.has(parts.join(edgeSymbol))
  }
  hasParticle(particle) {
    const needle = particle.toString()
    return this.getSubparticles().some(particle => particle.toString() === needle)
  }
  _hasCue(cue) {
    return this._getCueIndex()[cue] !== undefined
  }
  map(fn) {
    return this.getSubparticles().map(fn)
  }
  filter(fn = item => item) {
    return this.getSubparticles().filter(fn)
  }
  find(fn) {
    return this.getSubparticles().find(fn)
  }
  findLast(fn) {
    return this.getSubparticles().reverse().find(fn)
  }
  every(fn) {
    let index = 0
    for (let particle of this.getTopDownArrayIterator()) {
      if (!fn(particle, index)) return false
      index++
    }
    return true
  }
  forEach(fn) {
    this.getSubparticles().forEach(fn)
    return this
  }
  // Recurse if predicate passes
  deepVisit(predicate) {
    this.forEach(particle => {
      if (predicate(particle) !== false) particle.deepVisit(predicate)
    })
  }
  get quickCache() {
    if (!this._quickCache) this._quickCache = {}
    return this._quickCache
  }
  getCustomIndex(key) {
    if (!this.quickCache.customIndexes) this.quickCache.customIndexes = {}
    const customIndexes = this.quickCache.customIndexes
    if (customIndexes[key]) return customIndexes[key]
    const customIndex = {}
    customIndexes[key] = customIndex
    this.filter(file => file.has(key)).forEach(file => {
      const value = file.get(key)
      if (!customIndex[value]) customIndex[value] = []
      customIndex[value].push(file)
    })
    return customIndex
  }
  clearQuickCache() {
    delete this._quickCache
  }
  // todo: protected?
  _clearCueIndex() {
    delete this._cueIndex
    this.clearQuickCache()
  }
  slice(start, end) {
    return this.getSubparticles().slice(start, end)
  }
  // todo: make 0 and 1 a param
  getInheritanceParticles() {
    const paths = {}
    const result = new Particle()
    this.forEach(particle => {
      const key = particle.getAtom(0)
      const parentKey = particle.getAtom(1)
      const parentPath = paths[parentKey]
      paths[key] = parentPath ? [parentPath, key].join(" ") : key
      result.touchParticle(paths[key])
    })
    return result
  }
  _getGrandParent() {
    return this.isRoot() || this.parent.isRoot() ? undefined : this.parent.parent
  }
  _getParserPool() {
    if (!Particle._parserPools.has(this.constructor)) Particle._parserPools.set(this.constructor, this.createParserPool())
    return Particle._parserPools.get(this.constructor)
  }
  createParserPool() {
    return new ParserPool(this.constructor)
  }
  static _makeUniqueId() {
    if (this._uniqueId === undefined) this._uniqueId = 0
    this._uniqueId++
    return this._uniqueId
  }
  static _getFileFormat(path) {
    const format = path.split(".").pop()
    return FileFormat[format] ? format : FileFormat.particles
  }
  getLineModifiedTime() {
    return this._lineModifiedTime || this._particleCreationTime
  }
  getChildArrayModifiedTime() {
    return this._subparticleArrayModifiedTime || this._particleCreationTime
  }
  _setChildArrayMofifiedTime(value) {
    this._subparticleArrayModifiedTime = value
    return this
  }
  getLineOrSubparticlesModifiedTime() {
    return Math.max(
      this.getLineModifiedTime(),
      this.getChildArrayModifiedTime(),
      Math.max.apply(
        null,
        this.map(subparticle => subparticle.getLineOrSubparticlesModifiedTime())
      )
    )
  }
  _setVirtualParentParticle(particle) {
    this._virtualParentParticle = particle
    return this
  }
  _getVirtualParentParticle() {
    return this._virtualParentParticle
  }
  _setVirtualAncestorParticlesByInheritanceViaColumnIndicesAndThenExpand(particles, thisIdColumnNumber, extendsIdColumnNumber) {
    const map = {}
    for (let particle of particles) {
      const particleId = particle.getAtom(thisIdColumnNumber)
      if (map[particleId]) throw new Error(`Tried to define a particle with id "${particleId}" but one is already defined.`)
      map[particleId] = {
        particleId: particleId,
        particle: particle,
        parentId: particle.getAtom(extendsIdColumnNumber)
      }
    }
    // Add parent Particles
    Object.values(map).forEach(particleInfo => {
      const parentId = particleInfo.parentId
      const parentParticle = map[parentId]
      if (parentId && !parentParticle) throw new Error(`Particle "${particleInfo.particleId}" tried to extend "${parentId}" but "${parentId}" not found.`)
      if (parentId) particleInfo.particle._setVirtualParentParticle(parentParticle.particle)
    })
    particles.forEach(particle => particle._expandFromVirtualParentParticle())
    return this
  }
  _expandFromVirtualParentParticle() {
    if (this._isVirtualExpanded) return this
    this._isExpanding = true
    let parentParticle = this._getVirtualParentParticle()
    if (parentParticle) {
      if (parentParticle._isExpanding) throw new Error(`Loop detected: '${this.getLine()}' is the ancestor of one of its ancestors.`)
      parentParticle._expandFromVirtualParentParticle()
      const clone = this.clone()
      this._setSubparticles(parentParticle.subparticlesToString())
      this.extend(clone)
    }
    this._isExpanding = false
    this._isVirtualExpanded = true
  }
  // todo: solve issue related to whether extend should overwrite or append.
  _expandSubparticles(thisIdColumnNumber, extendsIdColumnNumber, subparticlesThatNeedExpanding = this.getSubparticles()) {
    return this._setVirtualAncestorParticlesByInheritanceViaColumnIndicesAndThenExpand(subparticlesThatNeedExpanding, thisIdColumnNumber, extendsIdColumnNumber)
  }
  // todo: add more testing.
  // todo: solve issue with where extend should overwrite or append
  // todo: should take a parsers? to decide whether to overwrite or append.
  // todo: this is slow.
  extend(particleOrStr) {
    const particle = particleOrStr instanceof Particle ? particleOrStr : new Particle(particleOrStr)
    const usedCues = new Set()
    particle.forEach(sourceParticle => {
      const cue = sourceParticle.cue
      let targetParticle
      const isAnArrayNotMap = usedCues.has(cue)
      if (!this.has(cue)) {
        usedCues.add(cue)
        this.appendLineAndSubparticles(sourceParticle.getLine(), sourceParticle.subparticlesToString())
        return true
      }
      if (isAnArrayNotMap) targetParticle = this.appendLine(sourceParticle.getLine())
      else {
        targetParticle = this.touchParticle(cue).setContent(sourceParticle.content)
        usedCues.add(cue)
      }
      if (sourceParticle.length) targetParticle.extend(sourceParticle)
    })
    return this
  }
  lastParticle() {
    return this.getSubparticles()[this.length - 1]
  }
  expandLastFromTopMatter() {
    const clone = this.clone()
    const map = new Map()
    const lastParticle = clone.lastParticle()
    lastParticle.getOlderSiblings().forEach(particle => map.set(particle.getAtom(0), particle))
    lastParticle.topDownArray.forEach(particle => {
      const replacement = map.get(particle.getAtom(0))
      if (!replacement) return
      particle.replaceParticle(str => replacement.toString())
    })
    return lastParticle
  }
  macroExpand(macroDefinitionAtom, macroUsageAtom) {
    const clone = this.clone()
    const defs = clone.findParticles(macroDefinitionAtom)
    const allUses = clone.findParticles(macroUsageAtom)
    const atomBreakSymbol = clone.atomBreakSymbol
    defs.forEach(def => {
      const macroName = def.getAtom(1)
      const uses = allUses.filter(particle => particle.hasAtom(1, macroName))
      const params = def.getAtomsFrom(2)
      const replaceFn = str => {
        const paramValues = str.split(atomBreakSymbol).slice(2)
        let newParticle = def.subparticlesToString()
        params.forEach((param, index) => {
          newParticle = newParticle.replace(new RegExp(param, "g"), paramValues[index])
        })
        return newParticle
      }
      uses.forEach(particle => {
        particle.replaceParticle(replaceFn)
      })
      def.destroy()
    })
    return clone
  }
  setSubparticles(subparticles) {
    return this._setSubparticles(subparticles)
  }
  _updateLineModifiedTimeAndTriggerEvent() {
    this._lineModifiedTime = this._getProcessTimeInMilliseconds()
  }
  insertAtom(index, atom) {
    const wi = this.atomBreakSymbol
    const atoms = this._getLine().split(wi)
    atoms.splice(index, 0, atom)
    this.setLine(atoms.join(wi))
    return this
  }
  deleteDuplicates() {
    const set = new Set()
    this.topDownArray.forEach(particle => {
      const str = particle.toString()
      if (set.has(str)) particle.destroy()
      else set.add(str)
    })
    return this
  }
  setAtom(index, atom) {
    const wi = this.atomBreakSymbol
    const atoms = this._getLine().split(wi)
    atoms[index] = atom
    this.setLine(atoms.join(wi))
    return this
  }
  deleteSubparticles() {
    return this._clearSubparticles()
  }
  setContent(content) {
    if (content === this.content) return this
    const newArray = [this.cue]
    if (content !== undefined) {
      content = content.toString()
      if (content.match(this.particleBreakSymbol)) return this.setContentWithSubparticles(content)
      newArray.push(content)
    }
    this._setLine(newArray.join(this.atomBreakSymbol))
    this._updateLineModifiedTimeAndTriggerEvent()
    return this
  }
  prependSibling(line, subparticles) {
    return this.parent.insertLineAndSubparticles(line, subparticles, this.index)
  }
  appendSibling(line, subparticles) {
    return this.parent.insertLineAndSubparticles(line, subparticles, this.index + 1)
  }
  setContentWithSubparticles(text) {
    // todo: deprecate
    if (!text.includes(this.particleBreakSymbol)) {
      this._clearSubparticles()
      return this.setContent(text)
    }
    const lines = text.split(this.particleBreakSymbolRegex)
    const firstLine = lines.shift()
    this.setContent(firstLine)
    // tood: cleanup.
    const remainingString = lines.join(this.particleBreakSymbol)
    const subparticles = new Particle(remainingString)
    if (!remainingString) subparticles.appendLine("")
    this.setSubparticles(subparticles)
    return this
  }
  setCue(cue) {
    return this.setAtom(0, cue)
  }
  setLine(line) {
    if (line === this.getLine()) return this
    // todo: clear parent TMTimes
    this.parent._clearCueIndex()
    this._setLine(line)
    this._updateLineModifiedTimeAndTriggerEvent()
    return this
  }
  duplicate() {
    return this.parent._insertBlock(this.toString(), this.index + 1)
  }
  trim() {
    // todo: could do this so only the trimmed rows are deleted.
    this.setSubparticles(this.subparticlesToString().trim())
    return this
  }
  destroy() {
    this.parent._deleteParticle(this)
  }
  set(cuePath, text) {
    return this.touchParticle(cuePath).setContentWithSubparticles(text)
  }
  setFromText(text) {
    if (this.toString() === text) return this
    const tuple = this._textToContentAndSubparticlesTuple(text)
    this.setLine(tuple[0])
    return this._setSubparticles(tuple[1])
  }
  setPropertyIfMissing(prop, value) {
    if (this.has(prop)) return true
    return this.touchParticle(prop).setContent(value)
  }
  setProperties(propMap) {
    const props = Object.keys(propMap)
    const values = Object.values(propMap)
    // todo: is there a built in particle method to do this?
    props.forEach((prop, index) => {
      const value = values[index]
      if (!value) return true
      if (this.get(prop) === value) return true
      this.touchParticle(prop).setContent(value)
    })
    return this
  }
  // todo: throw error if line contains a \n
  appendLine(line) {
    return this._insertBlock(line)
  }
  appendUniqueLine(line) {
    if (!this.hasLine(line)) return this.appendLine(line)
    return this.findLine(line)
  }
  appendLineAndSubparticles(line, subparticles) {
    return this._insertBlock(this._makeBlock(line, subparticles))
  }
  _makeBlock(line, subparticles) {
    if (subparticles === undefined) return line
    const particle = new Particle(subparticles, line)
    return particle._toStringWithLine()
  }
  getParticlesByRegex(regex) {
    const matches = []
    regex = regex instanceof RegExp ? [regex] : regex
    this._getParticlesByLineRegex(matches, regex)
    return matches
  }
  // todo: remove?
  getParticlesByLinePrefixes(columns) {
    const matches = []
    this._getParticlesByLineRegex(
      matches,
      columns.map(str => new RegExp("^" + str))
    )
    return matches
  }
  particlesThatStartWith(prefix) {
    return this.filter(particle => particle.getLine().startsWith(prefix))
  }
  _getParticlesByLineRegex(matches, regs) {
    const rgs = regs.slice(0)
    const reg = rgs.shift()
    const candidates = this.filter(subparticle => subparticle.getLine().match(reg))
    if (!rgs.length) return candidates.forEach(cand => matches.push(cand))
    candidates.forEach(cand => cand._getParticlesByLineRegex(matches, rgs))
  }
  concat(particle) {
    if (typeof particle === "string") particle = new Particle(particle)
    return particle.map(particle => this._insertBlock(particle.toString()))
  }
  _deleteByIndexes(indexesToDelete) {
    if (!indexesToDelete.length) return this
    this._clearCueIndex()
    // note: assumes indexesToDelete is in ascending order
    const deletedParticles = indexesToDelete.reverse().map(index => this._getSubparticlesArray().splice(index, 1)[0])
    this._setChildArrayMofifiedTime(this._getProcessTimeInMilliseconds())
    return this
  }
  _deleteParticle(particle) {
    const index = this._indexOfParticle(particle)
    return index > -1 ? this._deleteByIndexes([index]) : 0
  }
  reverse() {
    this._clearCueIndex()
    this._getSubparticlesArray().reverse()
    return this
  }
  shift() {
    if (!this.length) return null
    const particle = this._getSubparticlesArray().shift()
    return particle.copyTo(new this.constructor(), 0)
  }
  sort(fn) {
    this._getSubparticlesArray().sort(fn)
    this._clearCueIndex()
    return this
  }
  invert() {
    this.forEach(particle => particle.atoms.reverse())
    return this
  }
  _rename(oldCue, newCue) {
    const index = this.indexOf(oldCue)
    if (index === -1) return this
    const particle = this._getSubparticlesArray()[index]
    particle.setCue(newCue)
    this._clearCueIndex()
    return this
  }
  // Does not recurse.
  remap(map) {
    this.forEach(particle => {
      const cue = particle.cue
      if (map[cue] !== undefined) particle.setCue(map[cue])
    })
    return this
  }
  rename(oldCue, newCue) {
    this._rename(oldCue, newCue)
    return this
  }
  renameAll(oldName, newName) {
    this.findParticles(oldName).forEach(particle => particle.setCue(newName))
    return this
  }
  _deleteAllChildParticlesWithCue(cue) {
    if (!this.has(cue)) return this
    const allParticles = this._getSubparticlesArray()
    const indexesToDelete = []
    allParticles.forEach((particle, index) => {
      if (particle.cue === cue) indexesToDelete.push(index)
    })
    return this._deleteByIndexes(indexesToDelete)
  }
  delete(path = "") {
    const edgeSymbol = this.edgeSymbol
    if (!path.includes(edgeSymbol)) return this._deleteAllChildParticlesWithCue(path)
    const parts = path.split(edgeSymbol)
    const nextCue = parts.pop()
    const targetParticle = this.getParticle(parts.join(edgeSymbol))
    return targetParticle ? targetParticle._deleteAllChildParticlesWithCue(nextCue) : 0
  }
  deleteColumn(cue = "") {
    this.forEach(particle => particle.delete(cue))
    return this
  }
  _getNonMaps() {
    const results = this.topDownArray.filter(particle => particle.hasDuplicateCues())
    if (this.hasDuplicateCues()) results.unshift(this)
    return results
  }
  replaceParticle(fn) {
    const parent = this.parent
    const index = this.index
    const newParticles = new Particle(fn(this.toString()))
    const returnedParticles = []
    newParticles.forEach((subparticle, subparticleIndex) => {
      const newParticle = parent.insertLineAndSubparticles(subparticle.getLine(), subparticle.subparticlesToString(), index + subparticleIndex)
      returnedParticles.push(newParticle)
    })
    this.destroy()
    return returnedParticles
  }
  insertLineAndSubparticles(line, subparticles, index) {
    return this._insertBlock(this._makeBlock(line, subparticles), index)
  }
  insertLine(line, index) {
    return this._insertBlock(line, index)
  }
  insertSection(lines, index) {
    return this._insertBlock(lines, index)
  }
  prependLine(line) {
    return this.insertLine(line, 0)
  }
  pushContentAndSubparticles(content, subparticles) {
    let index = this.length
    while (this.has(index.toString())) {
      index++
    }
    const line = index.toString() + (content === undefined ? "" : this.atomBreakSymbol + content)
    return this.appendLineAndSubparticles(line, subparticles)
  }
  deleteBlanks() {
    this.getSubparticles()
      .filter(particle => particle.isBlankLine())
      .forEach(particle => particle.destroy())
    return this
  }
  // todo: add "globalReplace" method? Which runs a global regex or string replace on the Particle as a string?
  cueSort(cueOrder) {
    return this._cueSort(cueOrder)
  }
  deleteAtomAt(atomIndex) {
    const atoms = this.atoms
    atoms.splice(atomIndex, 1)
    return this.setAtoms(atoms)
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
    const parent = this.parent
    parent.trigger(event)
    parent.triggerAncestors(event)
  }
  onLineChanged(eventHandler) {
    return this._addEventListener(LineChangedParticleEvent, eventHandler)
  }
  onDescendantChanged(eventHandler) {
    return this._addEventListener(DescendantChangedParticleEvent, eventHandler)
  }
  onChildAdded(eventHandler) {
    return this._addEventListener(ChildAddedParticleEvent, eventHandler)
  }
  onChildRemoved(eventHandler) {
    return this._addEventListener(ChildRemovedParticleEvent, eventHandler)
  }
  _addEventListener(eventClass, eventHandler) {
    if (!this._listeners) this._listeners = new Map()
    if (!this._listeners.has(eventClass)) this._listeners.set(eventClass, [])
    this._listeners.get(eventClass).push(eventHandler)
    return this
  }
  setAtoms(atoms) {
    return this.setLine(atoms.join(this.atomBreakSymbol))
  }
  setAtomsFrom(index, atoms) {
    this.setAtoms(this.atoms.slice(0, index).concat(atoms))
    return this
  }
  appendAtom(atom) {
    const atoms = this.atoms
    atoms.push(atom)
    return this.setAtoms(atoms)
  }
  _cueSort(cueOrder, secondarySortFn) {
    const particleAFirst = -1
    const particleBFirst = 1
    const map = {}
    cueOrder.forEach((atom, index) => {
      map[atom] = index
    })
    this.sort((particleA, particleB) => {
      const valA = map[particleA.cue]
      const valB = map[particleB.cue]
      if (valA > valB) return particleBFirst
      if (valA < valB) return particleAFirst
      return secondarySortFn ? secondarySortFn(particleA, particleB) : 0
    })
    return this
  }
  _touchParticle(cuePathArray) {
    let contextParticle = this
    cuePathArray.forEach(cue => {
      contextParticle = contextParticle.getParticle(cue) || contextParticle.appendLine(cue)
    })
    return contextParticle
  }
  _touchParticleByString(str) {
    str = str.replace(this.particleBreakSymbolRegex, "") // todo: do we want to do this sanitization?
    return this._touchParticle(str.split(this.atomBreakSymbol))
  }
  touchParticle(str) {
    return this._touchParticleByString(str)
  }
  appendParticle(particle) {
    return this.appendLineAndSubparticles(particle.getLine(), particle.subparticlesToString())
  }
  hasLine(line) {
    return this.getSubparticles().some(particle => particle.getLine() === line)
  }
  findLine(line) {
    return this.getSubparticles().find(particle => particle.getLine() === line)
  }
  getParticlesByLine(line) {
    return this.filter(particle => particle.getLine() === line)
  }
  toggleLine(line) {
    const lines = this.getParticlesByLine(line)
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
    this.sort((particleA, particleB) => {
      const atomsA = particleA.atoms
      const atomsB = particleB.atoms
      for (let index = 0; index < length; index++) {
        const col = indices[index]
        const av = atomsA[col]
        const bv = atomsB[col]
        if (av === undefined) return -1
        if (bv === undefined) return 1
        if (av > bv) return 1
        else if (av < bv) return -1
      }
      return 0
    })
    return this
  }
  getAtomsAsSet() {
    return new Set(this.getAtomsFrom(1))
  }
  appendAtomIfMissing(atom) {
    if (this.getAtomsAsSet().has(atom)) return this
    return this.appendAtom(atom)
  }
  // todo: check to ensure identical objects
  addObjectsAsDelimited(arrayOfObjects, delimiter = Utils._chooseDelimiter(new Particle(arrayOfObjects).toString())) {
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
  setSubparticlesAsDelimited(particle, delimiter = Utils._chooseDelimiter(particle.toString())) {
    particle = particle instanceof Particle ? particle : new Particle(particle)
    return this.setSubparticles(particle.toDelimited(delimiter))
  }
  convertSubparticlesToDelimited(delimiter = Utils._chooseDelimiter(this.subparticlesToString())) {
    // todo: handle newlines!!!
    return this.setSubparticles(this.toDelimited(delimiter))
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
    const parentIndex = this.parent.index
    const newParticle = grandParent.insertLineAndSubparticles(this.getLine(), this.length ? this.subparticlesToString() : undefined, parentIndex + 1)
    this.destroy()
    return newParticle
  }
  pasteText(text) {
    const parent = this.parent
    const index = this.index
    const newParticles = new Particle(text)
    const firstParticle = newParticles.particleAt(0)
    if (firstParticle) {
      this.setLine(firstParticle.getLine())
      if (firstParticle.length) this.setSubparticles(firstParticle.subparticlesToString())
    } else {
      this.setLine("")
    }
    newParticles.forEach((subparticle, subparticleIndex) => {
      if (!subparticleIndex)
        // skip first
        return true
      parent.insertLineAndSubparticles(subparticle.getLine(), subparticle.subparticlesToString(), index + subparticleIndex)
    })
    return this
  }
  templateToString(obj) {
    // todo: compile/cache for perf?
    const particle = this.clone()
    particle.topDownArray.forEach(particle => {
      const line = particle.getLine().replace(/{([^\}]+)}/g, (match, path) => {
        const replacement = obj[path]
        if (replacement === undefined) throw new Error(`In string template no match found on line "${particle.getLine()}"`)
        return replacement
      })
      particle.pasteText(line)
    })
    return particle.toString()
  }
  shiftRight() {
    const olderSibling = this._getClosestOlderSibling()
    if (!olderSibling) return this
    const newParticle = olderSibling.appendLineAndSubparticles(this.getLine(), this.length ? this.subparticlesToString() : undefined)
    this.destroy()
    return newParticle
  }
  shiftYoungerSibsRight() {
    const particles = this.getYoungerSiblings()
    particles.forEach(particle => particle.shiftRight())
    return this
  }
  sortBy(nameOrNames) {
    const names = nameOrNames instanceof Array ? nameOrNames : [nameOrNames]
    const length = names.length
    this.sort((particleA, particleB) => {
      if (!particleB.length && !particleA.length) return 0
      else if (!particleA.length) return -1
      else if (!particleB.length) return 1
      for (let index = 0; index < length; index++) {
        const cue = names[index]
        const av = particleA.get(cue)
        const bv = particleB.get(cue)
        if (av > bv) return 1
        else if (av < bv) return -1
      }
      return 0
    })
    return this
  }
  selectParticle() {
    this._selected = true
  }
  unselectParticle() {
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
    this.setSubparticles(this._getTopUndoVersion())
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
    return new Particle(JSON.parse(str))
  }
  static serializedParticleToParticle(particle) {
    const language = new Particle()
    const atomDelimiter = language.atomBreakSymbol
    const particleDelimiter = language.particleBreakSymbol
    const line = particle.atoms ? particle.atoms.join(atomDelimiter) : undefined
    const newParticle = new Particle(undefined, line)
    if (particle.subparticles)
      particle.subparticles.forEach(subparticle => {
        newParticle.appendParticle(this.serializedParticleToParticle(subparticle))
      })
    return newParticle
  }
  static fromJson(str) {
    return this.serializedParticleToParticle(JSON.parse(str))
  }
  static fromGridJson(str) {
    const lines = JSON.parse(str)
    const language = new Particle()
    const atomDelimiter = language.atomBreakSymbol
    const particleDelimiter = language.particleBreakSymbol
    return new Particle(lines.map(line => line.join(atomDelimiter)).join(particleDelimiter))
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
    return this._rowsToParticle(rows, delimiter, true)
  }
  static _getEscapedRows(str, delimiter, quoteChar) {
    return str.includes(quoteChar) ? this._strToRows(str, delimiter, quoteChar) : str.split("\n").map(line => line.split(delimiter))
  }
  static fromDelimitedNoHeaders(str, delimiter, quoteChar) {
    str = str.replace(/\r/g, "") // remove windows newlines if present
    const rows = this._getEscapedRows(str, delimiter, quoteChar)
    return this._rowsToParticle(rows, delimiter, false)
  }
  static _strToRows(str, delimiter, quoteChar, newLineChar = "\n") {
    const rows = [[]]
    const newLine = "\n"
    const length = str.length
    let currentAtom = ""
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
        if (char !== quoteChar) currentAtom += char
        else if (isNextCharAQuote) {
          // Both the current and next char are ", so the " is escaped
          currentAtom += nextChar
          currentPosition++ // Jump 2
        } else {
          // If the current char is a " and the next char is not, it's the end of the quotes
          inQuote = false
          if (isLastChar) rows[currentRow].push(currentAtom)
        }
      } else {
        if (char === delimiter) {
          rows[currentRow].push(currentAtom)
          currentAtom = ""
          if (isNextCharAQuote) {
            inQuote = true
            currentPosition++ // Jump 2
          }
        } else if (char === newLine) {
          rows[currentRow].push(currentAtom)
          currentAtom = ""
          currentRow++
          if (nextChar) rows[currentRow] = []
          if (isNextCharAQuote) {
            inQuote = true
            currentPosition++ // Jump 2
          }
        } else if (isLastChar) rows[currentRow].push(currentAtom + char)
        else currentAtom += char
      }
      currentPosition++
    }
    return rows
  }
  static multiply(particleA, particleB) {
    const productParticle = particleA.clone()
    productParticle.forEach((particle, index) => {
      particle.setSubparticles(particle.length ? this.multiply(particle, particleB) : particleB.clone())
    })
    return productParticle
  }
  // Given an array return a particle
  static _rowsToParticle(rows, delimiter, hasHeaders) {
    const numberOfColumns = rows[0].length
    const particle = new Particle()
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
      row.forEach((atomValue, index) => {
        obj[names[index]] = atomValue
      })
      particle.pushContentAndSubparticles(undefined, obj)
    }
    return particle
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
      return this._particleFromXml(xml).getParticle("subparticles")
    } catch (err) {
      return this._particleFromXml(this._parseXml2(str)).getParticle("subparticles")
    }
  }
  static _zipObject(keys, values) {
    const obj = {}
    keys.forEach((key, index) => (obj[key] = values[index]))
    return obj
  }
  static fromShape(shapeArr, rootParticle = new Particle()) {
    const part = shapeArr.shift()
    if (part !== undefined) {
      for (let index = 0; index < part; index++) {
        rootParticle.appendLine(index.toString())
      }
    }
    if (shapeArr.length) rootParticle.forEach(particle => Particle.fromShape(shapeArr.slice(0), particle))
    return rootParticle
  }
  static fromDataTable(table) {
    const header = table.shift()
    return new Particle(table.map(row => this._zipObject(header, row)))
  }
  static _parseXml2(str) {
    const el = document.createElement("div")
    el.innerHTML = str
    return el
  }
  // todo: cleanup typings
  static _particleFromXml(xml) {
    const result = new Particle()
    const subparticles = new Particle()
    // Set attributes
    if (xml.attributes) {
      for (let index = 0; index < xml.attributes.length; index++) {
        result.set(xml.attributes[index].name, xml.attributes[index].value)
      }
    }
    if (xml.data) subparticles.pushContentAndSubparticles(xml.data)
    // Set content
    if (xml.childNodes && xml.childNodes.length > 0) {
      for (let index = 0; index < xml.childNodes.length; index++) {
        const child = xml.childNodes[index]
        if (child.tagName && child.tagName.match(/parsererror/i)) throw new Error("Parse Error")
        if (child.childNodes.length > 0 && child.tagName) subparticles.appendLineAndSubparticles(child.tagName, this._particleFromXml(child))
        else if (child.tagName) subparticles.appendLine(child.tagName)
        else if (child.data) {
          const data = child.data.trim()
          if (data) subparticles.pushContentAndSubparticles(data)
        }
      }
    }
    if (subparticles.length > 0) result.touchParticle("subparticles").setSubparticles(subparticles)
    return result
  }
  static _getHeader(rows, hasHeaders) {
    const numberOfColumns = rows[0].length
    const headerRow = hasHeaders ? rows[0] : []
    const AtomBreakSymbol = " "
    const ziRegex = new RegExp(AtomBreakSymbol, "g")
    if (hasHeaders) {
      // Strip any AtomBreakSymbols from column names in the header row.
      // This makes the mapping not quite 1 to 1 if there are any AtomBreakSymbols in names.
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
    const ParticleBreakSymbol = PARTICLE_MEMBRANE
    const AtomBreakSymbol = ATOM_MEMBRANE
    const indent = ParticleBreakSymbol + AtomBreakSymbol.repeat(xValue)
    return str ? indent + str.replace(/\n/g, indent) : ""
  }
  static fromDisk(path) {
    const format = this._getFileFormat(path)
    const content = require("fs").readFileSync(path, "utf8")
    const methods = {
      particles: content => new Particle(content),
      csv: content => this.fromCsv(content),
      tsv: content => this.fromTsv(content)
    }
    if (!methods[format]) throw new Error(`No support for '${format}'`)
    return methods[format](content)
  }
  static fromFolder(folderPath, filepathPredicate = filepath => filepath !== ".DS_Store") {
    const path = require("path")
    const fs = require("fs")
    const particle = new Particle()
    const files = fs
      .readdirSync(folderPath)
      .map(filename => path.join(folderPath, filename))
      .filter(filepath => !fs.statSync(filepath).isDirectory() && filepathPredicate(filepath))
      .forEach(filePath => particle.appendLineAndSubparticles(filePath, fs.readFileSync(filePath, "utf8")))
    return particle
  }
}
Particle._parserPools = new Map()
Particle.ParserPool = ParserPool
Particle.iris = `sepal_length,sepal_width,petal_length,petal_width,species
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
Particle.getVersion = () => "105.0.1"
class AbstractExtendibleParticle extends Particle {
  _getFromExtended(cuePath) {
    const hit = this._getParticleFromExtended(cuePath)
    return hit ? hit.get(cuePath) : undefined
  }
  _getLineage() {
    const newParticle = new Particle()
    this.forEach(particle => {
      const path = particle._getAncestorsArray().map(particle => particle.id)
      path.reverse()
      newParticle.touchParticle(path.join(SUBPARTICLE_MEMBRANE))
    })
    return newParticle
  }
  // todo: be more specific with the param
  _getSubparticlesByParserInExtended(parser) {
    return Utils.flatten(this._getAncestorsArray().map(particle => particle.getSubparticlesByParser(parser)))
  }
  _getExtendedParent() {
    return this._getAncestorsArray()[1]
  }
  _hasFromExtended(cuePath) {
    return !!this._getParticleFromExtended(cuePath)
  }
  _getParticleFromExtended(cuePath) {
    return this._getAncestorsArray().find(particle => particle.has(cuePath))
  }
  _getConcatBlockStringFromExtended(cuePath) {
    return this._getAncestorsArray()
      .filter(particle => particle.has(cuePath))
      .map(particle => particle.getParticle(cuePath).subparticlesToString())
      .reverse()
      .join("\n")
  }
  _doesExtend(parserId) {
    return this._getAncestorSet().has(parserId)
  }
  _getAncestorSet() {
    if (!this._cache_ancestorSet) this._cache_ancestorSet = new Set(this._getAncestorsArray().map(def => def.id))
    return this._cache_ancestorSet
  }
  // Note: the order is: [this, parent, grandParent, ...]
  _getAncestorsArray(cannotContainParticles) {
    this._initAncestorsArrayCache(cannotContainParticles)
    return this._cache_ancestorsArray
  }
  get idThatThisExtends() {
    return this.get(ParticlesConstants.extends)
  }
  _initAncestorsArrayCache(cannotContainParticles) {
    if (this._cache_ancestorsArray) return undefined
    if (cannotContainParticles && cannotContainParticles.includes(this)) throw new Error(`Loop detected: '${this.getLine()}' is the ancestor of one of its ancestors.`)
    cannotContainParticles = cannotContainParticles || [this]
    let ancestors = [this]
    const extendedId = this.idThatThisExtends
    if (extendedId) {
      const parentParticle = this.idToParticleMap[extendedId]
      if (!parentParticle) throw new Error(`${extendedId} not found`)
      ancestors = ancestors.concat(parentParticle._getAncestorsArray(cannotContainParticles))
    }
    this._cache_ancestorsArray = ancestors
  }
}
class ExtendibleParticle extends AbstractExtendibleParticle {
  get idToParticleMap() {
    if (!this.isRoot()) return this.root.idToParticleMap
    if (!this._particleMapCache) {
      this._particleMapCache = {}
      this.forEach(subparticle => {
        this._particleMapCache[subparticle.id] = subparticle
      })
    }
    return this._particleMapCache
  }
  get id() {
    return this.getAtom(0)
  }
}
window.Particle = Particle
window.ExtendibleParticle = ExtendibleParticle
window.AbstractExtendibleParticle = AbstractExtendibleParticle
window.ParticleEvents = ParticleEvents
window.ParticleAtom = ParticleAtom
;

// Compiled language parsers will include these files:
const GlobalNamespaceAdditions = {
  Utils: "Utils.js",
  Particle: "Particle.js",
  HandParsersProgram: "Parsers.js",
  ParserBackedParticle: "Parsers.js"
}
var ParsersConstantsCompiler
;(function (ParsersConstantsCompiler) {
  ParsersConstantsCompiler["stringTemplate"] = "stringTemplate"
  ParsersConstantsCompiler["indentCharacter"] = "indentCharacter"
  ParsersConstantsCompiler["catchAllAtomDelimiter"] = "catchAllAtomDelimiter"
  ParsersConstantsCompiler["openSubparticles"] = "openSubparticles"
  ParsersConstantsCompiler["joinSubparticlesWith"] = "joinSubparticlesWith"
  ParsersConstantsCompiler["closeSubparticles"] = "closeSubparticles"
})(ParsersConstantsCompiler || (ParsersConstantsCompiler = {}))
var ParsersConstantsMisc
;(function (ParsersConstantsMisc) {
  ParsersConstantsMisc["doNotSynthesize"] = "doNotSynthesize"
})(ParsersConstantsMisc || (ParsersConstantsMisc = {}))
var PreludeAtomTypeIds
;(function (PreludeAtomTypeIds) {
  PreludeAtomTypeIds["anyAtom"] = "anyAtom"
  PreludeAtomTypeIds["cueAtom"] = "cueAtom"
  PreludeAtomTypeIds["extraAtomAtom"] = "extraAtomAtom"
  PreludeAtomTypeIds["floatAtom"] = "floatAtom"
  PreludeAtomTypeIds["numberAtom"] = "numberAtom"
  PreludeAtomTypeIds["bitAtom"] = "bitAtom"
  PreludeAtomTypeIds["booleanAtom"] = "booleanAtom"
  PreludeAtomTypeIds["integerAtom"] = "integerAtom"
})(PreludeAtomTypeIds || (PreludeAtomTypeIds = {}))
var ParsersConstantsConstantTypes
;(function (ParsersConstantsConstantTypes) {
  ParsersConstantsConstantTypes["boolean"] = "boolean"
  ParsersConstantsConstantTypes["string"] = "string"
  ParsersConstantsConstantTypes["int"] = "int"
  ParsersConstantsConstantTypes["float"] = "float"
})(ParsersConstantsConstantTypes || (ParsersConstantsConstantTypes = {}))
var ParsersBundleFiles
;(function (ParsersBundleFiles) {
  ParsersBundleFiles["package"] = "package.json"
  ParsersBundleFiles["readme"] = "readme.md"
  ParsersBundleFiles["indexHtml"] = "index.html"
  ParsersBundleFiles["indexJs"] = "index.js"
  ParsersBundleFiles["testJs"] = "test.js"
})(ParsersBundleFiles || (ParsersBundleFiles = {}))
var ParsersAtomParser
;(function (ParsersAtomParser) {
  ParsersAtomParser["prefix"] = "prefix"
  ParsersAtomParser["postfix"] = "postfix"
  ParsersAtomParser["omnifix"] = "omnifix"
})(ParsersAtomParser || (ParsersAtomParser = {}))
var ParsersConstants
;(function (ParsersConstants) {
  // particle types
  ParsersConstants["comment"] = "//"
  ParsersConstants["parser"] = "parser"
  ParsersConstants["atomType"] = "atomType"
  ParsersConstants["parsersFileExtension"] = "parsers"
  ParsersConstants["abstractParserPrefix"] = "abstract"
  ParsersConstants["parserSuffix"] = "Parser"
  ParsersConstants["atomTypeSuffix"] = "Atom"
  // error check time
  ParsersConstants["regex"] = "regex"
  ParsersConstants["reservedAtoms"] = "reservedAtoms"
  ParsersConstants["enumFromAtomTypes"] = "enumFromAtomTypes"
  ParsersConstants["enum"] = "enum"
  ParsersConstants["examples"] = "examples"
  ParsersConstants["min"] = "min"
  ParsersConstants["max"] = "max"
  // baseParsers
  ParsersConstants["baseParser"] = "baseParser"
  ParsersConstants["blobParser"] = "blobParser"
  ParsersConstants["errorParser"] = "errorParser"
  // parse time
  ParsersConstants["extends"] = "extends"
  ParsersConstants["root"] = "root"
  ParsersConstants["cue"] = "cue"
  ParsersConstants["cueFromId"] = "cueFromId"
  ParsersConstants["pattern"] = "pattern"
  ParsersConstants["inScope"] = "inScope"
  ParsersConstants["atoms"] = "atoms"
  ParsersConstants["listDelimiter"] = "listDelimiter"
  ParsersConstants["contentKey"] = "contentKey"
  ParsersConstants["subparticlesKey"] = "subparticlesKey"
  ParsersConstants["uniqueCue"] = "uniqueCue"
  ParsersConstants["catchAllAtomType"] = "catchAllAtomType"
  ParsersConstants["atomParser"] = "atomParser"
  ParsersConstants["catchAllParser"] = "catchAllParser"
  ParsersConstants["constants"] = "constants"
  ParsersConstants["required"] = "required"
  ParsersConstants["single"] = "single"
  ParsersConstants["uniqueLine"] = "uniqueLine"
  ParsersConstants["tags"] = "tags"
  ParsersConstants["_rootNodeJsHeader"] = "_rootNodeJsHeader"
  // default catchAll parser
  ParsersConstants["BlobParser"] = "BlobParser"
  ParsersConstants["DefaultRootParser"] = "DefaultRootParser"
  // code
  ParsersConstants["javascript"] = "javascript"
  // compile time
  ParsersConstants["compilerParser"] = "compiler"
  // develop time
  ParsersConstants["description"] = "description"
  ParsersConstants["example"] = "example"
  ParsersConstants["popularity"] = "popularity"
  ParsersConstants["paint"] = "paint"
})(ParsersConstants || (ParsersConstants = {}))
class TypedAtom extends ParticleAtom {
  constructor(particle, atomIndex, type) {
    super(particle, atomIndex)
    this._type = type
  }
  get type() {
    return this._type
  }
  toString() {
    return this.atom + ":" + this.type
  }
}
// todo: can we merge these methods into base Particle and ditch this class?
class ParserBackedParticle extends Particle {
  get definition() {
    if (this._definition) return this._definition
    this._definition = this.isRoot() ? this.handParsersProgram : this.parent.definition.getParserDefinitionByParserId(this.constructor.name)
    return this._definition
  }
  get rootParsersParticles() {
    return this.definition.root
  }
  getAutocompleteResults(partialAtom, atomIndex) {
    return atomIndex === 0 ? this._getAutocompleteResultsForCue(partialAtom) : this._getAutocompleteResultsForAtom(partialAtom, atomIndex)
  }
  makeError(message) {
    return new ParserDefinedError(this, message)
  }
  usesParser(parserId) {
    return !!this.parserIdIndex[parserId]
  }
  get parserIdIndex() {
    if (this._parserIdIndex) return this._parserIdIndex
    const index = {}
    this._parserIdIndex = index
    for (let particle of this.getTopDownArrayIterator()) {
      Array.from(particle.definition._getAncestorSet()).forEach(id => {
        if (!index[id]) index[id] = []
        index[id].push(particle)
      })
    }
    return index
  }
  get particleIndex() {
    // StringMap<int> {cue: index}
    // When there are multiple tails with the same cue, index stores the last content.
    // todo: change the above behavior: when a collision occurs, create an array.
    return this._particleIndex || this._makeParticleIndex()
  }
  _clearCueIndex() {
    delete this._particleIndex
    return super._clearCueIndex()
  }
  _makeCueIndex(startAt = 0) {
    if (this._particleIndex) this._makeParticleIndex(startAt)
    return super._makeCueIndex(startAt)
  }
  _makeParticleIndex(startAt = 0) {
    if (!this._particleIndex || !startAt) this._particleIndex = {}
    const particles = this._getSubparticlesArray()
    const newIndex = this._particleIndex
    const length = particles.length
    for (let index = startAt; index < length; index++) {
      const particle = particles[index]
      const ancestors = Array.from(particle.definition._getAncestorSet()).forEach(id => {
        if (!newIndex[id]) newIndex[id] = []
        newIndex[id].push(particle)
      })
    }
    return newIndex
  }
  /**
   * Returns the total information bits required to represent this particle and all its subparticles.
   * This is calculated as the sum of:
   * 1. Information bits of all atoms in this particle
   * 2. Information bits of all subparticles (recursive)
   */
  get bitsRequired() {
    // Get information bits for all atoms in this particle
    const atomBits = this.parsedAtoms.map(atom => atom.bitsRequired).reduce((sum, bits) => sum + bits, 0)
    // Recursively get information bits from all subparticles
    const subparticleBits = this.map(child => child.bitsRequired).reduce((sum, bits) => sum + bits, 0)
    return atomBits + subparticleBits
  }
  getSubparticleInstancesOfParserId(parserId) {
    return this.particleIndex[parserId] || []
  }
  doesExtend(parserId) {
    return this.definition._doesExtend(parserId)
  }
  _getErrorParserErrors() {
    return [this.cue ? new UnknownParserError(this) : new BlankLineError(this)]
  }
  _getBlobParserCatchAllParser() {
    return BlobParser
  }
  _getAutocompleteResultsForCue(partialAtom) {
    const cueMap = this.definition.cueMapWithDefinitions
    let cues = Object.keys(cueMap)
    if (partialAtom) cues = cues.filter(cue => cue.includes(partialAtom))
    return cues
      .map(cue => {
        const def = cueMap[cue]
        if (def.suggestInAutocomplete === false) return false
        const description = def.description
        return {
          text: cue,
          displayText: cue + (description ? " " + description : "")
        }
      })
      .filter(i => i)
  }
  _getAutocompleteResultsForAtom(partialAtom, atomIndex) {
    // todo: root should be [] correct?
    const atom = this.parsedAtoms[atomIndex]
    return atom ? atom.getAutoCompleteAtoms(partialAtom) : []
  }
  // note: this is overwritten by the root particle of a runtime parsers program.
  // some of the magic that makes this all work. but maybe there's a better way.
  get handParsersProgram() {
    if (this.isRoot()) throw new Error(`Root particle without getHandParsersProgram defined.`)
    return this.root.handParsersProgram
  }
  getRunTimeEnumOptions(atom) {
    return undefined
  }
  getRunTimeEnumOptionsForValidation(atom) {
    return this.getRunTimeEnumOptions(atom)
  }
  _sortParticlesByInScopeOrder() {
    const parserOrder = this.definition._getMyInScopeParserIds()
    if (!parserOrder.length) return this
    const orderMap = {}
    parserOrder.forEach((atom, index) => (orderMap[atom] = index))
    this.sort(Utils.makeSortByFn(runtimeParticle => orderMap[runtimeParticle.definition.parserIdFromDefinition]))
    return this
  }
  get requiredParticleErrors() {
    const errors = []
    Object.values(this.definition.cueMapWithDefinitions).forEach(def => {
      if (def.isRequired() && !this.particleIndex[def.id]) errors.push(new MissingRequiredParserError(this, def.id))
    })
    return errors
  }
  get programAsAtoms() {
    // todo: what is this?
    return this.topDownArray.map(particle => {
      const atoms = particle.parsedAtoms
      let indents = particle.getIndentLevel() - 1
      while (indents) {
        atoms.unshift(undefined)
        indents--
      }
      return atoms
    })
  }
  get programWidth() {
    return Math.max(...this.programAsAtoms.map(line => line.length))
  }
  get allTypedAtoms() {
    const atoms = []
    this.topDownArray.forEach(particle => particle.atomTypes.forEach((atom, index) => atoms.push(new TypedAtom(particle, index, atom.atomTypeId))))
    return atoms
  }
  findAllAtomsWithAtomType(atomTypeId) {
    return this.allTypedAtoms.filter(typedAtom => typedAtom.type === atomTypeId)
  }
  findAllParticlesWithParser(parserId) {
    return this.topDownArray.filter(particle => particle.definition.parserIdFromDefinition === parserId)
  }
  toAtomTypeParticles() {
    return this.topDownArray.map(subparticle => subparticle.indentation + subparticle.lineAtomTypes).join("\n")
  }
  getParseTable(maxColumnWidth = 40) {
    const particle = new Particle(this.toAtomTypeParticles())
    return new Particle(
      particle.topDownArray.map((particle, lineNumber) => {
        const sourceParticle = this.particleAtLine(lineNumber)
        const errs = sourceParticle.getErrors()
        const errorCount = errs.length
        const obj = {
          lineNumber: lineNumber,
          source: sourceParticle.indentation + sourceParticle.getLine(),
          parser: sourceParticle.constructor.name,
          atomTypes: particle.content,
          errorCount: errorCount
        }
        if (errorCount) obj.errorMessages = errs.map(err => err.message).join(";")
        return obj
      })
    ).toFormattedTable(maxColumnWidth)
  }
  // Helper method for selecting potential parsers needed to update parsers file.
  get invalidParsers() {
    return Array.from(
      new Set(
        this.getAllErrors()
          .filter(err => err instanceof UnknownParserError)
          .map(err => err.getParticle().cue)
      )
    )
  }
  _getAllAutoCompleteAtoms() {
    return this.getAllAtomBoundaryCoordinates().map(coordinate => {
      const results = this.getAutocompleteResultsAt(coordinate.lineIndex, coordinate.charIndex)
      return {
        lineIndex: coordinate.lineIndex,
        charIndex: coordinate.charIndex,
        atomIndex: coordinate.atomIndex,
        atom: results.atom,
        suggestions: results.matches
      }
    })
  }
  toAutoCompleteCube(fillChar = "") {
    const particles = [this.clone()]
    const filled = this.clone().fill(fillChar)
    this._getAllAutoCompleteAtoms().forEach(hole => {
      hole.suggestions.forEach((suggestion, index) => {
        if (!particles[index + 1]) particles[index + 1] = filled.clone()
        particles[index + 1].particleAtLine(hole.lineIndex).setAtom(hole.atomIndex, suggestion.text)
      })
    })
    return new Particle(particles)
  }
  toAutoCompleteTable() {
    return new Particle(
      this._getAllAutoCompleteAtoms().map(result => {
        result.suggestions = result.suggestions.map(particle => particle.text).join(" ")
        return result
      })
    ).asTable
  }
  getAutocompleteResultsAt(lineIndex, charIndex) {
    const lineParticle = this.particleAtLine(lineIndex) || this
    const particleInScope = lineParticle.getParticleInScopeAtCharIndex(charIndex)
    // todo: add more tests
    // todo: second param this.subparticlesToString()
    // todo: change to getAutocomplete definitions
    const atomIndex = lineParticle.getAtomIndexAtCharacterIndex(charIndex)
    const atomProperties = lineParticle.getAtomProperties(atomIndex)
    return {
      startCharIndex: atomProperties.startCharIndex,
      endCharIndex: atomProperties.endCharIndex,
      atom: atomProperties.atom,
      matches: particleInScope.getAutocompleteResults(atomProperties.atom, atomIndex)
    }
  }
  _sortWithParentParsersUpTop() {
    const lineage = new HandParsersProgram(this.toString()).parserLineage
    const rank = {}
    lineage.topDownArray.forEach((particle, index) => {
      rank[particle.getAtom(0)] = index
    })
    const particleAFirst = -1
    const particleBFirst = 1
    this.sort((particleA, particleB) => {
      const particleARank = rank[particleA.getAtom(0)]
      const particleBRank = rank[particleB.getAtom(0)]
      return particleARank < particleBRank ? particleAFirst : particleBFirst
    })
    return this
  }
  format() {
    if (this.isRoot()) {
      this._sortParticlesByInScopeOrder()
      try {
        this._sortWithParentParsersUpTop()
      } catch (err) {
        console.log(`Warning: ${err}`)
      }
    }
    this.topDownArray.forEach(subparticle => subparticle.format())
    return this
  }
  getParserUsage(filepath = "") {
    // returns a report on what parsers from its language the program uses
    const usage = new Particle()
    const handParsersProgram = this.handParsersProgram
    handParsersProgram.validConcreteAndAbstractParserDefinitions.forEach(def => {
      const requiredAtomTypeIds = def.atomParser.getRequiredAtomTypeIds()
      usage.appendLine([def.parserIdFromDefinition, "line-id", "parser", requiredAtomTypeIds.join(" ")].join(" "))
    })
    this.topDownArray.forEach((particle, lineNumber) => {
      const stats = usage.getParticle(particle.parserId)
      stats.appendLine([filepath + "-" + lineNumber, particle.atoms.join(" ")].join(" "))
    })
    return usage
  }
  toPaintParticles() {
    return this.topDownArray.map(subparticle => subparticle.indentation + subparticle.getLinePaints()).join("\n")
  }
  toDefinitionLineNumberParticles() {
    return this.topDownArray.map(subparticle => subparticle.definition.lineNumber + " " + subparticle.indentation + subparticle.atomDefinitionLineNumbers.join(" ")).join("\n")
  }
  get asAtomTypeParticlesWithParserIds() {
    return this.topDownArray.map(subparticle => subparticle.constructor.name + this.atomBreakSymbol + subparticle.indentation + subparticle.lineAtomTypes).join("\n")
  }
  toPreludeAtomTypeParticlesWithParserIds() {
    return this.topDownArray.map(subparticle => subparticle.constructor.name + this.atomBreakSymbol + subparticle.indentation + subparticle.getLineAtomPreludeTypes()).join("\n")
  }
  get asParticlesWithParsers() {
    return this.topDownArray.map(subparticle => subparticle.constructor.name + this.atomBreakSymbol + subparticle.indentation + subparticle.getLine()).join("\n")
  }
  getAtomPaintAtPosition(lineIndex, atomIndex) {
    this._initAtomTypeCache()
    const typeParticle = this._cache_paintParticles.topDownArray[lineIndex - 1]
    return typeParticle ? typeParticle.getAtom(atomIndex - 1) : undefined
  }
  _initAtomTypeCache() {
    const particleMTime = this.getLineOrSubparticlesModifiedTime()
    if (this._cache_programAtomTypeStringMTime === particleMTime) return undefined
    this._cache_typeParticles = new Particle(this.toAtomTypeParticles())
    this._cache_paintParticles = new Particle(this.toPaintParticles())
    this._cache_programAtomTypeStringMTime = particleMTime
  }
  createParserPool() {
    return this.isRoot() ? new Particle.ParserPool(BlobParser) : new Particle.ParserPool(this.parent._getParserPool()._getCatchAllParser(this.parent), {})
  }
  get parserId() {
    return this.definition.parserIdFromDefinition
  }
  get atomTypes() {
    return this.parsedAtoms.filter(atom => atom.getAtom() !== undefined)
  }
  get atomErrors() {
    const { parsedAtoms } = this // todo: speedup. takes ~3s on pldb.
    // todo: speedup getErrorIfAny. takes ~3s on pldb.
    return parsedAtoms.map(check => check.getErrorIfAny()).filter(identity => identity)
  }
  get singleParserUsedTwiceErrors() {
    const errors = []
    const parent = this.parent
    const hits = parent.getSubparticleInstancesOfParserId(this.definition.id)
    if (hits.length > 1)
      hits.forEach((particle, index) => {
        if (particle === this) errors.push(new ParserUsedMultipleTimesError(particle))
      })
    return errors
  }
  get uniqueLineAppearsTwiceErrors() {
    const errors = []
    const parent = this.parent
    const hits = parent.getSubparticleInstancesOfParserId(this.definition.id)
    if (hits.length > 1) {
      const set = new Set()
      hits.forEach((particle, index) => {
        const line = particle.getLine()
        if (set.has(line)) errors.push(new ParserUsedMultipleTimesError(particle))
        set.add(line)
      })
    }
    return errors
  }
  get scopeErrors() {
    let errors = []
    const def = this.definition
    if (def.isSingle) errors = errors.concat(this.singleParserUsedTwiceErrors) // todo: speedup. takes ~1s on pldb.
    if (def.isUniqueLine) errors = errors.concat(this.uniqueLineAppearsTwiceErrors) // todo: speedup. takes ~1s on pldb.
    const { requiredParticleErrors } = this // todo: speedup. takes ~1.5s on pldb.
    if (requiredParticleErrors.length) errors = errors.concat(requiredParticleErrors)
    return errors
  }
  getErrors() {
    return this.atomErrors.concat(this.scopeErrors)
  }
  get parsedAtoms() {
    return this.definition.atomParser.getAtomArray(this)
  }
  // todo: just make a fn that computes proper spacing and then is given a particle to print
  get lineAtomTypes() {
    return this.parsedAtoms.map(slot => slot.atomTypeId).join(" ")
  }
  getLineAtomPreludeTypes() {
    return this.parsedAtoms
      .map(slot => {
        const def = slot.atomTypeDefinition
        //todo: cleanup
        return def ? def.preludeKindId : PreludeAtomTypeIds.anyAtom
      })
      .join(" ")
  }
  getLinePaints(defaultScope = "source") {
    return this.parsedAtoms.map(slot => slot.paint || defaultScope).join(" ")
  }
  get atomDefinitionLineNumbers() {
    return this.parsedAtoms.map(atom => atom.definitionLineNumber)
  }
  _getCompiledIndentation() {
    const indentCharacter = this.definition._getCompilerObject()[ParsersConstantsCompiler.indentCharacter]
    const indent = this.indentation
    return indentCharacter !== undefined ? indentCharacter.repeat(indent.length) : indent
  }
  _getFields() {
    // fields are like atoms
    const fields = {}
    this.forEach(particle => {
      const def = particle.definition
      if (def.isRequired() || def.isSingle) fields[particle.getAtom(0)] = particle.content
    })
    return fields
  }
  _getCompiledLine() {
    const compiler = this.definition._getCompilerObject()
    const catchAllAtomDelimiter = compiler[ParsersConstantsCompiler.catchAllAtomDelimiter]
    const str = compiler[ParsersConstantsCompiler.stringTemplate]
    return str !== undefined ? Utils.formatStr(str, catchAllAtomDelimiter, Object.assign(this._getFields(), this.atomsMap)) : this.getLine()
  }
  get listDelimiter() {
    return this.definition._getFromExtended(ParsersConstants.listDelimiter)
  }
  get contentKey() {
    return this.definition._getFromExtended(ParsersConstants.contentKey)
  }
  get subparticlesKey() {
    return this.definition._getFromExtended(ParsersConstants.subparticlesKey)
  }
  get subparticlesAreTextBlob() {
    return this.definition._isBlobParser()
  }
  get isArrayElement() {
    return this.definition._hasFromExtended(ParsersConstants.uniqueCue) ? false : !this.definition.isSingle
  }
  get list() {
    return this.listDelimiter ? this.content.split(this.listDelimiter) : super.list
  }
  get typedContent() {
    // todo: probably a better way to do this, perhaps by defining a atomDelimiter at the particle level
    // todo: this currently parse anything other than string types
    if (this.listDelimiter) return this.content.split(this.listDelimiter)
    const atoms = this.parsedAtoms
    if (atoms.length === 2) return atoms[1].parsed
    return this.content
  }
  get typedTuple() {
    const key = this.cue
    if (this.subparticlesAreTextBlob) return [key, this.subparticlesToString()]
    const { typedContent, contentKey, subparticlesKey } = this
    if (contentKey || subparticlesKey) {
      let obj = {}
      if (subparticlesKey) obj[subparticlesKey] = this.subparticlesToString()
      else obj = this.typedMap
      if (contentKey) {
        obj[contentKey] = typedContent
      }
      return [key, obj]
    }
    const hasSubparticles = this.length > 0
    const hasSubparticlesNoContent = typedContent === undefined && hasSubparticles
    const shouldReturnValueAsObject = hasSubparticlesNoContent
    if (shouldReturnValueAsObject) return [key, this.typedMap]
    const hasSubparticlesAndContent = typedContent !== undefined && hasSubparticles
    const shouldReturnValueAsContentPlusSubparticles = hasSubparticlesAndContent
    // If the particle has a content and a subparticle return it as a string, as
    // Javascript object values can't be both a leaf and a particle.
    if (shouldReturnValueAsContentPlusSubparticles) return [key, this.contentWithSubparticles]
    return [key, typedContent]
  }
  get _shouldSerialize() {
    const should = this.shouldSerialize
    return should === undefined ? true : should
  }
  get typedMap() {
    const obj = {}
    this.forEach(particle => {
      if (!particle._shouldSerialize) return true
      const tuple = particle.typedTuple
      if (!particle.isArrayElement) obj[tuple[0]] = tuple[1]
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
    const def = this.definition
    const indent = this._getCompiledIndentation()
    const compiledLine = this._getCompiledLine()
    if (def.isTerminalParser()) return indent + compiledLine
    const compiler = def._getCompilerObject()
    const openSubparticlesString = compiler[ParsersConstantsCompiler.openSubparticles] || ""
    const closeSubparticlesString = compiler[ParsersConstantsCompiler.closeSubparticles] || ""
    const subparticleJoinCharacter = compiler[ParsersConstantsCompiler.joinSubparticlesWith] || "\n"
    const compiledSubparticles = this.map(subparticle => subparticle.compile()).join(subparticleJoinCharacter)
    return `${indent + compiledLine}${openSubparticlesString}
${compiledSubparticles}
${indent}${closeSubparticlesString}`
  }
  // todo: remove
  get atomsMap() {
    const atomsMap = {}
    this.parsedAtoms.forEach(atom => {
      const atomTypeId = atom.atomTypeId
      if (!atom.isCatchAll()) atomsMap[atomTypeId] = atom.parsed
      else {
        if (!atomsMap[atomTypeId]) atomsMap[atomTypeId] = []
        atomsMap[atomTypeId].push(atom.parsed)
      }
    })
    return atomsMap
  }
}
class BlobParser extends ParserBackedParticle {
  createParserPool() {
    return new Particle.ParserPool(BlobParser, {})
  }
  getErrors() {
    return []
  }
}
// todo: can we remove this? hard to extend.
class UnknownParserParticle extends ParserBackedParticle {
  createParserPool() {
    return new Particle.ParserPool(UnknownParserParticle, {})
  }
  getErrors() {
    return [new UnknownParserError(this)]
  }
}
/*
A atom contains a atom but also the type information for that atom.
*/
class AbstractParsersBackedAtom {
  constructor(particle, index, typeDef, atomTypeId, isCatchAll, parserDefinitionParser) {
    this._typeDef = typeDef
    this._particle = particle
    this._isCatchAll = isCatchAll
    this._index = index
    this._atomTypeId = atomTypeId
    this._parserDefinitionParser = parserDefinitionParser
  }
  get optionCount() {
    return this._typeDef.optionCount
  }
  get bitsRequired() {
    return Math.log2(this.optionCount)
  }
  getAtom() {
    return this._particle.getAtom(this._index)
  }
  get definitionLineNumber() {
    return this._typeDef.lineNumber
  }
  get atomTypeId() {
    return this._atomTypeId
  }
  getParticle() {
    return this._particle
  }
  get atomIndex() {
    return this._index
  }
  isCatchAll() {
    return this._isCatchAll
  }
  get min() {
    return this.atomTypeDefinition.get(ParsersConstants.min) || "0"
  }
  get max() {
    return this.atomTypeDefinition.get(ParsersConstants.max) || "100"
  }
  get placeholder() {
    return this.atomTypeDefinition.get(ParsersConstants.examples) || ""
  }
  get paint() {
    const definition = this.atomTypeDefinition
    if (definition) return definition.paint // todo: why the undefined?
  }
  getAutoCompleteAtoms(partialAtom = "") {
    const atomDef = this.atomTypeDefinition
    let atoms = atomDef ? atomDef._getAutocompleteAtomOptions(this.getParticle().root) : []
    const runTimeOptions = this.getParticle().getRunTimeEnumOptions(this)
    if (runTimeOptions) atoms = runTimeOptions.concat(atoms)
    if (partialAtom) atoms = atoms.filter(atom => atom.includes(partialAtom))
    return atoms.map(atom => {
      return {
        text: atom,
        displayText: atom
      }
    })
  }
  synthesizeAtom(seed = Date.now()) {
    // todo: cleanup
    const atomDef = this.atomTypeDefinition
    const enumOptions = atomDef._getFromExtended(ParsersConstants.enum)
    if (enumOptions) return Utils.getRandomString(1, enumOptions.split(" "))
    return this._synthesizeAtom(seed)
  }
  _getStumpEnumInput(cue) {
    const atomDef = this.atomTypeDefinition
    const enumOptions = atomDef._getFromExtended(ParsersConstants.enum)
    if (!enumOptions) return undefined
    const options = new Particle(
      enumOptions
        .split(" ")
        .map(option => `option ${option}`)
        .join("\n")
    )
    return `select
 name ${cue}
${options.toString(1)}`
  }
  _toStumpInput(cue) {
    // todo: remove
    const enumInput = this._getStumpEnumInput(cue)
    if (enumInput) return enumInput
    // todo: cleanup. We shouldn't have these dual atomType classes.
    return `input
 name ${cue}
 placeholder ${this.placeholder}`
  }
  get atomTypeDefinition() {
    return this._typeDef
  }
  _getErrorContext() {
    return this.getParticle().getLine().split(" ")[0] // todo: AtomBreakSymbol
  }
  isValid() {
    const runTimeOptions = this.getParticle().getRunTimeEnumOptionsForValidation(this)
    const atom = this.getAtom()
    if (runTimeOptions) return runTimeOptions.includes(atom)
    return this.atomTypeDefinition.isValid(atom, this.getParticle().root) && this._isValid()
  }
  getErrorIfAny() {
    const atom = this.getAtom()
    if (atom !== undefined && this.isValid()) return undefined
    // todo: refactor invalidatomError. We want better error messages.
    return atom === undefined || atom === "" ? new MissingAtomError(this) : new InvalidAtomError(this)
  }
}
AbstractParsersBackedAtom.parserFunctionName = ""
class ParsersBitAtom extends AbstractParsersBackedAtom {
  _isValid() {
    const atom = this.getAtom()
    return atom === "0" || atom === "1"
  }
  get optionCount() {
    return 2
  }
  _synthesizeAtom() {
    return Utils.getRandomString(1, "01".split(""))
  }
  get regexString() {
    return "[01]"
  }
  get parsed() {
    const atom = this.getAtom()
    return !!parseInt(atom)
  }
}
ParsersBitAtom.defaultPaint = "constant.numeric"
class ParsersNumberAtom extends AbstractParsersBackedAtom {
  _toStumpInput(cue) {
    return `input
 name ${cue}
 type number
 placeholder ${this.placeholder}
 min ${this.min}
 max ${this.max}`
  }
}
class ParsersIntegerAtom extends ParsersNumberAtom {
  _isValid() {
    const atom = this.getAtom()
    const num = parseInt(atom)
    if (isNaN(num)) return false
    return num.toString() === atom
  }
  get optionCount() {
    const minVal = parseInt(this.min) || -Infinity
    const maxVal = parseInt(this.max) || Infinity
    return maxVal - minVal + 1
  }
  _synthesizeAtom(seed) {
    return Utils.randomUniformInt(parseInt(this.min), parseInt(this.max), seed).toString()
  }
  get regexString() {
    return "-?[0-9]+"
  }
  get parsed() {
    const atom = this.getAtom()
    return parseInt(atom)
  }
}
ParsersIntegerAtom.defaultPaint = "constant.numeric.integer"
ParsersIntegerAtom.parserFunctionName = "parseInt"
class ParsersFloatAtom extends ParsersNumberAtom {
  _isValid() {
    const atom = this.getAtom()
    const num = parseFloat(atom)
    return !isNaN(num) && /^-?\d*(\.\d+)?([eE][+-]?\d+)?$/.test(atom)
  }
  get optionCount() {
    // For floats, we'll estimate based on typical float32 precision
    // ~7 decimal digits of precision
    const minVal = parseInt(this.min) || -Infinity
    const maxVal = parseInt(this.max) || Infinity
    return (maxVal - minVal) * Math.pow(10, 7)
  }
  _synthesizeAtom(seed) {
    return Utils.randomUniformFloat(parseFloat(this.min), parseFloat(this.max), seed).toString()
  }
  get regexString() {
    return "-?d*(.d+)?"
  }
  get parsed() {
    const atom = this.getAtom()
    return parseFloat(atom)
  }
}
ParsersFloatAtom.defaultPaint = "constant.numeric.float"
ParsersFloatAtom.parserFunctionName = "parseFloat"
// ErrorAtomType => parsers asks for a '' atom type here but the parsers does not specify a '' atom type. (todo: bring in didyoumean?)
class ParsersBooleanAtom extends AbstractParsersBackedAtom {
  constructor() {
    super(...arguments)
    this._trues = new Set(["1", "true", "t", "yes"])
    this._falses = new Set(["0", "false", "f", "no"])
  }
  _isValid() {
    const atom = this.getAtom()
    const str = atom.toLowerCase()
    return this._trues.has(str) || this._falses.has(str)
  }
  get optionCount() {
    return 2
  }
  _synthesizeAtom() {
    return Utils.getRandomString(1, ["1", "true", "t", "yes", "0", "false", "f", "no"])
  }
  _getOptions() {
    return Array.from(this._trues).concat(Array.from(this._falses))
  }
  get regexString() {
    return "(?:" + this._getOptions().join("|") + ")"
  }
  get parsed() {
    const atom = this.getAtom()
    return this._trues.has(atom.toLowerCase())
  }
}
ParsersBooleanAtom.defaultPaint = "constant.language"
class ParsersAnyAtom extends AbstractParsersBackedAtom {
  _isValid() {
    return true
  }
  _synthesizeAtom() {
    const examples = this.atomTypeDefinition._getFromExtended(ParsersConstants.examples)
    if (examples) return Utils.getRandomString(1, examples.split(" "))
    return this._parserDefinitionParser.parserIdFromDefinition + "-" + this.constructor.name
  }
  get regexString() {
    return "[^ ]+"
  }
  get parsed() {
    return this.getAtom()
  }
}
class ParsersCueAtom extends ParsersAnyAtom {
  _synthesizeAtom() {
    return this._parserDefinitionParser.cueIfAny
  }
  get optionCount() {
    return 1
  }
}
ParsersCueAtom.defaultPaint = "keyword"
class ParsersExtraAtomAtomTypeAtom extends AbstractParsersBackedAtom {
  _isValid() {
    return false
  }
  synthesizeAtom() {
    throw new Error(`Trying to synthesize a ParsersExtraAtomAtomTypeAtom`)
    return this._synthesizeAtom()
  }
  _synthesizeAtom() {
    return "extraAtom" // should never occur?
  }
  get parsed() {
    return this.getAtom()
  }
  getErrorIfAny() {
    return new ExtraAtomError(this)
  }
}
class ParsersUnknownAtomTypeAtom extends AbstractParsersBackedAtom {
  _isValid() {
    return false
  }
  synthesizeAtom() {
    throw new Error(`Trying to synthesize an ParsersUnknownAtomTypeAtom`)
    return this._synthesizeAtom()
  }
  _synthesizeAtom() {
    return "extraAtom" // should never occur?
  }
  get parsed() {
    return this.getAtom()
  }
  getErrorIfAny() {
    return new UnknownAtomTypeError(this)
  }
}
class AbstractParticleError {
  constructor(particle) {
    this._particle = particle
  }
  getLineIndex() {
    return this.lineNumber - 1
  }
  get lineNumber() {
    return this.getParticle()._getLineNumber() // todo: handle sourcemaps
  }
  isCursorOnAtom(lineIndex, characterIndex) {
    return lineIndex === this.getLineIndex() && this._doesCharacterIndexFallOnAtom(characterIndex)
  }
  _doesCharacterIndexFallOnAtom(characterIndex) {
    return this.atomIndex === this.getParticle().getAtomIndexAtCharacterIndex(characterIndex)
  }
  // convenience method. may be removed.
  isBlankLineError() {
    return false
  }
  // convenience method. may be removed.
  isMissingAtomError() {
    return false
  }
  getIndent() {
    return this.getParticle().indentation
  }
  getCodeMirrorLineWidgetElement(onApplySuggestionCallBack = () => {}) {
    const suggestion = this.suggestionMessage
    if (this.isMissingAtomError()) return this._getCodeMirrorLineWidgetElementAtomTypeHints()
    if (suggestion) return this._getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack, suggestion)
    return this._getCodeMirrorLineWidgetElementWithoutSuggestion()
  }
  get parserId() {
    return this.getParticle().definition.parserIdFromDefinition
  }
  _getCodeMirrorLineWidgetElementAtomTypeHints() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + this.getParticle().definition.lineHints))
    el.className = "LintAtomTypeHints"
    return el
  }
  _getCodeMirrorLineWidgetElementWithoutSuggestion() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + this.message))
    el.className = "LintError"
    return el
  }
  _getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack, suggestion) {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + `${this.errorTypeName}. Suggestion: ${suggestion}`))
    el.className = "LintErrorWithSuggestion"
    el.onclick = () => {
      this.applySuggestion()
      onApplySuggestionCallBack()
    }
    return el
  }
  getLine() {
    return this.getParticle().getLine()
  }
  getExtension() {
    return this.getParticle().handParsersProgram.extensionName
  }
  getParticle() {
    return this._particle
  }
  get errorTypeName() {
    return this.constructor.name.replace("Error", "")
  }
  get atomIndex() {
    return 0
  }
  toObject() {
    return {
      type: this.errorTypeName,
      line: this.lineNumber,
      atom: this.atomIndex,
      suggestion: this.suggestionMessage,
      path: this.getParticle().getCuePath(),
      message: this.message
    }
  }
  hasSuggestion() {
    return this.suggestionMessage !== ""
  }
  get suggestionMessage() {
    return ""
  }
  toString() {
    return this.message
  }
  applySuggestion() {}
  get message() {
    return `${this.errorTypeName} at line ${this.lineNumber} atom ${this.atomIndex}.`
  }
}
class AbstractAtomError extends AbstractParticleError {
  constructor(atom) {
    super(atom.getParticle())
    this._atom = atom
  }
  get atom() {
    return this._atom
  }
  get atomIndex() {
    return this._atom.atomIndex
  }
  get atomSuggestion() {
    return Utils.didYouMean(
      this.atom.getAtom(),
      this.atom.getAutoCompleteAtoms().map(option => option.text)
    )
  }
}
class UnknownParserError extends AbstractParticleError {
  get message() {
    const particle = this.getParticle()
    const parentParticle = particle.parent
    const options = parentParticle._getParserPool().getCueOptions()
    return super.message + ` Invalid parser "${particle.cue}". Valid parsers are: ${Utils._listToEnglishText(options, 7)}.`
  }
  get atomSuggestion() {
    const particle = this.getParticle()
    const parentParticle = particle.parent
    return Utils.didYouMean(
      particle.cue,
      parentParticle.getAutocompleteResults("", 0).map(option => option.text)
    )
  }
  get suggestionMessage() {
    const suggestion = this.atomSuggestion
    const particle = this.getParticle()
    if (suggestion) return `Change "${particle.cue}" to "${suggestion}"`
    return ""
  }
  applySuggestion() {
    const suggestion = this.atomSuggestion
    if (suggestion) this.getParticle().setAtom(this.atomIndex, suggestion)
    return this
  }
}
class ParserDefinedError extends AbstractParticleError {
  constructor(particle, message) {
    super()
    this._particle = particle
    this._message = message
  }
  get message() {
    return this._message
  }
}
class BlankLineError extends UnknownParserError {
  get message() {
    return super.message + ` Line: "${this.getParticle().getLine()}". Blank lines are errors.`
  }
  // convenience method
  isBlankLineError() {
    return true
  }
  get suggestionMessage() {
    return `Delete line ${this.lineNumber}`
  }
  applySuggestion() {
    this.getParticle().destroy()
    return this
  }
}
class MissingRequiredParserError extends AbstractParticleError {
  constructor(particle, missingParserId) {
    super(particle)
    this._missingParserId = missingParserId
  }
  get message() {
    return super.message + ` A "${this._missingParserId}" is required.`
  }
}
class ParserUsedMultipleTimesError extends AbstractParticleError {
  get message() {
    return super.message + ` Multiple "${this.getParticle().cue}" found.`
  }
  get suggestionMessage() {
    return `Delete line ${this.lineNumber}`
  }
  applySuggestion() {
    return this.getParticle().destroy()
  }
}
class LineAppearsMultipleTimesError extends AbstractParticleError {
  get message() {
    return super.message + ` "${this.getParticle().getLine()}" appears multiple times.`
  }
  get suggestionMessage() {
    return `Delete line ${this.lineNumber}`
  }
  applySuggestion() {
    return this.getParticle().destroy()
  }
}
class UnknownAtomTypeError extends AbstractAtomError {
  get message() {
    return super.message + ` No atomType "${this.atom.atomTypeId}" found. Language parsers for "${this.getExtension()}" may need to be fixed.`
  }
}
class InvalidAtomError extends AbstractAtomError {
  get message() {
    return super.message + ` "${this.atom.getAtom()}" does not fit in atomType "${this.atom.atomTypeId}".`
  }
  get suggestionMessage() {
    const suggestion = this.atomSuggestion
    if (suggestion) return `Change "${this.atom.getAtom()}" to "${suggestion}"`
    return ""
  }
  applySuggestion() {
    const suggestion = this.atomSuggestion
    if (suggestion) this.getParticle().setAtom(this.atomIndex, suggestion)
    return this
  }
}
class ExtraAtomError extends AbstractAtomError {
  get message() {
    return super.message + ` Extra atom "${this.atom.getAtom()}" in ${this.parserId}.`
  }
  get suggestionMessage() {
    return `Delete atom "${this.atom.getAtom()}" at atom ${this.atomIndex}`
  }
  applySuggestion() {
    return this.getParticle().deleteAtomAt(this.atomIndex)
  }
}
class MissingAtomError extends AbstractAtomError {
  // todo: autocomplete suggestion
  get message() {
    return super.message + ` Missing atom for atom "${this.atom.atomTypeId}".`
  }
  isMissingAtomError() {
    return true
  }
}
// todo: add standard types, enum types, from disk types
class AbstractParsersAtomTestParser extends Particle {}
class ParsersRegexTestParser extends AbstractParsersAtomTestParser {
  isValid(str) {
    if (!this._regex) this._regex = new RegExp("^" + this.content + "$")
    return !!str.match(this._regex)
  }
}
class ParsersReservedAtomsTestParser extends AbstractParsersAtomTestParser {
  isValid(str) {
    if (!this._set) this._set = new Set(this.content.split(" "))
    return !this._set.has(str)
  }
}
// todo: remove in favor of custom atom type constructors
class EnumFromAtomTypesTestParser extends AbstractParsersAtomTestParser {
  _getEnumFromAtomTypes(programRootParticle) {
    const atomTypeIds = this.getAtomsFrom(1)
    const enumGroup = atomTypeIds.join(" ")
    // note: hack where we store it on the program. otherwise has global effects.
    if (!programRootParticle._enumMaps) programRootParticle._enumMaps = {}
    if (programRootParticle._enumMaps[enumGroup]) return programRootParticle._enumMaps[enumGroup]
    const atomIndex = 1
    const map = {}
    const atomTypeMap = {}
    atomTypeIds.forEach(typeId => (atomTypeMap[typeId] = true))
    programRootParticle.allTypedAtoms
      .filter(typedAtom => atomTypeMap[typedAtom.type])
      .forEach(typedAtom => {
        map[typedAtom.atom] = true
      })
    programRootParticle._enumMaps[enumGroup] = map
    return map
  }
  // todo: remove
  isValid(str, programRootParticle) {
    return this._getEnumFromAtomTypes(programRootParticle)[str] === true
  }
}
class ParsersEnumTestParticle extends AbstractParsersAtomTestParser {
  isValid(str) {
    // enum c c++ java
    return !!this.getOptions()[str]
  }
  getOptions() {
    if (!this._map) this._map = Utils.arrayToMap(this.getAtomsFrom(1))
    return this._map
  }
}
class atomTypeDefinitionParser extends AbstractExtendibleParticle {
  createParserPool() {
    const types = {}
    types[ParsersConstants.regex] = ParsersRegexTestParser
    types[ParsersConstants.reservedAtoms] = ParsersReservedAtomsTestParser
    types[ParsersConstants.enumFromAtomTypes] = EnumFromAtomTypesTestParser
    types[ParsersConstants.enum] = ParsersEnumTestParticle
    types[ParsersConstants.paint] = Particle
    types[ParsersConstants.comment] = Particle
    types[ParsersConstants.examples] = Particle
    types[ParsersConstants.min] = Particle
    types[ParsersConstants.max] = Particle
    types[ParsersConstants.description] = Particle
    types[ParsersConstants.extends] = Particle
    return new Particle.ParserPool(undefined, types)
  }
  get id() {
    return this.getAtom(0)
  }
  get idToParticleMap() {
    return this.parent.atomTypeDefinitions
  }
  getGetter(atomIndex) {
    const atomToNativeJavascriptTypeParser = this.getAtomConstructor().parserFunctionName
    return `get ${this.atomTypeId}() {
      return ${atomToNativeJavascriptTypeParser ? atomToNativeJavascriptTypeParser + `(this.getAtom(${atomIndex}))` : `this.getAtom(${atomIndex})`}
    }`
  }
  getCatchAllGetter(atomIndex) {
    const atomToNativeJavascriptTypeParser = this.getAtomConstructor().parserFunctionName
    return `get ${this.atomTypeId}() {
      return ${atomToNativeJavascriptTypeParser ? `this.getAtomsFrom(${atomIndex}).map(val => ${atomToNativeJavascriptTypeParser}(val))` : `this.getAtomsFrom(${atomIndex})`}
    }`
  }
  // `this.getAtomsFrom(${requireds.length + 1})`
  // todo: cleanup typings. todo: remove this hidden logic. have a "baseType" property?
  getAtomConstructor() {
    return this.preludeKind || ParsersAnyAtom
  }
  get preludeKind() {
    return PreludeKinds[this.getAtom(0)] || PreludeKinds[this._getExtendedAtomTypeId()]
  }
  get preludeKindId() {
    if (PreludeKinds[this.getAtom(0)]) return this.getAtom(0)
    else if (PreludeKinds[this._getExtendedAtomTypeId()]) return this._getExtendedAtomTypeId()
    return PreludeAtomTypeIds.anyAtom
  }
  _getExtendedAtomTypeId() {
    const arr = this._getAncestorsArray()
    return arr[arr.length - 1].id
  }
  get paint() {
    const hs = this._getFromExtended(ParsersConstants.paint)
    if (hs) return hs
    const preludeKind = this.preludeKind
    if (preludeKind) return preludeKind.defaultPaint
  }
  _getEnumOptions() {
    const enumParticle = this._getParticleFromExtended(ParsersConstants.enum)
    if (!enumParticle) return undefined
    // we sort by longest first to capture longest match first. todo: add test
    const options = Object.keys(enumParticle.getParticle(ParsersConstants.enum).getOptions())
    options.sort((a, b) => b.length - a.length)
    return options
  }
  get optionCount() {
    const enumOptions = this._getEnumOptions()
    if (enumOptions) return enumOptions.length
    return Infinity
  }
  _getEnumFromAtomTypeOptions(program) {
    const particle = this._getParticleFromExtended(ParsersConstants.enumFromAtomTypes)
    return particle ? Object.keys(particle.getParticle(ParsersConstants.enumFromAtomTypes)._getEnumFromAtomTypes(program)) : undefined
  }
  _getAutocompleteAtomOptions(program) {
    return this._getEnumOptions() || this._getEnumFromAtomTypeOptions(program) || []
  }
  get regexString() {
    // todo: enum
    const enumOptions = this._getEnumOptions()
    return this._getFromExtended(ParsersConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*")
  }
  _getAllTests() {
    return this._getSubparticlesByParserInExtended(AbstractParsersAtomTestParser)
  }
  isValid(str, programRootParticle) {
    return this._getAllTests().every(particle => particle.isValid(str, programRootParticle))
  }
  get atomTypeId() {
    return this.getAtom(0)
  }
}
class AbstractAtomParser {
  constructor(definition) {
    this._definition = definition
  }
  get catchAllAtomTypeId() {
    return this._definition._getFromExtended(ParsersConstants.catchAllAtomType)
  }
  // todo: improve layout (use bold?)
  get lineHints() {
    const catchAllAtomTypeId = this.catchAllAtomTypeId
    const parserId = this._definition.cueIfAny || this._definition.id // todo: cleanup
    return `${parserId}: ${this.getRequiredAtomTypeIds().join(" ")}${catchAllAtomTypeId ? ` ${catchAllAtomTypeId}...` : ""}`
  }
  getRequiredAtomTypeIds() {
    if (!this._requiredAtomTypeIds) {
      const parameters = this._definition._getFromExtended(ParsersConstants.atoms)
      this._requiredAtomTypeIds = parameters ? parameters.split(" ") : []
    }
    return this._requiredAtomTypeIds
  }
  _getAtomTypeId(atomIndex, requiredAtomTypeIds, totalAtomCount) {
    return requiredAtomTypeIds[atomIndex]
  }
  _isCatchAllAtom(atomIndex, numberOfRequiredAtoms, totalAtomCount) {
    return atomIndex >= numberOfRequiredAtoms
  }
  getAtomArray(particle = undefined) {
    const atomCount = particle ? particle.atoms.length : 0
    const def = this._definition
    const parsersProgram = def.languageDefinitionProgram
    const requiredAtomTypeIds = this.getRequiredAtomTypeIds()
    const numberOfRequiredAtoms = requiredAtomTypeIds.length
    const actualAtomCountOrRequiredAtomCount = Math.max(atomCount, numberOfRequiredAtoms)
    const atoms = []
    // A for loop instead of map because "numberOfAtomsToFill" can be longer than atoms.length
    for (let atomIndex = 0; atomIndex < actualAtomCountOrRequiredAtomCount; atomIndex++) {
      const isCatchAll = this._isCatchAllAtom(atomIndex, numberOfRequiredAtoms, atomCount)
      let atomTypeId = isCatchAll ? this.catchAllAtomTypeId : this._getAtomTypeId(atomIndex, requiredAtomTypeIds, atomCount)
      let atomTypeDefinition = parsersProgram.getAtomTypeDefinitionById(atomTypeId)
      let atomConstructor
      if (atomTypeDefinition) atomConstructor = atomTypeDefinition.getAtomConstructor()
      else if (atomTypeId) atomConstructor = ParsersUnknownAtomTypeAtom
      else {
        atomConstructor = ParsersExtraAtomAtomTypeAtom
        atomTypeId = PreludeAtomTypeIds.extraAtomAtom
        atomTypeDefinition = parsersProgram.getAtomTypeDefinitionById(atomTypeId)
      }
      const anyAtomConstructor = atomConstructor
      atoms[atomIndex] = new anyAtomConstructor(particle, atomIndex, atomTypeDefinition, atomTypeId, isCatchAll, def)
    }
    return atoms
  }
}
class PrefixAtomParser extends AbstractAtomParser {}
class PostfixAtomParser extends AbstractAtomParser {
  _isCatchAllAtom(atomIndex, numberOfRequiredAtoms, totalAtomCount) {
    return atomIndex < totalAtomCount - numberOfRequiredAtoms
  }
  _getAtomTypeId(atomIndex, requiredAtomTypeIds, totalAtomCount) {
    const catchAllAtomCount = Math.max(totalAtomCount - requiredAtomTypeIds.length, 0)
    return requiredAtomTypeIds[atomIndex - catchAllAtomCount]
  }
}
class OmnifixAtomParser extends AbstractAtomParser {
  getAtomArray(particle = undefined) {
    const atomsArr = []
    const def = this._definition
    const program = particle ? particle.root : undefined
    const parsersProgram = def.languageDefinitionProgram
    const atoms = particle ? particle.atoms : []
    const requiredAtomTypeDefs = this.getRequiredAtomTypeIds().map(atomTypeId => parsersProgram.getAtomTypeDefinitionById(atomTypeId))
    const catchAllAtomTypeId = this.catchAllAtomTypeId
    const catchAllAtomTypeDef = catchAllAtomTypeId && parsersProgram.getAtomTypeDefinitionById(catchAllAtomTypeId)
    atoms.forEach((atom, atomIndex) => {
      let atomConstructor
      for (let index = 0; index < requiredAtomTypeDefs.length; index++) {
        const atomTypeDefinition = requiredAtomTypeDefs[index]
        if (atomTypeDefinition.isValid(atom, program)) {
          // todo: cleanup atomIndex/atomIndex stuff
          atomConstructor = atomTypeDefinition.getAtomConstructor()
          atomsArr.push(new atomConstructor(particle, atomIndex, atomTypeDefinition, atomTypeDefinition.id, false, def))
          requiredAtomTypeDefs.splice(index, 1)
          return true
        }
      }
      if (catchAllAtomTypeDef && catchAllAtomTypeDef.isValid(atom, program)) {
        atomConstructor = catchAllAtomTypeDef.getAtomConstructor()
        atomsArr.push(new atomConstructor(particle, atomIndex, catchAllAtomTypeDef, catchAllAtomTypeId, true, def))
        return true
      }
      atomsArr.push(new ParsersUnknownAtomTypeAtom(particle, atomIndex, undefined, undefined, false, def))
    })
    const atomCount = atoms.length
    requiredAtomTypeDefs.forEach((atomTypeDef, index) => {
      let atomConstructor = atomTypeDef.getAtomConstructor()
      atomsArr.push(new atomConstructor(particle, atomCount + index, atomTypeDef, atomTypeDef.id, false, def))
    })
    return atomsArr
  }
}
class ParsersExampleParser extends Particle {}
class ParsersCompilerParser extends Particle {
  createParserPool() {
    const types = [
      ParsersConstantsCompiler.stringTemplate,
      ParsersConstantsCompiler.indentCharacter,
      ParsersConstantsCompiler.catchAllAtomDelimiter,
      ParsersConstantsCompiler.joinSubparticlesWith,
      ParsersConstantsCompiler.openSubparticles,
      ParsersConstantsCompiler.closeSubparticles
    ]
    const map = {}
    types.forEach(type => {
      map[type] = Particle
    })
    return new Particle.ParserPool(undefined, map)
  }
}
class AbstractParserConstantParser extends Particle {
  constructor(subparticles, line, parent) {
    super(subparticles, line, parent)
    parent[this.identifier] = this.constantValue
  }
  getGetter() {
    return `get ${this.identifier}() { return ${this.constantValueAsJsText} }`
  }
  get identifier() {
    return this.getAtom(1)
  }
  get constantValueAsJsText() {
    const atoms = this.getAtomsFrom(2)
    return atoms.length > 1 ? `[${atoms.join(",")}]` : atoms[0]
  }
  get constantValue() {
    return JSON.parse(this.constantValueAsJsText)
  }
}
class ParsersParserConstantInt extends AbstractParserConstantParser {}
class ParsersParserConstantString extends AbstractParserConstantParser {
  get constantValueAsJsText() {
    return "`" + Utils.escapeBackTicks(this.constantValue) + "`"
  }
  get constantValue() {
    return this.length ? this.subparticlesToString() : this.getAtomsFrom(2).join(" ")
  }
}
class ParsersParserConstantFloat extends AbstractParserConstantParser {}
class ParsersParserConstantBoolean extends AbstractParserConstantParser {}
class AbstractParserDefinitionParser extends AbstractExtendibleParticle {
  constructor() {
    super(...arguments)
    this._isLooping = false
  }
  createParserPool() {
    // todo: some of these should just be on nonRootParticles
    const types = [
      ParsersConstants.popularity,
      ParsersConstants.inScope,
      ParsersConstants.atoms,
      ParsersConstants.extends,
      ParsersConstants.description,
      ParsersConstants.catchAllParser,
      ParsersConstants.catchAllAtomType,
      ParsersConstants.atomParser,
      ParsersConstants.tags,
      ParsersConstants.cue,
      ParsersConstants.cueFromId,
      ParsersConstants.listDelimiter,
      ParsersConstants.contentKey,
      ParsersConstants.subparticlesKey,
      ParsersConstants.uniqueCue,
      ParsersConstants.uniqueLine,
      ParsersConstants.pattern,
      ParsersConstants.baseParser,
      ParsersConstants.required,
      ParsersConstants.root,
      ParsersConstants._rootNodeJsHeader,
      ParsersConstants.javascript,
      ParsersConstants.javascript,
      ParsersConstants.single,
      ParsersConstants.comment
    ]
    const map = {}
    types.forEach(type => {
      map[type] = Particle
    })
    map[ParsersConstantsConstantTypes.boolean] = ParsersParserConstantBoolean
    map[ParsersConstantsConstantTypes.int] = ParsersParserConstantInt
    map[ParsersConstantsConstantTypes.string] = ParsersParserConstantString
    map[ParsersConstantsConstantTypes.float] = ParsersParserConstantFloat
    map[ParsersConstants.compilerParser] = ParsersCompilerParser
    map[ParsersConstants.example] = ParsersExampleParser
    return new Particle.ParserPool(undefined, map, [{ regex: HandParsersProgram.parserFullRegex, parser: parserDefinitionParser }])
  }
  toTypeScriptInterface(used = new Set()) {
    let subparticlesInterfaces = []
    let properties = []
    const inScope = this.cueMapWithDefinitions
    const thisId = this.id
    used.add(thisId)
    Object.keys(inScope).forEach(key => {
      const def = inScope[key]
      const map = def.cueMapWithDefinitions
      const id = def.id
      const optionalTag = def.isRequired() ? "" : "?"
      const escapedKey = key.match(/\?/) ? `"${key}"` : key
      const description = def.description
      if (Object.keys(map).length && !used.has(id)) {
        subparticlesInterfaces.push(def.toTypeScriptInterface(used))
        properties.push(` ${escapedKey}${optionalTag}: ${id}`)
      } else properties.push(` ${escapedKey}${optionalTag}: any${description ? " // " + description : ""}`)
    })
    properties.sort()
    const description = this.description
    const myInterface = ""
    return `${subparticlesInterfaces.join("\n")}
${description ? "// " + description : ""}
interface ${thisId} {
${properties.join("\n")}
}`.trim()
  }
  get id() {
    return this.getAtom(0)
  }
  get idWithoutSuffix() {
    return this.id.replace(HandParsersProgram.parserSuffixRegex, "")
  }
  get constantsObject() {
    const obj = this._getUniqueConstantParticles()
    Object.keys(obj).forEach(key => (obj[key] = obj[key].constantValue))
    return obj
  }
  _getUniqueConstantParticles(extended = true) {
    const obj = {}
    const items = extended ? this._getSubparticlesByParserInExtended(AbstractParserConstantParser) : this.getSubparticlesByParser(AbstractParserConstantParser)
    items.reverse() // Last definition wins.
    items.forEach(particle => (obj[particle.identifier] = particle))
    return obj
  }
  get examples() {
    return this._getSubparticlesByParserInExtended(ParsersExampleParser)
  }
  get parserIdFromDefinition() {
    return this.getAtom(0)
  }
  // todo: remove? just reused parserId
  get generatedClassName() {
    return this.parserIdFromDefinition
  }
  _hasValidParserId() {
    return !!this.generatedClassName
  }
  _isAbstract() {
    return this.id.startsWith(ParsersConstants.abstractParserPrefix)
  }
  get cueIfAny() {
    return this.get(ParsersConstants.cue) || (this._hasFromExtended(ParsersConstants.cueFromId) ? this.idWithoutSuffix : undefined)
  }
  get regexMatch() {
    return this.get(ParsersConstants.pattern)
  }
  get cueEnumOptions() {
    const cueDef = this._getMyAtomTypeDefs()[0]
    return cueDef ? cueDef._getEnumOptions() : undefined
  }
  get languageDefinitionProgram() {
    return this.root
  }
  get customJavascriptMethods() {
    const hasJsCode = this.has(ParsersConstants.javascript)
    return hasJsCode ? this.getParticle(ParsersConstants.javascript).subparticlesToString() : ""
  }
  get cueMapWithDefinitions() {
    if (!this._cache_cueToParticleDefMap) this._cache_cueToParticleDefMap = this._createParserInfo(this._getInScopeParserIds()).cueMap
    return this._cache_cueToParticleDefMap
  }
  // todo: remove
  get runTimeCuesInScope() {
    return this._getParserPool().getCueOptions()
  }
  _getMyAtomTypeDefs() {
    const requiredAtoms = this.get(ParsersConstants.atoms)
    if (!requiredAtoms) return []
    const parsersProgram = this.languageDefinitionProgram
    return requiredAtoms.split(" ").map(atomTypeId => {
      const atomTypeDef = parsersProgram.getAtomTypeDefinitionById(atomTypeId)
      if (!atomTypeDef) throw new Error(`No atomType "${atomTypeId}" found`)
      return atomTypeDef
    })
  }
  // todo: what happens when you have a atom getter and constant with same name?
  get atomGettersAndParserConstants() {
    // todo: add atomType parsings
    const parsersProgram = this.languageDefinitionProgram
    const getters = this._getMyAtomTypeDefs().map((atomTypeDef, index) => atomTypeDef.getGetter(index))
    const catchAllAtomTypeId = this.get(ParsersConstants.catchAllAtomType)
    if (catchAllAtomTypeId) getters.push(parsersProgram.getAtomTypeDefinitionById(catchAllAtomTypeId).getCatchAllGetter(getters.length))
    // Constants
    Object.values(this._getUniqueConstantParticles(false)).forEach(particle => getters.push(particle.getGetter()))
    return getters.join("\n")
  }
  _createParserInfo(parserIdsInScope) {
    const result = {
      cueMap: {},
      regexTests: []
    }
    if (!parserIdsInScope.length) return result
    const allProgramParserDefinitionsMap = this.programParserDefinitionCache
    Object.keys(allProgramParserDefinitionsMap)
      .filter(parserId => {
        const def = allProgramParserDefinitionsMap[parserId]
        return def.isOrExtendsAParserInScope(parserIdsInScope) && !def._isAbstract()
      })
      .forEach(parserId => {
        const def = allProgramParserDefinitionsMap[parserId]
        const regex = def.regexMatch
        const cue = def.cueIfAny
        const enumOptions = def.cueEnumOptions
        if (regex) result.regexTests.push({ regex: regex, parser: def.parserIdFromDefinition })
        else if (cue) result.cueMap[cue] = def
        else if (enumOptions) {
          enumOptions.forEach(option => (result.cueMap[option] = def))
        }
      })
    return result
  }
  get topParserDefinitions() {
    const arr = Object.values(this.cueMapWithDefinitions)
    arr.sort(Utils.makeSortByFn(definition => definition.popularity))
    arr.reverse()
    return arr
  }
  _getMyInScopeParserIds(target = this) {
    const parsersParticle = target.getParticle(ParsersConstants.inScope)
    const scopedDefinitionIds = target.myScopedParserDefinitions.map(def => def.id)
    return parsersParticle ? parsersParticle.getAtomsFrom(1).concat(scopedDefinitionIds) : scopedDefinitionIds
  }
  _getInScopeParserIds() {
    // todo: allow multiple of these if we allow mixins?
    const ids = this._getMyInScopeParserIds()
    const parentDef = this._getExtendedParent()
    return parentDef ? ids.concat(parentDef._getInScopeParserIds()) : ids
  }
  get isSingle() {
    const hit = this._getParticleFromExtended(ParsersConstants.single)
    return hit && hit.get(ParsersConstants.single) !== "false"
  }
  get isUniqueLine() {
    const hit = this._getParticleFromExtended(ParsersConstants.uniqueLine)
    return hit && hit.get(ParsersConstants.uniqueLine) !== "false"
  }
  isRequired() {
    return this._hasFromExtended(ParsersConstants.required)
  }
  getParserDefinitionByParserId(parserId) {
    // todo: return catch all?
    const def = this.programParserDefinitionCache[parserId]
    if (def) return def
    this.languageDefinitionProgram._addDefaultCatchAllBlobParser() // todo: cleanup. Why did I do this? Needs to be removed or documented.
    const particleDef = this.languageDefinitionProgram.programParserDefinitionCache[parserId]
    if (!particleDef) throw new Error(`No definition found for parser id "${parserId}". Particle: \n---\n${this.asString}\n---`)
    return particleDef
  }
  isDefined(parserId) {
    return !!this.programParserDefinitionCache[parserId]
  }
  get idToParticleMap() {
    return this.programParserDefinitionCache
  }
  _amIRoot() {
    if (this._cache_isRoot === undefined) this._cache_isRoot = this._languageRootParticle === this
    return this._cache_isRoot
  }
  get _languageRootParticle() {
    return this.root.rootParserDefinition
  }
  _isErrorParser() {
    return this.get(ParsersConstants.baseParser) === ParsersConstants.errorParser
  }
  _isBlobParser() {
    // Do not check extended classes. Only do once.
    return this._getFromExtended(ParsersConstants.baseParser) === ParsersConstants.blobParser
  }
  get errorMethodToJavascript() {
    if (this._isBlobParser()) return "getErrors() { return [] }" // Skips parsing subparticles for perf gains.
    if (this._isErrorParser()) return "getErrors() { return this._getErrorParserErrors() }"
    return ""
  }
  get parserAsJavascript() {
    if (this._isBlobParser())
      // todo: do we need this?
      return "createParserPool() { return new Particle.ParserPool(this._getBlobParserCatchAllParser())}"
    const parserInfo = this._createParserInfo(this._getMyInScopeParserIds())
    const myCueMap = parserInfo.cueMap
    const regexRules = parserInfo.regexTests
    // todo: use constants in first atom maps?
    // todo: cache the super extending?
    const cues = Object.keys(myCueMap)
    const hasCues = cues.length
    const catchAllParser = this.catchAllParserToJavascript
    if (!hasCues && !catchAllParser && !regexRules.length) return ""
    const cuesStr = hasCues ? `Object.assign(Object.assign({}, super.createParserPool()._getCueMapAsObject()), {` + cues.map(cue => `"${cue}" : ${myCueMap[cue].parserIdFromDefinition}`).join(",\n") + "})" : "undefined"
    const regexStr = regexRules.length
      ? `[${regexRules
          .map(rule => {
            return `{regex: /${rule.regex}/, parser: ${rule.parser}}`
          })
          .join(",")}]`
      : "undefined"
    const catchAllStr = catchAllParser ? catchAllParser : this._amIRoot() ? `this._getBlobParserCatchAllParser()` : "undefined"
    const scopedParserJavascript = this.myScopedParserDefinitions.map(def => def.asJavascriptClass).join("\n\n")
    return `createParserPool() {${scopedParserJavascript}
  return new Particle.ParserPool(${catchAllStr}, ${cuesStr}, ${regexStr})
  }`
  }
  get myScopedParserDefinitions() {
    return this.getSubparticlesByParser(parserDefinitionParser)
  }
  get catchAllParserToJavascript() {
    if (this._isBlobParser()) return "this._getBlobParserCatchAllParser()"
    const parserId = this.get(ParsersConstants.catchAllParser)
    if (!parserId) return ""
    const particleDef = this.getParserDefinitionByParserId(parserId)
    return particleDef.generatedClassName
  }
  get asJavascriptClass() {
    const components = [this.parserAsJavascript, this.errorMethodToJavascript, this.atomGettersAndParserConstants, this.customJavascriptMethods].filter(identity => identity)
    const thisClassName = this.generatedClassName
    if (this._amIRoot()) {
      components.push(`static cachedHandParsersProgramRoot = new HandParsersProgram(\`${Utils.escapeBackTicks(this.parent.toString().replace(/\\/g, "\\\\"))}\`)
        get handParsersProgram() {
          return this.constructor.cachedHandParsersProgramRoot
      }`)
      components.push(`static rootParser = ${thisClassName}`)
    }
    return `class ${thisClassName} extends ${this._getExtendsClassName()} {
      ${components.join("\n")}
    }`
  }
  _getExtendsClassName() {
    const extendedDef = this._getExtendedParent()
    return extendedDef ? extendedDef.generatedClassName : "ParserBackedParticle"
  }
  _getCompilerObject() {
    let obj = {}
    const items = this._getSubparticlesByParserInExtended(ParsersCompilerParser)
    items.reverse() // Last definition wins.
    items.forEach(particle => {
      obj = Object.assign(obj, particle.toObject()) // todo: what about multiline strings?
    })
    return obj
  }
  // todo: improve layout (use bold?)
  get lineHints() {
    return this.atomParser.lineHints
  }
  isOrExtendsAParserInScope(cuesInScope) {
    const chain = this._getParserInheritanceSet()
    return cuesInScope.some(cue => chain.has(cue))
  }
  isTerminalParser() {
    return !this._getFromExtended(ParsersConstants.inScope) && !this._getFromExtended(ParsersConstants.catchAllParser)
  }
  get sublimeMatchLine() {
    const regexMatch = this.regexMatch
    if (regexMatch) return `'${regexMatch}'`
    const cueMatch = this.cueIfAny
    if (cueMatch) return `'^ *${Utils.escapeRegExp(cueMatch)}(?: |$)'`
    const enumOptions = this.cueEnumOptions
    if (enumOptions) return `'^ *(${Utils.escapeRegExp(enumOptions.join("|"))})(?: |$)'`
  }
  // todo: refactor. move some parts to atomParser?
  _toSublimeMatchBlock() {
    const defaultPaint = "source"
    const program = this.languageDefinitionProgram
    const atomParser = this.atomParser
    const requiredAtomTypeIds = atomParser.getRequiredAtomTypeIds()
    const catchAllAtomTypeId = atomParser.catchAllAtomTypeId
    const cueTypeDef = program.getAtomTypeDefinitionById(requiredAtomTypeIds[0])
    const cuePaint = (cueTypeDef ? cueTypeDef.paint : defaultPaint) + "." + this.parserIdFromDefinition
    const topHalf = ` '${this.parserIdFromDefinition}':
  - match: ${this.sublimeMatchLine}
    scope: ${cuePaint}`
    if (catchAllAtomTypeId) requiredAtomTypeIds.push(catchAllAtomTypeId)
    if (!requiredAtomTypeIds.length) return topHalf
    const captures = requiredAtomTypeIds
      .map((atomTypeId, index) => {
        const atomTypeDefinition = program.getAtomTypeDefinitionById(atomTypeId) // todo: cleanup
        if (!atomTypeDefinition) throw new Error(`No ${ParsersConstants.atomType} ${atomTypeId} found`) // todo: standardize error/capture error at parsers time
        return `        ${index + 1}: ${(atomTypeDefinition.paint || defaultPaint) + "." + atomTypeDefinition.atomTypeId}`
      })
      .join("\n")
    const atomTypesToRegex = atomTypeIds => atomTypeIds.map(atomTypeId => `({{${atomTypeId}}})?`).join(" ?")
    return `${topHalf}
    push:
     - match: ${atomTypesToRegex(requiredAtomTypeIds)}
       captures:
${captures}
     - match: $
       pop: true`
  }
  _getParserInheritanceSet() {
    if (!this._cache_parserInheritanceSet) this._cache_parserInheritanceSet = new Set(this.ancestorParserIdsArray)
    return this._cache_parserInheritanceSet
  }
  get ancestorParserIdsArray() {
    if (!this._cache_ancestorParserIdsArray) {
      this._cache_ancestorParserIdsArray = this._getAncestorsArray().map(def => def.parserIdFromDefinition)
      this._cache_ancestorParserIdsArray.reverse()
    }
    return this._cache_ancestorParserIdsArray
  }
  get programParserDefinitionCache() {
    var _a
    if (!this._cache_parserDefinitionParsers) {
      if (this._isLooping) throw new Error(`Loop detected in ${this.id}`)
      this._isLooping = true
      this._cache_parserDefinitionParsers =
        this.isRoot() || this.hasParserDefinitions
          ? this.makeProgramParserDefinitionCache()
          : ((_a = this.parent.programParserDefinitionCache[this.get(ParsersConstants.extends)]) === null || _a === void 0 ? void 0 : _a.programParserDefinitionCache) || this.parent.programParserDefinitionCache
      this._isLooping = false
    }
    return this._cache_parserDefinitionParsers
  }
  get hasParserDefinitions() {
    return !!this.getSubparticlesByParser(parserDefinitionParser).length
  }
  makeProgramParserDefinitionCache() {
    const scopedParsers = this.getSubparticlesByParser(parserDefinitionParser)
    const cache = Object.assign({}, this.parent.programParserDefinitionCache) // todo. We don't really need this. we should just lookup the parent if no local hits.
    scopedParsers.forEach(parserDefinitionParser => (cache[parserDefinitionParser.parserIdFromDefinition] = parserDefinitionParser))
    return cache
  }
  get description() {
    return this._getFromExtended(ParsersConstants.description) || ""
  }
  get popularity() {
    const val = this._getFromExtended(ParsersConstants.popularity)
    return val ? parseFloat(val) : 0
  }
  _getExtendedParserId() {
    const ancestorIds = this.ancestorParserIdsArray
    if (ancestorIds.length > 1) return ancestorIds[ancestorIds.length - 2]
  }
  _toStumpString() {
    const cue = this.cueIfAny
    const atomArray = this.atomParser.getAtomArray().filter((item, index) => index) // for now this only works for cue langs
    if (!atomArray.length)
      // todo: remove this! just doing it for now until we refactor getAtomArray to handle catchAlls better.
      return ""
    const atoms = new Particle(atomArray.map((atom, index) => atom._toStumpInput(cue)).join("\n"))
    return `div
 label ${cue}
${atoms.toString(1)}`
  }
  toStumpString() {
    const particleBreakSymbol = "\n"
    return this._getConcreteNonErrorInScopeParticleDefinitions(this._getInScopeParserIds())
      .map(def => def._toStumpString())
      .filter(identity => identity)
      .join(particleBreakSymbol)
  }
  _generateSimulatedLine(seed) {
    // todo: generate simulated data from catch all
    const cue = this.cueIfAny
    return this.atomParser
      .getAtomArray()
      .map((atom, index) => (!index && cue ? cue : atom.synthesizeAtom(seed)))
      .join(" ")
  }
  _shouldSynthesize(def, parserChain) {
    if (def._isErrorParser() || def._isAbstract()) return false
    if (parserChain.includes(def.id)) return false
    const tags = def.get(ParsersConstants.tags)
    if (tags && tags.includes(ParsersConstantsMisc.doNotSynthesize)) return false
    return true
  }
  // Get all definitions in this current scope down, even ones that are scoped inside other definitions.
  get inScopeAndDescendantDefinitions() {
    return this.languageDefinitionProgram._collectAllDefinitions(Object.values(this.programParserDefinitionCache), [])
  }
  _collectAllDefinitions(defs, collection = []) {
    defs.forEach(def => {
      collection.push(def)
      def._collectAllDefinitions(def.getSubparticlesByParser(parserDefinitionParser), collection)
    })
    return collection
  }
  get cuePath() {
    const parentPath = this.parent.cuePath
    return (parentPath ? parentPath + " " : "") + this.cueIfAny
  }
  get cuePathAsColumnName() {
    return this.cuePath.replace(/ /g, "_")
  }
  // Get every definition that extends from this one, even ones that are scoped inside other definitions.
  get concreteDescendantDefinitions() {
    const { inScopeAndDescendantDefinitions, id } = this
    return Object.values(inScopeAndDescendantDefinitions).filter(def => def._doesExtend(id) && !def._isAbstract())
  }
  get concreteInScopeDescendantDefinitions() {
    // Note: non-recursive.
    const defs = this.programParserDefinitionCache
    const id = this.id
    return Object.values(defs).filter(def => def._doesExtend(id) && !def._isAbstract())
  }
  _getConcreteNonErrorInScopeParticleDefinitions(parserIds) {
    const defs = []
    parserIds.forEach(parserId => {
      const def = this.getParserDefinitionByParserId(parserId)
      if (def._isErrorParser()) return
      else if (def._isAbstract()) def.concreteInScopeDescendantDefinitions.forEach(def => defs.push(def))
      else defs.push(def)
    })
    return defs
  }
  // todo: refactor
  synthesizeParticle(particleCount = 1, indentCount = -1, parsersAlreadySynthesized = [], seed = Date.now()) {
    let inScopeParserIds = this._getInScopeParserIds()
    const catchAllParserId = this._getFromExtended(ParsersConstants.catchAllParser)
    if (catchAllParserId) inScopeParserIds.push(catchAllParserId)
    const thisId = this.id
    if (!parsersAlreadySynthesized.includes(thisId)) parsersAlreadySynthesized.push(thisId)
    const lines = []
    while (particleCount) {
      const line = this._generateSimulatedLine(seed)
      if (line) lines.push(" ".repeat(indentCount >= 0 ? indentCount : 0) + line)
      this._getConcreteNonErrorInScopeParticleDefinitions(inScopeParserIds.filter(parserId => !parsersAlreadySynthesized.includes(parserId)))
        .filter(def => this._shouldSynthesize(def, parsersAlreadySynthesized))
        .forEach(def => {
          const chain = parsersAlreadySynthesized // .slice(0)
          chain.push(def.id)
          def.synthesizeParticle(1, indentCount + 1, chain, seed).forEach(line => lines.push(line))
        })
      particleCount--
    }
    return lines
  }
  get atomParser() {
    if (!this._atomParser) {
      const atomParsingStrategy = this._getFromExtended(ParsersConstants.atomParser)
      if (atomParsingStrategy === ParsersAtomParser.postfix) this._atomParser = new PostfixAtomParser(this)
      else if (atomParsingStrategy === ParsersAtomParser.omnifix) this._atomParser = new OmnifixAtomParser(this)
      else this._atomParser = new PrefixAtomParser(this)
    }
    return this._atomParser
  }
}
// todo: remove?
class parserDefinitionParser extends AbstractParserDefinitionParser {}
// HandParsersProgram is a constructor that takes a parsers file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class HandParsersProgram extends AbstractParserDefinitionParser {
  createParserPool() {
    const map = {}
    map[ParsersConstants.comment] = Particle
    return new Particle.ParserPool(UnknownParserParticle, map, [
      { regex: HandParsersProgram.blankLineRegex, parser: Particle },
      { regex: HandParsersProgram.parserFullRegex, parser: parserDefinitionParser },
      { regex: HandParsersProgram.atomTypeFullRegex, parser: atomTypeDefinitionParser }
    ])
  }
  // rootParser
  // Note: this is some so far unavoidable tricky code. We need to eval the transpiled JS, in a NodeJS or browser environment.
  _compileAndReturnRootParser() {
    if (this._cache_rootParser) return this._cache_rootParser
    if (!this.isNodeJs()) {
      this._cache_rootParser = Utils.appendCodeAndReturnValueOnWindow(this.toBrowserJavascript(), this.rootParserId).rootParser
      return this._cache_rootParser
    }
    const path = require("path")
    const code = this.toNodeJsJavascript(__dirname)
    try {
      const rootParticle = this._requireInVmNodeJsRootParser(code)
      this._cache_rootParser = rootParticle.rootParser
      if (!this._cache_rootParser) throw new Error(`Failed to rootParser`)
    } catch (err) {
      // todo: figure out best error pattern here for debugging
      console.log(err)
      // console.log(`Error in code: `)
      // console.log(new Particle(code).toStringWithLineNumbers())
    }
    return this._cache_rootParser
  }
  get cuePath() {
    return ""
  }
  trainModel(programs, rootParser = this.compileAndReturnRootParser()) {
    const particleDefs = this.validConcreteAndAbstractParserDefinitions
    const particleDefCountIncludingRoot = particleDefs.length + 1
    const matrix = Utils.makeMatrix(particleDefCountIncludingRoot, particleDefCountIncludingRoot, 0)
    const idToIndex = {}
    const indexToId = {}
    particleDefs.forEach((def, index) => {
      const id = def.id
      idToIndex[id] = index + 1
      indexToId[index + 1] = id
    })
    programs.forEach(code => {
      const exampleProgram = new rootParser(code)
      exampleProgram.topDownArray.forEach(particle => {
        const particleIndex = idToIndex[particle.definition.id]
        const parentParticle = particle.parent
        if (!particleIndex) return undefined
        if (parentParticle.isRoot()) matrix[0][particleIndex]++
        else {
          const parentIndex = idToIndex[parentParticle.definition.id]
          if (!parentIndex) return undefined
          matrix[parentIndex][particleIndex]++
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
    const total = Utils.sum(predictionsVector)
    const predictions = predictionsVector.slice(1).map((count, index) => {
      const id = model.indexToId[index + 1]
      return {
        id,
        def: this.getParserDefinitionByParserId(id),
        count,
        prob: count / total
      }
    })
    predictions.sort(Utils.makeSortByFn(prediction => prediction.count)).reverse()
    return predictions
  }
  predictSubparticles(model, particle) {
    return this._mapPredictions(this._predictSubparticles(model, particle), model)
  }
  predictParents(model, particle) {
    return this._mapPredictions(this._predictParents(model, particle), model)
  }
  _predictSubparticles(model, particle) {
    return model.matrix[particle.isRoot() ? 0 : model.idToIndex[particle.definition.id]]
  }
  _predictParents(model, particle) {
    if (particle.isRoot()) return []
    const particleIndex = model.idToIndex[particle.definition.id]
    return model.matrix.map(row => row[particleIndex])
  }
  _setDirName(name) {
    this._dirName = name
    return this
  }
  _requireInVmNodeJsRootParser(code) {
    const vm = require("vm")
    const path = require("path")
    // todo: cleanup up
    try {
      Object.keys(GlobalNamespaceAdditions).forEach(key => {
        global[key] = require("./" + GlobalNamespaceAdditions[key])
      })
      global.require = require
      global.__dirname = this._dirName
      global.module = {}
      return vm.runInThisContext(code)
    } catch (err) {
      // todo: figure out best error pattern here for debugging
      console.log(`Error in compiled parsers code for language "${this.parsersName}"`)
      // console.log(new Particle(code).toStringWithLineNumbers())
      console.log(err)
      throw err
    }
  }
  examplesToTestBlocks(rootParser = this.compileAndReturnRootParser(), expectedErrorMessage = "") {
    const testBlocks = {}
    this.validConcreteAndAbstractParserDefinitions.forEach(def =>
      def.examples.forEach(example => {
        const id = def.id + example.content
        testBlocks[id] = equal => {
          const exampleProgram = new rootParser(example.subparticlesToString())
          const errors = exampleProgram.getAllErrors(example._getLineNumber() + 1)
          equal(errors.join("\n"), expectedErrorMessage, `Expected no errors in ${id}`)
        }
      })
    )
    return testBlocks
  }
  toReadMe() {
    const languageName = this.extensionName
    const rootParticleDef = this.rootParserDefinition
    const atomTypes = this.atomTypeDefinitions
    const parserLineage = this.parserLineage
    const exampleParticle = rootParticleDef.examples[0]
    return `title2 ${languageName} stats

list
 - ${languageName} has ${parserLineage.topDownArray.length} parsers.
 - ${languageName} has ${Object.keys(atomTypes).length} atom types.
 - The source code for ${languageName} is ${this.topDownArray.length} lines long.
`
  }
  toBundle() {
    const files = {}
    const rootParticleDef = this.rootParserDefinition
    const languageName = this.extensionName
    const example = rootParticleDef.examples[0]
    const sampleCode = example ? example.subparticlesToString() : ""
    files[ParsersBundleFiles.package] = JSON.stringify(
      {
        name: languageName,
        private: true,
        dependencies: {
          scrollsdk: Particle.getVersion()
        }
      },
      null,
      2
    )
    files[ParsersBundleFiles.readme] = this.toReadMe()
    const testCode = `const program = new ${languageName}(sampleCode)
const errors = program.getAllErrors()
console.log("Sample program compiled with " + errors.length + " errors.")
if (errors.length)
 console.log(errors.map(error => error.message))`
    const nodePath = `${languageName}.node.js`
    files[nodePath] = this.toNodeJsJavascript()
    files[ParsersBundleFiles.indexJs] = `module.exports = require("./${nodePath}")`
    const browserPath = `${languageName}.browser.js`
    files[browserPath] = this.toBrowserJavascript()
    files[ParsersBundleFiles.indexHtml] = `<script src="node_modules/scrollsdk/products/Utils.browser.js"></script>
<script src="node_modules/scrollsdk/products/Particle.browser.js"></script>
<script src="node_modules/scrollsdk/products/Parsers.ts.browser.js"></script>
<script src="${browserPath}"></script>
<script>
const sampleCode = \`${sampleCode.toString()}\`
${testCode}
</script>`
    const samplePath = "sample." + this.extensionName
    files[samplePath] = sampleCode.toString()
    files[ParsersBundleFiles.testJs] = `const ${languageName} = require("./index.js")
/*keep-line*/ const sampleCode = require("fs").readFileSync("${samplePath}", "utf8")
${testCode}`
    return files
  }
  get atomTypeDefinitions() {
    if (this._cache_atomTypes) return this._cache_atomTypes
    const types = {}
    // todo: add built in atom types?
    this.getSubparticlesByParser(atomTypeDefinitionParser).forEach(type => (types[type.atomTypeId] = type))
    this._cache_atomTypes = types
    return types
  }
  getAtomTypeDefinitionById(atomTypeId) {
    // todo: return unknownAtomTypeDefinition? or is that handled somewhere else?
    return this.atomTypeDefinitions[atomTypeId]
  }
  get parserLineage() {
    const newParticle = new Particle()
    Object.values(this.validConcreteAndAbstractParserDefinitions).forEach(particle => newParticle.touchParticle(particle.ancestorParserIdsArray.join(" ")))
    return newParticle
  }
  get languageDefinitionProgram() {
    return this
  }
  get validConcreteAndAbstractParserDefinitions() {
    return this.getSubparticlesByParser(parserDefinitionParser).filter(particle => particle._hasValidParserId())
  }
  get lastRootParserDefinitionParticle() {
    return this.findLast(def => def instanceof AbstractParserDefinitionParser && def.has(ParsersConstants.root) && def._hasValidParserId())
  }
  _initRootParserDefinitionParticle() {
    if (this._cache_rootParserParticle) return
    if (!this._cache_rootParserParticle) this._cache_rootParserParticle = this.lastRootParserDefinitionParticle
    // By default, have a very permissive basic root particle.
    // todo: whats the best design pattern to use for this sort of thing?
    if (!this._cache_rootParserParticle) {
      this._cache_rootParserParticle = this.concat(`${ParsersConstants.DefaultRootParser}
 ${ParsersConstants.root}
 ${ParsersConstants.catchAllParser} ${ParsersConstants.BlobParser}`)[0]
      this._addDefaultCatchAllBlobParser()
    }
  }
  get rootParserDefinition() {
    this._initRootParserDefinitionParticle()
    return this._cache_rootParserParticle
  }
  _addDefaultCatchAllBlobParser() {
    if (this._addedCatchAll) return
    this._addedCatchAll = true
    delete this._cache_parserDefinitionParsers
    this.concat(`${ParsersConstants.BlobParser}
 ${ParsersConstants.baseParser} ${ParsersConstants.blobParser}`)
  }
  get extensionName() {
    return this.parsersName
  }
  get id() {
    return this.rootParserId
  }
  get rootParserId() {
    return this.rootParserDefinition.parserIdFromDefinition
  }
  get parsersName() {
    return this.rootParserId.replace(HandParsersProgram.parserSuffixRegex, "")
  }
  _getMyInScopeParserIds() {
    return super._getMyInScopeParserIds(this.rootParserDefinition)
  }
  _getInScopeParserIds() {
    const parsersParticle = this.rootParserDefinition.getParticle(ParsersConstants.inScope)
    return parsersParticle ? parsersParticle.getAtomsFrom(1) : []
  }
  makeProgramParserDefinitionCache() {
    const cache = {}
    this.getSubparticlesByParser(parserDefinitionParser).forEach(parserDefinitionParser => (cache[parserDefinitionParser.parserIdFromDefinition] = parserDefinitionParser))
    return cache
  }
  compileAndReturnRootParser() {
    if (!this._cached_rootParser) {
      const rootDef = this.rootParserDefinition
      this._cached_rootParser = rootDef.languageDefinitionProgram._compileAndReturnRootParser()
    }
    return this._cached_rootParser
  }
  toNodeJsJavascript(scrollsdkProductsPath = "scrollsdk/products") {
    return this._rootParticleDefToJavascriptClass(scrollsdkProductsPath, true).trim()
  }
  toBrowserJavascript() {
    return this._rootParticleDefToJavascriptClass("", false).trim()
  }
  _rootParticleDefToJavascriptClass(scrollsdkProductsPath, forNodeJs = true) {
    const defs = this.validConcreteAndAbstractParserDefinitions
    // todo: throw if there is no root particle defined
    const parserClasses = defs.map(def => def.asJavascriptClass).join("\n\n")
    const rootDef = this.rootParserDefinition
    const rootNodeJsHeader = forNodeJs && rootDef._getConcatBlockStringFromExtended(ParsersConstants._rootNodeJsHeader)
    const rootName = rootDef.generatedClassName
    if (!rootName) throw new Error(`Root Particle Type Has No Name`)
    let exportScript = ""
    if (forNodeJs)
      exportScript = `module.exports = ${rootName};
${rootName}`
    else exportScript = `window.${rootName} = ${rootName}`
    let nodeJsImports = ``
    if (forNodeJs) {
      const path = require("path")
      nodeJsImports = Object.keys(GlobalNamespaceAdditions)
        .map(key => {
          const thePath = scrollsdkProductsPath + "/" + GlobalNamespaceAdditions[key]
          return `const { ${key} } = require("${thePath.replace(/\\/g, "\\\\")}")` // escape windows backslashes
        })
        .join("\n")
    }
    // todo: we can expose the previous "constants" export, if needed, via the parsers, which we preserve.
    return `{
${nodeJsImports}
${rootNodeJsHeader ? rootNodeJsHeader : ""}
${parserClasses}

${exportScript}
}
`
  }
  toSublimeSyntaxFile(fileExtensions = "") {
    const atomTypeDefs = this.atomTypeDefinitions
    const variables = Object.keys(atomTypeDefs)
      .map(name => ` ${name}: '${atomTypeDefs[name].regexString}'`)
      .join("\n")
    const defs = this.validConcreteAndAbstractParserDefinitions.filter(kw => !kw._isAbstract())
    const parserContexts = defs.map(def => def._toSublimeMatchBlock()).join("\n\n")
    const includes = defs.map(parserDef => `  - include: '${parserDef.parserIdFromDefinition}'`).join("\n")
    return `%YAML 1.2
---
name: ${this.extensionName}
file_extensions: [${fileExtensions}]
scope: source.${this.extensionName}

variables:
${variables}

contexts:
 main:
${includes}

${parserContexts}`
  }
}
HandParsersProgram.makeParserId = str => Utils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(HandParsersProgram.parserSuffixRegex, "") + ParsersConstants.parserSuffix
HandParsersProgram.makeAtomTypeId = str => Utils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(HandParsersProgram.atomTypeSuffixRegex, "") + ParsersConstants.atomTypeSuffix
HandParsersProgram.parserSuffixRegex = new RegExp(ParsersConstants.parserSuffix + "$")
HandParsersProgram.parserFullRegex = new RegExp("^[a-zA-Z0-9_]+" + ParsersConstants.parserSuffix + "$")
HandParsersProgram.blankLineRegex = new RegExp("^$")
HandParsersProgram.atomTypeSuffixRegex = new RegExp(ParsersConstants.atomTypeSuffix + "$")
HandParsersProgram.atomTypeFullRegex = new RegExp("^[a-zA-Z0-9_]+" + ParsersConstants.atomTypeSuffix + "$")
HandParsersProgram._languages = {}
HandParsersProgram._parsers = {}
const PreludeKinds = {}
PreludeKinds[PreludeAtomTypeIds.anyAtom] = ParsersAnyAtom
PreludeKinds[PreludeAtomTypeIds.cueAtom] = ParsersCueAtom
PreludeKinds[PreludeAtomTypeIds.floatAtom] = ParsersFloatAtom
PreludeKinds[PreludeAtomTypeIds.numberAtom] = ParsersFloatAtom
PreludeKinds[PreludeAtomTypeIds.bitAtom] = ParsersBitAtom
PreludeKinds[PreludeAtomTypeIds.booleanAtom] = ParsersBooleanAtom
PreludeKinds[PreludeAtomTypeIds.integerAtom] = ParsersIntegerAtom
class UnknownParsersProgram extends Particle {
  _inferRootParticleForAPrefixLanguage(parsersName) {
    parsersName = HandParsersProgram.makeParserId(parsersName)
    const rootParticle = new Particle(`${parsersName}
 ${ParsersConstants.root}`)
    // note: right now we assume 1 global atomTypeMap and parserMap per parsers. But we may have scopes in the future?
    const rootParticleNames = this.getCues()
      .filter(identity => identity)
      .map(atom => HandParsersProgram.makeParserId(atom))
    rootParticle
      .particleAt(0)
      .touchParticle(ParsersConstants.inScope)
      .setAtomsFrom(1, Array.from(new Set(rootParticleNames)))
    return rootParticle
  }
  _renameIntegerCues(clone) {
    // todo: why are we doing this?
    for (let particle of clone.getTopDownArrayIterator()) {
      const cueIsAnInteger = !!particle.cue.match(/^\d+$/)
      const parentCue = particle.parent.cue
      if (cueIsAnInteger && parentCue) particle.setCue(HandParsersProgram.makeParserId(parentCue + UnknownParsersProgram._subparticleSuffix))
    }
  }
  _getCueMaps(clone) {
    const cuesToChildCues = {}
    const cuesToParticleInstances = {}
    for (let particle of clone.getTopDownArrayIterator()) {
      const cue = particle.cue
      if (!cuesToChildCues[cue]) cuesToChildCues[cue] = {}
      if (!cuesToParticleInstances[cue]) cuesToParticleInstances[cue] = []
      cuesToParticleInstances[cue].push(particle)
      particle.forEach(subparticle => (cuesToChildCues[cue][subparticle.cue] = true))
    }
    return { cuesToChildCues, cuesToParticleInstances }
  }
  _inferParserDef(cue, globalAtomTypeMap, subparticleCues, instances) {
    const edgeSymbol = this.edgeSymbol
    const parserId = HandParsersProgram.makeParserId(cue)
    const particleDefParticle = new Particle(parserId).particleAt(0)
    const subparticleParserIds = subparticleCues.map(atom => HandParsersProgram.makeParserId(atom))
    if (subparticleParserIds.length) particleDefParticle.touchParticle(ParsersConstants.inScope).setAtomsFrom(1, subparticleParserIds)
    const atomsForAllInstances = instances
      .map(line => line.content)
      .filter(identity => identity)
      .map(line => line.split(edgeSymbol))
    const instanceAtomCounts = new Set(atomsForAllInstances.map(atoms => atoms.length))
    const maxAtomsOnLine = Math.max(...Array.from(instanceAtomCounts))
    const minAtomsOnLine = Math.min(...Array.from(instanceAtomCounts))
    let catchAllAtomType
    let atomTypeIds = []
    for (let atomIndex = 0; atomIndex < maxAtomsOnLine; atomIndex++) {
      const atomType = this._getBestAtomType(
        cue,
        instances.length,
        maxAtomsOnLine,
        atomsForAllInstances.map(atoms => atoms[atomIndex])
      )
      if (!globalAtomTypeMap.has(atomType.atomTypeId)) globalAtomTypeMap.set(atomType.atomTypeId, atomType.atomTypeDefinition)
      atomTypeIds.push(atomType.atomTypeId)
    }
    if (maxAtomsOnLine > minAtomsOnLine) {
      //columns = columns.slice(0, min)
      catchAllAtomType = atomTypeIds.pop()
      while (atomTypeIds[atomTypeIds.length - 1] === catchAllAtomType) {
        atomTypeIds.pop()
      }
    }
    const needsCueProperty = !cue.endsWith(UnknownParsersProgram._subparticleSuffix + ParsersConstants.parserSuffix) // todo: cleanup
    if (needsCueProperty) particleDefParticle.set(ParsersConstants.cue, cue)
    if (catchAllAtomType) particleDefParticle.set(ParsersConstants.catchAllAtomType, catchAllAtomType)
    const atomLine = atomTypeIds.slice()
    atomLine.unshift(PreludeAtomTypeIds.cueAtom)
    if (atomLine.length > 0) particleDefParticle.set(ParsersConstants.atoms, atomLine.join(edgeSymbol))
    //if (!catchAllAtomType && atomTypeIds.length === 1) particleDefParticle.set(ParsersConstants.atoms, atomTypeIds[0])
    // Todo: add conditional frequencies
    return particleDefParticle.parent.toString()
  }
  //  inferParsersFileForAnSSVLanguage(parsersName: string): string {
  //     parsersName = HandParsersProgram.makeParserId(parsersName)
  //    const rootParticle = new Particle(`${parsersName}
  // ${ParsersConstants.root}`)
  //    // note: right now we assume 1 global atomTypeMap and parserMap per parsers. But we may have scopes in the future?
  //    const rootParticleNames = this.getCues().map(atom => HandParsersProgram.makeParserId(atom))
  //    rootParticle
  //      .particleAt(0)
  //      .touchParticle(ParsersConstants.inScope)
  //      .setAtomsFrom(1, Array.from(new Set(rootParticleNames)))
  //    return rootParticle
  //  }
  inferParsersFileForACueLanguage(parsersName) {
    const clone = this.clone()
    this._renameIntegerCues(clone)
    const { cuesToChildCues, cuesToParticleInstances } = this._getCueMaps(clone)
    const globalAtomTypeMap = new Map()
    globalAtomTypeMap.set(PreludeAtomTypeIds.cueAtom, undefined)
    const parserDefs = Object.keys(cuesToChildCues)
      .filter(identity => identity)
      .map(cue => this._inferParserDef(cue, globalAtomTypeMap, Object.keys(cuesToChildCues[cue]), cuesToParticleInstances[cue]))
    const atomTypeDefs = []
    globalAtomTypeMap.forEach((def, id) => atomTypeDefs.push(def ? def : id))
    const particleBreakSymbol = this.particleBreakSymbol
    return this._formatCode([this._inferRootParticleForAPrefixLanguage(parsersName).toString(), atomTypeDefs.join(particleBreakSymbol), parserDefs.join(particleBreakSymbol)].filter(identity => identity).join("\n"))
  }
  _formatCode(code) {
    // todo: make this run in browser too
    if (!this.isNodeJs()) return code
    const parsersProgram = new HandParsersProgram(Particle.fromDisk(__dirname + "/../langs/parsers/parsers.parsers"))
    const rootParser = parsersProgram.compileAndReturnRootParser()
    const program = new rootParser(code)
    return program.format().toString()
  }
  _getBestAtomType(cue, instanceCount, maxAtomsOnLine, allValues) {
    const asSet = new Set(allValues)
    const edgeSymbol = this.edgeSymbol
    const values = Array.from(asSet).filter(identity => identity)
    const every = fn => {
      for (let index = 0; index < values.length; index++) {
        if (!fn(values[index])) return false
      }
      return true
    }
    if (every(str => str === "0" || str === "1")) return { atomTypeId: PreludeAtomTypeIds.bitAtom }
    if (
      every(str => {
        const num = parseInt(str)
        if (isNaN(num)) return false
        return num.toString() === str
      })
    ) {
      return { atomTypeId: PreludeAtomTypeIds.integerAtom }
    }
    if (every(str => str.match(/^-?\d*.?\d+$/))) return { atomTypeId: PreludeAtomTypeIds.floatAtom }
    const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"])
    if (every(str => bools.has(str.toLowerCase()))) return { atomTypeId: PreludeAtomTypeIds.booleanAtom }
    // todo: cleanup
    const enumLimit = 30
    if (instanceCount > 1 && maxAtomsOnLine === 1 && allValues.length > asSet.size && asSet.size < enumLimit)
      return {
        atomTypeId: HandParsersProgram.makeAtomTypeId(cue),
        atomTypeDefinition: `${HandParsersProgram.makeAtomTypeId(cue)}
 enum ${values.join(edgeSymbol)}`
      }
    return { atomTypeId: PreludeAtomTypeIds.anyAtom }
  }
}
UnknownParsersProgram._subparticleSuffix = "Subparticle"
window.ParsersConstants = ParsersConstants
window.PreludeAtomTypeIds = PreludeAtomTypeIds
window.HandParsersProgram = HandParsersProgram
window.ParserBackedParticle = ParserBackedParticle
window.UnknownParserError = UnknownParserError
window.UnknownParsersProgram = UnknownParsersProgram
;

// todo: as much as we can, remove Fusion and move these capabilities into the root Particle class.
const PARSERS_EXTENSION = ".parsers"
const SCROLL_EXTENSION = ".scroll"
// Add URL regex pattern
const urlRegex = /^https?:\/\/[^ ]+$/i
const parserRegex = /^[a-zA-Z0-9_]+Parser$/gm
const importRegex = /^(import |[a-zA-Z\_\-\.0-9\/]+\.(scroll|parsers)$|https?:\/\/.+\.(scroll|parsers)$)/gm
const importOnlyRegex = /^importOnly/
const isUrl = path => urlRegex.test(path)
// URL content cache with pending requests tracking
const urlCache = {}
const pendingRequests = {}
async function fetchWithCache(url) {
  const now = Date.now()
  const cached = urlCache[url]
  if (cached) return cached
  // If there's already a pending request for this URL, return that promise
  if (pendingRequests[url]) {
    return pendingRequests[url]
  }
  // Create new request and store in pending
  const requestPromise = (async () => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const content = await response.text()
      const result = {
        content,
        timestamp: now,
        exists: true
      }
      urlCache[url] = result
      return result
    } catch (error) {
      console.error(`Error fetching ${url}:`, error)
      const result = {
        content: "",
        timestamp: now,
        exists: false
      }
      urlCache[url] = result
      return result
    } finally {
      delete pendingRequests[url]
    }
  })()
  pendingRequests[url] = requestPromise
  return requestPromise
}
class DiskWriter {
  constructor() {
    this.fileCache = {}
  }
  async _read(absolutePath) {
    if (isUrl(absolutePath)) {
      const result = await fetchWithCache(absolutePath)
      return {
        absolutePath,
        exists: result.exists,
        content: result.content,
        stats: { mtimeMs: Date.now(), ctimeMs: Date.now() }
      }
    }
    const { fileCache } = this
    if (fileCache[absolutePath]) return fileCache[absolutePath]
    try {
      const stats = await fs.stat(absolutePath)
      const content = await fs.readFile(absolutePath, {
        encoding: "utf8",
        flag: "r" // explicit read flag
      })
      const normalizedContent = content.includes("\r") ? content.replace(/\r/g, "") : content
      fileCache[absolutePath] = {
        absolutePath,
        exists: true,
        content: normalizedContent,
        stats
      }
    } catch (error) {
      fileCache[absolutePath] = {
        absolutePath,
        exists: false,
        content: "",
        stats: { mtimeMs: 0, ctimeMs: 0 }
      }
    }
    return fileCache[absolutePath]
  }
  async exists(absolutePath) {
    if (isUrl(absolutePath)) {
      const result = await fetchWithCache(absolutePath)
      return result.exists
    }
    const file = await this._read(absolutePath)
    return file.exists
  }
  async read(absolutePath) {
    const file = await this._read(absolutePath)
    return file.content
  }
  async list(folder) {
    if (isUrl(folder)) {
      return [] // URLs don't support directory listing
    }
    return Disk.getFiles(folder)
  }
  async write(fullPath, content) {
    if (isUrl(fullPath)) {
      throw new Error("Cannot write to URL")
    }
    Disk.writeIfChanged(fullPath, content)
  }
  async getMTime(absolutePath) {
    if (isUrl(absolutePath)) {
      const cached = urlCache[absolutePath]
      return cached ? cached.timestamp : Date.now()
    }
    const file = await this._read(absolutePath)
    return file.stats.mtimeMs
  }
  async getCTime(absolutePath) {
    if (isUrl(absolutePath)) {
      const cached = urlCache[absolutePath]
      return cached ? cached.timestamp : Date.now()
    }
    const file = await this._read(absolutePath)
    return file.stats.ctimeMs
  }
  dirname(absolutePath) {
    if (isUrl(absolutePath)) {
      return absolutePath.substring(0, absolutePath.lastIndexOf("/"))
    }
    return path.dirname(absolutePath)
  }
  join(...segments) {
    const firstSegment = segments[0]
    if (isUrl(firstSegment)) {
      // For URLs, we need to handle joining differently
      const baseUrl = firstSegment.endsWith("/") ? firstSegment : firstSegment + "/"
      return new URL(segments.slice(1).join("/"), baseUrl).toString()
    }
    return path.join(...segments)
  }
}
// Update MemoryWriter to support URLs
class MemoryWriter {
  constructor(inMemoryFiles) {
    this.inMemoryFiles = inMemoryFiles
  }
  async read(absolutePath) {
    if (isUrl(absolutePath)) {
      const result = await fetchWithCache(absolutePath)
      return result.content
    }
    const value = this.inMemoryFiles[absolutePath]
    if (value === undefined) {
      return ""
    }
    return value
  }
  async exists(absolutePath) {
    if (isUrl(absolutePath)) {
      const result = await fetchWithCache(absolutePath)
      return result.exists
    }
    return this.inMemoryFiles[absolutePath] !== undefined
  }
  async write(absolutePath, content) {
    if (isUrl(absolutePath)) {
      throw new Error("Cannot write to URL")
    }
    this.inMemoryFiles[absolutePath] = content
  }
  async list(absolutePath) {
    if (isUrl(absolutePath)) {
      return []
    }
    return Object.keys(this.inMemoryFiles).filter(filePath => filePath.startsWith(absolutePath) && !filePath.replace(absolutePath, "").includes("/"))
  }
  async getMTime(absolutePath) {
    if (isUrl(absolutePath)) {
      const cached = urlCache[absolutePath]
      return cached ? cached.timestamp : Date.now()
    }
    return 1
  }
  async getCTime(absolutePath) {
    if (isUrl(absolutePath)) {
      const cached = urlCache[absolutePath]
      return cached ? cached.timestamp : Date.now()
    }
    return 1
  }
  dirname(path) {
    if (isUrl(path)) {
      return path.substring(0, path.lastIndexOf("/"))
    }
    return Utils.posix.dirname(path)
  }
  join(...segments) {
    const firstSegment = segments[0]
    if (isUrl(firstSegment)) {
      const baseUrl = firstSegment.endsWith("/") ? firstSegment : firstSegment + "/"
      return new URL(segments.slice(1).join("/"), baseUrl).toString()
    }
    return Utils.posix.join(...segments)
  }
}
class EmptyScrollParser extends Particle {
  setFile(fusionFile) {
    this.file = fusionFile
  }
}
class FusionFile {
  constructor(codeAtStart, absoluteFilePath = "", fileSystem = new Fusion({})) {
    this.defaultParserCode = ""
    this.defaultParser = EmptyScrollParser
    this.fileSystem = fileSystem
    this.filePath = absoluteFilePath
    this.codeAtStart = codeAtStart
    this.timeIndex = 0
    this.timestamp = 0
    this.importOnly = false
  }
  async readCodeFromStorage() {
    if (this.codeAtStart !== undefined) return this // Code provided
    const { filePath } = this
    if (!filePath) {
      this.codeAtStart = ""
      return this
    }
    this.codeAtStart = await this.fileSystem.read(filePath)
  }
  get isFused() {
    return this.fusedCode !== undefined
  }
  async fuse() {
    // PASS 1: READ FULL FILE
    await this.readCodeFromStorage()
    const { codeAtStart, fileSystem, filePath, defaultParserCode, defaultParser } = this
    // PASS 2: READ AND REPLACE IMPORTs
    let fusedCode = codeAtStart
    let fusedFile
    if (filePath) {
      this.timestamp = await fileSystem.getCTime(filePath)
      fusedFile = await fileSystem.fuseFile(filePath, defaultParserCode)
      this.importOnly = fusedFile.isImportOnly
      fusedCode = fusedFile.fused
      if (fusedFile.footers) fusedCode += "\n" + fusedFile.footers.join("\n")
      this.dependencies = fusedFile.importFilePaths
      this.fusedFile = fusedFile
    }
    this.fusedCode = fusedCode
    this.parser = (fusedFile === null || fusedFile === void 0 ? void 0 : fusedFile.parser) || defaultParser
    // PASS 3: PARSER WITH CUSTOM PARSER OR STANDARD SCROLL PARSER
    this.scrollProgram = new this.parser(fusedCode, filePath)
    this.scrollProgram.setFile(this)
    return this
  }
  get formatted() {
    return this.codeAtStart
  }
  async formatAndSave() {
    const { codeAtStart, formatted } = this
    if (codeAtStart === formatted) return false
    await this.fileSystem.write(this.filePath, formatted)
    return true
  }
}
let fusionIdNumber = 0
class Fusion {
  constructor(inMemoryFiles) {
    this.productCache = []
    this._particleCache = {}
    this._parserCache = {}
    this._parsersExpandersCache = {}
    this._pendingFuseRequests = {}
    this.defaultFileClass = FusionFile
    this.parsedFiles = {}
    this.folderCache = {}
    if (inMemoryFiles) this._storage = new MemoryWriter(inMemoryFiles)
    else this._storage = new DiskWriter()
    fusionIdNumber = fusionIdNumber + 1
    this.fusionId = fusionIdNumber
  }
  async read(absolutePath) {
    return await this._storage.read(absolutePath)
  }
  async exists(absolutePath) {
    return await this._storage.exists(absolutePath)
  }
  async write(absolutePath, content) {
    return await this._storage.write(absolutePath, content)
  }
  async list(absolutePath) {
    return await this._storage.list(absolutePath)
  }
  dirname(absolutePath) {
    return this._storage.dirname(absolutePath)
  }
  join(...segments) {
    return this._storage.join(...segments)
  }
  async getMTime(absolutePath) {
    return await this._storage.getMTime(absolutePath)
  }
  async getCTime(absolutePath) {
    return await this._storage.getCTime(absolutePath)
  }
  async writeProduct(absolutePath, content) {
    this.productCache.push(absolutePath)
    return await this.write(absolutePath, content)
  }
  async _getFileAsParticles(absoluteFilePathOrUrl) {
    const { _particleCache } = this
    if (_particleCache[absoluteFilePathOrUrl] === undefined) {
      const content = await this._storage.read(absoluteFilePathOrUrl)
      _particleCache[absoluteFilePathOrUrl] = new Particle(content)
    }
    return _particleCache[absoluteFilePathOrUrl]
  }
  getImports(particle, absoluteFilePathOrUrl, importStack) {
    const folder = this.dirname(absoluteFilePathOrUrl)
    const results = particle
      .filter(particle => particle.getLine().match(importRegex))
      .map(async importParticle => {
        const rawPath = importParticle.getLine().replace("import ", "")
        let absoluteImportFilePath = this.join(folder, rawPath)
        if (isUrl(rawPath)) absoluteImportFilePath = rawPath
        else if (isUrl(folder)) absoluteImportFilePath = folder + "/" + rawPath
        if (importStack.includes(absoluteImportFilePath) || absoluteImportFilePath === absoluteFilePathOrUrl) {
          const circularImportError = `Circular import detected: ${[...importStack, absoluteImportFilePath].join(" -> ")}`
          return {
            expandedFile: circularImportError,
            exists: true,
            absoluteImportFilePath,
            importParticle,
            circularImportError,
            lineCount: particle.numberOfLines
          }
        }
        const expandedFile = await this._fuseFile(absoluteImportFilePath, [...importStack, absoluteFilePathOrUrl])
        const exists = await this.exists(absoluteImportFilePath)
        return {
          expandedFile,
          exists,
          absoluteImportFilePath,
          importParticle,
          lineCount: expandedFile.lineCount
        }
      })
    return Promise.all(results)
  }
  async _fuseFile(absoluteFilePathOrUrl, importStack) {
    const { _pendingFuseRequests } = this
    if (_pendingFuseRequests[absoluteFilePathOrUrl]) return _pendingFuseRequests[absoluteFilePathOrUrl]
    _pendingFuseRequests[absoluteFilePathOrUrl] = this._fuseFile2(absoluteFilePathOrUrl, importStack)
    return _pendingFuseRequests[absoluteFilePathOrUrl]
  }
  async _fuseFile2(absoluteFilePathOrUrl, importStack) {
    const [code, exists] = await Promise.all([this.read(absoluteFilePathOrUrl), this.exists(absoluteFilePathOrUrl)])
    const isImportOnly = importOnlyRegex.test(code)
    // Perf hack
    // If its a parsers file, it will have no content, just parsers (and maybe imports).
    // The parsers will already have been processed. We can skip them
    const stripParsers = absoluteFilePathOrUrl.endsWith(PARSERS_EXTENSION)
    let processedCode = stripParsers
      ? code
          .split("\n")
          .filter(line => importRegex.test(line))
          .join("\n")
      : code
    const lineCount = (processedCode.match(/\n/g) || []).length + 1
    let filepathsWithParserDefinitions
    if (await this._doesFileHaveParsersDefinitions(absoluteFilePathOrUrl)) {
      filepathsWithParserDefinitions = [absoluteFilePathOrUrl]
    }
    if (!importRegex.test(processedCode)) {
      return {
        fused: processedCode,
        isImportOnly,
        filepathsWithParserDefinitions,
        exists,
        lineCount
      }
    }
    const particle = new Particle(processedCode)
    // Fetch all imports in parallel
    const imported = await this.getImports(particle, absoluteFilePathOrUrl, importStack)
    // Assemble all imports
    let importFilePaths = []
    let footers
    let hasCircularImportError = false
    imported.forEach(importResults => {
      const { importParticle, absoluteImportFilePath, expandedFile, exists, circularImportError, lineCount } = importResults
      importFilePaths.push(absoluteImportFilePath)
      if (expandedFile.importFilePaths) importFilePaths = importFilePaths.concat(expandedFile.importFilePaths)
      const originalLine = importParticle.getLine()
      importParticle.setLine("imported " + absoluteImportFilePath)
      importParticle.set("exists", `${exists}`)
      importParticle.set("original", `${originalLine}`)
      importParticle.set("lines", `${lineCount}`)
      if (circularImportError) {
        hasCircularImportError = true
        importParticle.set("circularImportError", circularImportError)
      }
      if (expandedFile.footers) footers = (footers || []).concat(expandedFile.footers)
      if (importParticle.has("footer")) {
        footers = footers || []
        footers.push(expandedFile.fused)
      } else importParticle.insertLinesAfter(expandedFile.fused)
    })
    const existStates = await Promise.all(importFilePaths.map(file => this.exists(file)))
    const allImportsExist = !existStates.some(exists => !exists)
    const importFilepathsWithParserDefinitions = (
      await Promise.all(
        importFilePaths.map(async filename => ({
          filename,
          hasParser: await this._doesFileHaveParsersDefinitions(filename)
        }))
      )
    )
      .filter(result => result.hasParser)
      .map(result => result.filename)
    // todo: add tests for this
    if (importFilepathsWithParserDefinitions.length) {
      filepathsWithParserDefinitions = (filepathsWithParserDefinitions || []).concat(importFilepathsWithParserDefinitions)
    }
    return {
      importFilePaths,
      isImportOnly,
      fused: particle.toString(),
      lineCount,
      footers,
      circularImportError: hasCircularImportError,
      exists: allImportsExist,
      filepathsWithParserDefinitions
    }
  }
  async _doesFileHaveParsersDefinitions(absoluteFilePathOrUrl) {
    if (!absoluteFilePathOrUrl) return false
    const { _parsersExpandersCache } = this
    if (_parsersExpandersCache[absoluteFilePathOrUrl] === undefined) {
      const content = await this._storage.read(absoluteFilePathOrUrl)
      _parsersExpandersCache[absoluteFilePathOrUrl] = !!content.match(parserRegex)
    }
    return _parsersExpandersCache[absoluteFilePathOrUrl]
  }
  async _getOneParsersParserFromFiles(filePaths, baseParsersCode) {
    const fileContents = await Promise.all(filePaths.map(async filePath => await this._storage.read(filePath)))
    return Fusion.combineParsers(filePaths, fileContents, baseParsersCode)
  }
  async getParser(filePaths, baseParsersCode = "") {
    const { _parserCache } = this
    const key = filePaths
      .filter(fp => fp)
      .sort()
      .join("\n")
    const hit = _parserCache[key]
    if (hit) return await hit
    _parserCache[key] = this._getOneParsersParserFromFiles(filePaths, baseParsersCode)
    return await _parserCache[key]
  }
  static combineParsers(filePaths, fileContents, baseParsersCode = "") {
    const parserDefinitionRegex = /^[a-zA-Z0-9_]+Parser$/
    const atomDefinitionRegex = /^[a-zA-Z0-9_]+Atom/
    const mapped = fileContents.map((content, index) => {
      const filePath = filePaths[index]
      if (filePath.endsWith(PARSERS_EXTENSION)) return content
      return new Particle(content)
        .filter(particle => particle.getLine().match(parserDefinitionRegex) || particle.getLine().match(atomDefinitionRegex))
        .map(particle => particle.asString)
        .join("\n")
    })
    const asOneFile = mapped.join("\n").trim()
    const sorted = new parsersParser(baseParsersCode + "\n" + asOneFile)._sortParticlesByInScopeOrder()._sortWithParentParsersUpTop()
    const parsersCode = sorted.asString
    return {
      parsersParser: sorted,
      parsersCode,
      parser: new HandParsersProgram(parsersCode).compileAndReturnRootParser()
    }
  }
  get parsers() {
    return Object.values(this._parserCache).map(parser => parser.parsersParser)
  }
  async fuseFile(absoluteFilePathOrUrl, defaultParserCode) {
    const fusedFile = await this._fuseFile(absoluteFilePathOrUrl, [])
    if (!defaultParserCode) return fusedFile
    if (fusedFile.filepathsWithParserDefinitions) {
      const parser = await this.getParser(fusedFile.filepathsWithParserDefinitions, defaultParserCode)
      fusedFile.parser = parser.parser
    }
    return fusedFile
  }
  async getLoadedFile(filePath) {
    return await this._getLoadedFile(filePath, this.defaultFileClass)
  }
  async _getLoadedFile(absolutePath, parser) {
    if (this.parsedFiles[absolutePath]) return this.parsedFiles[absolutePath]
    const file = new parser(undefined, absolutePath, this)
    await file.fuse()
    this.parsedFiles[absolutePath] = file
    return file
  }
  getCachedLoadedFilesInFolder(folderPath, requester) {
    folderPath = Utils.ensureFolderEndsInSlash(folderPath)
    const hit = this.folderCache[folderPath]
    if (!hit) console.log(`Warning: '${folderPath}' not yet loaded in '${this.fusionId}'. Requested by '${requester.filePath}'`)
    return hit || []
  }
  makeSourceMap(fileName, fusedCode) {
    const fileStack = [{ fileName, lineNumber: 0, linesLeft: fusedCode.split("\n").length }]
    return new Particle(fusedCode)
      .map(particle => {
        const currentFile = fileStack[fileStack.length - 1]
        currentFile.lineNumber++
        currentFile.linesLeft--
        if (particle.cue === "imported") {
          const linesLeft = parseInt(particle.get("lines"))
          const original = particle.get("original")
          fileStack.push({ fileName: particle.atoms[1], lineNumber: 0, linesLeft })
          return `${currentFile.fileName}:${currentFile.lineNumber} ${original}\n` + particle.map(line => `${currentFile.fileName}:${currentFile.lineNumber}  ${line}`).join("\n")
        }
        if (!currentFile.linesLeft) fileStack.pop()
        return particle
          .toString()
          .split("\n")
          .map((line, index) => {
            if (index) {
              currentFile.lineNumber++
              currentFile.linesLeft--
            }
            return `${currentFile.fileName}:${currentFile.lineNumber} ${line}`
          })
          .join("\n")
      })
      .join("\n")
  }
  // todo: this is weird. i know we evolved our way here but we should step back and clean this up.
  async getLoadedFilesInFolder(folderPath, extension) {
    folderPath = Utils.ensureFolderEndsInSlash(folderPath)
    if (this.folderCache[folderPath]) return this.folderCache[folderPath]
    const allFiles = await this.list(folderPath)
    const loadedFiles = await Promise.all(allFiles.filter(file => file.endsWith(extension)).map(filePath => this.getLoadedFile(filePath)))
    const sorted = loadedFiles.sort((a, b) => b.timestamp - a.timestamp)
    sorted.forEach((file, index) => (file.timeIndex = index))
    this.folderCache[folderPath] = sorted
    return this.folderCache[folderPath]
  }
}
window.Fusion = Fusion
window.FusionFile = FusionFile
;

{
  class stumpParser extends ParserBackedParticle {
    createParserPool() {
      return new Particle.ParserPool(
        errorParser,
        Object.assign(Object.assign({}, super.createParserPool()._getCueMapAsObject()), {
          blockquote: htmlTagParser,
          colgroup: htmlTagParser,
          datalist: htmlTagParser,
          fieldset: htmlTagParser,
          menuitem: htmlTagParser,
          noscript: htmlTagParser,
          optgroup: htmlTagParser,
          progress: htmlTagParser,
          styleTag: htmlTagParser,
          template: htmlTagParser,
          textarea: htmlTagParser,
          titleTag: htmlTagParser,
          address: htmlTagParser,
          article: htmlTagParser,
          caption: htmlTagParser,
          details: htmlTagParser,
          section: htmlTagParser,
          summary: htmlTagParser,
          button: htmlTagParser,
          canvas: htmlTagParser,
          dialog: htmlTagParser,
          figure: htmlTagParser,
          footer: htmlTagParser,
          header: htmlTagParser,
          hgroup: htmlTagParser,
          iframe: htmlTagParser,
          keygen: htmlTagParser,
          legend: htmlTagParser,
          object: htmlTagParser,
          option: htmlTagParser,
          output: htmlTagParser,
          script: htmlTagParser,
          select: htmlTagParser,
          source: htmlTagParser,
          strong: htmlTagParser,
          aside: htmlTagParser,
          embed: htmlTagParser,
          input: htmlTagParser,
          label: htmlTagParser,
          meter: htmlTagParser,
          param: htmlTagParser,
          small: htmlTagParser,
          table: htmlTagParser,
          tbody: htmlTagParser,
          tfoot: htmlTagParser,
          thead: htmlTagParser,
          track: htmlTagParser,
          video: htmlTagParser,
          abbr: htmlTagParser,
          area: htmlTagParser,
          base: htmlTagParser,
          body: htmlTagParser,
          code: htmlTagParser,
          form: htmlTagParser,
          head: htmlTagParser,
          html: htmlTagParser,
          link: htmlTagParser,
          main: htmlTagParser,
          mark: htmlTagParser,
          menu: htmlTagParser,
          meta: htmlTagParser,
          ruby: htmlTagParser,
          samp: htmlTagParser,
          span: htmlTagParser,
          time: htmlTagParser,
          bdi: htmlTagParser,
          bdo: htmlTagParser,
          col: htmlTagParser,
          del: htmlTagParser,
          dfn: htmlTagParser,
          div: htmlTagParser,
          img: htmlTagParser,
          ins: htmlTagParser,
          kbd: htmlTagParser,
          map: htmlTagParser,
          nav: htmlTagParser,
          pre: htmlTagParser,
          rtc: htmlTagParser,
          sub: htmlTagParser,
          sup: htmlTagParser,
          var: htmlTagParser,
          wbr: htmlTagParser,
          br: htmlTagParser,
          dd: htmlTagParser,
          dl: htmlTagParser,
          dt: htmlTagParser,
          em: htmlTagParser,
          h1: htmlTagParser,
          h2: htmlTagParser,
          h3: htmlTagParser,
          h4: htmlTagParser,
          h5: htmlTagParser,
          h6: htmlTagParser,
          hr: htmlTagParser,
          li: htmlTagParser,
          ol: htmlTagParser,
          rb: htmlTagParser,
          rp: htmlTagParser,
          rt: htmlTagParser,
          td: htmlTagParser,
          th: htmlTagParser,
          tr: htmlTagParser,
          ul: htmlTagParser,
          a: htmlTagParser,
          b: htmlTagParser,
          i: htmlTagParser,
          p: htmlTagParser,
          q: htmlTagParser,
          s: htmlTagParser,
          u: htmlTagParser
        }),
        [
          { regex: /^$/, parser: blankLineParser },
          { regex: /^[a-zA-Z0-9_]+Component/, parser: componentDefinitionParser }
        ]
      )
    }
    compile() {
      return this.asHtml
    }
    _getHtmlJoinByCharacter() {
      return ""
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// Atom parsers
anyAtom
cueAtom
emptyAtom
extraAtom
 paint invalid
anyHtmlContentAtom
 paint string
attributeValueAtom
 paint constant.language
componentTagNameAtom
 paint variable.function
 extends cueAtom
htmlTagNameAtom
 paint variable.function
 extends cueAtom
 enum a abbr address area article aside b base bdi bdo blockquote body br button canvas caption code col colgroup datalist dd del details dfn dialog div dl dt em embed fieldset figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rb rp rt rtc ruby s samp script section select small source span strong styleTag sub summary sup table tbody td template textarea tfoot th thead time titleTag tr track u ul var video wbr
htmlAttributeNameAtom
 paint entity.name.type
 extends cueAtom
 enum accept accept-charset accesskey action align alt async autocomplete autofocus autoplay bgcolor border charset checked class color cols colspan content contenteditable controls coords datetime default defer dir dirname disabled download draggable dropzone enctype for formaction headers height hidden high href hreflang http-equiv id ismap kind lang list loop low max maxlength media method min multiple muted name novalidate onabort onafterprint onbeforeprint onbeforeunload onblur oncanplay oncanplaythrough onchange onclick oncontextmenu oncopy oncuechange oncut ondblclick ondrag ondragend ondragenter ondragleave ondragover ondragstart ondrop ondurationchange onemptied onended onerror onfocus onhashchange oninput oninvalid onkeydown onkeypress onkeyup onload onloadeddata onloadedmetadata onloadstart onmousedown onmousemove onmouseout onmouseover onmouseup onmousewheel onoffline ononline onpagehide onpageshow onpaste onpause onplay onplaying onpopstate onprogress onratechange onreset onresize onscroll onsearch onseeked onseeking onselect onstalled onstorage onsubmit onsuspend ontimeupdate ontoggle onunload onvolumechange onwaiting onwheel open optimum pattern placeholder poster preload property readonly rel required reversed rows rowspan sandbox scope selected shape size sizes spellcheck src srcdoc srclang srcset start step style tabindex target title translate type usemap value width wrap
bernKeywordAtom
 enum bern
 extends cueAtom

// Line parsers
stumpParser
 root
 description A prefix Language that compiles to HTML.
 catchAllParser errorParser
 inScope htmlTagParser blankLineParser
 example
  div
   h1 hello world
 javascript
  compile() {
   return this.asHtml
  }
  _getHtmlJoinByCharacter() {
    return ""
  }
blankLineParser
 pattern ^$
 tags doNotSynthesize
 atoms emptyAtom
 javascript
  _toHtml() {
   return ""
  }
  getTextContent() {return ""}
htmlTagParser
 inScope bernParser htmlTagParser htmlAttributeParser blankLineParser
 catchAllAtomType anyHtmlContentAtom
 atoms htmlTagNameAtom
 javascript
  isHtmlTagParser = true
  getTag() {
   // we need to remove the "Tag" bit to handle the style and title attribute/tag conflict.
   const cue = this.cue
   const map = {
    titleTag: "title",
    styleTag: "style"
   }
   return map[cue] || cue
  }
  _getHtmlJoinByCharacter() {
   return ""
  }
  asHtmlWithSuids() {
   return this._toHtml(undefined, true)
  }
  _getOneLiner() {
   const oneLinerAtoms = this.getAtomsFrom(1)
   return oneLinerAtoms.length ? oneLinerAtoms.join(" ") : ""
  }
  getTextContent() {
    return this._getOneLiner()
  }
  shouldCollapse() {
   return this.has("collapse")
  }
  get domElement() {
    var elem = document.createElement(this.getTag())
    elem.setAttribute("stumpUid", this._getUid())
    this.filter(particle => particle.isAttributeParser)
      .forEach(subparticle => elem.setAttribute(subparticle.cue, subparticle.content))
    elem.innerHTML = this.has("bern") ? this.getParticle("bern").subparticlesToString() : this._getOneLiner()
    this.filter(particle => particle.isHtmlTagParser)
      .forEach(subparticle => elem.appendChild(subparticle.domElement))
    return elem
  }
  _toHtml(indentCount, withSuid) {
   const tag = this.getTag()
   const children = this.map(child => child._toHtml(indentCount + 1, withSuid)).join("")
   const attributesStr = this.filter(particle => particle.isAttributeParser)
    .map(child => child.getAttribute())
    .join("")
   const indent = " ".repeat(indentCount)
   const collapse = this.shouldCollapse()
   const indentForChildParsers = !collapse && this.getSubparticleInstancesOfParserId("htmlTagParser").length > 0
   const suid = withSuid ? \` stumpUid="\${this._getUid()}"\` : ""
   const oneLiner = this._getOneLiner()
   return \`\${!collapse ? indent : ""}<\${tag}\${attributesStr}\${suid}>\${oneLiner}\${indentForChildParsers ? "\\n" : ""}\${children}</\${tag}>\${collapse ? "" : "\\n"}\`
  }
  removeCssStumpParticle() {
   return this.removeStumpParticle()
  }
  removeStumpParticle() {
   this.getShadow().removeShadow()
   return this.destroy()
  }
  getParticleByGuid(guid) {
   return this.topDownArray.find(particle => particle._getUid() === guid)
  }
  addClassToStumpParticle(className) {
   const classParser = this.touchParticle("class")
   const atoms = classParser.getAtomsFrom(1)
   // note: we call add on shadow regardless, because at the moment stump may have gotten out of
   // sync with shadow, if things modified the dom. todo: cleanup.
   this.getShadow().addClassToShadow(className)
   if (atoms.includes(className)) return this
   atoms.push(className)
   classParser.setContent(atoms.join(this.atomBreakSymbol))
   return this
  }
  removeClassFromStumpParticle(className) {
   const classParser = this.getParticle("class")
   if (!classParser) return this
   const newClasses = classParser.atoms.filter(atom => atom !== className)
   if (!newClasses.length) classParser.destroy()
   else classParser.setContent(newClasses.join(" "))
   this.getShadow().removeClassFromShadow(className)
   return this
  }
  stumpParticleHasClass(className) {
   const classParser = this.getParticle("class")
   return classParser && classParser.atoms.includes(className) ? true : false
  }
  isStumpParticleCheckbox() {
   return this.get("type") === "checkbox"
  }
  getShadow() {
   if (!this._shadow) {
    const shadowClass = this.getShadowClass()
    this._shadow = new shadowClass(this)
   }
   return this._shadow
  }
  insertCssChildParticle(text, index) {
   return this.insertChildParticle(text, index)
  }
  insertChildParticle(text, index) {
   const singleParticle = new Particle(text).getSubparticles()[0]
   const newParticle = this.insertLineAndSubparticles(singleParticle.getLine(), singleParticle.subparticlesToString(), index)
   const stumpParserIndex = this.filter(particle => particle.isHtmlTagParser).indexOf(newParticle)
   this.getShadow().insertHtmlParticle(newParticle, stumpParserIndex)
   return newParticle
  }
  isInputType() {
   return ["input", "textarea"].includes(this.getTag()) || this.get("contenteditable") === "true"
  }
  findStumpParticleByChild(line) {
   return this.findStumpParticlesByChild(line)[0]
  }
  findStumpParticleByChildString(line) {
   return this.topDownArray.find(particle =>
    particle
     .map(subparticle => subparticle.getLine())
     .join("\\n")
     .includes(line)
   )
  }
  findStumpParticleByCue(cue) {
   return this._findStumpParticlesByBase(cue)[0]
  }
  _findStumpParticlesByBase(cue) {
   return this.topDownArray.filter(particle => particle.doesExtend("htmlTagParser") && particle.cue === cue)
  }
  hasLine(line) {
   return this.getSubparticles().some(particle => particle.getLine() === line)
  }
  findStumpParticlesByChild(line) {
   return this.topDownArray.filter(particle => particle.doesExtend("htmlTagParser") && particle.hasLine(line))
  }
  findStumpParticlesWithClass(className) {
   return this.topDownArray.filter(
    particle =>
     particle.doesExtend("htmlTagParser") &&
     particle.has("class") &&
     particle
      .getParticle("class")
      .atoms
      .includes(className)
   )
  }
  getShadowClass() {
   return this.parent.getShadowClass()
  }
  // todo: should not be here
  getStumpParticleParticleComponent() {
   return this._particleComponent || this.parent.getStumpParticleParticleComponent()
  }
  // todo: should not be here
  setStumpParticleParticleComponent(particleComponent) {
   this._particleComponent = particleComponent
   return this
  }
  getStumpParticleCss(prop) {
   return this.getShadow().getShadowCss(prop)
  }
  getStumpParticleAttr(key) {
   return this.get(key)
  }
  setStumpParticleAttr(key, value) {
   // todo
   return this
  }
  get asHtml() {
   return this._toHtml()
  }
errorParser
 baseParser errorParser
componentDefinitionParser
 extends htmlTagParser
 pattern ^[a-zA-Z0-9_]+Component
 atoms componentTagNameAtom
 javascript
  getTag() {
   return "div"
  }
htmlAttributeParser
 javascript
  _toHtml() {
   return ""
  }
  getTextContent() {return ""}
  getAttribute() {
   return \` \${this.cue}="\${this.content}"\`
  }
 boolean isAttributeParser true
 boolean isTileAttribute true
 catchAllParser errorParser
 catchAllAtomType attributeValueAtom
 atoms htmlAttributeNameAtom
stumpExtendedAttributeNameAtom
 extends htmlAttributeNameAtom
 enum collapse blurCommand changeCommand clickCommand contextMenuCommand doubleClickCommand keyUpCommand lineClickCommand lineShiftClickCommand shiftClickCommand
stumpExtendedAttributeParser
 description Parser types not present in HTML but included in stump.
 extends htmlAttributeParser
 atoms stumpExtendedAttributeNameAtom
lineOfHtmlContentParser
 boolean isTileAttribute true
 catchAllParser lineOfHtmlContentParser
 catchAllAtomType anyHtmlContentAtom
 javascript
  getTextContent() {return this.getLine()}
bernParser
 boolean isTileAttribute true
 // todo Rename this particle type
 description This is a particle where you can put any HTML content. It is called "bern" until someone comes up with a better name.
 catchAllParser lineOfHtmlContentParser
 javascript
  _toHtml() {
   return this.subparticlesToString()
  }
  getTextContent() {return ""}
 atoms bernKeywordAtom`)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = stumpParser
  }

  class blankLineParser extends ParserBackedParticle {
    get emptyAtom() {
      return this.getAtom(0)
    }
    _toHtml() {
      return ""
    }
    getTextContent() {
      return ""
    }
  }

  class htmlTagParser extends ParserBackedParticle {
    createParserPool() {
      return new Particle.ParserPool(
        undefined,
        Object.assign(Object.assign({}, super.createParserPool()._getCueMapAsObject()), {
          blockquote: htmlTagParser,
          colgroup: htmlTagParser,
          datalist: htmlTagParser,
          fieldset: htmlTagParser,
          menuitem: htmlTagParser,
          noscript: htmlTagParser,
          optgroup: htmlTagParser,
          progress: htmlTagParser,
          styleTag: htmlTagParser,
          template: htmlTagParser,
          textarea: htmlTagParser,
          titleTag: htmlTagParser,
          address: htmlTagParser,
          article: htmlTagParser,
          caption: htmlTagParser,
          details: htmlTagParser,
          section: htmlTagParser,
          summary: htmlTagParser,
          button: htmlTagParser,
          canvas: htmlTagParser,
          dialog: htmlTagParser,
          figure: htmlTagParser,
          footer: htmlTagParser,
          header: htmlTagParser,
          hgroup: htmlTagParser,
          iframe: htmlTagParser,
          keygen: htmlTagParser,
          legend: htmlTagParser,
          object: htmlTagParser,
          option: htmlTagParser,
          output: htmlTagParser,
          script: htmlTagParser,
          select: htmlTagParser,
          source: htmlTagParser,
          strong: htmlTagParser,
          aside: htmlTagParser,
          embed: htmlTagParser,
          input: htmlTagParser,
          label: htmlTagParser,
          meter: htmlTagParser,
          param: htmlTagParser,
          small: htmlTagParser,
          table: htmlTagParser,
          tbody: htmlTagParser,
          tfoot: htmlTagParser,
          thead: htmlTagParser,
          track: htmlTagParser,
          video: htmlTagParser,
          abbr: htmlTagParser,
          area: htmlTagParser,
          base: htmlTagParser,
          body: htmlTagParser,
          code: htmlTagParser,
          form: htmlTagParser,
          head: htmlTagParser,
          html: htmlTagParser,
          link: htmlTagParser,
          main: htmlTagParser,
          mark: htmlTagParser,
          menu: htmlTagParser,
          meta: htmlTagParser,
          ruby: htmlTagParser,
          samp: htmlTagParser,
          span: htmlTagParser,
          time: htmlTagParser,
          bdi: htmlTagParser,
          bdo: htmlTagParser,
          col: htmlTagParser,
          del: htmlTagParser,
          dfn: htmlTagParser,
          div: htmlTagParser,
          img: htmlTagParser,
          ins: htmlTagParser,
          kbd: htmlTagParser,
          map: htmlTagParser,
          nav: htmlTagParser,
          pre: htmlTagParser,
          rtc: htmlTagParser,
          sub: htmlTagParser,
          sup: htmlTagParser,
          var: htmlTagParser,
          wbr: htmlTagParser,
          br: htmlTagParser,
          dd: htmlTagParser,
          dl: htmlTagParser,
          dt: htmlTagParser,
          em: htmlTagParser,
          h1: htmlTagParser,
          h2: htmlTagParser,
          h3: htmlTagParser,
          h4: htmlTagParser,
          h5: htmlTagParser,
          h6: htmlTagParser,
          hr: htmlTagParser,
          li: htmlTagParser,
          ol: htmlTagParser,
          rb: htmlTagParser,
          rp: htmlTagParser,
          rt: htmlTagParser,
          td: htmlTagParser,
          th: htmlTagParser,
          tr: htmlTagParser,
          ul: htmlTagParser,
          a: htmlTagParser,
          b: htmlTagParser,
          i: htmlTagParser,
          p: htmlTagParser,
          q: htmlTagParser,
          s: htmlTagParser,
          u: htmlTagParser,
          oncanplaythrough: htmlAttributeParser,
          ondurationchange: htmlAttributeParser,
          onloadedmetadata: htmlAttributeParser,
          contenteditable: htmlAttributeParser,
          "accept-charset": htmlAttributeParser,
          onbeforeunload: htmlAttributeParser,
          onvolumechange: htmlAttributeParser,
          onbeforeprint: htmlAttributeParser,
          oncontextmenu: htmlAttributeParser,
          autocomplete: htmlAttributeParser,
          onafterprint: htmlAttributeParser,
          onhashchange: htmlAttributeParser,
          onloadeddata: htmlAttributeParser,
          onmousewheel: htmlAttributeParser,
          onratechange: htmlAttributeParser,
          ontimeupdate: htmlAttributeParser,
          oncuechange: htmlAttributeParser,
          ondragenter: htmlAttributeParser,
          ondragleave: htmlAttributeParser,
          ondragstart: htmlAttributeParser,
          onloadstart: htmlAttributeParser,
          onmousedown: htmlAttributeParser,
          onmousemove: htmlAttributeParser,
          onmouseover: htmlAttributeParser,
          placeholder: htmlAttributeParser,
          formaction: htmlAttributeParser,
          "http-equiv": htmlAttributeParser,
          novalidate: htmlAttributeParser,
          ondblclick: htmlAttributeParser,
          ondragover: htmlAttributeParser,
          onkeypress: htmlAttributeParser,
          onmouseout: htmlAttributeParser,
          onpagehide: htmlAttributeParser,
          onpageshow: htmlAttributeParser,
          onpopstate: htmlAttributeParser,
          onprogress: htmlAttributeParser,
          spellcheck: htmlAttributeParser,
          accesskey: htmlAttributeParser,
          autofocus: htmlAttributeParser,
          draggable: htmlAttributeParser,
          maxlength: htmlAttributeParser,
          oncanplay: htmlAttributeParser,
          ondragend: htmlAttributeParser,
          onemptied: htmlAttributeParser,
          oninvalid: htmlAttributeParser,
          onkeydown: htmlAttributeParser,
          onmouseup: htmlAttributeParser,
          onoffline: htmlAttributeParser,
          onplaying: htmlAttributeParser,
          onseeking: htmlAttributeParser,
          onstalled: htmlAttributeParser,
          onstorage: htmlAttributeParser,
          onsuspend: htmlAttributeParser,
          onwaiting: htmlAttributeParser,
          translate: htmlAttributeParser,
          autoplay: htmlAttributeParser,
          controls: htmlAttributeParser,
          datetime: htmlAttributeParser,
          disabled: htmlAttributeParser,
          download: htmlAttributeParser,
          dropzone: htmlAttributeParser,
          hreflang: htmlAttributeParser,
          multiple: htmlAttributeParser,
          onchange: htmlAttributeParser,
          ononline: htmlAttributeParser,
          onresize: htmlAttributeParser,
          onscroll: htmlAttributeParser,
          onsearch: htmlAttributeParser,
          onseeked: htmlAttributeParser,
          onselect: htmlAttributeParser,
          onsubmit: htmlAttributeParser,
          ontoggle: htmlAttributeParser,
          onunload: htmlAttributeParser,
          property: htmlAttributeParser,
          readonly: htmlAttributeParser,
          required: htmlAttributeParser,
          reversed: htmlAttributeParser,
          selected: htmlAttributeParser,
          tabindex: htmlAttributeParser,
          bgcolor: htmlAttributeParser,
          charset: htmlAttributeParser,
          checked: htmlAttributeParser,
          colspan: htmlAttributeParser,
          content: htmlAttributeParser,
          default: htmlAttributeParser,
          dirname: htmlAttributeParser,
          enctype: htmlAttributeParser,
          headers: htmlAttributeParser,
          onabort: htmlAttributeParser,
          onclick: htmlAttributeParser,
          onended: htmlAttributeParser,
          onerror: htmlAttributeParser,
          onfocus: htmlAttributeParser,
          oninput: htmlAttributeParser,
          onkeyup: htmlAttributeParser,
          onpaste: htmlAttributeParser,
          onpause: htmlAttributeParser,
          onreset: htmlAttributeParser,
          onwheel: htmlAttributeParser,
          optimum: htmlAttributeParser,
          pattern: htmlAttributeParser,
          preload: htmlAttributeParser,
          rowspan: htmlAttributeParser,
          sandbox: htmlAttributeParser,
          srclang: htmlAttributeParser,
          accept: htmlAttributeParser,
          action: htmlAttributeParser,
          border: htmlAttributeParser,
          coords: htmlAttributeParser,
          height: htmlAttributeParser,
          hidden: htmlAttributeParser,
          method: htmlAttributeParser,
          onblur: htmlAttributeParser,
          oncopy: htmlAttributeParser,
          ondrag: htmlAttributeParser,
          ondrop: htmlAttributeParser,
          onload: htmlAttributeParser,
          onplay: htmlAttributeParser,
          poster: htmlAttributeParser,
          srcdoc: htmlAttributeParser,
          srcset: htmlAttributeParser,
          target: htmlAttributeParser,
          usemap: htmlAttributeParser,
          align: htmlAttributeParser,
          async: htmlAttributeParser,
          class: htmlAttributeParser,
          color: htmlAttributeParser,
          defer: htmlAttributeParser,
          ismap: htmlAttributeParser,
          media: htmlAttributeParser,
          muted: htmlAttributeParser,
          oncut: htmlAttributeParser,
          scope: htmlAttributeParser,
          shape: htmlAttributeParser,
          sizes: htmlAttributeParser,
          start: htmlAttributeParser,
          style: htmlAttributeParser,
          title: htmlAttributeParser,
          value: htmlAttributeParser,
          width: htmlAttributeParser,
          cols: htmlAttributeParser,
          high: htmlAttributeParser,
          href: htmlAttributeParser,
          kind: htmlAttributeParser,
          lang: htmlAttributeParser,
          list: htmlAttributeParser,
          loop: htmlAttributeParser,
          name: htmlAttributeParser,
          open: htmlAttributeParser,
          rows: htmlAttributeParser,
          size: htmlAttributeParser,
          step: htmlAttributeParser,
          type: htmlAttributeParser,
          wrap: htmlAttributeParser,
          alt: htmlAttributeParser,
          dir: htmlAttributeParser,
          for: htmlAttributeParser,
          low: htmlAttributeParser,
          max: htmlAttributeParser,
          min: htmlAttributeParser,
          rel: htmlAttributeParser,
          src: htmlAttributeParser,
          id: htmlAttributeParser,
          lineShiftClickCommand: stumpExtendedAttributeParser,
          contextMenuCommand: stumpExtendedAttributeParser,
          doubleClickCommand: stumpExtendedAttributeParser,
          shiftClickCommand: stumpExtendedAttributeParser,
          lineClickCommand: stumpExtendedAttributeParser,
          changeCommand: stumpExtendedAttributeParser,
          clickCommand: stumpExtendedAttributeParser,
          keyUpCommand: stumpExtendedAttributeParser,
          blurCommand: stumpExtendedAttributeParser,
          collapse: stumpExtendedAttributeParser,
          bern: bernParser
        }),
        [
          { regex: /^$/, parser: blankLineParser },
          { regex: /^[a-zA-Z0-9_]+Component/, parser: componentDefinitionParser }
        ]
      )
    }
    get htmlTagNameAtom() {
      return this.getAtom(0)
    }
    get anyHtmlContentAtom() {
      return this.getAtomsFrom(1)
    }
    isHtmlTagParser = true
    getTag() {
      // we need to remove the "Tag" bit to handle the style and title attribute/tag conflict.
      const cue = this.cue
      const map = {
        titleTag: "title",
        styleTag: "style"
      }
      return map[cue] || cue
    }
    _getHtmlJoinByCharacter() {
      return ""
    }
    asHtmlWithSuids() {
      return this._toHtml(undefined, true)
    }
    _getOneLiner() {
      const oneLinerAtoms = this.getAtomsFrom(1)
      return oneLinerAtoms.length ? oneLinerAtoms.join(" ") : ""
    }
    getTextContent() {
      return this._getOneLiner()
    }
    shouldCollapse() {
      return this.has("collapse")
    }
    get domElement() {
      var elem = document.createElement(this.getTag())
      elem.setAttribute("stumpUid", this._getUid())
      this.filter(particle => particle.isAttributeParser).forEach(subparticle => elem.setAttribute(subparticle.cue, subparticle.content))
      elem.innerHTML = this.has("bern") ? this.getParticle("bern").subparticlesToString() : this._getOneLiner()
      this.filter(particle => particle.isHtmlTagParser).forEach(subparticle => elem.appendChild(subparticle.domElement))
      return elem
    }
    _toHtml(indentCount, withSuid) {
      const tag = this.getTag()
      const children = this.map(child => child._toHtml(indentCount + 1, withSuid)).join("")
      const attributesStr = this.filter(particle => particle.isAttributeParser)
        .map(child => child.getAttribute())
        .join("")
      const indent = " ".repeat(indentCount)
      const collapse = this.shouldCollapse()
      const indentForChildParsers = !collapse && this.getSubparticleInstancesOfParserId("htmlTagParser").length > 0
      const suid = withSuid ? ` stumpUid="${this._getUid()}"` : ""
      const oneLiner = this._getOneLiner()
      return `${!collapse ? indent : ""}<${tag}${attributesStr}${suid}>${oneLiner}${indentForChildParsers ? "\n" : ""}${children}</${tag}>${collapse ? "" : "\n"}`
    }
    removeCssStumpParticle() {
      return this.removeStumpParticle()
    }
    removeStumpParticle() {
      this.getShadow().removeShadow()
      return this.destroy()
    }
    getParticleByGuid(guid) {
      return this.topDownArray.find(particle => particle._getUid() === guid)
    }
    addClassToStumpParticle(className) {
      const classParser = this.touchParticle("class")
      const atoms = classParser.getAtomsFrom(1)
      // note: we call add on shadow regardless, because at the moment stump may have gotten out of
      // sync with shadow, if things modified the dom. todo: cleanup.
      this.getShadow().addClassToShadow(className)
      if (atoms.includes(className)) return this
      atoms.push(className)
      classParser.setContent(atoms.join(this.atomBreakSymbol))
      return this
    }
    removeClassFromStumpParticle(className) {
      const classParser = this.getParticle("class")
      if (!classParser) return this
      const newClasses = classParser.atoms.filter(atom => atom !== className)
      if (!newClasses.length) classParser.destroy()
      else classParser.setContent(newClasses.join(" "))
      this.getShadow().removeClassFromShadow(className)
      return this
    }
    stumpParticleHasClass(className) {
      const classParser = this.getParticle("class")
      return classParser && classParser.atoms.includes(className) ? true : false
    }
    isStumpParticleCheckbox() {
      return this.get("type") === "checkbox"
    }
    getShadow() {
      if (!this._shadow) {
        const shadowClass = this.getShadowClass()
        this._shadow = new shadowClass(this)
      }
      return this._shadow
    }
    insertCssChildParticle(text, index) {
      return this.insertChildParticle(text, index)
    }
    insertChildParticle(text, index) {
      const singleParticle = new Particle(text).getSubparticles()[0]
      const newParticle = this.insertLineAndSubparticles(singleParticle.getLine(), singleParticle.subparticlesToString(), index)
      const stumpParserIndex = this.filter(particle => particle.isHtmlTagParser).indexOf(newParticle)
      this.getShadow().insertHtmlParticle(newParticle, stumpParserIndex)
      return newParticle
    }
    isInputType() {
      return ["input", "textarea"].includes(this.getTag()) || this.get("contenteditable") === "true"
    }
    findStumpParticleByChild(line) {
      return this.findStumpParticlesByChild(line)[0]
    }
    findStumpParticleByChildString(line) {
      return this.topDownArray.find(particle =>
        particle
          .map(subparticle => subparticle.getLine())
          .join("\n")
          .includes(line)
      )
    }
    findStumpParticleByCue(cue) {
      return this._findStumpParticlesByBase(cue)[0]
    }
    _findStumpParticlesByBase(cue) {
      return this.topDownArray.filter(particle => particle.doesExtend("htmlTagParser") && particle.cue === cue)
    }
    hasLine(line) {
      return this.getSubparticles().some(particle => particle.getLine() === line)
    }
    findStumpParticlesByChild(line) {
      return this.topDownArray.filter(particle => particle.doesExtend("htmlTagParser") && particle.hasLine(line))
    }
    findStumpParticlesWithClass(className) {
      return this.topDownArray.filter(particle => particle.doesExtend("htmlTagParser") && particle.has("class") && particle.getParticle("class").atoms.includes(className))
    }
    getShadowClass() {
      return this.parent.getShadowClass()
    }
    // todo: should not be here
    getStumpParticleParticleComponent() {
      return this._particleComponent || this.parent.getStumpParticleParticleComponent()
    }
    // todo: should not be here
    setStumpParticleParticleComponent(particleComponent) {
      this._particleComponent = particleComponent
      return this
    }
    getStumpParticleCss(prop) {
      return this.getShadow().getShadowCss(prop)
    }
    getStumpParticleAttr(key) {
      return this.get(key)
    }
    setStumpParticleAttr(key, value) {
      // todo
      return this
    }
    get asHtml() {
      return this._toHtml()
    }
  }

  class errorParser extends ParserBackedParticle {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  class componentDefinitionParser extends htmlTagParser {
    get componentTagNameAtom() {
      return this.getAtom(0)
    }
    getTag() {
      return "div"
    }
  }

  class htmlAttributeParser extends ParserBackedParticle {
    createParserPool() {
      return new Particle.ParserPool(errorParser, undefined, undefined)
    }
    get htmlAttributeNameAtom() {
      return this.getAtom(0)
    }
    get attributeValueAtom() {
      return this.getAtomsFrom(1)
    }
    get isTileAttribute() {
      return true
    }
    get isAttributeParser() {
      return true
    }
    _toHtml() {
      return ""
    }
    getTextContent() {
      return ""
    }
    getAttribute() {
      return ` ${this.cue}="${this.content}"`
    }
  }

  class stumpExtendedAttributeParser extends htmlAttributeParser {
    get stumpExtendedAttributeNameAtom() {
      return this.getAtom(0)
    }
  }

  class lineOfHtmlContentParser extends ParserBackedParticle {
    createParserPool() {
      return new Particle.ParserPool(lineOfHtmlContentParser, undefined, undefined)
    }
    get anyHtmlContentAtom() {
      return this.getAtomsFrom(0)
    }
    get isTileAttribute() {
      return true
    }
    getTextContent() {
      return this.getLine()
    }
  }

  class bernParser extends ParserBackedParticle {
    createParserPool() {
      return new Particle.ParserPool(lineOfHtmlContentParser, undefined, undefined)
    }
    get bernKeywordAtom() {
      return this.getAtom(0)
    }
    get isTileAttribute() {
      return true
    }
    _toHtml() {
      return this.subparticlesToString()
    }
    getTextContent() {
      return ""
    }
  }

  window.stumpParser = stumpParser
}
;

{
  class hakonParser extends ParserBackedParticle {
    createParserPool() {
      return new Particle.ParserPool(selectorParser, Object.assign(Object.assign({}, super.createParserPool()._getCueMapAsObject()), { comment: commentParser }), undefined)
    }
    getSelector() {
      return ""
    }
    compile() {
      return this.topDownArray
        .filter(particle => particle.isSelectorParser)
        .map(subparticle => subparticle.compile())
        .join("")
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// Atom Parsers
anyAtom
cueAtom
commentKeywordAtom
 extends cueAtom
 paint comment
 enum comment
extraAtom
 paint invalid
cssValueAtom
 paint constant.numeric
selectorAtom
 paint keyword.control
 examples body h1
 // todo add html tags, css and ids selector regexes, etc
vendorPrefixCueAtom
 description Properties like -moz-column-fill
 paint variable.function
 extends cueAtom
propertyNameAtom
 paint variable.function
 // todo Where are these coming from? Can we add a url link
 enum align-content align-items align-self all animation animation-delay animation-direction animation-duration animation-fill-mode animation-iteration-count animation-name animation-play-state animation-timing-function backface-visibility background background-attachment background-blend-mode background-clip background-color background-image background-origin background-position background-repeat background-size border border-bottom border-bottom-color border-bottom-left-radius border-bottom-right-radius border-bottom-style border-bottom-width border-collapse border-color border-image border-image-outset border-image-repeat border-image-slice border-image-source border-image-width border-left border-left-color border-left-style border-left-width border-radius border-right border-right-color border-right-style border-right-width border-spacing border-style border-top border-top-color border-top-left-radius border-top-right-radius border-top-style border-top-width border-width bottom box-shadow box-sizing break-inside caption-side clear clip color column-count column-fill column-gap column-rule column-rule-color column-rule-style column-rule-width column-span column-width columns content counter-increment counter-reset cursor direction display empty-atoms fill filter flex flex-basis flex-direction flex-flow flex-grow flex-shrink flex-wrap float font @font-face font-family font-size font-size-adjust font-stretch font-style font-variant font-weight  hanging-punctuation height hyphens justify-content @keyframes left letter-spacing line-height list-style list-style-image list-style-position list-style-type margin margin-bottom margin-left margin-right margin-top max-height max-width @media min-height min-width nav-down nav-index nav-left nav-right nav-up opacity order outline outline-color outline-offset outline-style outline-width overflow overflow-x overflow-y padding padding-bottom padding-left padding-right padding-top page-break-after page-break-before page-break-inside perspective perspective-origin position quotes resize right tab-size table-layout text-align text-align-last text-decoration text-decoration-color text-decoration-line text-decoration-style text-indent text-justify text-overflow text-shadow text-transform top transform transform-origin transform-style transition transition-delay transition-duration transition-property transition-timing-function unicode-bidi vertical-align visibility white-space width atom-break atom-spacing atom-wrap z-index overscroll-behavior-x user-select -ms-touch-action -webkit-user-select -webkit-touch-callout -moz-user-select touch-action -ms-user-select -khtml-user-select gap grid-auto-flow grid-column grid-column-end grid-column-gap grid-column-start grid-gap grid-row grid-row-end grid-row-gap grid-row-start grid-template-columns grid-template-rows justify-items justify-self
errorAtom
 paint invalid
commentAtom
 paint comment

// Line Parsers
hakonParser
 root
 // todo Add variables?
 description A prefix Language that compiles to CSS
 inScope commentParser
 catchAllParser selectorParser
 javascript
  getSelector() {
   return ""
  }
  compile() {
   return this.topDownArray
    .filter(particle => particle.isSelectorParser)
    .map(subparticle => subparticle.compile())
    .join("")
  }
 example A basic example
  body
   font-size 12px
   h1,h2
    color red
  a
   &:hover
    color blue
    font-size 17px
propertyParser
 catchAllAtomType cssValueAtom
 catchAllParser errorParser
 javascript
  compile(spaces) {
   return \`\${spaces}\${this.cue}: \${this.content};\`
  }
 atoms propertyNameAtom
variableParser
 extends propertyParser
 pattern --
browserPrefixPropertyParser
 extends propertyParser
 pattern ^\\-\\w.+
 atoms vendorPrefixCueAtom
errorParser
 catchAllParser errorParser
 catchAllAtomType errorAtom
 baseParser errorParser
commentParser
 atoms commentKeywordAtom
 catchAllAtomType commentAtom
 catchAllParser commentParser
selectorParser
 inScope propertyParser variableParser commentParser
 catchAllParser selectorParser
 boolean isSelectorParser true
 javascript
  getSelector() {
   const parentSelector = this.parent.getSelector()
   return this.cue
    .split(",")
    .map(part => {
     if (part.startsWith("&")) return parentSelector + part.substr(1)
     return parentSelector ? parentSelector + " " + part : part
    })
    .join(",")
  }
  compile() {
   const propertyParsers = this.getSubparticles().filter(particle => particle.doesExtend("propertyParser"))
   if (!propertyParsers.length) return ""
   const spaces = "  "
   return \`\${this.getSelector()} {
  \${propertyParsers.map(subparticle => subparticle.compile(spaces)).join("\\n")}
  }\\n\`
  }
 atoms selectorAtom`)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = hakonParser
  }

  class propertyParser extends ParserBackedParticle {
    createParserPool() {
      return new Particle.ParserPool(errorParser, undefined, undefined)
    }
    get propertyNameAtom() {
      return this.getAtom(0)
    }
    get cssValueAtom() {
      return this.getAtomsFrom(1)
    }
    compile(spaces) {
      return `${spaces}${this.cue}: ${this.content};`
    }
  }

  class variableParser extends propertyParser {}

  class browserPrefixPropertyParser extends propertyParser {
    get vendorPrefixCueAtom() {
      return this.getAtom(0)
    }
  }

  class errorParser extends ParserBackedParticle {
    createParserPool() {
      return new Particle.ParserPool(errorParser, undefined, undefined)
    }
    getErrors() {
      return this._getErrorParserErrors()
    }
    get errorAtom() {
      return this.getAtomsFrom(0)
    }
  }

  class commentParser extends ParserBackedParticle {
    createParserPool() {
      return new Particle.ParserPool(commentParser, undefined, undefined)
    }
    get commentKeywordAtom() {
      return this.getAtom(0)
    }
    get commentAtom() {
      return this.getAtomsFrom(1)
    }
  }

  class selectorParser extends ParserBackedParticle {
    createParserPool() {
      return new Particle.ParserPool(
        selectorParser,
        Object.assign(Object.assign({}, super.createParserPool()._getCueMapAsObject()), {
          "border-bottom-right-radius": propertyParser,
          "transition-timing-function": propertyParser,
          "animation-iteration-count": propertyParser,
          "animation-timing-function": propertyParser,
          "border-bottom-left-radius": propertyParser,
          "border-top-right-radius": propertyParser,
          "border-top-left-radius": propertyParser,
          "background-attachment": propertyParser,
          "background-blend-mode": propertyParser,
          "text-decoration-color": propertyParser,
          "text-decoration-style": propertyParser,
          "overscroll-behavior-x": propertyParser,
          "-webkit-touch-callout": propertyParser,
          "grid-template-columns": propertyParser,
          "animation-play-state": propertyParser,
          "text-decoration-line": propertyParser,
          "animation-direction": propertyParser,
          "animation-fill-mode": propertyParser,
          "backface-visibility": propertyParser,
          "background-position": propertyParser,
          "border-bottom-color": propertyParser,
          "border-bottom-style": propertyParser,
          "border-bottom-width": propertyParser,
          "border-image-outset": propertyParser,
          "border-image-repeat": propertyParser,
          "border-image-source": propertyParser,
          "hanging-punctuation": propertyParser,
          "list-style-position": propertyParser,
          "transition-duration": propertyParser,
          "transition-property": propertyParser,
          "-webkit-user-select": propertyParser,
          "animation-duration": propertyParser,
          "border-image-slice": propertyParser,
          "border-image-width": propertyParser,
          "border-right-color": propertyParser,
          "border-right-style": propertyParser,
          "border-right-width": propertyParser,
          "perspective-origin": propertyParser,
          "-khtml-user-select": propertyParser,
          "grid-template-rows": propertyParser,
          "background-origin": propertyParser,
          "background-repeat": propertyParser,
          "border-left-color": propertyParser,
          "border-left-style": propertyParser,
          "border-left-width": propertyParser,
          "column-rule-color": propertyParser,
          "column-rule-style": propertyParser,
          "column-rule-width": propertyParser,
          "counter-increment": propertyParser,
          "page-break-before": propertyParser,
          "page-break-inside": propertyParser,
          "grid-column-start": propertyParser,
          "background-color": propertyParser,
          "background-image": propertyParser,
          "border-top-color": propertyParser,
          "border-top-style": propertyParser,
          "border-top-width": propertyParser,
          "font-size-adjust": propertyParser,
          "list-style-image": propertyParser,
          "page-break-after": propertyParser,
          "transform-origin": propertyParser,
          "transition-delay": propertyParser,
          "-ms-touch-action": propertyParser,
          "-moz-user-select": propertyParser,
          "animation-delay": propertyParser,
          "background-clip": propertyParser,
          "background-size": propertyParser,
          "border-collapse": propertyParser,
          "justify-content": propertyParser,
          "list-style-type": propertyParser,
          "text-align-last": propertyParser,
          "text-decoration": propertyParser,
          "transform-style": propertyParser,
          "-ms-user-select": propertyParser,
          "grid-column-end": propertyParser,
          "grid-column-gap": propertyParser,
          "animation-name": propertyParser,
          "border-spacing": propertyParser,
          "flex-direction": propertyParser,
          "letter-spacing": propertyParser,
          "outline-offset": propertyParser,
          "padding-bottom": propertyParser,
          "text-transform": propertyParser,
          "vertical-align": propertyParser,
          "grid-auto-flow": propertyParser,
          "grid-row-start": propertyParser,
          "align-content": propertyParser,
          "border-bottom": propertyParser,
          "border-radius": propertyParser,
          "counter-reset": propertyParser,
          "margin-bottom": propertyParser,
          "outline-color": propertyParser,
          "outline-style": propertyParser,
          "outline-width": propertyParser,
          "padding-right": propertyParser,
          "text-overflow": propertyParser,
          "justify-items": propertyParser,
          "border-color": propertyParser,
          "border-image": propertyParser,
          "border-right": propertyParser,
          "border-style": propertyParser,
          "border-width": propertyParser,
          "break-inside": propertyParser,
          "caption-side": propertyParser,
          "column-count": propertyParser,
          "column-width": propertyParser,
          "font-stretch": propertyParser,
          "font-variant": propertyParser,
          "margin-right": propertyParser,
          "padding-left": propertyParser,
          "table-layout": propertyParser,
          "text-justify": propertyParser,
          "unicode-bidi": propertyParser,
          "atom-spacing": propertyParser,
          "touch-action": propertyParser,
          "grid-row-end": propertyParser,
          "grid-row-gap": propertyParser,
          "justify-self": propertyParser,
          "align-items": propertyParser,
          "border-left": propertyParser,
          "column-fill": propertyParser,
          "column-rule": propertyParser,
          "column-span": propertyParser,
          "empty-atoms": propertyParser,
          "flex-shrink": propertyParser,
          "font-family": propertyParser,
          "font-weight": propertyParser,
          "line-height": propertyParser,
          "margin-left": propertyParser,
          "padding-top": propertyParser,
          perspective: propertyParser,
          "text-indent": propertyParser,
          "text-shadow": propertyParser,
          "white-space": propertyParser,
          "user-select": propertyParser,
          "grid-column": propertyParser,
          "align-self": propertyParser,
          background: propertyParser,
          "border-top": propertyParser,
          "box-shadow": propertyParser,
          "box-sizing": propertyParser,
          "column-gap": propertyParser,
          "flex-basis": propertyParser,
          "@font-face": propertyParser,
          "font-style": propertyParser,
          "@keyframes": propertyParser,
          "list-style": propertyParser,
          "margin-top": propertyParser,
          "max-height": propertyParser,
          "min-height": propertyParser,
          "overflow-x": propertyParser,
          "overflow-y": propertyParser,
          "text-align": propertyParser,
          transition: propertyParser,
          visibility: propertyParser,
          "atom-break": propertyParser,
          animation: propertyParser,
          direction: propertyParser,
          "flex-flow": propertyParser,
          "flex-grow": propertyParser,
          "flex-wrap": propertyParser,
          "font-size": propertyParser,
          "max-width": propertyParser,
          "min-width": propertyParser,
          "nav-index": propertyParser,
          "nav-right": propertyParser,
          transform: propertyParser,
          "atom-wrap": propertyParser,
          "nav-down": propertyParser,
          "nav-left": propertyParser,
          overflow: propertyParser,
          position: propertyParser,
          "tab-size": propertyParser,
          "grid-gap": propertyParser,
          "grid-row": propertyParser,
          columns: propertyParser,
          content: propertyParser,
          display: propertyParser,
          hyphens: propertyParser,
          opacity: propertyParser,
          outline: propertyParser,
          padding: propertyParser,
          "z-index": propertyParser,
          border: propertyParser,
          bottom: propertyParser,
          cursor: propertyParser,
          filter: propertyParser,
          height: propertyParser,
          margin: propertyParser,
          "@media": propertyParser,
          "nav-up": propertyParser,
          quotes: propertyParser,
          resize: propertyParser,
          clear: propertyParser,
          color: propertyParser,
          float: propertyParser,
          order: propertyParser,
          right: propertyParser,
          width: propertyParser,
          clip: propertyParser,
          fill: propertyParser,
          flex: propertyParser,
          font: propertyParser,
          left: propertyParser,
          all: propertyParser,
          top: propertyParser,
          gap: propertyParser,
          "": propertyParser,
          comment: commentParser
        }),
        [
          { regex: /--/, parser: variableParser },
          { regex: /^\-\w.+/, parser: browserPrefixPropertyParser }
        ]
      )
    }
    get selectorAtom() {
      return this.getAtom(0)
    }
    get isSelectorParser() {
      return true
    }
    getSelector() {
      const parentSelector = this.parent.getSelector()
      return this.cue
        .split(",")
        .map(part => {
          if (part.startsWith("&")) return parentSelector + part.substr(1)
          return parentSelector ? parentSelector + " " + part : part
        })
        .join(",")
    }
    compile() {
      const propertyParsers = this.getSubparticles().filter(particle => particle.doesExtend("propertyParser"))
      if (!propertyParsers.length) return ""
      const spaces = "  "
      return `${this.getSelector()} {
${propertyParsers.map(subparticle => subparticle.compile(spaces)).join("\n")}
}\n`
    }
  }

  window.hakonParser = hakonParser
}
;

//onsave scrollsdk build produce ParticleComponentFramework.browser.js
const BrowserEvents = {}
BrowserEvents.click = "click"
BrowserEvents.change = "change"
BrowserEvents.mouseover = "mouseover"
BrowserEvents.mouseout = "mouseout"
BrowserEvents.mousedown = "mousedown"
BrowserEvents.contextmenu = "contextmenu"
BrowserEvents.keypress = "keypress"
BrowserEvents.keyup = "keyup"
BrowserEvents.focus = "focus"
BrowserEvents.mousemove = "mousemove"
BrowserEvents.dblclick = "dblclick"
BrowserEvents.submit = "submit"
BrowserEvents.blur = "blur"
BrowserEvents.paste = "paste"
BrowserEvents.copy = "copy"
BrowserEvents.resize = "resize"
BrowserEvents.cut = "cut"
BrowserEvents.drop = "drop"
BrowserEvents.dragover = "dragover"
BrowserEvents.dragenter = "dragenter"
BrowserEvents.dragleave = "dragleave"
BrowserEvents.ready = "ready"
const WillowConstants = {}
// todo: cleanup
WillowConstants.clickCommand = "clickCommand"
WillowConstants.shiftClickCommand = "shiftClickCommand"
WillowConstants.blurCommand = "blurCommand"
WillowConstants.keyUpCommand = "keyUpCommand"
WillowConstants.contextMenuCommand = "contextMenuCommand"
WillowConstants.changeCommand = "changeCommand"
WillowConstants.doubleClickCommand = "doubleClickCommand"
// todo: cleanup
WillowConstants.titleTag = "titleTag"
WillowConstants.styleTag = "styleTag"
WillowConstants.tagMap = {}
WillowConstants.tagMap[WillowConstants.styleTag] = "style"
WillowConstants.tagMap[WillowConstants.titleTag] = "title"
WillowConstants.tags = {}
WillowConstants.tags.html = "html"
WillowConstants.tags.head = "head"
WillowConstants.tags.body = "body"
WillowConstants.collapse = "collapse"
WillowConstants.uidAttribute = "stumpUid"
WillowConstants.class = "class"
WillowConstants.type = "type"
WillowConstants.value = "value"
WillowConstants.name = "name"
WillowConstants.checkbox = "checkbox"
WillowConstants.checkedSelector = ":checked"
WillowConstants.contenteditable = "contenteditable"
WillowConstants.inputTypes = ["input", "textarea"]
var CacheType
;(function (CacheType) {
  CacheType["inBrowserMemory"] = "inBrowserMemory"
})(CacheType || (CacheType = {}))
class WillowHTTPResponse {
  constructor(superAgentResponse) {
    this._cacheType = CacheType.inBrowserMemory
    this._fromCache = false
    this._cacheTime = Date.now()
    this._superAgentResponse = superAgentResponse
    this._mimeType = superAgentResponse && superAgentResponse.type
  }
  // todo: ServerMemoryCacheTime and ServerMemoryDiskCacheTime
  get cacheTime() {
    return this._cacheTime
  }
  get cacheType() {
    return this._cacheType
  }
  get body() {
    return this._superAgentResponse && this._superAgentResponse.body
  }
  get text() {
    if (this._text === undefined) this._text = this._superAgentResponse && this._superAgentResponse.text ? this._superAgentResponse.text : this.body ? JSON.stringify(this.body, null, 2) : ""
    return this._text
  }
  get asJson() {
    return this.body ? this.body : JSON.parse(this.text)
  }
  get fromCache() {
    return this._fromCache
  }
  setFromCache(val) {
    this._fromCache = val
    return this
  }
  getParsedDataOrText() {
    if (this._mimeType === "text/csv") return this.text
    return this.body || this.text
  }
}
class WillowHTTPProxyCacheResponse extends WillowHTTPResponse {
  constructor(proxyServerResponse) {
    super()
    this._proxyServerResponse = proxyServerResponse
    this._cacheType = proxyServerResponse.body.cacheType
    this._cacheTime = proxyServerResponse.body.cacheTime
    this._text = proxyServerResponse.body.text
  }
}
class AbstractWillowShadow {
  constructor(stumpParticle) {
    this._stumpParticle = stumpParticle
  }
  getShadowStumpParticle() {
    return this._stumpParticle
  }
  getShadowValue() {
    return this._val
  }
  removeShadow() {
    return this
  }
  setInputOrTextAreaValue(value) {
    this._val = value
    return this
  }
  getShadowParent() {
    return this.getShadowStumpParticle().parent.getShadow()
  }
  getPositionAndDimensions(gridSize = 1) {
    const offset = this.getShadowOffset()
    const parentOffset = this.getShadowParent().getShadowOffset()
    return {
      left: Math.floor((offset.left - parentOffset.left) / gridSize),
      top: Math.floor((offset.top - parentOffset.top) / gridSize),
      width: Math.floor(this.getShadowWidth() / gridSize),
      height: Math.floor(this.getShadowHeight() / gridSize)
    }
  }
  shadowHasClass(name) {
    return false
  }
  getShadowAttr(name) {
    return ""
  }
  makeResizable(options) {
    return this
  }
  makeDraggable(options) {
    return this
  }
  makeSelectable(options) {
    return this
  }
  isShadowChecked() {
    return false
  }
  getShadowOffset() {
    return { left: 111, top: 111 }
  }
  getShadowWidth() {
    return 111
  }
  getShadowHeight() {
    return 111
  }
  setShadowAttr(name, value) {
    return this
  }
  isShadowDraggable() {
    return this.shadowHasClass("draggable")
  }
  toggleShadow() {}
  addClassToShadow(className) {}
  removeClassFromShadow(className) {
    return this
  }
  onShadowEvent(event, fn) {
    // todo:
    return this
  }
  onShadowEventWithSelector(event, selector, fn) {
    // todo:
    return this
  }
  offShadowEvent(event, fn) {
    // todo:
    return this
  }
  triggerShadowEvent(name) {
    return this
  }
  getShadowPosition() {
    return {
      left: 111,
      top: 111
    }
  }
  getShadowOuterHeight() {
    return 11
  }
  getShadowOuterWidth() {
    return 11
  }
  getShadowCss(property) {
    return ""
  }
  insertHtmlParticle(subparticle, index) {}
  get element() {
    return {}
  }
}
class WillowShadow extends AbstractWillowShadow {}
class WillowStore {
  constructor() {
    this._values = {}
  }
  get(key) {
    return this._values[key]
  }
  set(key, value) {
    this._values[key] = value
    return this
  }
  remove(key) {
    delete this._values[key]
  }
  each(fn) {
    Object.keys(this._values).forEach(key => {
      fn(this._values[key], key)
    })
  }
  clearAll() {
    this._values = {}
  }
}
class WillowMousetrap {
  constructor() {
    this.prototype = {}
  }
  bind() {}
}
// this one should have no document, window, $, et cetera.
class AbstractWillowBrowser extends stumpParser {
  constructor(fullHtmlPageUrlIncludingProtocolAndFileName) {
    super(`${WillowConstants.tags.html}
 ${WillowConstants.tags.head}
 ${WillowConstants.tags.body}`)
    this._offlineMode = false
    this._httpGetResponseCache = {}
    this.location = {}
    this._htmlStumpParticle = this.particleAt(0)
    this._headStumpParticle = this.particleAt(0).particleAt(0)
    this._bodyStumpParticle = this.particleAt(0).particleAt(1)
    this.addSuidsToHtmlHeadAndBodyShadows()
    this._fullHtmlPageUrlIncludingProtocolAndFileName = fullHtmlPageUrlIncludingProtocolAndFileName
    const url = new URL(fullHtmlPageUrlIncludingProtocolAndFileName)
    this.location.port = url.port
    this.location.protocol = url.protocol
    this.location.hostname = url.hostname
    this.location.host = url.host
  }
  _getPort() {
    return this.location.port ? ":" + this.location.port : ""
  }
  getHash() {
    return this.location.hash || ""
  }
  setHash(value) {
    this.location.hash = value
  }
  setHtmlOfElementWithIdHack(id, html) {}
  setHtmlOfElementsWithClassHack(id, html) {}
  setValueOfElementWithIdHack(id, value) {}
  setValueOfElementWithClassHack(id, value) {}
  getElementById(id) {}
  queryObjectToQueryString(obj) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(obj)) {
      params.set(key, String(value))
    }
    return params.toString()
  }
  toPrettyDeepLink(particleCode, queryObject) {
    // todo: move things to a constant.
    const particleBreakSymbol = "~"
    const edgeSymbol = "_"
    const obj = Object.assign({}, queryObject)
    if (!particleCode.includes(particleBreakSymbol) && !particleCode.includes(edgeSymbol)) {
      obj.particleBreakSymbol = particleBreakSymbol
      obj.edgeSymbol = edgeSymbol
      obj.data = encodeURIComponent(particleCode.replace(/ /g, edgeSymbol).replace(/\n/g, particleBreakSymbol))
    } else obj.data = encodeURIComponent(particleCode)
    return this.getAppWebPageUrl() + "?" + this.queryObjectToQueryString(obj)
  }
  getHost() {
    return this.location.host
  }
  reload() {}
  toggleOfflineMode() {
    this._offlineMode = !this._offlineMode
  }
  addSuidsToHtmlHeadAndBodyShadows() {}
  getShadowClass() {
    return WillowShadow
  }
  getMockMouseEvent() {
    return {
      clientX: 0,
      clientY: 0,
      offsetX: 0,
      offsetY: 0
    }
  }
  toggleFullScreen() {}
  getMousetrap() {
    if (!this._mousetrap) this._mousetrap = new WillowMousetrap()
    return this._mousetrap
  }
  _getFocusedShadow() {
    return this._focusedShadow || this.getBodyStumpParticle().getShadow()
  }
  getHeadStumpParticle() {
    return this._headStumpParticle
  }
  getBodyStumpParticle() {
    return this._bodyStumpParticle
  }
  getHtmlStumpParticle() {
    return this._htmlStumpParticle
  }
  getStore() {
    if (!this._store) this._store = new WillowStore()
    return this._store
  }
  someInputHasFocus() {
    const focusedShadow = this._getFocusedShadow()
    if (!focusedShadow) return false
    const stumpParticle = focusedShadow.getShadowStumpParticle()
    return stumpParticle && stumpParticle.isInputType()
  }
  copyTextToClipboard(text) {}
  setCopyData(evt, str) {}
  getAppWebPageUrl() {
    return this._fullHtmlPageUrlIncludingProtocolAndFileName
  }
  getAppWebPageParentFolderWithoutTrailingSlash() {
    return Utils.getPathWithoutFileName(this._fullHtmlPageUrlIncludingProtocolAndFileName)
  }
  _makeRelativeUrlAbsolute(url) {
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    return this.getAppWebPageParentFolderWithoutTrailingSlash() + "/" + url.replace(/^\//, "")
  }
  async makeUrlAbsoluteAndHttpGetUrl(url, queryStringObject, responseClass = WillowHTTPResponse) {
    return this.httpGetUrl(this._makeRelativeUrlAbsolute(url), queryStringObject, responseClass)
  }
  async httpGetUrl(url, queryStringObject, responseClass = WillowHTTPResponse) {
    if (this._offlineMode) return new WillowHTTPResponse()
    const superAgentResponse = await superagent
      .get(url)
      .query(queryStringObject)
      .set(this._headers || {})
    return new responseClass(superAgentResponse)
  }
  _getFromResponseCache(cacheKey) {
    const hit = this._httpGetResponseCache[cacheKey]
    if (hit) hit.setFromCache(true)
    return hit
  }
  _setInResponseCache(url, res) {
    this._httpGetResponseCache[url] = res
    return this
  }
  async httpGetUrlFromCache(url, queryStringMap = {}, responseClass = WillowHTTPResponse) {
    const cacheKey = url + JSON.stringify(queryStringMap)
    const cacheHit = this._getFromResponseCache(cacheKey)
    if (!cacheHit) {
      const res = await this.httpGetUrl(url, queryStringMap, responseClass)
      this._setInResponseCache(cacheKey, res)
      return res
    }
    return cacheHit
  }
  async httpGetUrlFromProxyCache(url) {
    const queryStringMap = {}
    queryStringMap.url = url
    queryStringMap.cacheOnServer = "true"
    return await this.httpGetUrlFromCache("/proxy", queryStringMap, WillowHTTPProxyCacheResponse)
  }
  async httpPostUrl(url, data) {
    if (this._offlineMode) return new WillowHTTPResponse()
    const superAgentResponse = await superagent
      .post(this._makeRelativeUrlAbsolute(url))
      .set(this._headers || {})
      .send(data)
    return new WillowHTTPResponse(superAgentResponse)
  }
  encodeURIComponent(str) {
    return encodeURIComponent(str)
  }
  downloadFile(data, filename, filetype) {
    // noop
  }
  async appendScript(url) {}
  getWindowTitle() {
    // todo: deep getParticleByBase/withBase/type/atom or something?
    const particles = this.topDownArray
    const titleParticle = particles.find(particle => particle.cue === WillowConstants.titleTag)
    return titleParticle ? titleParticle.content : ""
  }
  setWindowTitle(value) {
    const particles = this.topDownArray
    const headParticle = particles.find(particle => particle.cue === WillowConstants.tags.head)
    headParticle.touchParticle(WillowConstants.titleTag).setContent(value)
    return this
  }
  _getHostname() {
    return this.location.hostname || ""
  }
  openUrl(link) {
    // noop in willow
  }
  getPageHtml() {
    return this.getHtmlStumpParticle().asHtmlWithSuids()
  }
  getStumpParticleFromElement(el) {}
  setPasteHandler(fn) {
    return this
  }
  setErrorHandler(fn) {
    return this
  }
  setCopyHandler(fn) {
    return this
  }
  setCutHandler(fn) {
    return this
  }
  setResizeEndHandler(fn) {
    return this
  }
  async confirmThen(message) {
    return true
  }
  async promptThen(message, value) {
    return value
  }
  setLoadedDroppedFileHandler(callback, helpText = "") {}
  getWindowSize() {
    return {
      width: 1111,
      height: 1111
    }
  }
  getDocumentSize() {
    return this.getWindowSize()
  }
  isExternalLink(link) {
    if (link && link.substr(0, 1) === "/") return false
    if (!link.includes("//")) return false
    const hostname = this._getHostname()
    const url = new URL(link)
    return url.hostname && hostname !== url.hostname
  }
  forceRepaint() {}
  blurFocusedInput() {}
}
class WillowBrowser extends AbstractWillowBrowser {
  constructor(fullHtmlPageUrlIncludingProtocolAndFileName) {
    super(fullHtmlPageUrlIncludingProtocolAndFileName)
    this._offlineMode = true
  }
}
WillowBrowser._stumpsOnPage = 0
class WillowBrowserShadow extends AbstractWillowShadow {
  get element() {
    if (!this._cachedEl) this._cachedEl = document.querySelector(`[${WillowConstants.uidAttribute}="${this.getShadowStumpParticle()._getUid()}"]`)
    return this._cachedEl
  }
  getShadowValueFromAttr() {
    return this.element.getAttribute(WillowConstants.value)
  }
  isShadowChecked() {
    return this.element.checked
  }
  getShadowAttr(name) {
    return this.element.getAttribute(name)
  }
  _logMessage(type) {
    if (true) return true
    WillowBrowserShadow._shadowUpdateNumber++
    console.log(`DOM Update ${WillowBrowserShadow._shadowUpdateNumber}: ${type}`)
  }
  // BEGIN MUTABLE METHODS:
  // todo: add tests
  // todo: idea, don't "paint" wall (dont append it to parent, until done.)
  insertHtmlParticle(childStumpParticle, index) {
    const { domElement } = childStumpParticle
    const { element } = this
    // todo: can we virtualize this?
    // would it be a "virtual shadow?"
    if (index === undefined) element.appendChild(domElement)
    else if (index === 0) element.prepend(domElement)
    else element.insertBefore(domElement, element.children[index])
    WillowBrowser._stumpsOnPage++
    this._logMessage("insert")
  }
  removeShadow() {
    this.element.remove()
    WillowBrowser._stumpsOnPage--
    this._logMessage("remove")
    return this
  }
  setInputOrTextAreaValue(value) {
    this.element.value = value
    this._logMessage("val")
    return this
  }
  setShadowAttr(name, value) {
    this.element.setAttribute(name, value)
    this._logMessage("attr")
    return this
  }
  getShadowCss(prop) {
    const { element } = this
    const compStyles = window.getComputedStyle(element)
    return compStyles.getPropertyValue(prop)
  }
  getShadowPosition() {
    return this.element.getBoundingClientRect()
  }
  shadowHasClass(name) {
    return this.element.classList.contains(name)
  }
  getShadowValue() {
    // todo: cleanup, add tests
    if (this.getShadowStumpParticle().isInputType()) return this.element.value
    return this.element.value || this.getShadowValueFromAttr()
  }
  addClassToShadow(className) {
    this.element.classList.add(className)
    this._logMessage("addClass")
    return this
  }
  removeClassFromShadow(className) {
    this.element.classList.remove(className)
    this._logMessage("removeClass")
    return this
  }
  toggleShadow() {
    const { element } = this
    element.style.display = element.style.display == "none" ? "block" : "none"
    this._logMessage("toggle")
    return this
  }
  getShadowOuterHeight() {
    return this.element.outerHeight
  }
  getShadowOuterWidth() {
    return this.element.outerWidth
  }
  getShadowWidth() {
    return this.element.innerWidth
  }
  getShadowHeight() {
    return this.element.innerHeight
  }
  getShadowOffset() {
    const element = this.element
    if (!element.getClientRects().length) return { top: 0, left: 0 }
    const rect = element.getBoundingClientRect()
    const win = element.ownerDocument.defaultView
    return {
      top: rect.top + win.pageYOffset,
      left: rect.left + win.pageXOffset
    }
  }
  triggerShadowEvent(event) {
    this.element.dispatchEvent(new Event(event))
    this._logMessage("trigger")
    return this
  }
  onShadowEvent(event, fn) {
    this.element.addEventListener(event, fn)
    this._logMessage("bind on")
    return this
  }
  onShadowEventWithSelector(event, selector, fn) {
    this.element.addEventListener(event, function (evt) {
      let target = evt.target
      while (target !== null) {
        if (target.matches(selector)) {
          fn(target, evt)
          return
        }
        target = target.parentElement
      }
    })
    this._logMessage("bind on")
    return this
  }
  offShadowEvent(event, fn) {
    this.element.removeEventListener(event, fn)
    this._logMessage("bind off")
    return this
  }
}
WillowBrowserShadow._shadowUpdateNumber = 0 // todo: what is this for, debugging perf?
// same thing, except with side effects.
class RealWillowBrowser extends AbstractWillowBrowser {
  findStumpParticlesByShadowClass(className) {
    const stumpParticles = []
    const els = document.getElementsByClassName(className)
    for (let el of els) {
      stumpParticles.push(this.getStumpParticleFromElement(this))
    }
    return stumpParticles
  }
  getElementById(id) {
    return document.getElementById(id)
  }
  setHtmlOfElementWithIdHack(id, html = "") {
    document.getElementById(id).innerHTML = html
  }
  setHtmlOfElementsWithClassHack(className, html = "") {
    const els = document.getElementsByClassName(className)
    for (let el of els) {
      el.innerHTML = html
    }
  }
  setValueOfElementWithIdHack(id, value = "") {
    const el = document.getElementById(id)
    el.value = value
  }
  setValueOfElementsWithClassHack(className, value = "") {
    const els = document.getElementsByClassName(className)
    for (let el of els) {
      el.value = value
    }
  }
  getElementByTagName(tagName) {
    return document.getElementsByTagName(tagName)[0]
  }
  addSuidsToHtmlHeadAndBodyShadows() {
    this.getElementByTagName(WillowConstants.tags.html).setAttribute(WillowConstants.uidAttribute, this.getHtmlStumpParticle()._getUid())
    this.getElementByTagName(WillowConstants.tags.head).setAttribute(WillowConstants.uidAttribute, this.getHeadStumpParticle()._getUid())
    this.getElementByTagName(WillowConstants.tags.body).setAttribute(WillowConstants.uidAttribute, this.getBodyStumpParticle()._getUid())
  }
  getShadowClass() {
    return WillowBrowserShadow
  }
  setCopyHandler(fn) {
    document.addEventListener(BrowserEvents.copy, event => {
      fn(event)
    })
    return this
  }
  setCutHandler(fn) {
    document.addEventListener(BrowserEvents.cut, event => {
      fn(event)
    })
    return this
  }
  setPasteHandler(fn) {
    window.addEventListener(BrowserEvents.paste, fn, false)
    return this
  }
  setErrorHandler(fn) {
    window.addEventListener("error", fn)
    window.addEventListener("unhandledrejection", fn)
    return this
  }
  toggleFullScreen() {
    const doc = document
    if ((doc.fullScreenElement && doc.fullScreenElement !== null) || (!doc.mozFullScreen && !doc.webkitIsFullScreen)) {
      if (doc.documentElement.requestFullScreen) doc.documentElement.requestFullScreen()
      else if (doc.documentElement.mozRequestFullScreen) doc.documentElement.mozRequestFullScreen()
      else if (doc.documentElement.webkitRequestFullScreen) doc.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
    } else {
      if (doc.cancelFullScreen) doc.cancelFullScreen()
      else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen()
      else if (doc.webkitCancelFullScreen) doc.webkitCancelFullScreen()
    }
  }
  setCopyData(evt, str) {
    const originalEvent = evt.originalEvent
    originalEvent.preventDefault()
    originalEvent.clipboardData.setData("text/plain", str)
    originalEvent.clipboardData.setData("text/html", str)
  }
  getMousetrap() {
    return window.Mousetrap
  }
  copyTextToClipboard(text) {
    // http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    const textArea = document.createElement("textarea")
    textArea.style.position = "fixed"
    textArea.style.top = "0"
    textArea.style.left = "0"
    textArea.style.width = "2em"
    textArea.style.height = "2em"
    textArea.style.padding = "0"
    textArea.style.border = "none"
    textArea.style.outline = "none"
    textArea.style.boxShadow = "none"
    textArea.style.background = "transparent"
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      const successful = document.execCommand("copy")
    } catch (err) {}
    document.body.removeChild(textArea)
  }
  getStore() {
    return window.store
  }
  getHash() {
    return location.hash || ""
  }
  setHash(value) {
    location.hash = value
  }
  getHost() {
    return location.host
  }
  _getHostname() {
    return location.hostname
  }
  async appendScript(url) {
    if (!url) return undefined
    if (!this._loadingPromises) this._loadingPromises = {}
    if (this._loadingPromises[url]) return this._loadingPromises[url]
    if (this.isNodeJs()) return undefined
    this._loadingPromises[url] = this._appendScript(url)
    return this._loadingPromises[url]
  }
  _appendScript(url) {
    //https://bradb.net/blog/promise-based-js-script-loader/
    return new Promise(function (resolve, reject) {
      let resolved = false
      const scriptEl = document.createElement("script")
      scriptEl.type = "text/javascript"
      scriptEl.src = url
      scriptEl.async = true
      scriptEl.onload = scriptEl.onreadystatechange = function () {
        if (!resolved && (!this.readyState || this.readyState == "complete")) {
          resolved = true
          resolve(this)
        }
      }
      scriptEl.onerror = scriptEl.onabort = reject
      document.head.appendChild(scriptEl)
    })
  }
  downloadFile(data, filename, filetype) {
    const downloadLink = document.createElement("a")
    downloadLink.setAttribute("href", `data:${filetype},` + encodeURIComponent(data))
    downloadLink.setAttribute("download", filename)
    downloadLink.click()
  }
  reload() {
    window.location.reload()
  }
  openUrl(link) {
    window.open(link)
  }
  setResizeEndHandler(fn) {
    let resizeTimer
    window.addEventListener(BrowserEvents.resize, evt => {
      const target = evt.target
      if (target !== window) return // dont resize on div resizes
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        fn(this.getWindowSize())
      }, 100)
    })
    return this
  }
  getStumpParticleFromElement(el) {
    return this.getHtmlStumpParticle().getParticleByGuid(parseInt(el.getAttribute(WillowConstants.uidAttribute)))
  }
  forceRepaint() {
    // todo:
  }
  getBrowserHtml() {
    return document.documentElement.outerHTML
  }
  async confirmThen(message) {
    return confirm(message)
  }
  async promptThen(message, value) {
    return prompt(message, value)
  }
  getWindowSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }
  // todo: denote the side effect
  blurFocusedInput() {
    // todo: test against browser.
    document.activeElement.blur()
  }
  setLoadedDroppedFileHandler(callback, helpText = "") {
    const bodyStumpParticle = this.getBodyStumpParticle()
    const bodyShadow = bodyStumpParticle.getShadow()
    // Added the below to ensure dragging from the chrome downloads bar works
    // http://stackoverflow.com/questions/19526430/drag-and-drop-file-uploads-from-chrome-downloads-bar
    const handleChromeBug = event => {
      const originalEvent = event.originalEvent
      const effect = originalEvent.dataTransfer.effectAllowed
      originalEvent.dataTransfer.dropEffect = effect === "move" || effect === "linkMove" ? "move" : "copy"
    }
    const dragoverHandler = event => {
      handleChromeBug(event)
      event.preventDefault()
      event.stopPropagation()
      if (!bodyStumpParticle.stumpParticleHasClass("dragOver")) {
        bodyStumpParticle.insertChildParticle(`div ${helpText}
 id dragOverHelp`)
        bodyStumpParticle.addClassToStumpParticle("dragOver")
        // Add the help, and then hopefull we'll get a dragover event on the dragOverHelp, then
        // 50ms later, add the dragleave handler, and from now on drag leave will only happen on the help
        // div
        setTimeout(function () {
          bodyShadow.onShadowEvent(BrowserEvents.dragleave, dragleaveHandler)
        }, 50)
      }
    }
    const dragleaveHandler = event => {
      event.preventDefault()
      event.stopPropagation()
      bodyStumpParticle.removeClassFromStumpParticle("dragOver")
      bodyStumpParticle.findStumpParticleByChild("id dragOverHelp").removeStumpParticle()
      bodyShadow.offShadowEvent(BrowserEvents.dragleave, dragleaveHandler)
    }
    const dropHandler = async event => {
      event.preventDefault()
      event.stopPropagation()
      bodyStumpParticle.removeClassFromStumpParticle("dragOver")
      bodyStumpParticle.findStumpParticleByChild("id dragOverHelp").removeStumpParticle()
      const droppedItems = event.originalEvent.dataTransfer.items
      // NOTE: YOU NEED TO STAY IN THE "DROP" EVENT, OTHERWISE THE DATATRANSFERITEMS MUTATE
      // (BY DESIGN) https://bugs.chromium.org/p/chromium/issues/detail?id=137231
      // DO NOT ADD AN AWAIT IN THIS LOOP. IT WILL BREAK.
      const items = []
      for (let droppedItem of droppedItems) {
        const entry = droppedItem.webkitGetAsEntry()
        items.push(this._handleDroppedEntry(entry))
      }
      const results = await Promise.all(items)
      callback(results)
    }
    bodyShadow.onShadowEvent(BrowserEvents.dragover, dragoverHandler)
    bodyShadow.onShadowEvent(BrowserEvents.drop, dropHandler)
    // todo: why do we do this?
    bodyShadow.onShadowEvent(BrowserEvents.dragenter, function (event) {
      event.preventDefault()
      event.stopPropagation()
    })
  }
  _handleDroppedEntry(item, path = "") {
    // http://stackoverflow.com/questions/3590058/does-html5-allow-drag-drop-upload-of-folders-or-a-folder-tree
    // http://stackoverflow.com/questions/6756583/prevent-browser-from-loading-a-drag-and-dropped-file
    return item.isFile ? this._handleDroppedFile(item) : this._handleDroppedDirectory(item, path)
  }
  _handleDroppedDirectory(item, path) {
    return new Promise((resolve, reject) => {
      item.createReader().readEntries(async entries => {
        const promises = []
        for (let i = 0; i < entries.length; i++) {
          promises.push(this._handleDroppedEntry(entries[i], path + item.name + "/"))
        }
        const res = await Promise.all(promises)
        resolve(res)
      })
    })
  }
  _handleDroppedFile(file) {
    // https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
    // http://www.sitepoint.com/html5-javascript-open-dropped-files/
    return new Promise((resolve, reject) => {
      file.file(data => {
        const reader = new FileReader()
        reader.onload = evt => {
          resolve({ data: evt.target.result, filename: data.name })
        }
        reader.onerror = err => reject(err)
        reader.readAsText(data)
      })
    })
  }
  _getFocusedShadow() {
    const stumpParticle = this.getStumpParticleFromElement(document.activeElement)
    return stumpParticle && stumpParticle.getShadow()
  }
}
class AbstractTheme {
  hakonToCss(str) {
    const hakonProgram = new hakonParser(str)
    // console.log(hakonProgram.getAllErrors())
    return hakonProgram.compile()
  }
}
class DefaultTheme extends AbstractTheme {}
class AbstractParticleComponentParser extends ParserBackedParticle {
  async startWhenReady() {
    if (this.isNodeJs()) return this.start()
    document.addEventListener(
      "DOMContentLoaded",
      async () => {
        this.start()
      },
      false
    )
  }
  start() {
    this._bindParticleComponentFrameworkCommandListenersOnBody()
    this.renderAndGetRenderReport(this.willowBrowser.getBodyStumpParticle())
  }
  get willowBrowser() {
    if (!this._willowBrowser) {
      if (this.isNodeJs()) {
        this._willowBrowser = new WillowBrowser("http://localhost:8000/index.html")
      } else {
        this._willowBrowser = new RealWillowBrowser(window.location.href)
      }
    }
    return this._willowBrowser
  }
  onCommandError(err) {
    throw err
  }
  _setMouseEvent(evt) {
    this._mouseEvent = evt
    return this
  }
  getMouseEvent() {
    return this._mouseEvent || this.willowBrowser.getMockMouseEvent()
  }
  _onCommandWillRun() {
    // todo: remove. currently used by ohayo
  }
  _getCommandArgumentsFromStumpParticle(stumpParticle, commandMethod) {
    if (commandMethod.includes(" ")) {
      // todo: cleanup and document
      // It seems the command arguments can from the method string or from form values.
      const parts = commandMethod.split(" ")
      return {
        uno: parts[1],
        dos: parts[2]
      }
    }
    const shadow = stumpParticle.getShadow()
    let valueParam
    if (stumpParticle.isStumpParticleCheckbox()) valueParam = shadow.isShadowChecked() ? true : false
    // todo: fix bug if nothing is entered.
    else if (shadow.getShadowValue() !== undefined) valueParam = shadow.getShadowValue()
    else valueParam = stumpParticle.getStumpParticleAttr("value")
    const nameParam = stumpParticle.getStumpParticleAttr("name")
    return {
      uno: valueParam,
      dos: nameParam
    }
  }
  getStumpParticleString() {
    return this.willowBrowser.getHtmlStumpParticle().toString()
  }
  _getHtmlOnlyParticles() {
    const particles = []
    this.willowBrowser.getHtmlStumpParticle().deepVisit(particle => {
      if (particle.cue === "styleTag" || (particle.content || "").startsWith("<svg ")) return false
      particles.push(particle)
    })
    return particles
  }
  getStumpParticleStringWithoutCssAndSvg() {
    // todo: cleanup. feels hacky.
    const clone = new Particle(this.willowBrowser.getHtmlStumpParticle().toString())
    clone.topDownArray.forEach(particle => {
      if (particle.cue === "styleTag" || (particle.content || "").startsWith("<svg ")) particle.destroy()
    })
    return clone.toString()
  }
  getTextContent() {
    return this._getHtmlOnlyParticles()
      .map(particle => particle.getTextContent())
      .filter(text => text)
      .join("\n")
  }
  getCommandNames() {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(atom => atom.endsWith("Command"))
  }
  async _executeCommandOnStumpParticle(stumpParticle, commandMethod) {
    const params = this._getCommandArgumentsFromStumpParticle(stumpParticle, commandMethod)
    if (commandMethod.includes(" "))
      // todo: cleanup
      commandMethod = commandMethod.split(" ")[0]
    this.addToCommandLog([commandMethod, params.uno, params.dos].filter(identity => identity).join(" "))
    this._onCommandWillRun() // todo: remove. currently used by ohayo
    let particleComponent = stumpParticle.getStumpParticleParticleComponent()
    while (!particleComponent[commandMethod]) {
      const parent = particleComponent.parent
      if (parent === particleComponent) throw new Error(`Unknown command "${commandMethod}"`)
      if (!parent) debugger
      particleComponent = parent
    }
    try {
      await particleComponent[commandMethod](params.uno, params.dos)
    } catch (err) {
      this.onCommandError(err)
    }
  }
  _bindParticleComponentFrameworkCommandListenersOnBody() {
    const willowBrowser = this.willowBrowser
    const bodyShadow = willowBrowser.getBodyStumpParticle().getShadow()
    const app = this
    const checkAndExecute = (el, attr, evt) => {
      const stumpParticle = willowBrowser.getStumpParticleFromElement(el)
      evt.preventDefault()
      evt.stopImmediatePropagation()
      this._executeCommandOnStumpParticle(stumpParticle, stumpParticle.getStumpParticleAttr(attr))
      return false
    }
    bodyShadow.onShadowEventWithSelector(BrowserEvents.contextmenu, `[${WillowConstants.contextMenuCommand}]`, function (target, evt) {
      if (evt.ctrlKey) return true
      app._setMouseEvent(evt) // todo: remove?
      return checkAndExecute(target, WillowConstants.contextMenuCommand, evt)
    })
    bodyShadow.onShadowEventWithSelector(BrowserEvents.click, `[${WillowConstants.clickCommand}]`, function (target, evt) {
      if (evt.shiftKey) return checkAndExecute(this, WillowConstants.shiftClickCommand, evt)
      app._setMouseEvent(evt) // todo: remove?
      return checkAndExecute(target, WillowConstants.clickCommand, evt)
    })
    bodyShadow.onShadowEventWithSelector(BrowserEvents.dblclick, `[${WillowConstants.doubleClickCommand}]`, function (target, evt) {
      if (evt.target !== evt.currentTarget) return true // direct dblclicks only
      app._setMouseEvent(evt) // todo: remove?
      return checkAndExecute(target, WillowConstants.doubleClickCommand, evt)
    })
    bodyShadow.onShadowEventWithSelector(BrowserEvents.blur, `[${WillowConstants.blurCommand}]`, function (target, evt) {
      return checkAndExecute(target, WillowConstants.blurCommand, evt)
    })
    bodyShadow.onShadowEventWithSelector(BrowserEvents.keyup, `[${WillowConstants.keyUpCommand}]`, function (target, evt) {
      return checkAndExecute(target, WillowConstants.keyUpCommand, evt)
    })
    bodyShadow.onShadowEventWithSelector(BrowserEvents.change, `[${WillowConstants.changeCommand}]`, function (target, evt) {
      return checkAndExecute(target, WillowConstants.changeCommand, evt)
    })
  }
  stopPropagationCommand() {
    // todo: remove?
    // intentional noop
  }
  // todo: remove?
  async clearMessageBufferCommand() {
    delete this._messageBuffer
  }
  // todo: remove?
  async unmountAndDestroyCommand() {
    this.unmountAndDestroy()
  }
  toggleParticleComponentFrameworkDebuggerCommand() {
    // todo: move somewhere else?
    // todo: cleanup
    const app = this.root
    const particle = app.getParticle("ParticleComponentFrameworkDebuggerComponent")
    if (particle) {
      particle.unmountAndDestroy()
    } else {
      app.appendLine("ParticleComponentFrameworkDebuggerComponent")
      app.renderAndGetRenderReport()
    }
  }
  getStumpParticle() {
    return this._htmlStumpParticle
  }
  toHakonCode() {
    return ""
  }
  getTheme() {
    if (!this.isRoot()) return this.root.getTheme()
    if (!this._theme) this._theme = new DefaultTheme()
    return this._theme
  }
  getCommandsBuffer() {
    if (!this._commandsBuffer) this._commandsBuffer = []
    return this._commandsBuffer
  }
  addToCommandLog(command) {
    this.getCommandsBuffer().push({
      command: command,
      time: this._getProcessTimeInMilliseconds()
    })
  }
  getMessageBuffer() {
    if (!this._messageBuffer) this._messageBuffer = new Particle()
    return this._messageBuffer
  }
  // todo: move this to particle class? or other higher level class?
  addStumpCodeMessageToLog(message) {
    // note: we have 1 parameter, and are going to do type inference first.
    // Todo: add actions that can be taken from a message?
    // todo: add tests
    this.getMessageBuffer().appendLineAndSubparticles("message", message)
  }
  addStumpErrorMessageToLog(errorMessage) {
    // todo: cleanup!
    return this.addStumpCodeMessageToLog(`div
 class OhayoError
 bern${Particle.nest(errorMessage, 2)}`)
  }
  logMessageText(message = "") {
    const pre = `pre
 bern${Particle.nest(message, 2)}`
    return this.addStumpCodeMessageToLog(pre)
  }
  unmount() {
    if (
      !this.isMounted() // todo: why do we need this check?
    )
      return undefined
    this._getChildParticleComponents().forEach(subparticle => subparticle.unmount())
    this.particleComponentWillUnmount()
    this._removeCss()
    this._removeHtml()
    delete this._lastRenderedTime
    this.particleComponentDidUnmount()
  }
  _removeHtml() {
    this._htmlStumpParticle.removeStumpParticle()
    delete this._htmlStumpParticle
  }
  toStumpCode() {
    return `div
 class ${this.getCssClassNames().join(" ")}`
  }
  getCssClassNames() {
    return this._getJavascriptPrototypeChainUpTo("AbstractParticleComponentParser")
  }
  particleComponentWillMount() {}
  async particleComponentDidMount() {
    AbstractParticleComponentParser._mountedParticleComponents++
  }
  particleComponentDidUnmount() {
    AbstractParticleComponentParser._mountedParticleComponents--
  }
  particleComponentWillUnmount() {}
  getNewestTimeToRender() {
    return this._lastTimeToRender
  }
  _setLastRenderedTime(time) {
    this._lastRenderedTime = time
    return this
  }
  async particleComponentDidUpdate() {}
  _getChildParticleComponents() {
    return this.getSubparticlesByParser(AbstractParticleComponentParser)
  }
  _hasSubparticlesParticleComponents() {
    return this._getChildParticleComponents().length > 0
  }
  // todo: this is hacky. we do it so we can just mount all tiles to wall.
  getStumpParticleForSubparticles() {
    return this.getStumpParticle()
  }
  _getLastRenderedTime() {
    return this._lastRenderedTime
  }
  get _css() {
    return this.getTheme().hakonToCss(this.toHakonCode())
  }
  toPlainHtml(containerId) {
    return `<div id="${containerId}">
 <style>${this.getTheme().hakonToCss(this.toHakonCode())}</style>
${new stumpParser(this.toStumpCode()).compile()}
</div>`
  }
  _updateAndGetUpdateReport() {
    const reasonForUpdatingOrNot = this.getWhetherToUpdateAndReason()
    if (!reasonForUpdatingOrNot.shouldUpdate) return reasonForUpdatingOrNot
    this._setLastRenderedTime(this._getProcessTimeInMilliseconds())
    this._removeCss()
    this._mountCss()
    // todo: fucking switch to react? looks like we don't update parent because we dont want to nuke children.
    // okay. i see why we might do that for non tile particleComponents. but for Tile particleComponents, seems like we arent nesting, so why not?
    // for now
    if (this._hasSubparticlesParticleComponents()) return { shouldUpdate: false, reason: "did not update because is a parent" }
    this._updateHtml()
    this._lastTimeToRender = this._getProcessTimeInMilliseconds() - this._getLastRenderedTime()
    return reasonForUpdatingOrNot
  }
  _updateHtml() {
    const stumpParticleToMountOn = this._htmlStumpParticle.parent
    const currentIndex = this._htmlStumpParticle.index
    this._removeHtml()
    this._mountHtml(stumpParticleToMountOn, this._toLoadedOrLoadingStumpCode(), currentIndex)
  }
  unmountAndDestroy() {
    this.unmount()
    return this.destroy()
  }
  // todo: move to keyword particle class?
  toggle(cue, contentOptions) {
    const currentParticle = this.getParticle(cue)
    if (!contentOptions) return currentParticle ? currentParticle.unmountAndDestroy() : this.appendLine(cue)
    const currentContent = currentParticle === undefined ? undefined : currentParticle.content
    const index = contentOptions.indexOf(currentContent)
    const newContent = index === -1 || index + 1 === contentOptions.length ? contentOptions[0] : contentOptions[index + 1]
    this.delete(cue)
    if (newContent) this.touchParticle(cue).setContent(newContent)
    return newContent
  }
  isMounted() {
    return !!this._htmlStumpParticle
  }
  toggleAndRender(cue, contentOptions) {
    this.toggle(cue, contentOptions)
    this.root.renderAndGetRenderReport()
  }
  _getFirstOutdatedDependency(lastRenderedTime = this._getLastRenderedTime() || 0) {
    return this.getDependencies().find(dep => dep.getLineModifiedTime() > lastRenderedTime)
  }
  getWhetherToUpdateAndReason() {
    const mTime = this.getLineModifiedTime()
    const lastRenderedTime = this._getLastRenderedTime() || 0
    const staleTime = mTime - lastRenderedTime
    if (lastRenderedTime === 0)
      return {
        shouldUpdate: true,
        reason: "shouldUpdate because this ParticleComponent hasn't been rendered yet",
        staleTime: staleTime
      }
    if (staleTime > 0)
      return {
        shouldUpdate: true,
        reason: "shouldUpdate because this ParticleComponent changed",
        staleTime: staleTime
      }
    const outdatedDependency = this._getFirstOutdatedDependency(lastRenderedTime)
    if (outdatedDependency)
      return {
        shouldUpdate: true,
        reason: "Should update because a dependency updated",
        dependency: outdatedDependency,
        staleTime: outdatedDependency.getLineModifiedTime() - lastRenderedTime
      }
    return {
      shouldUpdate: false,
      reason: "Should NOT update because no dependency changed",
      lastRenderedTime: lastRenderedTime,
      mTime: mTime
    }
  }
  getDependencies() {
    return []
  }
  _getParticleComponentsThatNeedRendering(arr) {
    this._getChildParticleComponents().forEach(subparticle => {
      const reasonForUpdatingOrNot = subparticle.getWhetherToUpdateAndReason()
      if (!subparticle.isMounted() || reasonForUpdatingOrNot.shouldUpdate) arr.push({ subparticle: subparticle, subparticleUpdateBecause: reasonForUpdatingOrNot })
      subparticle._getParticleComponentsThatNeedRendering(arr)
    })
  }
  toStumpLoadingCode() {
    return `div Loading ${this.cue}...
 class ${this.getCssClassNames().join(" ")}
 id ${this.getParticleComponentId()}`
  }
  getParticleComponentId() {
    // html ids can't begin with a number
    return "particleComponent" + this._getUid()
  }
  _toLoadedOrLoadingStumpCode() {
    if (!this.isLoaded()) return this.toStumpLoadingCode()
    this.setRunTimePhaseError("renderPhase")
    try {
      return this.toStumpCode()
    } catch (err) {
      console.error(err)
      this.setRunTimePhaseError("renderPhase", err)
      return this.toStumpErrorStateCode(err)
    }
  }
  toStumpErrorStateCode(err) {
    return `div ${err}
 class ${this.getCssClassNames().join(" ")}
 id ${this.getParticleComponentId()}`
  }
  _mount(stumpParticleToMountOn, index) {
    this._setLastRenderedTime(this._getProcessTimeInMilliseconds())
    this.particleComponentWillMount()
    this._mountCss()
    this._mountHtml(stumpParticleToMountOn, this._toLoadedOrLoadingStumpCode(), index) // todo: add index back?
    this._lastTimeToRender = this._getProcessTimeInMilliseconds() - this._getLastRenderedTime()
    return this
  }
  // todo: we might be able to squeeze virtual dom in here on the mountCss and mountHtml methods.
  _mountCss() {
    const css = this._css
    if (!css) return this
    // todo: only insert css once per class? have a set?
    this._cssStumpParticle = this._getPageHeadStump().insertCssChildParticle(`styleTag
 for ${this.constructor.name}
 bern${Particle.nest(css, 2)}`)
  }
  _getPageHeadStump() {
    return this.root.willowBrowser.getHeadStumpParticle()
  }
  _removeCss() {
    if (!this._cssStumpParticle) return this
    this._cssStumpParticle.removeCssStumpParticle()
    delete this._cssStumpParticle
  }
  _mountHtml(stumpParticleToMountOn, htmlCode, index) {
    this._htmlStumpParticle = stumpParticleToMountOn.insertChildParticle(htmlCode, index)
    this._htmlStumpParticle.setStumpParticleParticleComponent(this)
  }
  renderAndGetRenderReport(stumpParticle, index) {
    const isUpdateOp = this.isMounted()
    let particleComponentUpdateReport = {
      shouldUpdate: false,
      reason: ""
    }
    if (isUpdateOp) particleComponentUpdateReport = this._updateAndGetUpdateReport()
    else this._mount(stumpParticle, index)
    const stumpParticleForSubparticles = this.getStumpParticleForSubparticles()
    // Todo: insert delayed rendering?
    const subparticleResults = this._getChildParticleComponents().map((subparticle, index) => subparticle.renderAndGetRenderReport(stumpParticleForSubparticles, index))
    if (isUpdateOp) {
      if (particleComponentUpdateReport.shouldUpdate) {
        try {
          if (this.isLoaded()) this.particleComponentDidUpdate()
        } catch (err) {
          console.error(err)
        }
      }
    } else {
      try {
        if (this.isLoaded()) this.particleComponentDidMount()
      } catch (err) {
        console.error(err)
      }
    }
    let str = `${this.getAtom(0) || this.constructor.name} ${isUpdateOp ? "update" : "mount"} ${particleComponentUpdateReport.shouldUpdate} ${particleComponentUpdateReport.reason}`
    subparticleResults.forEach(subparticle => (str += "\n" + subparticle.toString(1)))
    return new Particle(str)
  }
}
AbstractParticleComponentParser._mountedParticleComponents = 0
class ParticleComponentFrameworkDebuggerComponent extends AbstractParticleComponentParser {
  toHakonCode() {
    return `.ParticleComponentFrameworkDebuggerComponent
 position fixed
 top 5px
 left 5px
 z-index 1000
 background rgba(254,255,156, .95)
 box-shadow 1px 1px 1px rgba(0,0,0,.5)
 padding 12px
 overflow scroll
 max-height 500px
.ParticleComponentFrameworkDebuggerComponentCloseButton
 position absolute
 cursor pointer
 opacity .9
 top 2px
 right 2px
 &:hover
  opacity 1`
  }
  toStumpCode() {
    const app = this.root
    return `div
 class ParticleComponentFrameworkDebuggerComponent
 div x
  class ParticleComponentFrameworkDebuggerComponentCloseButton
  clickCommand toggleParticleComponentFrameworkDebuggerCommand
 div
  span This app is powered by the
  a ParticleComponentFramework
   href https://github.com/breck7/scrollsdk/tree/main/particleComponentFramework
 p ${app.numberOfLines} components loaded. ${WillowBrowser._stumpsOnPage} stumps on page.
 pre
  bern
${app.toString(3)}`
  }
}
class AbstractGithubTriangleComponent extends AbstractParticleComponentParser {
  constructor() {
    super(...arguments)
    this.githubLink = `https://github.com/breck7/scrollsdk`
  }
  toHakonCode() {
    return `.AbstractGithubTriangleComponent
 display block
 position absolute
 top 0
 right 0`
  }
  toStumpCode() {
    return `a
 class AbstractGithubTriangleComponent
 href ${this.githubLink}
 img
  src ../images/github-fork.svg`
  }
}
window.AbstractGithubTriangleComponent = AbstractGithubTriangleComponent
window.AbstractParticleComponentParser = AbstractParticleComponentParser
window.WillowBrowser = WillowBrowser
window.ParticleComponentFrameworkDebuggerComponent = ParticleComponentFrameworkDebuggerComponent