"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const jtree_1 = require("./jtree");
const GrammarProgram_1 = require("./grammar/GrammarProgram");
jtree_1.default.executeFile = (programPath, grammarPath) => jtree_1.default.makeProgram(programPath, grammarPath).execute(programPath);
// returns AbstractRuntimeProgram
jtree_1.default.makeProgram = (programPath, grammarPath) => {
    const programClass = jtree_1.default.getParser(grammarPath);
    const code = fs.readFileSync(programPath, "utf8");
    return new programClass(code);
};
// returns GrammarBackedProgramClass
jtree_1.default.getParser = (grammarPath) => {
    const grammarCode = fs.readFileSync(grammarPath, "utf8");
    const grammarProgram = GrammarProgram_1.default.newFromCondensed(grammarCode, grammarPath);
    return grammarProgram.getRootParserClass();
};
jtree_1.default.GrammarProgram = GrammarProgram_1.default;
exports.default = jtree_1.default;
