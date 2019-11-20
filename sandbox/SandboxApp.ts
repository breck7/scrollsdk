//onsave jtree build produce SandboxApp.browser.js

const { AbstractTreeComponent, WillowConstants, TreeComponentFrameworkDebuggerComponent, AbstractGithubTriangleComponent } = require("../products/TreeComponentFramework.node.js")
const { jtree } = require("../index.js")

declare var jQuery: any

class SandboxApp extends AbstractTreeComponent {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      tableComponent: tableComponent,
      githubTriangleComponent: githubTriangleComponent,
      headerComponent: headerComponent,
      TreeComponentFrameworkDebuggerComponent: TreeComponentFrameworkDebuggerComponent
    })
  }

  loadJsonSampleCommand() {
    jQuery("#jsonConsole")
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

  async appWillFirstRender() {
    // todo: refactor!!! splut these into components

    const willowBrowser = this.getWillowProgram()
    const bodyShadow = willowBrowser.getBodyStumpNode().getShadow()

    jQuery(document).ready(function() {
      const treeConsole = jQuery("#treeConsole")
      const jsonConsole = jQuery("#jsonConsole")
      const outlineConsole = jQuery("#outlineConsole")
      const csvConsole = jQuery("#csvConsole")
      const xmlConsole = jQuery("#xmlConsole")
      const htmlConsole = jQuery("#htmlConsole")
      const tableConsole = jQuery("#tableConsole")
      const yamlConsole = jQuery("#yamlConsole")

      // Init vars
      if (localStorage.getItem("tree")) treeConsole.val(localStorage.getItem("tree"))

      const updateAll = (tree: any, eventSource: any) => {
        if (eventSource !== treeConsole) treeConsole.val(tree.toString())
        if (eventSource !== jsonConsole) jsonConsole.val(tree.toJsonSubset())
        if (eventSource !== outlineConsole) outlineConsole.html(tree.toOutline())
        if (eventSource !== csvConsole) csvConsole.val(tree.toCsv())
        if (eventSource !== xmlConsole) xmlConsole.val(tree.toXml())
        if (eventSource !== htmlConsole) htmlConsole.html(tree.toHtml())
        if (eventSource !== tableConsole) tableConsole.html(tree.toTable())
        if (eventSource !== yamlConsole) yamlConsole.html(tree.toYaml())

        let win = <any>window
        win.tree = tree
        localStorage.setItem("tree", tree.toString())
      }

      // Bind listeners
      treeConsole.on("keyup", () => updateAll(new jtree.TreeNode(treeConsole.val()), treeConsole))
      jsonConsole.on("keyup", () => updateAll(jtree.TreeNode.fromJsonSubset(jsonConsole.val()), jsonConsole))
      csvConsole.on("keyup", () => updateAll(jtree.TreeNode.fromCsv(csvConsole.val()), csvConsole))
      xmlConsole.on("keyup", () => updateAll(jtree.TreeNode.fromXml(xmlConsole.val()), xmlConsole))

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
textarea,pre
 width 500px
 padding 5px
 margin 5px
 height 200px
 font-size 14px
 white-space pre
 overflow scroll
pre
 line-height 14px
.keyword
 color green`
  }

  static getDefaultStartState() {
    return `headerComponent
tableComponent
githubTriangleComponent`
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
   ${WillowConstants.DataShadowEvents.onClickCommand} toggleTreeComponentFrameworkDebuggerCommand
  span  | Version ${jtree.getVersion()}
 p This is a simple console for exploring the base Tree Notation. In dev tools, you can access the parsed tree below as "window.tree"`
  }
}

class githubTriangleComponent extends AbstractGithubTriangleComponent {
  githubLink = `https://github.com/treenotation/jtree/tree/master/sandbox`
}

class tableComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `table
 tr
  td
   div Tree
   textarea
    id treeConsole
  td
   div
    span toJsonSubset()
    a sample
     ${WillowConstants.DataShadowEvents.onClickCommand} loadJsonSampleCommand
   textarea
    id jsonConsole
 tr
  td
   div
    span toCsv()
    a sample
     ${WillowConstants.DataShadowEvents.onClickCommand} loadCsvSampleCommand
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
    id yamlConsole`
  }
}

export { SandboxApp }
