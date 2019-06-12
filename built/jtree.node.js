"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const jtree_1 = require("./jtree");
const GrammarLanguage_1 = require("./grammar/GrammarLanguage");
const Upgrader_1 = require("./tools/Upgrader");
class jtreeNode extends jtree_1.default {
}
jtreeNode.Upgrader = Upgrader_1.default;
jtreeNode.executeFile = (programPath, grammarPath) => jtreeNode.makeProgram(programPath, grammarPath).execute(programPath);
jtreeNode.executeFiles = (programPaths, grammarPath) => {
    const programConstructor = jtreeNode.getProgramConstructor(grammarPath);
    return programPaths.map(programPath => new programConstructor(fs.readFileSync(programPath, "utf8")).execute(programPath));
};
jtreeNode.executeFileSync = (programPath, grammarPath) => jtreeNode.makeProgram(programPath, grammarPath).executeSync(programPath);
jtreeNode.makeProgram = (programPath, grammarPath) => {
    const programConstructor = jtreeNode.getProgramConstructor(grammarPath);
    return new programConstructor(fs.readFileSync(programPath, "utf8"));
};
// returns GrammarBackedProgramClass
jtreeNode.getProgramConstructor = (grammarPath) => {
    const grammarCode = fs.readFileSync(grammarPath, "utf8");
    const grammarProgram = GrammarLanguage_1.GrammarProgram.newFromCondensed(grammarCode, grammarPath);
    return grammarProgram.getRootConstructor();
};
jtreeNode.combineFiles = (globPatterns) => {
    const glob = require("glob");
    const files = globPatterns.map(pattern => glob.sync(pattern)).flat();
    const content = files.map((path) => fs.readFileSync(path, "utf8")).join("\n");
    return new jtree_1.default.TreeNode(content);
};
exports.default = jtreeNode;
