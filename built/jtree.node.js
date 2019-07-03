"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const jtree_1 = require("./jtree");
const GrammarLanguage_1 = require("./GrammarLanguage");
const Upgrader_1 = require("./tools/Upgrader");
var CompileTarget;
(function (CompileTarget) {
    CompileTarget["nodejs"] = "nodejs";
    CompileTarget["browser"] = "browser";
})(CompileTarget || (CompileTarget = {}));
class jtreeNode extends jtree_1.default {
    static compileGrammarForNodeJs(pathToGrammar, outputFolder) {
        return this._compileGrammar(pathToGrammar, outputFolder, CompileTarget.nodejs);
    }
    static _compileGrammar(pathToGrammar, outputFolder, target) {
        const grammarCode = jtree_1.default.TreeNode.fromDisk(pathToGrammar);
        const program = new GrammarLanguage_1.GrammarProgram(grammarCode.toString(), pathToGrammar);
        let name = program.getGrammarName();
        const pathToJtree = __dirname + "/../index.js";
        const outputFilePath = outputFolder + `${name}Language.${target}.js`;
        const result = target === CompileTarget.nodejs ? program.toNodeJsJavascriptPrettier(pathToJtree) : program.toBrowserJavascriptPrettier();
        fs.writeFileSync(outputFilePath, result, "utf8");
        return outputFilePath;
    }
    static compileGrammarForBrowser(pathToGrammar, outputFolder) {
        return this._compileGrammar(pathToGrammar, outputFolder, CompileTarget.browser);
    }
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
    const grammarProgram = new GrammarLanguage_1.GrammarProgram(grammarCode, grammarPath);
    return grammarProgram.getRootConstructor();
};
jtreeNode.combineFiles = (globPatterns) => {
    const glob = require("glob");
    const files = globPatterns.map(pattern => glob.sync(pattern)).flat();
    const content = files.map((path) => fs.readFileSync(path, "utf8")).join("\n");
    return new jtree_1.default.TreeNode(content);
};
exports.default = jtreeNode;
