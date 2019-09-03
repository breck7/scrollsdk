const moment = require("moment")
// https://github.com/moment/moment/issues/2469
// todo: ugly. how do we ditch this or test?
moment.createFromInputFallback = function(momentConfig) {
  momentConfig._d = new Date(momentConfig._i)
}

class Metrics {
  /**
   * Return inches given formats like 6'1 6'2"
   *
   * @param num string
   * @return int|null|NaN
   */
  static feetToInches = numStr => {
    let result = 0
    const indexOfDelimited = numStr.search(/[^0-9\.]/)
    if (indexOfDelimited < 1) {
      result = parseFloat(numStr.replace(/[^0-9\.]/g, ""))
      return isNaN(result) ? result : result * 12
    }
    const feetPart = parseFloat(numStr.substr(0, indexOfDelimited).replace(/[^0-9\.]/g, ""))
    const inchesPart = parseFloat(numStr.substr(indexOfDelimited).replace(/[^0-9\.]/g, ""))
    if (!isNaN(feetPart)) result += feetPart * 12
    if (!isNaN(inchesPart)) result += inchesPart
    return result
  }

  /**
   * @param value any
   * @return moment|invalidMoment
   */
  static getDateAsUnixUtx = value => Metrics.getDate(value, moment.utc).unix()
  static getDate = (value, momentFn = moment) => {
    let result = momentFn(value)

    if (result.isValid()) return result

    if (typeof value === "string" && value.match(/^[0-9]{8}$/)) {
      const first2 = parseInt(value.substr(0, 2))
      const second2 = parseInt(value.substr(2, 2))
      const third2 = parseInt(value.substr(4, 2))
      const last2 = parseInt(value.substr(6, 2))
      const first4 = parseInt(value.substr(0, 4))
      const last4 = parseInt(value.substr(4, 4))

      const first2couldBeDay = first2 < 32
      const first2couldBeMonth = first2 < 13
      const second2couldBeDay = second2 < 32
      const second2couldBeMonth = second2 < 13
      const third2couldBeDay = third2 < 32
      const third2couldBeMonth = third2 < 13
      const last2couldBeDay = last2 < 32
      const last2couldBeMonth = last2 < 13
      const last4looksLikeAYear = last4 > 1000 && last4 < 2100
      const first4looksLikeAYear = first4 > 1000 && first4 < 2100

      // MMDDYYYY
      // YYYYMMDD
      // Prioritize the above 2 american versions
      // YYYYDDMM
      // DDMMYYYY

      if (first2couldBeMonth && second2couldBeDay && last4looksLikeAYear) result = momentFn(value, "MMDDYYYY")
      else if (first4looksLikeAYear && third2couldBeMonth && last2couldBeDay) result = momentFn(value, "YYYYMMDD")
      else if (first4looksLikeAYear && last2couldBeMonth) result = momentFn(value, "YYYYDDMM")
      else result = momentFn(value, "DDMMYYYY")

      return result
    } else if (typeof value === "string" && value.match(/^[0-9]{2}\/[0-9]{4}$/))
      // MM/YYYY
      return momentFn(value, "MM/YYYY")

    // Check if timestamp
    if (value.match && !value.match(/[^0-9]/)) {
      const num = parseFloat(value)
      if (!isNaN(num)) {
        if (value.length === 10) return momentFn(num * 1000)
        else return momentFn(num)
      }
    }

    // Okay to return an invalid result if we dont find a match
    // todo: why??? should we return "" instead ?
    return result
  }
}

export { Metrics }
