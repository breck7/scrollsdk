//onsave /usr/local/bin/tsc -p /Users/breck/jtree/sandbox/build/
class GrammarIDEApp {
    constructor(grammarSourceCode) {
        this.codeErrorsConsole = jQuery("#codeErrorsConsole");
        this.codeConsole = jQuery("#codeConsole");
        this.grammarConsole = jQuery("#grammarConsole");
        this.grammarErrorsConsole = jQuery("#grammarErrorsConsole");
        this.resetButton = jQuery("#resetButton");
        this.execButton = jQuery("#execButton");
        this.execResultsTextArea = jQuery("#execResultsTextArea");
        this.compileButton = jQuery("#compileButton");
        this.downloadButton = jQuery("#downloadButton");
        this.samplesButtons = jQuery("#samplesButtons");
        this.otherErrorsDiv = jQuery("#otherErrorsDiv");
        this.versionSpan = jQuery("#versionSpan");
        this.localStorageKeys = {
            grammarConsole: "grammarConsole",
            codeConsole: "codeConsole",
            grammarPath: "grammarPath"
        };
        this.codeWidgets = [];
        this.GrammarConstructor = jtree.GrammarProgram.newFromCondensed(grammarSourceCode, "").getRootConstructor();
    }
    resetCommand() {
        Object.values(this.localStorageKeys).forEach(val => localStorage.removeItem(val));
    }
    bindListeners() {
        this.resetButton.on("click", () => {
            this.resetCommand();
            console.log("reset...");
            window.location.reload();
        });
        this.execButton.on("click", () => {
            if (this.program)
                this.execResultsTextArea.val(this.program.executeSync());
            else
                this.execResultsTextArea.val("Program failed to execute");
        });
        this.compileButton.on("click", () => {
            if (this.program)
                this.execResultsTextArea.val(this.program.compile());
            else
                this.execResultsTextArea.val("Program failed to compile");
        });
        const that = this;
        this.samplesButtons.on("click", "a", function () {
            const el = jQuery(this);
            const name = el.text().toLowerCase();
            const samplePath = el.attr("data-samplePath") || `/langs/${name}/sample.${name}`;
            const grammarPath = el.attr("data-grammarPath") || `/langs/${name}/${name}.grammar`;
            that.fetchGrammar(grammarPath, samplePath);
        });
        this.downloadButton.on("click", () => this.downloadBundle());
    }
    async loadScripts(grammarCode, grammarPath) {
        if (!grammarCode || !grammarPath)
            return undefined;
        jtree.NonTerminalNode.setAsBackupConstructor(true);
        try {
            const grammarProgram = jtree.GrammarProgram.newFromCondensed(grammarCode, "");
            const loadedScripts = await grammarProgram.loadAllConstructorScripts(jtree.Utils.getPathWithoutFileName(grammarPath) + "/");
            console.log(`Loaded scripts ${loadedScripts.join(", ")}...`);
            this.otherErrorsDiv.html("");
        }
        catch (err) {
            console.error(err);
            this.otherErrorsDiv.html(err);
        }
    }
    async downloadBundle() {
        const grammarCode = this.grammarInstance.getValue();
        const grammarProgram = new jtree.GrammarProgram(grammarCode);
        const languageName = grammarProgram.get("grammar name");
        const extension = languageName;
        const zip = new JSZip();
        const pack = {
            name: languageName,
            private: true,
            dependencies: {
                jtree: jtree.getVersion()
            }
        };
        const nodePath = `${languageName}.node.js`;
        const samplePath = "sample." + extension;
        const sampleCode = this.codeInstance.getValue();
        const browserPath = `${languageName}.browser.js`;
        const rootProgramClassName = grammarProgram._getGeneratedClassName();
        zip.file("package.json", JSON.stringify(pack, null, 2));
        zip.file("readme.md", `# ${languageName} Readme

### Installing

    npm install .

### Testing

    node test.js`);
        const testCode = `const program = new ${rootProgramClassName}(sampleCode)
const errors = program.getAllErrors()
console.log("Sample program compiled with " + errors.length + " errors.")
if (errors.length)
 console.log(errors.map(error => error.getMessage()))`;
        zip.file(browserPath, grammarProgram.toBrowserJavascript());
        zip.file(nodePath, grammarProgram.toNodeJsJavascript());
        zip.file(`index.js`, `module.exports = require("./${nodePath}")`);
        zip.file("index.html", `<script src="node_modules/jtree/built/jtree.browser.js"></script>
<script src="${browserPath}"></script>
<script>
const sampleCode = \`${sampleCode}\`
${testCode}
</script>`);
        zip.file(samplePath, sampleCode);
        zip.file(`test.js`, `const {${rootProgramClassName}} = require("./index.js")
/*keep-line*/ const sampleCode = require("fs").readFileSync("${samplePath}", "utf8")
${testCode}`);
        zip.generateAsync({ type: "blob" }).then(function (content) {
            // see FileSaver.js
            saveAs(content, languageName + ".zip");
        });
    }
    async start() {
        this.bindListeners();
        this.versionSpan.html("Version: " + jtree.getVersion());
        const gram = localStorage.getItem(this.localStorageKeys.grammarConsole);
        console.log("Loading grammar...");
        if (gram)
            await this.loadScripts(gram, localStorage.getItem(this.localStorageKeys.grammarPath));
        const code = localStorage.getItem(this.localStorageKeys.codeConsole);
        console.log("Loading code...");
        if (localStorage.getItem(this.localStorageKeys.grammarConsole))
            this.grammarConsole.val(gram);
        if (code)
            this.codeConsole.val(code);
        this.grammarInstance = new jtree.TreeNotationCodeMirrorMode("grammar", () => this.GrammarConstructor, undefined, CodeMirror)
            .register()
            .fromTextAreaWithAutocomplete(this.grammarConsole[0], { lineWrapping: true });
        this.grammarInstance.on("keyup", () => this.grammarDidUpdate());
        this.grammarInstance.on("keyup", () => {
            this.codeDidUpdate();
            // Hack to break CM cache:
            if (true) {
                const val = this.codeInstance.getValue();
                this.codeInstance.setValue("\n" + val);
                this.codeInstance.setValue(val);
            }
        });
        this.codeInstance = new jtree.TreeNotationCodeMirrorMode("custom", () => this.getGrammarConstructor(), undefined, CodeMirror)
            .register()
            .fromTextAreaWithAutocomplete(this.codeConsole[0], { lineWrapping: true });
        this.codeInstance.on("keyup", () => this.codeDidUpdate());
        this.grammarDidUpdate();
        this.codeDidUpdate();
    }
    _getGrammarErrors(grammarCode) {
        return new this.GrammarConstructor(grammarCode).getAllErrors();
    }
    getGrammarConstructor() {
        let currentGrammarCode = this.grammarInstance.getValue();
        // todo: for custom constructors, if they are not there, replace?
        if (!this._grammarConstructor || currentGrammarCode !== this._cachedGrammarCode) {
            try {
                const grammarProgram = jtree.GrammarProgram.newFromCondensed(currentGrammarCode, "");
                const grammarErrors = this._getGrammarErrors(currentGrammarCode);
                if (grammarErrors.length) {
                    this._grammarConstructor = jtree.GrammarProgram.getTheAnyLanguageRootConstructor();
                }
                else
                    this._grammarConstructor = grammarProgram.getRootConstructor();
                this._cachedGrammarCode = currentGrammarCode;
                this.otherErrorsDiv.html("");
            }
            catch (err) {
                console.error(err);
                this.otherErrorsDiv.html(err);
            }
        }
        return this._grammarConstructor;
    }
    grammarDidUpdate() {
        const grammarCode = this.grammarInstance.getValue();
        localStorage.setItem(this.localStorageKeys.grammarConsole, grammarCode);
        this.grammarProgram = new this.GrammarConstructor(grammarCode);
        const errs = this.grammarProgram.getAllErrors().map(err => err.toObject());
        this.grammarErrorsConsole.html(errs.length ? new jtree.TreeNode(errs).toFormattedTable(200) : "0 errors");
    }
    codeDidUpdate() {
        const code = this.codeInstance.getValue();
        localStorage.setItem(this.localStorageKeys.codeConsole, code);
        const programConstructor = this.getGrammarConstructor();
        this.program = new programConstructor(code);
        const errs = this.program.getAllErrors();
        this.codeErrorsConsole.html(errs.length ? new jtree.TreeNode(errs.map(err => err.toObject())).toFormattedTable(200) : "0 errors");
        const cursor = this.codeInstance.getCursor();
        // todo: what if 2 errors?
        this.codeInstance.operation(() => {
            this.codeWidgets.forEach(widget => this.codeInstance.removeLineWidget(widget));
            this.codeWidgets.length = 0;
            errs
                .filter(err => !err.isBlankLineError())
                .filter(err => !err.isCursorOnWord(cursor.line, cursor.ch))
                .slice(0, 1) // Only show 1 error at a time. Otherwise UX is not fun.
                .forEach(err => {
                const el = err.getCodeMirrorLineWidgetElement(() => {
                    this.codeInstance.setValue(this.program.toString());
                    this.codeDidUpdate();
                });
                this.codeWidgets.push(this.codeInstance.addLineWidget(err.getLineNumber() - 1, el, { coverGutter: false, noHScroll: false }));
            });
            const info = this.codeInstance.getScrollInfo();
            const after = this.codeInstance.charCoords({ line: cursor.line + 1, ch: 0 }, "local").top;
            if (info.top + info.clientHeight < after)
                this.codeInstance.scrollTo(null, after - info.clientHeight + 3);
        });
    }
    async fetchGrammar(grammarPath, samplePath) {
        const grammar = await jQuery.get(grammarPath);
        const sample = await jQuery.get(samplePath);
        await this.loadScripts(grammar, grammarPath);
        localStorage.setItem(this.localStorageKeys.grammarPath, grammarPath);
        this.grammarInstance.setValue(grammar);
        this.grammarDidUpdate();
        this.codeInstance.setValue(sample);
        this.codeDidUpdate();
    }
}
jQuery(document).ready(function () {
    jQuery.get("/langs/grammar/grammar.grammar").then(grammarSourceCode => {
        const app = new GrammarIDEApp(grammarSourceCode);
        window.app = app;
        app.start();
    });
});
