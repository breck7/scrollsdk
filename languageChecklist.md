A checklist for creating a new Tree Language from Scratch
=========================================================

- Know where to get help. [GitHub issues](https://github.com/breck7/jtree/issues), [Tree Notation subreddit](https://reddit.com/r/treenotation), [Google Groups](mailto:treenotation@googlegroups.com), or [email Breck](mailto:breck7@gmail.com).
- Take a look at some of the sample languages in the simple web [Tree Language builder](http://treenotation.org/sandbox/build/). You might be able to use these as a reference if you get stuck.
- Open the [Tree Language builder](http://treenotation.org/sandbox/build/) or use your own editor (note: only [Sublime Text 3](https://www.sublimetext.com/) currently has syntax highlighting for Grammar Languages).
- Name your language. For now, it is recommended that your language name be lowercase, only letters between A-Z, and not a common reserved word like "while/if/true/etc". You are free to name it anything you want, but if you do we ask that you report any bugs you encounter.
- If you are using the [Tree Language builder](http://treenotation.org/sandbox/build/), clear the boxes to create a new language from scratch.
If you are using your own editor, create a new file with the name "{yourLanguageNameGoesHere}.grammar"
- Create a root nodeType. This will be the root node for your language. It should like this:

`nodeType {yourLanguageNameGoesHere}
 root`

- Add a description line to your new root nodeType. This should describe what the purpose of your language is:

`nodeType {yourLanguageNameGoesHere}
 root
 description {thisIsALangageToHelpYouDoX}`

- Add a top level nodeType to your language. In this example, we'll make a simple language that allows to store your friend's birthdays. Let's add a "friend" nodeType.

`nodeType birthdays
 root
 description A language for storing your friend's birthdays.
nodeType friend
 description Store information about a friend.`

- Now let's add an inScope line to the root node so that the friend node is in scope:

`nodeType birthdays
 root
 description A language for storing your friend's birthdays.
 inScope friend
nodeType friend
 description Store information about a friend.`

- Now the following is a valid program in your language:

`friend
friend
friend`

- Now let's add a "name" nodeType under the friend nodeType's scope. We're start hiding some already mentioned code with "..." 

`...
nodeType friend
 description Store information about a friend.
 inScope name
nodeType name`

- Now the following is a valid program in your language:

`friend
 name
friend
 name
...`

- Now let's add a "cellType", which let's us start getting things like type checking, syntax highlighting, and autocomplete. By the *current* convention, we put the cellTypes at the top of our grammar file.

`cellType nameCell
 highlightScope string
...`

- Now let's make the name nodeType accept a "catch all" cellType of the nameCell.

`...
nodeType name
 catchAllCellType nameCell`

- Now the following is a valid program in your language:

`friend
 name Ben Franklin
friend
 name Ada Lovelace`

- Now let's add an error nodeType, and link it to the rootNode, to catch errors:

`nodeType birthdays
 root
 description A language for storing your friend's birthdays.
 inScope friend
 catchAllNodeType errorNode
nodeType errorNode
 baseNodeType errorNode`

- Now you should get an error for a program like this:

`frieeeend
 name Ben Franklin`

That's all for now! Let us know what you need to do next.
