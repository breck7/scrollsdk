"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const GrammarConstants_1 = require("./GrammarConstants");
class UnknownGrammarProgram extends TreeNode_1.default {
    getPredictedGrammarFile(grammarName) {
        const rootNode = new TreeNode_1.default(`grammar
 name ${grammarName}`);
        // note: right now we assume 1 global cellTypeMap and keywordMap per grammar. But we may have scopes in the future?
        const globalCellTypeMap = new Map();
        const xi = this.getXI();
        const yi = this.getYI();
        this.getKeywords().forEach(keyword => rootNode.touchNode(`grammar keywords ${keyword}`));
        const clone = this.clone();
        let allNodes = clone.getTopDownArrayIterator();
        let node;
        for (node of allNodes) {
            const keyword = node.getKeyword();
            const asInt = parseInt(keyword);
            if (!isNaN(asInt) && asInt.toString() === keyword && node.getParent().getKeyword())
                node.setKeyword(node.getParent().getKeyword() + "Child");
        }
        allNodes = clone.getTopDownArrayIterator();
        const allChilds = {};
        const allKeywordNodes = {};
        for (let node of allNodes) {
            const keyword = node.getKeyword();
            if (!allChilds[keyword])
                allChilds[keyword] = {};
            if (!allKeywordNodes[keyword])
                allKeywordNodes[keyword] = [];
            allKeywordNodes[keyword].push(node);
            node.forEach((child) => {
                allChilds[keyword][child.getKeyword()] = true;
            });
        }
        const lineCount = clone.getNumberOfLines();
        const keywords = Object.keys(allChilds).map(keyword => {
            const defNode = new TreeNode_1.default(`${GrammarConstants_1.GrammarConstants.keyword} ${keyword}`).nodeAt(0);
            const childKeywords = Object.keys(allChilds[keyword]);
            if (childKeywords.length) {
                //defNode.touchNode(GrammarConstants.any) // todo: remove?
                childKeywords.forEach(keyword => defNode.touchNode(`keywords ${keyword}`));
            }
            const allLines = allKeywordNodes[keyword];
            const cells = allLines
                .map(line => line.getContent())
                .filter(i => i)
                .map(i => i.split(xi));
            const sizes = new Set(cells.map(c => c.length));
            const max = Math.max(...Array.from(sizes));
            const min = Math.min(...Array.from(sizes));
            let catchAllCellType;
            let cellTypes = [];
            for (let index = 0; index < max; index++) {
                const cellType = this._getBestCellType(keyword, cells.map(c => c[index]));
                if (cellType.cellTypeDefinition && !globalCellTypeMap.has(cellType.cellTypeName))
                    globalCellTypeMap.set(cellType.cellTypeName, cellType.cellTypeDefinition);
                cellTypes.push(cellType.cellTypeName);
            }
            if (max > min) {
                //columns = columns.slice(0, min)
                catchAllCellType = cellTypes.pop();
                while (cellTypes[cellTypes.length - 1] === catchAllCellType) {
                    cellTypes.pop();
                }
            }
            if (catchAllCellType)
                defNode.set(GrammarConstants_1.GrammarConstants.catchAllCellType, catchAllCellType);
            if (cellTypes.length > 1)
                defNode.set(GrammarConstants_1.GrammarConstants.cells, cellTypes.join(xi));
            if (!catchAllCellType && cellTypes.length === 1)
                defNode.set(GrammarConstants_1.GrammarConstants.cells, cellTypes[0]);
            // Todo: switch to conditional frequency
            //defNode.set(GrammarConstants.frequency, (allLines.length / lineCount).toFixed(3))
            return defNode.getParent().toString();
        });
        const cellTypes = [];
        globalCellTypeMap.forEach(def => cellTypes.push(def));
        return [rootNode.toString(), cellTypes.join(yi), keywords.join(yi)].filter(i => i).join("\n");
    }
    _getBestCellType(keyword, allValues) {
        const asSet = new Set(allValues);
        const xi = this.getXI();
        const values = Array.from(asSet).filter(c => c);
        const all = (fn) => {
            for (let i = 0; i < values.length; i++) {
                if (!fn(values[i]))
                    return false;
            }
            return true;
        };
        if (all((str) => str === "0" || str === "1"))
            return { cellTypeName: "bit" };
        if (all((str) => {
            const num = parseInt(str);
            if (isNaN(num))
                return false;
            return num.toString() === str;
        })) {
            return { cellTypeName: "int" };
        }
        if (all((str) => !str.match(/[^\d\.\-]/)))
            return { cellTypeName: "float" };
        const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"]);
        if (all((str) => bools.has(str.toLowerCase())))
            return { cellTypeName: "bool" };
        // If there are duplicate files and the set is less than enum
        const enumLimit = 30;
        if ((asSet.size === 1 || allValues.length > asSet.size) && asSet.size < enumLimit)
            return {
                cellTypeName: `${keyword}Enum`,
                cellTypeDefinition: `cellType ${keyword}Enum
 enum ${values.join(xi)}`
            };
        return { cellTypeName: "any" };
    }
}
exports.default = UnknownGrammarProgram;
