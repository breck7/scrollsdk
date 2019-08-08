"use strict";
//tooling product jtree.node.js
//tooling product jtree.browser.js
//tooling product cli.node.js
//tooling product treeBase.node.js
//tooling product SandboxServer.node.js
Object.defineProperty(exports, "__esModule", { value: true });
//tooling product treeBase.node.js
const fs = require("fs");
class Disk {
}
Disk.getTreeNode = () => require("../products/jtree.node.js").TreeNode; // todo: cleanup
Disk.rm = (path) => fs.unlinkSync(path);
Disk.getCleanedString = (str) => str.replace(/[\,\t\n]/g, " ");
Disk.makeExecutable = (path) => fs.chmodSync(path, 0o755);
Disk.strCount = (str, reg) => (str.match(new RegExp(reg, "gi")) || []).length;
Disk.read = (path) => fs.readFileSync(path, "utf8");
Disk.touch = (path) => (Disk.exists(path) ? true : Disk.write(path, ""));
Disk.mkdir = (path) => require("mkdirp").sync(path);
Disk.getRecursive = (path) => require("recursive-readdir-sync")(path);
Disk.readJson = (path) => JSON.parse(Disk.read(path));
Disk.getFileNameWithoutExtension = (path) => Disk.getFileName(path).replace(/\.[^\.]+$/, "");
Disk.write = (path, content) => fs.writeFileSync(path, content, "utf8");
Disk.writeJson = (path, content) => fs.writeFileSync(path, JSON.stringify(content, null, 2), "utf8");
Disk.exists = (path) => fs.existsSync(path);
Disk.dir = (dir) => fs.readdirSync(dir).filter((file) => file !== ".DS_Store");
Disk.getFullPaths = (dir) => Disk.dir(dir).map((file) => dir.replace(/\/$/, "") + "/" + file);
Disk.getFiles = (dir) => Disk.getFullPaths(dir).filter((file) => fs.statSync(file).isFile());
Disk.getFolders = (dir) => Disk.getFullPaths(dir).filter((file) => fs.statSync(file).isDirectory());
Disk.getFileName = (path) => path.split("/").pop();
Disk.append = (path, content) => fs.appendFileSync(path, content, "utf8");
Disk.readCsvAsTree = (path) => Disk.getTreeNode().fromCsv(Disk.read(path));
Disk.readSsvAsTree = (path) => Disk.getTreeNode().fromSsv(Disk.read(path));
Disk.readTsvAsTree = (path) => Disk.getTreeNode().fromTsv(Disk.read(path));
Disk.insertIntoFile = (path, content, delimiter) => Disk.write(path, Disk.stickBetween(content, Disk.read(path), delimiter));
Disk.detectAndReadAsTree = (path) => Disk.detectDelimiterAndReadAsTree(Disk.read(path));
Disk.getAllOf = (node, prop) => node.filter((node) => node.getWord(0) === prop);
Disk.getDelimitedChildrenAsTree = (node, delimiter = undefined) => Disk.detectDelimiterAndReadAsTree(node.childrenToString());
Disk.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
Disk.readTree = (path) => new (Disk.getTreeNode())(Disk.read(path));
Disk.sizeOf = (path) => fs.statSync(path).size;
Disk.stripHtml = (text) => (text && text.replace ? text.replace(/<(?:.|\n)*?>/gm, "") : text);
Disk.stripParentheticals = (text) => (text && text.replace ? text.replace(/\((?:.|\n)*?\)/gm, "") : text);
Disk.escape = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
Disk.hasLine = (path, line) => Disk.read(path).includes(line);
Disk.mv = (source, dest) => {
    if (Disk.exists(dest) && false) {
        console.log(`${dest} exists. Skipping`);
    }
    else {
        Disk.write(dest, Disk.read(source));
        Disk.rm(source);
    }
};
Disk.stickBetween = (content, dest, delimiter) => {
    const parts = dest.split(delimiter);
    return [parts[0], content, parts[2]].join(delimiter);
};
// todo: move to tree base class
Disk.detectDelimiterAndReadAsTree = (str) => {
    const line1 = str.split("\n")[0];
    const TreeNode = Disk.getTreeNode();
    if (line1.includes("\t"))
        return TreeNode.fromTsv(str);
    else if (line1.includes(","))
        return TreeNode.fromCsv(str);
    else if (line1.includes("|"))
        return TreeNode.fromDelimited(str, "|");
    else if (line1.includes(";"))
        return TreeNode.fromDelimited(str, ";");
    // todo: add more robust. align with choose delimiter
    return TreeNode.fromSsv(str);
};
Disk.deleteDuplicates = (node, prop1, prop2, reverse = false) => {
    const map = {};
    Disk.getAllOf(node, prop1).forEach((node) => {
        const val = node.get(prop2);
        console.log(val);
        if (map[val] && reverse) {
            map[val].destroy();
            map[val] = node;
        }
        else if (map[val]) {
            node.destroy();
        }
        else
            map[val] = node;
    });
};
Disk.getLastFolderName = (path) => {
    const parts = path.replace(/\/$/, "").split("/");
    const last = parts.pop();
    return fs.statSync(path).isDirectory() ? last : parts.pop();
};
Disk.appendUniqueLine = (path, line) => {
    const file = Disk.read(path);
    if (file.match(new RegExp("^" + Disk.escape(line), "m")))
        return true;
    const prefix = !file || file.endsWith("\n") ? "" : "\n";
    return Disk.append(path, prefix + line + "\n");
};
Disk.move = (node, newPosition) => {
    node.getParent().insertLineAndChildren(node.getLine(), node.childrenToString(), newPosition);
    node.destroy();
};
Disk._getTextUrl = async (url) => {
    // todo: https://visionmedia.github.io/superagent/
    // build well tested version of this.
    // have a mock server returning with all sorts of things.
    const res = await Disk.getUrl(url);
    // todo: leave it up to user to specfiy text ro body
    return res.body || res.text || "";
};
Disk.getUrl = async (url) => {
    const superagent = require("superagent");
    const agent = superagent.agent();
    const res = await agent.get(url);
    return res;
};
Disk.download = async (url, destination) => {
    const result = await Disk._getTextUrl(url);
    Disk.write(destination, result);
};
Disk.downloadPlain = async (url, destination) => {
    const result = await Disk.getUrl(url);
    Disk.write(destination, result.text);
};
Disk.downloadJson = async (url, destination) => {
    const result = await Disk._getTextUrl(url);
    if (destination)
        Disk.writeJson(destination, result);
    return result;
};
Disk.buildMapFrom = (tree, key, value) => {
    const map = {};
    tree.forEach((child) => {
        map[child.get(key)] = child.get(value);
    });
    return map;
};
Disk.csvToMap = (path, columnName) => {
    const tree = Disk.readCsvAsTree(path);
    const map = {};
    tree.forEach((child) => {
        const key = child.get(columnName);
        map[key] = child.toObject();
    });
    return map;
};
//tooling product treeBase.node.js
const jtree = require("../products/jtree.node.js");
const GrammarProgram = jtree.GrammarProgram;
const TreeUtils = jtree.Utils;
const TreeNode = jtree.TreeNode;
const GrammarConstants = jtree.GrammarConstants;
class TreeBaseFile extends TreeNode {
    setDiskVersion() {
        this._diskVersion = this.childrenToString();
        return this;
    }
    getDiskVersion() {
        return this._diskVersion;
    }
    getOneOf(keys) {
        for (let i = 0; i < keys.length; i++) {
            const value = this.get(keys[i]);
            if (value)
                return value;
        }
        return "";
    }
    toExpandedColumns() {
        // todo: do things like wp_example_2 wp_example_3 ...
    }
    getDoc(terms) {
        return terms
            .map(term => {
            const nodes = this.findNodes(this._getFilePath() + " " + term);
            return nodes.map(node => node.childrenToString()).join("\n");
        })
            .filter(a => a)
            .join("\n");
    }
    set(keywordPath, content) {
        return typeof keywordPath === "object" ? this.setProperties(keywordPath) : super.set(keywordPath, content);
    }
    setPropertyIfMissing(prop, value) {
        if (this.has(prop))
            return true;
        return this.touchNode(prop).setContent(value);
    }
    setProperties(propMap) {
        const props = Object.keys(propMap);
        const values = Object.values(propMap);
        // todo: is there a built in tree method to do this?
        props.forEach((prop, index) => {
            const value = values[index];
            if (!value)
                return true;
            if (this.get(prop) === value)
                return true;
            this.touchNode(prop).setContent(value);
        });
        return this;
    }
    extract(fields) {
        const newTree = new TreeNode(this.toString()); // todo: why not clone?
        const map = TreeUtils.arrayToMap(fields);
        newTree.nodeAt(0).forEach(node => {
            if (!map[node.getWord(0)])
                node.destroy();
        });
        return newTree;
    }
    save() {
        const str = this.childrenToString();
        if (this.getDiskVersion() === str)
            return this;
        Disk.write(this._getFilePath(), str);
        this.setDiskVersion();
        return this;
    }
    appendUniqueLine(line) {
        const file = this.toString();
        if (file.match(new RegExp("^" + Disk.escape(line), "m")))
            return true;
        const prefix = !file || file.endsWith("\n") ? "" : "\n";
        return this.appendLine(prefix + line + "\n");
    }
    _getFilePath() {
        return this.getWord(0);
    }
    getFileName() {
        return Disk.getFileName(this._getFilePath());
    }
    createParser() {
        return new TreeNode.Parser(TreeNode);
    }
}
class TreeBaseFolder extends TreeNode {
    constructor() {
        super(...arguments);
        this._isLoaded = false;
    }
    touch(filename) {
        // todo: throw if its a folder path, has wrong file extension, or other invalid
        return Disk.touch(this._getDir() + filename);
    }
    createParser() {
        return new TreeNode.Parser(TreeBaseFile);
    }
    // todo: RAII?
    loadFolder(files = undefined, sampleSize = undefined, seed = Date.now()) {
        if (this._isLoaded)
            return this;
        files = files || this._getAndFilterFilesFromFolder();
        if (sampleSize !== undefined)
            files = TreeUtils._sampleWithoutReplacement(files, sampleSize, seed);
        this.setChildren(this._readFiles(files));
        this._setDiskVersions();
        this._isLoaded = true;
        return this;
    }
    startExpressApp(port = 8887) {
        this.loadFolder();
        this._startListeningForFileChanges();
        this._getExpressApp().listen(port, () => console.log(`TreeBase server running: \ncmd+dblclick: http://localhost:${port}/`));
        return this;
    }
    cellCheckWithProgressBar(printLimit = 100) {
        TreeUtils._tick("start...");
        const program = this._getAsProgram();
        let lines = this.getNumberOfLines();
        let lps = lines / (TreeUtils._tick("End parser") / 1000);
        console.log(`Parsed ${lines} line program at ${lps} lines per second`);
        const ProgressBar = require("progress");
        const bar = new ProgressBar(":bar", { total: lines, width: 50 });
        let current = Date.now();
        let inc = 100000;
        let totalErrors = 0;
        for (let err of program.getAllErrorsIterator()) {
            bar.tick();
            if (bar.curr % inc === 0) {
                bar.interrupt(`Lines ${bar.curr - inc}-${bar.curr} at ${10000 / ((Date.now() - current) / 1000)} per second`);
                current = Date.now();
            }
            if (err.length)
                totalErrors += err.length;
            if (printLimit && err) {
                err.forEach(err => console.log(err
                    .getNode()
                    .getParent()
                    .getLine() +
                    ": " +
                    err.getLine() +
                    ": " +
                    err.getMessage()));
                printLimit--;
            }
            //if (!limit) return 0
        }
        return totalErrors;
    }
    _getDir() {
        // todo: cache?
        return this.getWord(0).replace(/\/$/, "") + "/";
    }
    _getGrammarPaths() {
        return Disk.getFiles(this._getDir()).filter(file => file.endsWith(GrammarConstants.grammarFileExtension));
    }
    _setDiskVersions() {
        this.forEach(node => {
            node.setDiskVersion();
        });
        return this;
    }
    _getAndFilterFilesFromFolder() {
        return this._filterFiles(Disk.getFiles(this._getDir()));
    }
    // todo: cleanup the filtering here.
    _filterFiles(files) {
        return files.filter(file => !file.endsWith(GrammarConstants.grammarFileExtension));
    }
    _getExpressApp() {
        if (!this._app)
            this._app = this._makeApp();
        return this._app;
    }
    _startListeningForFileChanges() {
        const fs = require("fs");
        fs.watch(this._getDir(), (event, filename) => {
            let fullPath = this._getDir() + filename;
            fullPath = this._filterFiles([fullPath])[0];
            if (!fullPath)
                return true;
            const data = Disk.read(fullPath);
            const node = this.getNode(fullPath);
            if (!node)
                this.appendLineAndChildren(fullPath, data);
            else
                node.setChildren(data);
        });
    }
    _getStatusMessage() {
        const paths = this._getExpressApp()
            ._router.stack // registered routes
            .filter(route => route.route && route.route.path.length > 1) // take out all the middleware
            .map(route => `<a href="${route.route.path}">${route.route.path}</a>`); // get all the paths
        return `<div style="white-space:pre;">TreeBase server running:
-- Folder: '${this._getDir()}'
-- Grammars: '${this._getGrammarPaths().join(",")}'
-- Files: ${this.length}
-- Bytes: ${this.toString().length}
-- Routes: ${paths.join("\n ")}</div>`;
    }
    _makeApp() {
        const path = require("path");
        const express = require("express");
        const bodyParser = require("body-parser");
        const app = express();
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
            res.setHeader("Access-Control-Allow-Credentials", true);
            next();
        });
        app.get("/list", (req, res) => {
            res.send(this.map(node => `<a href="${node.getFileName()}">${node.getFileName()}</a>`).join("<br>"));
        });
        app.get("/", (req, res) => {
            res.send(this._getStatusMessage());
        });
        app.use(express.static(this._getDir(), {
            setHeaders: (res, requestPath) => {
                res.setHeader("Content-Type", "text/plain");
            }
        }));
        app.get("/cellCheck", (req, res) => {
            let end = TreeUtils._tick("Loaded collection....");
            let lines = this.getNumberOfLines();
            let lps = lines / (end / 1000);
            const errors = this._getAsProgram().getAllErrors();
            res.setHeader("Content-Type", "text/plain");
            res.send(`Total errors: ${errors.length}\n${errors.join("\n")}`);
        });
        return app;
    }
    _getTreeBaseGrammarCode() {
        const code = new TreeNode(this._getGrammarPaths()
            .map(Disk.read)
            .join("\n"));
        const rootNodes = code.with("root");
        return (code +
            "\n" +
            `treeBaseFolderNode
 ${GrammarConstants.root}
 ${GrammarConstants.inScope} ${rootNodes.map(node => node.getWord(0)).join(" ")}
 ${GrammarConstants.catchAllNodeType} treeBaseErrorNode
treeBaseErrorNode
 ${GrammarConstants.baseNodeType} ${GrammarConstants.errorNode}`);
    }
    _getAsProgram() {
        this.loadFolder();
        const grammarProgram = new GrammarProgram(this._getTreeBaseGrammarCode());
        const programConstructor = grammarProgram.getRootConstructor();
        return new programConstructor(this.toString());
    }
    _readFiles(files) {
        return files
            .map(fullPath => {
            const filename = Disk.getFileName(fullPath);
            const content = Disk.read(fullPath);
            if (content.match(/\r/))
                throw new Error("bad \\r in " + fullPath);
            return content ? fullPath + "\n " + content.trim().replace(/\n/g, "\n ") : fullPath;
        })
            .join("\n");
    }
}

module.exports = {TreeBaseFile, TreeBaseFolder}