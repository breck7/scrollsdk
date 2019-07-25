//onsave /usr/local/bin/tsc -p /Users/breck/jtree/sandbox/build/
class GrammarIDEApp {
    constructor(grammarSourceCode) {
        this.languages = "newlang hakon stump dug fire swarm project stamp grammar jibberish numbers".split(" ");
        this._codeErrorsConsole = jQuery("#codeErrorsConsole");
        this._codeConsole = jQuery("#codeConsole");
        this._grammarConsole = jQuery("#grammarConsole");
        this._grammarErrorsConsole = jQuery("#grammarErrorsConsole");
        this._resetButton = jQuery("#resetButton");
        this._execButton = jQuery("#execButton");
        this._execResultsTextArea = jQuery("#execResultsTextArea");
        this._compileButton = jQuery("#compileButton");
        this._downloadButton = jQuery("#downloadButton");
        this._samplesButtons = jQuery("#samplesButtons");
        this._otherErrorsDiv = jQuery("#otherErrorsDiv");
        this._versionSpan = jQuery("#versionSpan");
        this._shareLink = jQuery("#shareLink");
        this._inferButton = jQuery("#inferButton");
        this._localStorageKeys = {
            grammarConsole: "grammarConsole",
            codeConsole: "codeConsole"
        };
        this.codeWidgets = [];
        this.GrammarConstructor = new jtree.GrammarProgram(grammarSourceCode).getRootConstructor();
    }
    async _loadFromDeepLink() {
        const hash = location.hash;
        if (hash.length < 2)
            return false;
        const deepLink = new jtree.TreeNode(decodeURIComponent(hash.substr(1)));
        const standard = deepLink.get("standard");
        if (standard) {
            console.log("Loading standard from deep link....");
            await this._fetchJTreeStandardGrammar(standard);
            return true;
        }
        else {
            const grammarCode = deepLink.getNode("grammar");
            const sampleCode = deepLink.getNode("sample");
            if (grammarCode && sampleCode) {
                console.log("Loading custom from deep link....");
                this._setGrammarAndCode(grammarCode.childrenToString(), sampleCode.childrenToString());
                return true;
            }
        }
        return false;
    }
    _clearHash() {
        history.replaceState(null, null, " ");
    }
    async start() {
        this._samplesButtons.html(`Example Languages: ` + this.languages.map(lang => `<a href="#standard%20${lang}">${jtree.Utils.ucfirst(lang)}</a>`).join(" | "));
        this._bindListeners();
        this._versionSpan.html("Version: " + jtree.getVersion());
        this.grammarInstance = new jtree.TreeNotationCodeMirrorMode("grammar", () => this.GrammarConstructor, undefined, CodeMirror)
            .register()
            .fromTextAreaWithAutocomplete(this._grammarConsole[0], { lineWrapping: true });
        this.grammarInstance.on("keyup", () => {
            this._grammarDidUpdate();
            this._codeDidUpdate();
            // Hack to break CM cache:
            if (true) {
                const val = this.codeInstance.getValue();
                this.codeInstance.setValue("\n" + val);
                this.codeInstance.setValue(val);
            }
        });
        this.codeInstance = new jtree.TreeNotationCodeMirrorMode("custom", () => this._getGrammarConstructor(), undefined, CodeMirror)
            .register()
            .fromTextAreaWithAutocomplete(this._codeConsole[0], { lineWrapping: true });
        this.codeInstance.on("keyup", () => this._codeDidUpdate());
        // loadFromURL
        const wasLoadedFromDeepLink = await this._loadFromDeepLink();
        if (!wasLoadedFromDeepLink)
            await this._restoreFromLocalStorage();
    }
    resetCommand() {
        Object.values(this._localStorageKeys).forEach(val => localStorage.removeItem(val));
    }
    _bindListeners() {
        this._resetButton.on("click", () => {
            this.resetCommand();
            console.log("reset...");
            window.location.reload();
        });
        this._execButton.on("click", () => {
            if (this.program)
                this._execResultsTextArea.val(this.program.executeSync());
            else
                this._execResultsTextArea.val("Program failed to execute");
        });
        this._compileButton.on("click", () => {
            if (this.program)
                this._execResultsTextArea.val(this.program.compile());
            else
                this._execResultsTextArea.val("Program failed to compile");
        });
        const that = this;
        this._samplesButtons.on("click", "a", function () {
            that._fetchJTreeStandardGrammar(jQuery(this)
                .text()
                .toLowerCase());
        });
        this._inferButton.on("click", () => {
            this.grammarInstance.setValue(new jtree.UnknownGrammarProgram(this.codeInstance.getValue()).getPredictedGrammarFile("guess"));
        });
        this._downloadButton.on("click", () => this._downloadBundleCommand());
    }
    // TODO: ADD TESTS!!!!!
    async _downloadBundleCommand() {
        const grammarCode = this.grammarInstance.getValue();
        const grammarProgram = new jtree.GrammarProgram(grammarCode);
        const languageName = grammarProgram.getGrammarName();
        const extension = grammarProgram.getExtensionName();
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
        const rootProgramClassName = languageName;
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
        zip.file(`test.js`, `const ${rootProgramClassName} = require("./index.js")
/*keep-line*/ const sampleCode = require("fs").readFileSync("${samplePath}", "utf8")
${testCode}`);
        zip.generateAsync({ type: "blob" }).then(function (content) {
            // see FileSaver.js
            saveAs(content, languageName + ".zip");
        });
    }
    async _restoreFromLocalStorage() {
        console.log("Restoring from local storage....");
        const grammarCode = localStorage.getItem(this._localStorageKeys.grammarConsole);
        const code = localStorage.getItem(this._localStorageKeys.codeConsole);
        if (typeof grammarCode === "string" && typeof code === "string")
            this._setGrammarAndCode(grammarCode, code);
        return grammarCode || code;
    }
    _updateLocalStorage() {
        localStorage.setItem(this._localStorageKeys.grammarConsole, this.grammarInstance.getValue());
        localStorage.setItem(this._localStorageKeys.codeConsole, this.codeInstance.getValue());
        this._updateShareLink(); // todo: where to put this?
        console.log("Local storage updated...");
    }
    _getGrammarErrors(grammarCode) {
        return new this.GrammarConstructor(grammarCode).getAllErrors();
    }
    _getGrammarConstructor() {
        let currentGrammarCode = this.grammarInstance.getValue();
        if (!this._grammarConstructor || currentGrammarCode !== this._cachedGrammarCode) {
            try {
                const grammarErrors = this._getGrammarErrors(currentGrammarCode);
                this._grammarConstructor = new jtree.GrammarProgram(currentGrammarCode).getRootConstructor();
                this._cachedGrammarCode = currentGrammarCode;
                this._otherErrorsDiv.html("");
            }
            catch (err) {
                console.error(err);
                this._otherErrorsDiv.html(err);
            }
        }
        return this._grammarConstructor;
    }
    _grammarDidUpdate() {
        const grammarCode = this.grammarInstance.getValue();
        this._updateLocalStorage();
        this.grammarProgram = new this.GrammarConstructor(grammarCode);
        const errs = this.grammarProgram.getAllErrors().map(err => err.toObject());
        this._grammarErrorsConsole.html(errs.length ? new jtree.TreeNode(errs).toFormattedTable(200) : "0 errors");
    }
    _updateShareLink() {
        const tree = new jtree.TreeNode();
        tree.appendLineAndChildren("grammar", this.grammarInstance.getValue());
        tree.appendLineAndChildren("sample", this.codeInstance.getValue());
        const hash = "#" + encodeURIComponent(tree.toString());
        const link = location.href.replace(location.hash, "") + hash;
        this._shareLink.val(link);
    }
    _codeDidUpdate() {
        const code = this.codeInstance.getValue();
        this._updateLocalStorage();
        const programConstructor = this._getGrammarConstructor();
        this.program = new programConstructor(code);
        const errs = this.program.getAllErrors();
        this._codeErrorsConsole.html(errs.length ? new jtree.TreeNode(errs.map(err => err.toObject())).toFormattedTable(200) : "0 errors");
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
                    this._codeDidUpdate();
                });
                this.codeWidgets.push(this.codeInstance.addLineWidget(err.getLineNumber() - 1, el, { coverGutter: false, noHScroll: false }));
            });
            const info = this.codeInstance.getScrollInfo();
            const after = this.codeInstance.charCoords({ line: cursor.line + 1, ch: 0 }, "local").top;
            if (info.top + info.clientHeight < after)
                this.codeInstance.scrollTo(null, after - info.clientHeight + 3);
        });
    }
    _setGrammarAndCode(grammar, code) {
        this.grammarInstance.setValue(grammar);
        this.codeInstance.setValue(code);
        this._clearHash();
        this._grammarDidUpdate();
        this._codeDidUpdate();
    }
    async _fetchJTreeStandardGrammar(name) {
        const samplePath = `/langs/${name}/sample.${name}`;
        const grammarPath = `/langs/${name}/${name}.grammar`;
        const grammar = await jQuery.get(grammarPath);
        const sample = await jQuery.get(samplePath);
        this._setGrammarAndCode(grammar, sample);
    }
}
jQuery(document).ready(function () {
    jQuery.get("/langs/grammar/grammar.grammar").then(grammarSourceCode => {
        const app = new GrammarIDEApp(grammarSourceCode);
        window.app = app;
        app.start();
    });
});
