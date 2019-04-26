#! /usr/local/bin/node --use_strict

const fs = require("fs")
const jtree = require("../index.js")
const TreeNode = jtree.TreeNode
const Utils = jtree.Utils

const combine = (outputPath, inputFilePath) => {
  console.log("Working...")
  const folderPath = Utils.getPathWithoutFileName(inputFilePath) + "/"
  const fileExtension = Utils.getFileExtension(inputFilePath)
  const content = fs
    .readdirSync(folderPath)
    .filter(a => a.endsWith("." + fileExtension))
    .map(file => {
      const path = folderPath + file
      return `#file ${path}\n` + fs.readFileSync(path, "utf8")
    })
    .join("\n")

  const node = new TreeNode(content)
  node.delete("#onsave")

  const distributeFilePath = __filename.replace("combine.js", "distribute.js")
  node.prependLine(`#onsave ${distributeFilePath}`)
  fs.writeFileSync(outputPath, node.toString(), "utf8")
  console.log("Done")
}

const theSavedFilepath = process.argv[3]
const outputFilePath = process.argv[2]

console.log(`Combining files like ${theSavedFilepath} into ${outputFilePath}`)

if (!theSavedFilepath) console.log(`Error: No output file specified`)
else {
  try {
    combine(outputFilePath, theSavedFilepath)
  } catch (err) {
    console.log(err)
  }
}
