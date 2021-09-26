const { AbstractTreeComponent } = require("../../products/TreeComponentFramework.node.js")
const { jtree } = require("../../index.js")

// http://localhost:3333/designer/#url%20https://simoji.pub/simoji.grammar
// http://localhost:3333/designer/#url%20https://scroll.pub/scrolldown.grammar

class SamplesComponent extends AbstractTreeComponent {
  languages = "newlang hakon stump dumbdown arrow dug iris fire chuck wwt swarm project stamp grammar config jibberish numbers poop".split(" ")

  toStumpCode() {
    const langs = this.languages
      .map(
        (lang: string) => ` a ${jtree.Utils.ucfirst(lang)}
  href #standard%20${lang}
  value ${lang}
  clickCommand fetchAndLoadJtreeShippedLanguageCommand`
      )
      .join("\n span  | \n")
    return `p
 class SamplesComponent
 span Example Languages 
${langs}`
  }
}

export { SamplesComponent }
