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
    static compileGrammarForNodeJs(pathToGrammar, outputFolder, usePrettier = true) {
        return this._compileGrammar(pathToGrammar, outputFolder, CompileTarget.nodejs, usePrettier);
    }
    static _compileGrammar(pathToGrammar, outputFolder, target, usePrettier) {
        const isNodeJs = CompileTarget.nodejs === target;
        const grammarCode = jtree_1.default.TreeNode.fromDisk(pathToGrammar);
        const program = new GrammarLanguage_1.GrammarProgram(grammarCode.toString());
        let name = program.getGrammarName();
        const pathToJtree = __dirname + "/../index.js";
        const outputFilePath = outputFolder + `${name}.${target}.js`;
        let result = isNodeJs ? program.toNodeJsJavascript(pathToJtree) : program.toBrowserJavascript();
        if (isNodeJs)
            result =
                "#! /usr/bin/env node\n" +
                    result.replace(/}\s*$/, `
if (!module.parent) new ${name}(jtree.TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
`);
        if (usePrettier)
            result = require("prettier").format(result, { semi: false, parser: "babel", printWidth: 160 });
        fs.writeFileSync(outputFilePath, result, "utf8");
        if (isNodeJs)
            fs.chmodSync(outputFilePath, 0o755);
        return outputFilePath;
    }
    static compileGrammarForBrowser(pathToGrammar, outputFolder, usePrettier = true) {
        return this._compileGrammar(pathToGrammar, outputFolder, CompileTarget.browser, usePrettier);
    }
}
jtreeNode.Upgrader = Upgrader_1.default;
jtreeNode.GrammarConstants = GrammarLanguage_1.GrammarConstants;
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
    const grammarProgram = new GrammarLanguage_1.GrammarProgram(grammarCode);
    return grammarProgram.getRootConstructor();
};
jtreeNode.combineFiles = (globPatterns) => {
    const glob = require("glob");
    const files = jtree_1.default.Utils.flatten(globPatterns.map(pattern => glob.sync(pattern)));
    const content = files.map((path) => fs.readFileSync(path, "utf8")).join("\n");
    return new jtree_1.default.TreeNode(content);
};
exports.default = jtreeNode;
