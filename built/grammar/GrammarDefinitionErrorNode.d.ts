import TreeNode from "../base/TreeNode";
import { GrammarConstantsErrors } from "./GrammarConstants";
declare class GrammarDefinitionErrorNode extends TreeNode {
    getErrors(): {
        kind: GrammarConstantsErrors;
        subkind: string;
        level: number;
        context: string;
        message: string;
    }[];
    getLineSyntax(): string;
}
export default GrammarDefinitionErrorNode;
