import GrammarBackedNonTerminalNode from "./GrammarBackedNonTerminalNode";
import jTreeTypes from "../jTreeTypes";
declare class GrammarBackedBlobNode extends GrammarBackedNonTerminalNode {
    getFirstWordMap(): {};
    getErrors(): jTreeTypes.ParseError[];
    getCatchAllNodeConstructor(line: string): typeof GrammarBackedBlobNode;
}
export default GrammarBackedBlobNode;
