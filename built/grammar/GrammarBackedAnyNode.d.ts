import GrammarBackedNonTerminalNode from "./GrammarBackedNonTerminalNode";
declare class GrammarBackedAnyNode extends GrammarBackedNonTerminalNode {
    getKeywordMap(): {};
    getErrors(): any[];
    getCatchAllNodeConstructor(line: any): typeof GrammarBackedAnyNode;
}
export default GrammarBackedAnyNode;
