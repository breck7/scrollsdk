import { AbstractRuntimeProgramRootNode } from "./AbstractRuntimeNodes"

interface AbstractRuntimeProgramConstructorInterface {
  new (code: string): AbstractRuntimeProgramRootNode
}

export default AbstractRuntimeProgramConstructorInterface
