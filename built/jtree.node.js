"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const jtree_1 = require("./jtree");
const GrammarProgram_1 = require("./grammar/GrammarProgram");
class jtreeNode extends jtree_1.default {
}
jtreeNode.executeFile = (programPath, grammarPath) => jtreeNode.makeProgram(programPath, grammarPath).execute(programPath);
// returns AbstractRuntimeProgram
jtreeNode.makeProgram = (programPath, grammarPath) => {
    const programConstructor = jtreeNode.getProgramConstructor(grammarPath);
    const code = fs.readFileSync(programPath, "utf8");
    return new programConstructor(code);
};
// returns GrammarBackedProgramClass
jtreeNode.getProgramConstructor = (grammarPath) => {
    const grammarCode = fs.readFileSync(grammarPath, "utf8");
    const grammarProgram = GrammarProgram_1.default.newFromCondensed(grammarCode, grammarPath);
    return grammarProgram.getRootConstructor();
};
jtreeNode.combineFiles = (globPatterns) => {
    const glob = require("glob");
    const files = globPatterns.map(pattern => glob.sync(pattern)).flat();
    const content = files.map((path) => fs.readFileSync(path, "utf8")).join("\n");
    return new jtree_1.default.TreeNode(content);
};
exports.default = jtreeNode;
