"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const GrammarLanguage_1 = require("../GrammarLanguage");
class UnknownGrammarProgram extends TreeNode_1.default {
    getPredictedGrammarFile(grammarName) {
        const rootNode = new TreeNode_1.default(`${GrammarLanguage_1.GrammarConstants.nodeType} ${grammarName}
 ${GrammarLanguage_1.GrammarConstants.root}`);
        // note: right now we assume 1 global cellTypeMap and nodeTypeMap per grammar. But we may have scopes in the future?
        const globalCellTypeMap = new Map();
        const xi = this.getXI();
        const yi = this.getYI();
        rootNode.nodeAt(0).touchNode(GrammarLanguage_1.GrammarConstants.inScope).setWordsFrom(1, Array.from(new Set(this.getFirstWords())));
        const clone = this.clone();
        let allNodes = clone.getTopDownArrayIterator();
        let node;
        for (node of allNodes) {
            const firstWord = node.getFirstWord();
            const asInt = parseInt(firstWord);
            if (!isNaN(asInt) && asInt.toString() === firstWord && node.getParent().getFirstWord())
                node.setFirstWord(node.getParent().getFirstWord() + "Child");
        }
        allNodes = clone.getTopDownArrayIterator();
        const allChilds = {};
        const allFirstWordNodes = {};
        for (let node of allNodes) {
            const firstWord = node.getFirstWord();
            if (!allChilds[firstWord])
                allChilds[firstWord] = {};
            if (!allFirstWordNodes[firstWord])
                allFirstWordNodes[firstWord] = [];
            allFirstWordNodes[firstWord].push(node);
            node.forEach((child) => {
                allChilds[firstWord][child.getFirstWord()] = true;
            });
        }
        const lineCount = clone.getNumberOfLines();
        const firstWords = Object.keys(allChilds).map(firstWord => {
            const defNode = new TreeNode_1.default(`${GrammarLanguage_1.GrammarConstants.nodeType} ${firstWord}`).nodeAt(0);
            const childFirstWords = Object.keys(allChilds[firstWord]);
            if (childFirstWords.length)
                defNode.touchNode(GrammarLanguage_1.GrammarConstants.inScope).setWordsFrom(1, childFirstWords);
            const allLines = allFirstWordNodes[firstWord];
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
                const cellType = this._getBestCellType(firstWord, cells.map(c => c[index]));
                if (cellType.cellTypeDefinition && !globalCellTypeMap.has(cellType.cellTypeId))
                    globalCellTypeMap.set(cellType.cellTypeId, cellType.cellTypeDefinition);
                cellTypes.push(cellType.cellTypeId);
            }
            if (max > min) {
                //columns = columns.slice(0, min)
                catchAllCellType = cellTypes.pop();
                while (cellTypes[cellTypes.length - 1] === catchAllCellType) {
                    cellTypes.pop();
                }
            }
            if (catchAllCellType)
                defNode.set(GrammarLanguage_1.GrammarConstants.catchAllCellType, catchAllCellType);
            if (cellTypes.length > 1)
                defNode.set(GrammarLanguage_1.GrammarConstants.cells, cellTypes.join(xi));
            if (!catchAllCellType && cellTypes.length === 1)
                defNode.set(GrammarLanguage_1.GrammarConstants.cells, cellTypes[0]);
            // Todo: switch to conditional frequency
            //defNode.set(GrammarConstants.frequency, (allLines.length / lineCount).toFixed(3))
            return defNode.getParent().toString();
        });
        const cellTypes = [];
        globalCellTypeMap.forEach(def => cellTypes.push(def));
        return [rootNode.toString(), cellTypes.join(yi), firstWords.join(yi)].filter(i => i).join("\n");
    }
    _getBestCellType(firstWord, allValues) {
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
            return { cellTypeId: GrammarLanguage_1.GrammarStandardCellTypeIds.bit };
        if (all((str) => {
            const num = parseInt(str);
            if (isNaN(num))
                return false;
            return num.toString() === str;
        })) {
            return { cellTypeId: GrammarLanguage_1.GrammarStandardCellTypeIds.int };
        }
        if (all((str) => !str.match(/[^\d\.\-]/)))
            return { cellTypeId: GrammarLanguage_1.GrammarStandardCellTypeIds.float };
        const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"]);
        if (all((str) => bools.has(str.toLowerCase())))
            return { cellTypeId: GrammarLanguage_1.GrammarStandardCellTypeIds.bool };
        // If there are duplicate files and the set is less than enum
        const enumLimit = 30;
        if ((asSet.size === 1 || allValues.length > asSet.size) && asSet.size < enumLimit)
            return {
                cellTypeId: `${firstWord}Enum`,
                cellTypeDefinition: `cellType ${firstWord}Enum
 enum ${values.join(xi)}`
            };
        return { cellTypeId: GrammarLanguage_1.GrammarStandardCellTypeIds.any };
    }
}
exports.default = UnknownGrammarProgram;
