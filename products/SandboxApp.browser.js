//onsave jtree build produce SandboxApp.browser.js
// Todo: add inputs at the top to change the edge, node, and cell delimiters.
class SandboxApp extends AbstractTreeComponent {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      tableComponent: tableComponent,
      shareComponent: shareComponent,
      githubTriangleComponent: githubTriangleComponent,
      headerComponent: headerComponent,
      TreeComponentFrameworkDebuggerComponent: TreeComponentFrameworkDebuggerComponent
    })
  }
  loadJsonSampleCommand() {
    jQuery("#toJsonSubset")
      .val(
        `{
 "name": "jtree",
 "description": "Tree Notation parser, compiler-compiler, and virtual machine for Tree Languages",
 "keywords": "jtree"
}`
      )
      .keyup()
  }
  loadCsvSampleCommand() {
    jQuery("#csvConsole")
      .val(jtree.TreeNode.iris)
      .keyup()
  }
  get _shareLink() {
    return jQuery("#shareLink")
  }
  _updateShareLink() {
    const url = new URL(location.href)
    url.hash = ""
    const base = url.toString()
    this._shareLink.val(base + this.toShareLink())
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
  async treeComponentDidMount() {
    const app = this
    // todo: refactor!!! split these into components
    jQuery(document).ready(function() {
      const treeConsole = jQuery("#treeConsole")
      const toJsonSubset = jQuery("#toJsonSubset")
      const outlineConsole = jQuery("#outlineConsole")
      const csvConsole = jQuery("#csvConsole")
      const xmlConsole = jQuery("#xmlConsole")
      const htmlConsole = jQuery("#htmlConsole")
      const tableConsole = jQuery("#tableConsole")
      const htmlCubeConsole = jQuery("#htmlCubeConsole")
      const gridJsonConsole = jQuery("#gridJsonConsole")
      const jsonConsole = jQuery("#jsonConsole")
      const yamlConsole = jQuery("#yamlConsole")
      // Init vars
      const deepLink = app.treeFromDeepLink()
      if (deepLink) treeConsole.val(deepLink.childrenToString())
      else if (localStorage.getItem("tree")) treeConsole.val(localStorage.getItem("tree"))
      const updateAll = (tree, eventSource) => {
        if (eventSource !== treeConsole) treeConsole.val(tree.toString())
        if (eventSource !== toJsonSubset) toJsonSubset.val(tree.toJsonSubset())
        if (eventSource !== outlineConsole) outlineConsole.html(tree.toOutline())
        if (eventSource !== csvConsole) csvConsole.val(tree.toCsv())
        if (eventSource !== xmlConsole) xmlConsole.val(tree.toXml())
        if (eventSource !== htmlConsole) htmlConsole.html(tree.toHtml())
        if (eventSource !== tableConsole) tableConsole.html(tree.toTable())
        if (eventSource !== gridJsonConsole) gridJsonConsole.val(tree.toGridJson())
        if (eventSource !== jsonConsole) jsonConsole.val(tree.toJson())
        if (eventSource !== htmlCubeConsole) htmlCubeConsole.html(tree.toHtmlCube())
        if (eventSource !== yamlConsole) yamlConsole.html(tree.toYaml())
        let win = window
        win.tree = tree
        localStorage.setItem("tree", tree.toString())
        app._updateShareLink() // todo: where to put this?
      }
      // Bind listeners
      treeConsole.on("keyup", () => updateAll(new jtree.TreeNode(treeConsole.val()), treeConsole))
      toJsonSubset.on("keyup", () => updateAll(jtree.TreeNode.fromJsonSubset(toJsonSubset.val()), toJsonSubset))
      csvConsole.on("keyup", () => updateAll(jtree.TreeNode.fromCsv(csvConsole.val()), csvConsole))
      xmlConsole.on("keyup", () => updateAll(jtree.TreeNode.fromXml(xmlConsole.val()), xmlConsole))
      gridJsonConsole.on("keyup", () => updateAll(jtree.TreeNode.fromGridJson(gridJsonConsole.val()), gridJsonConsole))
      jsonConsole.on("keyup", () => updateAll(jtree.TreeNode.fromJson(jsonConsole.val()), jsonConsole))
      // Trigger start
      treeConsole.keyup()
    })
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
    src /helloWorld3D.svg
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
    this.githubLink = `https://github.com/treenotation/jtree/tree/master/sandbox`
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
  td
   div toGridJson()
   textarea
    id gridJsonConsole
 tr
  td
   div toJson()
   textarea
    id jsonConsole
  td
   div
    span toJsonSubset()
    a sample
     clickCommand loadJsonSampleCommand
   textarea
    id toJsonSubset
 tr
  td
   div
    span toCsv()
    a sample
     clickCommand loadCsvSampleCommand
   textarea
    id csvConsole
  td
   div
    span toXml()
   textarea
    id xmlConsole
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
