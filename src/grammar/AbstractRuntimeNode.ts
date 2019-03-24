import TreeNode from "../base/TreeNode"
import GrammarConstants from "./GrammarConstants"

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
          kind: GrammarConstants.errors.missingRequiredKeywordError,
          subkind: keyword,
          level: 0,
          context: 0,
          message: `${
            GrammarConstants.errors.missingRequiredKeywordError
          } Required keyword missing: "${keyword}" in node '${this.getLine()}' at line '${this.getPoint().y}'`
        })
      }
    })
    return errors
  }
}

export default AbstractRuntimeNode
