const samples = {}

samples.csv = TreeNode.iris

samples.json = `{
 "name": "jtree",
 "version": "18.1.3",
 "description": "Tree Notation parser, compiler-compiler, and virtual machine for Tree Languages",
 "main": "index.js",
 "types": "./built/jtree.node.d.ts",
 "bin": {
  "jtree": "./cli.js"
 },
 "scripts": {
  "test": "./tasks/test.js",
  "cover": "./tasks/cover.sh",
  "start": "./sandbox.express.js"
 },
 "repository": {
  "type": "git",
  "url": "git://github.com/treenotation/jtree"
 },
 "keywords": "jtree",
 "devDependencies": {
  "express": "*",
  "jquery": "*",
  "project-lang": "^1.7.0",
  "qunitjs": "*",
  "recursive-readdir-sync": "*",
  "tap": "^12.6.0",
  "@types/node": "^11.10.4",
  "tap-mocha-reporter": "^4.0.1"
 },
 "license": "MIT"
}`

$(document).ready(function() {
  const treeConsole = $("#treeConsole")
  const jsonConsole = $("#jsonConsole")
  const outlineConsole = $("#outlineConsole")
  const csvConsole = $("#csvConsole")
  const xmlConsole = $("#xmlConsole")
  const htmlConsole = $("#htmlConsole")
  const tableConsole = $("#tableConsole")
  const yamlConsole = $("#yamlConsole")

  $("#jsonSample").on("click", () => jsonConsole.val(samples.json).keyup())
  $("#csvSample").on("click", () => csvConsole.val(samples.csv).keyup())

  // Init vars
  if (localStorage.getItem("tree")) treeConsole.val(localStorage.getItem("tree"))
  $("#version").html("Version: " + jtree.getVersion())

  const updateAll = (tree, eventSource) => {
    if (eventSource !== treeConsole) treeConsole.val(tree.toString())
    if (eventSource !== jsonConsole) jsonConsole.val(tree.toJsonSubset())
    if (eventSource !== outlineConsole) outlineConsole.html(tree.toOutline())
    if (eventSource !== csvConsole) csvConsole.val(tree.toCsv())
    if (eventSource !== xmlConsole) xmlConsole.val(tree.toXml())
    if (eventSource !== htmlConsole) htmlConsole.html(tree.toHtml())
    if (eventSource !== tableConsole) tableConsole.html(tree.toTable())
    if (eventSource !== yamlConsole) yamlConsole.html(tree.toYaml())

    window.tree = tree
    localStorage.setItem("tree", tree.toString())
  }

  // Bind listeners
  treeConsole.on("keyup", () => updateAll(new TreeNode(treeConsole.val()), treeConsole))
  jsonConsole.on("keyup", () => updateAll(TreeNode.fromJsonSubset(jsonConsole.val()), jsonConsole))
  csvConsole.on("keyup", () => updateAll(TreeNode.fromCsv(csvConsole.val()), csvConsole))
  xmlConsole.on("keyup", () => updateAll(TreeNode.fromXml(xmlConsole.val()), xmlConsole))

  // Trigger start
  treeConsole.keyup()
})
