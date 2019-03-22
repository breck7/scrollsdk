abstract class AbstractNode {
  protected _getNow() {
    return parseFloat(process.hrtime().join(""))
  }

  toDisk(path: string, format = "tree") {
    const formats = {
      tree: tree => tree.toString(),
      csv: tree => tree.toCsv(),
      tsv: tree => tree.toTsv()
    }
    require("fs").writeFileSync(path, formats[format](this), "utf8")
    return this
  }
}

export default AbstractNode
