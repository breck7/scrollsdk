import AbstractRuntimeCodeNode from "./AbstractRuntimeCodeNode";
import { GrammarConstantsErrors } from "./GrammarConstants";
declare class GrammarBackedErrorNode extends AbstractRuntimeCodeNode {
    getLineSyntax(): string;
    getErrors(): {
        kind: GrammarConstantsErrors;
        subkind: string;
        context: string;
        level: number;
        message: string;
    }[];
}
export default GrammarBackedErrorNode;
