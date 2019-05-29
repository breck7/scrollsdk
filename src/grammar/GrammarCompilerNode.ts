import TreeNode from "../base/TreeNode"

import { GrammarConstantsCompiler } from "./GrammarConstants"
import jTreeTypes from "../jTreeTypes"

class GrammarCompilerNode extends TreeNode {
  getFirstWordMap() {
    const types = [
      GrammarConstantsCompiler.sub,
      GrammarConstantsCompiler.indentCharacter,
      GrammarConstantsCompiler.listDelimiter,
      GrammarConstantsCompiler.openChildren,
      GrammarConstantsCompiler.closeChildren
    ]
    const map: jTreeTypes.firstWordToNodeConstructorMap = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    return map
  }

  getTargetExtension() {
    return this.getWord(1)
  }

  getListDelimiter() {
    return this.get(GrammarConstantsCompiler.listDelimiter)
  }

  getTransformation() {
    return this.get(GrammarConstantsCompiler.sub)
  }

  getIndentCharacter() {
    return this.get(GrammarConstantsCompiler.indentCharacter)
  }

  getOpenChildrenString() {
    return this.get(GrammarConstantsCompiler.openChildren) || ""
  }

  getCloseChildrenString() {
    return this.get(GrammarConstantsCompiler.closeChildren) || ""
  }
}

export default GrammarCompilerNode
