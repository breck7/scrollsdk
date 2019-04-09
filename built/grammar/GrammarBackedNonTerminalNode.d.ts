import AbstractRuntimeCodeNode from "./AbstractRuntimeCodeNode";
declare class GrammarBackedNonTerminalNode extends AbstractRuntimeCodeNode {
    getKeywordMap(): any;
    getCatchAllNodeConstructor(line: string): any;
    protected _getNodeJoinCharacter(): string;
    compile(targetExtension: any): string;
}
export default GrammarBackedNonTerminalNode;
