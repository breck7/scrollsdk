#! /usr/local/bin/node

const test = require("tape")
const testTree = require("../tests.js")

Object.keys(testTree).forEach(key => {
	test(key, t => {
		testTree[key](t)
		t.end()
	})
})
