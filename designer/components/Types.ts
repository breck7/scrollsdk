export interface GrammarProvider {
  grammarConstructor: any
}

export interface EditorWorkspace {
  setCode(str: string): any
  code: string
  initCodeMirror(): any
}

export interface CodeAndGrammarApp {
  postGrammarKeyup(): any
  postCodeKeyup(): any
  codeCode: string
  grammarCode: string
  program: any
}

const LocalStorageKeys = {
  grammarConsole: "grammarConsole",
  codeConsole: "codeConsole"
}

export { LocalStorageKeys }
