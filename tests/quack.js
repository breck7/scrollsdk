const tap = require("tap")

const quack = {}

quack.quickTest = (name, fn) => {
  tap.test(name, async childTest => {
    try {
      await fn(childTest.equal)
    } catch (err) {
      console.error(err)
      debugger
    }
    childTest.end()
  })
}

module.exports = quack
