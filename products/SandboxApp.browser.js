//tooling product SandboxApp.browser.js
const samples = {};
samples.csv = jtree.TreeNode.iris;
// todo: autogen this.
samples.json = `{
 "name": "jtree",
 "description": "Tree Notation parser, compiler-compiler, and virtual machine for Tree Languages",
 "keywords": "jtree"
}`;
jQuery(document).ready(function () {
    const treeConsole = jQuery("#treeConsole");
    const jsonConsole = jQuery("#jsonConsole");
    const outlineConsole = jQuery("#outlineConsole");
    const csvConsole = jQuery("#csvConsole");
    const xmlConsole = jQuery("#xmlConsole");
    const htmlConsole = jQuery("#htmlConsole");
    const tableConsole = jQuery("#tableConsole");
    const yamlConsole = jQuery("#yamlConsole");
    jQuery("#jsonSample").on("click", () => jsonConsole.val(samples.json).keyup());
    jQuery("#csvSample").on("click", () => csvConsole.val(samples.csv).keyup());
    // Init vars
    if (localStorage.getItem("tree"))
        treeConsole.val(localStorage.getItem("tree"));
    jQuery("#version").html("Version: " + jtree.getVersion());
    const updateAll = (tree, eventSource) => {
        if (eventSource !== treeConsole)
            treeConsole.val(tree.toString());
        if (eventSource !== jsonConsole)
            jsonConsole.val(tree.toJsonSubset());
        if (eventSource !== outlineConsole)
            outlineConsole.html(tree.toOutline());
        if (eventSource !== csvConsole)
            csvConsole.val(tree.toCsv());
        if (eventSource !== xmlConsole)
            xmlConsole.val(tree.toXml());
        if (eventSource !== htmlConsole)
            htmlConsole.html(tree.toHtml());
        if (eventSource !== tableConsole)
            tableConsole.html(tree.toTable());
        if (eventSource !== yamlConsole)
            yamlConsole.html(tree.toYaml());
        let win = window;
        win.tree = tree;
        localStorage.setItem("tree", tree.toString());
    };
    // Bind listeners
    treeConsole.on("keyup", () => updateAll(new jtree.TreeNode(treeConsole.val()), treeConsole));
    jsonConsole.on("keyup", () => updateAll(jtree.TreeNode.fromJsonSubset(jsonConsole.val()), jsonConsole));
    csvConsole.on("keyup", () => updateAll(jtree.TreeNode.fromCsv(csvConsole.val()), csvConsole));
    xmlConsole.on("keyup", () => updateAll(jtree.TreeNode.fromXml(xmlConsole.val()), xmlConsole));
    // Trigger start
    treeConsole.keyup();
});
