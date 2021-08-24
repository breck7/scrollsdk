export interface GrammarProvider {
  grammarConstructor: any
}

export interface EditorWorkspace {
  setCode(str: string): any
  code: string
}

export interface CodeAndGrammarApp {
  postGrammarKeyup(): any
  postCodeKeyup(): any
}

export enum LocalStorageKeys {
  grammarConsole = "grammarConsole",
  codeConsole = "codeConsole"
}
