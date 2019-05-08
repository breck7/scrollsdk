#! /usr/local/bin/node --use_strict

const fs = require("fs")
const glob = require("glob")

const jtree = require("../index.js")
const TreeNode = jtree.TreeNode
const Utils = jtree.Utils

const combine = (outputPath, globPatterns, prepareForDistribute = false) => {
  const files = globPatterns.map(pattern => glob.sync(pattern)).flat()
  const content = files
    .map(path => {
      const distributeLine = prepareForDistribute ? `#file ${path}\n` : ""
      return distributeLine + fs.readFileSync(path, "utf8")
    })
    .join("\n")

  const node = new TreeNode(content)
  node.delete("#onsave")

  const distributeFilePath = __filename.replace("combine.js", "distribute.js")
  if (prepareForDistribute) node.prependLine(`#onsave ${distributeFilePath}`)

  fs.writeFileSync(outputPath, node.toString(), "utf8")
  console.log("Done")
}

if (!module.parent) {
  const outputFilePath = process.argv[2]
  const globPatterns = process.argv.slice(3)

  if (!outputFilePath) throw new Error(`Error: No output file specified`)
  if (!globPatterns.length) throw new Error(`Error: No globPatterns specified`)

  try {
    console.log(`Combining files '${globPatterns.join(",")}' into '${outputFilePath}'`)
    combine(outputFilePath, globPatterns)
  } catch (err) {
    console.log(err)
  }
}

module.exports = combine
