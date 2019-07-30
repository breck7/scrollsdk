"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const jtree_node_1 = require("../built/jtree.node");
const TreeNode = jtree_node_1.default.TreeNode;
const recursiveReadSync = require("recursive-readdir-sync");
const mkdirp = require("mkdirp");
class Disk {
}
Disk.rm = path => fs.unlinkSync(path);
Disk.getCleanedString = str => str.replace(/[\,\t\n]/g, " ");
Disk.strCount = (str, reg) => (str.match(new RegExp(reg, "gi")) || []).length;
Disk.read = path => fs.readFileSync(path, "utf8");
Disk.touch = path => (Disk.exists(path) ? true : Disk.write(path, ""));
Disk.mkdir = path => mkdirp.sync(path);
Disk.getRecursive = path => recursiveReadSync(path);
Disk.readJson = path => JSON.parse(Disk.read(path));
Disk.getFileNameWithoutExtension = path => Disk.getFileName(path).replace(/\.[^\.]+$/, "");
Disk.write = (path, content) => fs.writeFileSync(path, content, "utf8");
Disk.writeJson = (path, content) => fs.writeFileSync(path, JSON.stringify(content, null, 2), "utf8");
Disk.exists = path => fs.existsSync(path);
Disk.dir = dir => fs.readdirSync(dir).filter(file => file !== ".DS_Store");
Disk.getFullPaths = dir => Disk.dir(dir).map(file => dir.replace(/\/$/, "") + "/" + file);
Disk.getFiles = dir => Disk.getFullPaths(dir).filter(file => fs.statSync(file).isFile());
Disk.getFolders = dir => Disk.getFullPaths(dir).filter(file => fs.statSync(file).isDirectory());
Disk.getFileName = path => path.split("/").pop();
Disk.append = (path, content) => fs.appendFileSync(path, content, "utf8");
Disk.readCsvAsTree = path => TreeNode.fromCsv(Disk.read(path));
Disk.readSsvAsTree = path => TreeNode.fromSsv(Disk.read(path));
Disk.readTsvAsTree = path => TreeNode.fromTsv(Disk.read(path));
Disk.insertIntoFile = (path, content, delimiter) => Disk.write(path, Disk.stickBetween(content, Disk.read(path), delimiter));
Disk.detectAndReadAsTree = path => Disk.detectDelimiterAndReadAsTree(Disk.read(path));
Disk.getAllOf = (node, prop) => node.filter(node => node.getWord(0) === prop);
Disk.getDelimitedChildrenAsTree = (node, delimiter = undefined) => Disk.detectDelimiterAndReadAsTree(node.childrenToString());
Disk.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
Disk.readTree = path => new TreeNode(Disk.read(path));
Disk.sizeOf = path => fs.statSync(path).size;
Disk.stripHtml = text => (text && text.replace ? text.replace(/<(?:.|\n)*?>/gm, "") : text);
Disk.stripParentheticals = text => (text && text.replace ? text.replace(/\((?:.|\n)*?\)/gm, "") : text);
Disk.escape = s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
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
Disk.detectDelimiterAndReadAsTree = str => {
    const line1 = str.split("\n")[0];
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
    Disk.getAllOf(node, prop1).forEach(n => {
        const val = n.get(prop2);
        console.log(val);
        if (map[val] && reverse) {
            map[val].destroy();
            map[val] = n;
        }
        else if (map[val]) {
            n.destroy();
        }
        else
            map[val] = n;
    });
};
Disk.getLastFolderName = path => {
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
    tree.forEach(child => {
        map[child.get(key)] = child.get(value);
    });
    return map;
};
Disk.csvToMap = (path, columnName) => {
    const tree = Disk.readCsvAsTree(path);
    const map = {};
    tree.forEach(child => {
        const key = child.get(columnName);
        map[key] = child.toObject();
    });
    return map;
};
exports.Disk = Disk;
