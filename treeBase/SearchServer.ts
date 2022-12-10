#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const numeral = require("numeral")

const { jtree } = require("../index.js")
const { Disk } = require("../products/Disk.node.js")
const { TreeNode, Utils } = jtree

import { TreeBaseFolder, TreeBaseFile } from "./TreeBase"

class SearchServer {
	constructor(treeBaseFolder: TreeBaseFolder, searchUrl = "search") {
		this.folder = treeBaseFolder
		this.searchUrl = searchUrl
	}

	searchUrl: string
	folder: TreeBaseFolder

	logQuery(logFilePath: string, originalQuery: string, ip: string) {
		const tree = `search
 time ${Date.now()}
 ip ${ip}
 query
  ${originalQuery.replace(/\n/g, "\n  ")} 
`
		fs.appendFile(logFilePath, tree, function() {})
		return this
	}

	search(originalQuery: string, format = "html", columns = ["id"], idColumnName = "id"): string {
		const query = decodeURIComponent(originalQuery)
		const startTime = Date.now()
		const { folder } = this
		const lowerCaseQuery = query.toLowerCase()
		// Todo: allow advanced search. case sensitive/insensitive, regex, et cetera.
		const testFn = (str: string) => str.includes(lowerCaseQuery)

		const escapedQuery = Utils.htmlEscaped(lowerCaseQuery)
		const fullTextHits = folder.filter((file: TreeBaseFile) => testFn(file.lowercase))
		const nameHits = folder.filter((file: TreeBaseFile) => file.lowercaseNames.some(testFn))

		if (format === "namesOnly") return fullTextHits.map((file: TreeBaseFile) => file.id)

		if (format === "csv") {
			nameHits.map((file: TreeBaseFile) => file.set(idColumnName, file.id))
			fullTextHits.map((file: TreeBaseFile) => file.set(idColumnName, file.id))

			console.log(`## ${nameHits.length} name hits`)
			console.log(new TreeNode(nameHits).toDelimited(",", columns))

			console.log(``)

			console.log(`## ${fullTextHits.length} full text hits`)
			console.log(new TreeNode(fullTextHits).toDelimited(",", columns))
			return
		}

		const highlightHit = (file: TreeBaseFile) => {
			const line = file.lowercase.split("\n").find((line: string) => testFn(line))
			return line.replace(lowerCaseQuery, `<span style="highlightHit">${lowerCaseQuery}</span>`)
		}
		const fullTextSearchResults = fullTextHits.map((file: TreeBaseFile) => ` <div class="searchResultFullText"><a href="${file.webPermalink}">${file.title}</a> - ${file.get("type")} #${file.rank} - ${highlightHit(file)}</div>`).join("\n")

		const nameResults = nameHits.map((file: TreeBaseFile) => ` <div class="searchResultName"><a href="${file.webPermalink}">${file.title}</a> - ${file.get("type")} #${file.rank}</div>`).join("\n")

		const time = numeral((Date.now() - startTime) / 1000).format("0.00")
		return `
html
 <div class="treeBaseSearchForm"><form style="display:inline;" method="get" action="${
		this.searchUrl
 }"><input name="q" placeholder="Search" autocomplete="off" type="search" id="searchFormInput"><input class="searchButton" type="submit" value="Search"></form></div>
 <script>document.addEventListener("DOMContentLoaded", evt => initSearchAutocomplete("searchFormInput"))</script>

* <p class="searchResultsHeader">Searched ${numeral(folder.length).format("0,0")} files for "${escapedQuery}" in ${time}s.</p>
 <hr>

html
 <p class="searchResultsHeader">Showing ${nameHits.length} files whose name or aliases matched.</p>

html
${nameResults}
<hr>

* <p class="searchResultsHeader">Showing ${fullTextHits.length} files who matched on a full text search.</p>

html
 ${fullTextSearchResults}`
	}
}

export { SearchServer }

if (!module.parent) {
	const folderPath = process.cwd()
	const folder = new TreeBaseFolder().setDir(folderPath).setGrammarDir(folderPath)
	new SearchServer(folder).search(process.argv.slice(2).join(" "), "csv")
}
