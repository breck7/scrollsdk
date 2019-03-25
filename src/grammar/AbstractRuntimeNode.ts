import TreeNode from "../base/TreeNode"
import { GrammarConstantsErrors } from "./GrammarConstants"

abstract class AbstractRuntimeNode extends TreeNode {
  getGrammarProgram(): any {}

  getProgram(): AbstractRuntimeNode {
    return this
  }

  abstract getDefinition(): any

  protected _getKeywordDefinitionByName(path: string) {
    return (
      this.getProgram()
        .getGrammarProgram()
        // todo: do we need a relative to with this keyword path?
        .getKeywordDefinitionByKeywordPath(path)
    )
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
