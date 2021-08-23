const { AbstractTreeComponent } = require("../../products/TreeComponentFramework.node.js")
const { jtree } = require("../../index.js")

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
 span Example Languages 
${langs}`
  }
}

export { SamplesComponent }
