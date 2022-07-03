//onsave jtree build produce SandboxApp.browser.js
// Todo: add inputs at the top to change the edge, node, and cell delimiters.
class SandboxApp extends AbstractTreeComponent {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      tableComponent,
      shareComponent,
      githubTriangleComponent,
      headerComponent,
      TreeComponentFrameworkDebuggerComponent
    })
  }
  loadJsonSampleCommand() {
    this.willowBrowser.setValueOfElementWithIdHack(
      "toJsonSubset",
      `{
 "name": "jtree",
 "description": "Tree Notation parser, compiler-compiler, and virtual machine for Tree Languages",
 "keywords": "jtree"
}`
    )
    this.updateFromJsonSubsetCommand()
  }
  loadCsvSampleCommand() {
    this.willowBrowser.setValueOfElementWithIdHack("csvConsole", jtree.TreeNode.iris)
    this.updateFromCsvConsoleCommand()
  }
  _updateShareLink() {
    const url = new URL(location.href)
    url.hash = ""
    const base = url.toString()
    this.willowBrowser.setValueOfElementWithIdHack("shareLink", base + this.toShareLink())
  }
  toShareLink() {
    const treeCode = localStorage.getItem("tree")
    if (!treeCode) return ""
    const tree = new jtree.TreeNode()
    tree.appendLineAndChildren("tree", treeCode)
    return "#" + encodeURIComponent(tree.toString())
  }
  treeFromDeepLink() {
    const hash = location.hash
    if (hash.length < 2) return ""
    return new jtree.TreeNode(decodeURIComponent(hash.substr(1))).getNode("tree")
  }
  updateAllCommand(tree, eventSource) {
    const { willowBrowser } = this
    if (eventSource !== "treeConsole") willowBrowser.setValueOfElementWithIdHack("treeConsole", tree.toString())
    if (eventSource !== "toJsonSubset") willowBrowser.setValueOfElementWithIdHack("toJsonSubset", tree.toJsonSubset())
    if (eventSource !== "csvConsole") willowBrowser.setValueOfElementWithIdHack("csvConsole", tree.toCsv())
    if (eventSource !== "xmlConsole") willowBrowser.setValueOfElementWithIdHack("xmlConsole", tree.toXml())
    if (eventSource !== "gridJsonConsole") willowBrowser.setValueOfElementWithIdHack("gridJsonConsole", tree.toGridJson())
    if (eventSource !== "jsonConsole") willowBrowser.setValueOfElementWithIdHack("jsonConsole", tree.toJson())
    if (eventSource !== "outlineConsole") willowBrowser.setHtmlOfElementWithIdHack("outlineConsole", tree.toOutline())
    if (eventSource !== "htmlConsole") willowBrowser.setHtmlOfElementWithIdHack("htmlConsole", tree.toHtml())
    if (eventSource !== "tableConsole") willowBrowser.setHtmlOfElementWithIdHack("tableConsole", tree.toTable())
    if (eventSource !== "htmlCubeConsole") willowBrowser.setHtmlOfElementWithIdHack("htmlCubeConsole", tree.toHtmlCube())
    if (eventSource !== "yamlConsole") willowBrowser.setHtmlOfElementWithIdHack("yamlConsole", tree.toYaml())
    let win = window
    win.tree = tree
    localStorage.setItem("tree", tree.toString())
    this._updateShareLink() // todo: where to put this?
  }
  async treeComponentDidMount() {
    // todo: refactor!!! split these into components
    const treeConsoleEl = this.willowBrowser.getElementById("treeConsole")
    // Init vars
    const deepLink = this.treeFromDeepLink()
    if (deepLink) treeConsoleEl.value = deepLink.childrenToString()
    else if (localStorage.getItem("tree")) treeConsoleEl.value = localStorage.getItem("tree")
    // Trigger start
    this.updateFromTreeConsoleCommand()
  }
  valueOf(id) {
    return this.willowBrowser.getElementById(id).value
  }
  updateFromXmlConsoleCommand() {
    this.updateAllCommand(jtree.TreeNode.fromXml(this.valueOf("xmlConsole")), "xmlConsole")
  }
  updateFromGridJsonConsoleCommand() {
    this.updateAllCommand(jtree.TreeNode.fromGridJson(this.valueOf("gridJsonConsole")), "gridJsonConsole")
  }
  updateFromJsonConsoleCommand() {
    this.updateAllCommand(jtree.TreeNode.fromJson(this.valueOf("jsonConsole")), "jsonConsole")
  }
  updateFromCsvConsoleCommand() {
    this.updateAllCommand(jtree.TreeNode.fromCsv(this.valueOf("csvConsole")), "csvConsole")
  }
  updateFromJsonSubsetCommand() {
    this.updateAllCommand(jtree.TreeNode.fromJsonSubset(this.valueOf("toJsonSubset")), "toJsonSubset")
  }
  updateFromTreeConsoleCommand() {
    this.updateAllCommand(new jtree.TreeNode(this.valueOf("treeConsole")), "treeConsole")
  }
  toHakonCode() {
    const theme = this.getTheme()
    return `body
 font-family "San Francisco", "Myriad Set Pro", "Lucida Grande", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif
 margin auto
 max-width 1200px
 background #eee
 color rgba(1, 47, 52, 1)
 h1
  font-weight 300
textarea,input
 background #eee
a
 text-decoration underline
 cursor pointer
.htmlCubeSpan
 --topIncrement 1px
 --leftIncrement 1px
 --cellWidth 100px
 --rowHeight 30px
 position absolute
 box-sizing border-box
 width var(--cellWidth)
 height var(--rowHeight)
 overflow hidden
 text-overflow hidden
 display inline-block
 text-align center
 line-height var(--rowHeight)
 font-size 12px
 font-family -apple-system, BlinkMacSystemFont, sans-serif
 color rgba(0, 0, 0, 0.8)
 background rgba(255, 255, 255, 1)
 border 1px solid rgba(0, 0, 0, 0.3)
 &:hover
  opacity 1
  background rgba(255, 255, 255, 1)
  z-index 2
textarea,pre
 width 500px
 padding 5px
 margin 5px
 height 200px
 font-size 14px
 white-space pre
 overflow scroll
input
 border 1px solid black
pre
 line-height 14px
.keyword
 color green`
  }
}
class headerComponent extends AbstractTreeComponent {
  toHakonCode() {
    return `#logo
 width 100px
 vertical-align middle`
  }
  toStumpCode() {
    return `div
 h1
  a
   href https://treenotation.org
   style text-decoration: none;
   img
    id logo
    src /images/helloWorld3D.svg
    title TreeNotation.org
  span Tree Notation Sandbox
 p
  a Tree Language Designer
   href /designer/
  span  | 
  a Unit Tests
   href test.html
  span  | 
  a Perf Tests
   href perfTests.html
  span  | 
  a Debug
   clickCommand toggleTreeComponentFrameworkDebuggerCommand
  span  | Version ${jtree.getVersion()}
 p This is a simple console for exploring the base Tree Notation. In dev tools, you can access the parsed tree below as "window.tree"`
  }
}
class shareComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div
 id shareDiv
 span Share
 input
  id shareLink
  readonly`
  }
  toHakonCode() {
    return `#shareDiv
 font-size 16px
 width 100%
 span
  width 50px
  display inline-block
 input
  font-size 16px
  padding 5px`
  }
}
class githubTriangleComponent extends AbstractGithubTriangleComponent {
  constructor() {
    super(...arguments)
    this.githubLink = `https://github.com/treenotation/jtree/tree/main/sandbox`
  }
}
class tableComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `table
 tr
  td
   div Tree Notation
   textarea
    id treeConsole
    keyUpCommand updateFromTreeConsoleCommand
  td
   div toGridJson()
   textarea
    id gridJsonConsole
    keyUpCommand updateFromGridJsonConsoleCommand
 tr
  td
   div toJson()
   textarea
    id jsonConsole
    keyUpCommand updateFromJsonConsoleCommand
  td
   div
    span toJsonSubset()
    a sample
     clickCommand loadJsonSampleCommand
   textarea
    id toJsonSubset
    keyUpCommand updateFromJsonSubsetCommand
 tr
  td
   div
    span toCsv()
    a sample
     clickCommand loadCsvSampleCommand
   textarea
    id csvConsole
    keyUpCommand updateFromCsvConsoleCommand
  td
   div
    span toXml()
   textarea
    id xmlConsole
    keyUpCommand updateFromXmlConsoleCommand
 tr
  td
   div toOutline()
   pre
    id outlineConsole
  td
   div toHtml()
   pre
    id htmlConsole
 tr
  td
   div toTable()
   pre
    id tableConsole
  td
   div toYaml()
   pre
    id yamlConsole
 tr
  td
   div toHtmlCube()
    title Experimental. This is a very specific kind of Tree Language.
   div
    id htmlCubeConsole
    style position:relative;`
  }
}
window.SandboxApp = SandboxApp
