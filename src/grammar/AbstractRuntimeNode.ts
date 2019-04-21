import TreeNode from "../base/TreeNode"
import { GrammarConstantsErrors } from "./GrammarConstants"

/*FOR_TYPES_ONLY*/ import GrammarProgram from "./GrammarProgram"

abstract class AbstractRuntimeNode extends TreeNode {
  getGrammarProgram() {
    return this.getProgram().getGrammarProgram()
  }

  getProgram(): AbstractRuntimeNode {
    return this
  }

  abstract getDefinition(): any

  protected _getKeywordDefinitionByName(path: string) {
    const grammarProgram = <GrammarProgram>this.getProgram().getGrammarProgram()
    // todo: do we need a relative to with this keyword path?
    return grammarProgram.getKeywordDefinitionByKeywordPath(path)
  }

  protected _getRequiredNodeErrors(errors = []) {
    const nodeDef = this.getDefinition()
    const keywords = nodeDef.getRunTimeKeywordMapWithDefinitions()
    Object.keys(keywords).forEach(keyword => {
      const def = keywords[keyword]
      if (def.isRequired() && !this.has(keyword)) {
        errors.push({
          kind: GrammarConstantsErrors.missingRequiredKeywordError,
          subkind: keyword,
          level: 0,
          context: 0,
          message: `${
            GrammarConstantsErrors.missingRequiredKeywordError
          } Required keyword missing: "${keyword}" in node '${this.getLine()}' at line '${this.getPoint().y}'`
        })
      }
    })
    return errors
  }
}

export default AbstractRuntimeNode
