import GrammarExampleNode from "./GrammarExampleNode";
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode";
import jTreeTypes from "../jTreeTypes";
declare class GrammarNodeTypeDefinitionNode extends AbstractGrammarDefinitionNode {
    _getRunTimeCatchAllNodeTypeId(): string;
    isOrExtendsANodeTypeInScope(firstWordsInScope: string[]): boolean;
    getSublimeSyntaxContextId(): string;
    getConstantsObject(): jTreeTypes.stringMap;
    private _getFirstCellHighlightScope;
    protected _getParentDefinition(): AbstractGrammarDefinitionNode;
    getMatchBlock(): string;
    private _cache_nodeTypeInheritanceSet;
    private _cache_ancestorNodeTypeIdsArray;
    getNodeTypeInheritanceSet(): Set<string>;
    private _getIdOfNodeTypeThatThisExtends;
    getAncestorNodeTypeIdsArray(): jTreeTypes.nodeTypeId[];
    protected _initNodeTypeInheritanceCache(): void;
    _getProgramNodeTypeDefinitionCache(): {
        [nodeTypeName: string]: GrammarNodeTypeDefinitionNode;
    };
    getDoc(): string;
    private _getDefaultsNode;
    getDefaultFor(name: string): string;
    getDescription(): string;
    getExamples(): GrammarExampleNode[];
    getFrequency(): number;
    private _getExtendedNodeTypeId;
    toJavascript(): jTreeTypes.javascriptCode;
}
export default GrammarNodeTypeDefinitionNode;
