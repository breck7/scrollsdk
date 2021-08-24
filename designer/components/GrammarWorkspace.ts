const { AbstractTreeComponent } = require("../../products/TreeComponentFramework.node.js")
const { jtree } = require("../../index.js")

declare var JSZip: any
declare var saveAs: any
declare var CodeMirror: any

declare var grammarNode: any

// todo: get typings in here.
declare var dumbdownNode: any

import { GrammarProvider, EditorWorkspace, CodeAndGrammarApp, LocalStorageKeys } from "./Types"

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

  private get grammarWorkspace() {
    return <EditorWorkspace>this.getParent()
  }

  private get code() {
    return this.grammarWorkspace.code
  }

  inferPrefixGrammarCommand() {
    this.grammarWorkspace.setCode(new jtree.UnknownGrammarProgram(this.code).inferGrammarFileForAKeywordLanguage("inferredLanguage"))
    this._onGrammarKeyup()
  }

  synthesizeProgramCommand() {
    const grammarProgram = new jtree.HandGrammarProgram(this.code)
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
    const grammarProgram = new jtree.HandGrammarProgram(this.code)
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

  start() {
    this.codeMirrorInstance = new jtree.TreeNotationCodeMirrorMode("grammar", () => grammarNode, undefined, CodeMirror).register().fromTextAreaWithAutocomplete(document.getElementById("grammarConsole"), { lineWrapping: true })

    this.codeMirrorInstance.on("keyup", () => {
      this.workspace.onKeyUp()
    })
  }

  get workspace() {
    return <GrammarWorkspaceComponent>this.getParent()
  }

  private codeMirrorInstance: any

  get code() {
    return this.codeMirrorInstance.getValue()
  }

  setCode(code: string) {
    this.codeMirrorInstance.setValue(code)
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

class GrammarWorkspaceComponent extends AbstractTreeComponent implements GrammarProvider, EditorWorkspace {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      GrammarToolbarComponent,
      GrammarEditorComponent,
      GrammarErrorBarComponent,
      GrammarReadmeComponent
    })
  }

  public grammarProgram: any

  onKeyUp() {
    this._grammarDidUpdate()
    this.designerApp.postGrammarKeyup()
  }

  get code() {
    return this.editor.code
  }

  setCode(str: string) {
    this.editor.setCode(str)
    this._grammarDidUpdate()
  }

  get designerApp() {
    return <CodeAndGrammarApp>this.getParent()
  }

  private _grammarConstructor: any
  private _cachedGrammarCode: string

  get grammarConstructor() {
    let currentGrammarCode = this.code

    if (!this._grammarConstructor || currentGrammarCode !== this._cachedGrammarCode) {
      try {
        this._grammarConstructor = new jtree.HandGrammarProgram(currentGrammarCode).compileAndReturnRootConstructor()
        this._cachedGrammarCode = currentGrammarCode
        this.willowBrowser.setHtmlOfElementWithIdHack("ErrorDisplayComponent")
      } catch (err) {
        console.error(err)
        this.willowBrowser.setHtmlOfElementWithIdHack("ErrorDisplayComponent", err)
      }
    }
    return this._grammarConstructor
  }

  get editor(): GrammarEditorComponent {
    return this.getNode("GrammarEditorComponent")
  }

  private _getGrammarErrors(grammarCode: string) {
    return new grammarNode(grammarCode).getAllErrors()
  }

  private _updateLocalStorage() {
    localStorage.setItem(LocalStorageKeys.grammarConsole, this.code)
  }

  private _grammarDidUpdate() {
    this._updateLocalStorage()
    this.grammarProgram = new grammarNode(this.code)
    this._updateErrorConsole()
    this._updateReadme()
  }

  private _updateErrorConsole() {
    const errs = this.grammarProgram.getAllErrors().map((err: any) => err.toObject())
    this.willowBrowser.setHtmlOfElementWithIdHack("grammarErrorsConsole", errs.length ? new jtree.TreeNode(errs).toFormattedTable(200) : "0 errors")
  }

  private _updateReadme() {
    const grammarProgram = new jtree.HandGrammarProgram(this.code)
    const readme = new dumbdownNode(grammarProgram.toReadMe()).compile()
    this.willowBrowser.setHtmlOfElementWithIdHack("readmeComponent", readme)
  }
}

export { GrammarWorkspaceComponent }
