import { AbstractRuntimeProgramRootNode } from "./GrammarLanguage"

interface AbstractRuntimeProgramConstructorInterface {
  new (code: string): AbstractRuntimeProgramRootNode
}

export default AbstractRuntimeProgramConstructorInterface
