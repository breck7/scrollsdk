const { AbstractTreeComponent } = require("../../products/TreeComponentFramework.node.js")
const { jtree } = require("../../index.js")

declare var JSZip: any
declare var saveAs: any

class GrammarToolbarComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div
 span Grammar for your Tree Language 
 a Infer Prefix Grammar
  clickCommand inferPrefixGrammarCommand
 span  |
 a Download Bundle
  clickCommand downloadBundleCommand
 span  |
 a Synthesize Program
  clickCommand synthesizeProgramCommand`
  }

  inferPrefixGrammarCommand() {
    this.setGrammarCode(new jtree.UnknownGrammarProgram(this.getCodeValue()).inferGrammarFileForAKeywordLanguage("inferredLanguage"))
    this._onGrammarKeyup()
  }

  synthesizeProgramCommand() {
    const grammarProgram = new jtree.HandGrammarProgram(this.getGrammarCode())
    this.setCodeCode(
      grammarProgram
        .getRootNodeTypeDefinitionNode()
        .synthesizeNode()
        .join("\n")
    )
    this._onCodeKeyUp()
  }

  // TODO: ADD TESTS!!!!!
  async downloadBundleCommand() {
    const grammarProgram = new jtree.HandGrammarProgram(this.getGrammarCode())
    const bundle = grammarProgram.toBundle()
    const languageName = grammarProgram.getExtensionName()
    return this._makeZipBundle(languageName + ".zip", bundle)
  }

  private async _makeZipBundle(fileName: string, bundle: any) {
    const zip = new JSZip()
    Object.keys(bundle).forEach(key => {
      zip.file(key, bundle[key])
    })

    zip.generateAsync({ type: "blob" }).then((content: any) => {
      // see FileSaver.js
      saveAs(content, fileName)
    })
  }
}

class GrammarEditorComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `textarea
 id grammarConsole`
  }
}

class GrammarErrorBarComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div Grammar Errors
 pre
  id grammarErrorsConsole`
  }
}

class GrammarReadmeComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div
 id readmeComponent`
  }
}

class GrammarWorkspaceComponent extends AbstractTreeComponent {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      GrammarToolbarComponent,
      GrammarEditorComponent,
      GrammarErrorBarComponent,
      GrammarReadmeComponent
    })
  }
}

export { GrammarWorkspaceComponent }
