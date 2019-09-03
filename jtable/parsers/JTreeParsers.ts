const { jtree } = require("../../products/jtree.node.js")

import { jTableTypes } from "../../worldWideTypes/jTableTypes"
import { TableParserIds } from "../JTableConstants"

import { AbstractTableParser } from "./AbstractTableParser"

// todo: remove?
abstract class AbstractJTreeTableParser extends AbstractTableParser {
  _parseTableInputsFromString(str: string) {
    return {
      rows: this._parseTrees(str)
        .filter(node => node.length)
        .map(node => node.toObject())
    }
  }

  protected _parseTrees(str: string): jTableTypes.treeNode[] {
    return []
  }
}

class CsvParser extends AbstractJTreeTableParser {
  getExample() {
    return `name,age,height
john,12,50`
  }

  _parseTrees(str) {
    return jtree.TreeNode.fromCsv(str)
  }

  getProbForRowSpecimen(specimen) {
    if (!specimen.firstLineCommaCount) return 0
    if (specimen.blankLineCount) return 0.05
    return 0.49
  }

  getParserId() {
    return TableParserIds.csv
  }
}

class TsvParser extends AbstractJTreeTableParser {
  getExample() {
    return `name\tage\theight
john\t12\t50`
  }

  _parseTrees(str) {
    return jtree.TreeNode.fromTsv(str)
  }

  getProbForRowSpecimen(specimen) {
    if (!specimen.firstLineTabCount) return 0
    else if (specimen.tabCount > 5) return 0.9
    return 0.25
  }

  getParserId() {
    return TableParserIds.tsv
  }
}

class PsvParser extends AbstractJTreeTableParser {
  getParserId() {
    return TableParserIds.psv
  }

  getExample() {
    return `name|age
mike|33`
  }

  _parseTrees(str) {
    return jtree.TreeNode.fromDelimited(str, "|", '"')
  }

  getProbForRowSpecimen(specimen) {
    // vertical bar separated file
    if (!specimen.firstLineVerticalBarCount) return 0
    else if (specimen.verticalBarCount >= specimen.lineCount) return 0.8
    return 0.01
  }
}

class SsvParser extends AbstractJTreeTableParser {
  getExample() {
    return `name age height
john 12 50`
  }

  getParserId() {
    return TableParserIds.ssv
  }

  _parseTrees(str) {
    return jtree.TreeNode.fromSsv(str)
  }

  getProbForRowSpecimen(specimen) {
    if (!specimen.firstLineSpaceCount) return 0
    if (specimen.blankLineCount) return 0.05
    return 0.11
  }
}

class XmlParser extends AbstractJTreeTableParser {
  getProbForRowSpecimen(specimen) {
    return specimen.trimmedStr.match(/^ *\</) ? 1 : 0
  }

  getExample() {
    return `<person>
 <name>bob</name><age>32</age></person>`
  }

  getParserId() {
    return TableParserIds.xml
  }

  _parseTrees(str) {
    // todo: fix this! Create an XML Tree Language
    if (this.isNodeJs()) return new jtree.TreeNode(str)
    return jtree.TreeNode.fromXml(str)
  }
}

class HtmlParser extends AbstractJTreeTableParser {
  getProbForRowSpecimen(specimen) {
    return specimen.trimmedStr.match(/^(\<\!doctype html\>|\<html|\<div)/i) ? 1 : 0
  }

  getExample() {
    return `<!doctype html>
<html>
 <head>bam</head></html>`
  }

  getParserId() {
    return TableParserIds.html
  }

  _parseTrees(str) {
    if (this.isNodeJs()) return new jtree.TreeNode(str)
    return jtree.TreeNode.fromXml(str)
  }
}

class TreeRowsParser extends AbstractJTreeTableParser {
  getExample() {
    return `person
 name john
 age 12
 height 50`
  }

  _parseTableInputsFromString(str: string) {
    // todo: get columns on first pass.
    const rows = new jtree.TreeNode(str)
    return {
      rows: rows.map(node => node.toObject()),
      columnDefinitions: rows.getColumnNames().map(name => {
        return { name: name }
      })
    }
  }

  getProbForRowSpecimen(specimen) {
    if (specimen.indentedLineCount < 1) return 0
    return 0.1
  }

  getParserId() {
    return TableParserIds.treeRows
  }
}

class TreeParser extends AbstractJTreeTableParser {
  getExample() {
    return `country
 name USA
 state
  name MA
  city
   name Brockton`
  }

  _parseTrees(str) {
    // todo: add tests. Detected value(s) or undefined subtrees, treating as object.
    const newTree = new jtree.TreeNode()
    newTree.pushContentAndChildren(undefined, str instanceof jtree.TreeNode ? str : new jtree.TreeNode(str))
    return newTree
  }

  getProbForRowSpecimen(specimen) {
    return 0
  }

  getParserId() {
    return TableParserIds.tree
  }
}

export { CsvParser, TsvParser, SsvParser, PsvParser, TreeRowsParser, TreeParser, XmlParser, HtmlParser }
