//onsave scrollsdk build produce SandboxApp.browser.js

const { AbstractParticleComponentParser, ParticleComponentFrameworkDebuggerComponent, AbstractGithubTriangleComponent } = require("../products/ParticleComponentFramework.node.js")
const { Particle } = require("../products/Particle.js")

// Todo: add inputs at the top to change the edge, node, and cell delimiters.

class SandboxApp extends AbstractParticleComponentParser {
  createParserCombinator() {
    return new Particle.ParserCombinator(undefined, {
      tableComponent,
      shareComponent,
      githubTriangleComponent,
      headerComponent,
      ParticleComponentFrameworkDebuggerComponent
    })
  }

  loadJsonSampleCommand() {
    this.willowBrowser.setValueOfElementWithIdHack(
      "toJsonSubset",
      `{
 "name": "scrollsdk",
 "description": "Scroll Notation parser, compiler-compiler, and virtual machine for Languages",
 "keywords": "scrollsdk"
}`
    )

    this.updateFromJsonSubsetCommand()
  }

  loadCsvSampleCommand() {
    this.willowBrowser.setValueOfElementWithIdHack("csvConsole", Particle.iris)

    this.updateFromCsvConsoleCommand()
  }

  private _updateShareLink() {
    const url = new URL(location.href)
    url.hash = ""
    const base = url.toString()
    this.willowBrowser.setValueOfElementWithIdHack("shareLink", base + this.toShareLink())
  }

  toShareLink() {
    const particleCode = localStorage.getItem("particle")
    if (!particleCode) return ""
    const particle = new Particle()
    particle.appendLineAndChildren("particle", particleCode)
    return "#" + encodeURIComponent(particle.toString())
  }

  private particleFromDeepLink() {
    const hash = location.hash
    if (hash.length < 2) return ""

    return new Particle(decodeURIComponent(hash.substr(1))).getParticle("particle")
  }

  updateAllCommand(particle: any, eventSource: string) {
    const { willowBrowser } = this
    if (eventSource !== "particleConsole") willowBrowser.setValueOfElementWithIdHack("particleConsole", particle.toString())
    if (eventSource !== "toJsonSubset") willowBrowser.setValueOfElementWithIdHack("toJsonSubset", particle.asJsonSubset)
    if (eventSource !== "csvConsole") willowBrowser.setValueOfElementWithIdHack("csvConsole", particle.asCsv)
    if (eventSource !== "xmlConsole") willowBrowser.setValueOfElementWithIdHack("xmlConsole", particle.asXml)
    if (eventSource !== "gridJsonConsole") willowBrowser.setValueOfElementWithIdHack("gridJsonConsole", particle.asGridJson)
    if (eventSource !== "jsonConsole") willowBrowser.setValueOfElementWithIdHack("jsonConsole", particle.asJson)
    if (eventSource !== "outlineConsole") willowBrowser.setHtmlOfElementWithIdHack("outlineConsole", particle.asOutline)
    if (eventSource !== "htmlConsole") willowBrowser.setHtmlOfElementWithIdHack("htmlConsole", particle.asHtml)
    if (eventSource !== "tableConsole") willowBrowser.setHtmlOfElementWithIdHack("tableConsole", particle.asTable)
    if (eventSource !== "htmlCubeConsole") willowBrowser.setHtmlOfElementWithIdHack("htmlCubeConsole", particle.asHtmlCube)
    if (eventSource !== "yamlConsole") willowBrowser.setHtmlOfElementWithIdHack("yamlConsole", particle.asYaml)

    let win = <any>window
    win.particle = particle
    localStorage.setItem("particle", particle.toString())
    this._updateShareLink() // todo: where to put this?
  }

  async particleComponentDidMount() {
    // todo: refactor!!! split these into components
    const particleConsoleEl = this.willowBrowser.getElementById("particleConsole")

    // Init vars
    const deepLink = this.particleFromDeepLink()
    if (deepLink) particleConsoleEl.value = deepLink.childrenToString()
    else if (localStorage.getItem("particle")) particleConsoleEl.value = localStorage.getItem("particle")

    // Trigger start
    this.updateFromParticlesConsoleCommand()
  }

  valueOf(id: string) {
    return this.willowBrowser.getElementById(id).value
  }

  updateFromXmlConsoleCommand() {
    this.updateAllCommand(Particle.fromXml(this.valueOf("xmlConsole")), "xmlConsole")
  }

  updateFromGridJsonConsoleCommand() {
    this.updateAllCommand(Particle.fromGridJson(this.valueOf("gridJsonConsole")), "gridJsonConsole")
  }

  updateFromJsonConsoleCommand() {
    this.updateAllCommand(Particle.fromJson(this.valueOf("jsonConsole")), "jsonConsole")
  }

  updateFromCsvConsoleCommand() {
    this.updateAllCommand(Particle.fromCsv(this.valueOf("csvConsole")), "csvConsole")
  }

  updateFromJsonSubsetCommand() {
    this.updateAllCommand(Particle.fromJsonSubset(this.valueOf("toJsonSubset")), "toJsonSubset")
  }

  updateFromParticlesConsoleCommand() {
    this.updateAllCommand(new Particle(this.valueOf("particleConsole")), "particleConsole")
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

class headerComponent extends AbstractParticleComponentParser {
  toHakonCode() {
    return `#logo
 width 100px
 vertical-align middle`
  }

  toStumpCode() {
    return `div
 h1
  a
   href https://notation.scroll.pub
   style text-decoration: none;
   img
    id logo
    src ../images/helloWorld3D.svg
    title Scroll.pub
  span Scroll Notation Sandbox
 p
  a Parser Designer
   href ../designer/index.html
  span  | 
  a Unit Tests
   href test.html
  span  | 
  a Perf Tests
   href perfTests.html
  span  | 
  a Debug
   clickCommand toggleParticleComponentFrameworkDebuggerCommand
  span  | Version ${Particle.getVersion()}
 p This is a simple console for exploring the base Scroll Notation. In dev tools, you can access the parsed particle below as "window.particle"`
  }
}

class shareComponent extends AbstractParticleComponentParser {
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
  githubLink = `https://github.com/breck7/scrollsdk/tree/main/sandbox`
}

class tableComponent extends AbstractParticleComponentParser {
  toStumpCode() {
    return `table
 tr
  td
   div Scroll Notation
   textarea
    id particleConsole
    keyUpCommand updateFromParticlesConsoleCommand
  td
   div asGridJson
   textarea
    id gridJsonConsole
    keyUpCommand updateFromGridJsonConsoleCommand
 tr
  td
   div asJson
   textarea
    id jsonConsole
    keyUpCommand updateFromJsonConsoleCommand
  td
   div
    span asJsonSubset
    a sample
     clickCommand loadJsonSampleCommand
   textarea
    id toJsonSubset
    keyUpCommand updateFromJsonSubsetCommand
 tr
  td
   div
    span asCsv
    a sample
     clickCommand loadCsvSampleCommand
   textarea
    id csvConsole
    keyUpCommand updateFromCsvConsoleCommand
  td
   div
    span asXml
   textarea
    id xmlConsole
    keyUpCommand updateFromXmlConsoleCommand
 tr
  td
   div asOutline
   pre
    id outlineConsole
  td
   div asHtml
   pre
    id htmlConsole
 tr
  td
   div asTable
   pre
    id tableConsole
  td
   div asYaml
   pre
    id yamlConsole
 tr
  td
   div asHtmlCube
    title Experimental. This is a very specific kind of Language.
   div
    id htmlCubeConsole
    style position:relative;`
  }
}

export { SandboxApp }
