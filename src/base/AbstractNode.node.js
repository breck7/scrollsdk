class AbstractNode {
  _getNow() {
    return parseFloat(process.hrtime().join(""))
  }
}

module.exports = AbstractNode
