abstract class AbstractNode {
  protected _getNow() {
    return parseFloat(process.hrtime().join(""))
  }
}

export default AbstractNode
