class TreeUtils {
  static getPathWithoutFileName(path) {
    const parts = path.split("/") // todo: change for windows?
    parts.pop()
    return parts.join("/")
  }

  static getClassNameFromFilePath(filename) {
    return filename
      .replace(/\.[^\.]+$/, "")
      .split("/")
      .pop()
  }

  static getFileExtension(url = "") {
    url = url.match(/\.([^\.]+)$/)
    return (url && url[1]) || ""
  }

  static formatStr(str, listDelimiter = " ", parameterMap) {
    return str.replace(/{([^\}]+)}/g, (match, path) => {
      const isList = path.endsWith("*")
      const typePath = path.replace("*", "")
      const arr = parameterMap[typePath]
      if (!arr) return ""
      const word = isList ? arr.join(listDelimiter) : arr.shift()
      return word
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
  static arrayToMap(arr) {
    const map = {}
    arr.forEach(val => (map[val] = true))
    return map
  }

  static mapValues(object, fn) {
    const result = {}
    Object.keys(object).forEach(key => {
      result[key] = fn(key)
    })
    return result
  }

  static sortByAccessor(accessor) {
    return (objectA, objectB) => {
      const av = accessor(objectA)
      const bv = accessor(objectB)
      let result = av < bv ? -1 : av > bv ? 1 : 0
      if (av === undefined && bv !== undefined) result = -1
      else if (bv === undefined && av !== undefined) result = 1
      return result
    }
  }
}

module.exports = TreeUtils
