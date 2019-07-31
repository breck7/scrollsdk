TreeBase BETA
=============

What is TreeBase?
-----------------

TreeBase is the software-less database system for community knowledge bases. You can also think of it as Wikipedia for clean, strongly typed data<sup>1</sup>.

Try It
------

This will launch a TreeBase server on port 4444 using the included example "planets" database.

    npm install -g jtree
    jtree base


How does it work?
-----------------

TreeBase stores data in plain text files using [Tree Notation](http://treenotation.org). Instead of storing data in rows in a compressed binary format, you store data in regular files.

So a database of planets might look like this:

    planets/
     venus.planet
     mercury.planet
     earth.planet
     mars.planet
     jupiter.planet
     saturn.planet
     neptune.planet
     uranus.planet

Each file contains information in a schema that you specify in a Grammar file.

For example, the file `mars.planet` might look like this:

    diameter 6794
    surfaceGravity 4
    yearsToOrbitSun 1.881
    moons 2

The Grammar file (TreeBase's version of "Schemas"), for this file would be this:

    planetNode
     root
     todo Change pattern to postfix.
     pattern \.planet$
     inScope abstractIntPropertyNode abstractFloatPropertyNode
     catchAllNodeType errorNode
    anyFirstCell
     todo remove the need for this
    errorNode
     baseNodeType errorNode
    intCell
     highlightScope constant.numeric.integer
    floatCell
     highlightScope constant.numeric.float
    keywordCell
     highlightScope keyword
    abstractIntPropertyNode
     cells intCell
     firstCellType keywordCell
     abstract
    abstractFloatPropertyNode
     cells floatCell
     firstCellType keywordCell
     abstract
    surfaceGravityNode
     extends abstractIntPropertyNode
    diameterNode
     extends abstractIntPropertyNode
    moonsNode
     extends abstractIntPropertyNode
    yearsToOrbitSunNode
     extends abstractFloatPropertyNode

By creating the Grammar file, you get type checking, autocomplete, syntax highlighting, and more. Try the [Planets Grammar](http://treenotation.org/sandbox/build/#grammar%0A%20planetNode%0A%20%20root%0A%20%20todo%20Change%20pattern%20to%20postfix.%0A%20%20pattern%20%5C.planet%24%0A%20%20inScope%20abstractIntPropertyNode%20abstractFloatPropertyNode%0A%20%20catchAllNodeType%20errorNode%0A%20anyFirstCell%0A%20%20todo%20remove%20the%20need%20for%20this%0A%20errorNode%0A%20%20baseNodeType%20errorNode%0A%20intCell%0A%20%20highlightScope%20constant.numeric.integer%0A%20floatCell%0A%20%20highlightScope%20constant.numeric.float%0A%20keywordCell%0A%20%20highlightScope%20keyword%0A%20abstractIntPropertyNode%0A%20%20cells%20intCell%0A%20%20firstCellType%20keywordCell%0A%20%20abstract%0A%20abstractFloatPropertyNode%0A%20%20cells%20floatCell%0A%20%20firstCellType%20keywordCell%0A%20%20abstract%0A%20surfaceGravityNode%0A%20%20extends%20abstractIntPropertyNode%0A%20diameterNode%0A%20%20extends%20abstractIntPropertyNode%0A%20moonsNode%0A%20%20extends%20abstractIntPropertyNode%0A%20yearsToOrbitSunNode%0A%20%20extends%20abstractFloatPropertyNode%0Asample%0A%20diameter%206794%0A%20surfaceGravity%204%0A%20yearsToOrbitSun%201.881%0A%20moons%202).

TreeBase delegates to Git for versioning, backups, and collaboration.

Do I need to use this library to use TreeBase?
----------------------------------------------

No. This library gives you some convenient functionality, like querying and bulk editing capabilities, but you can use the TreeBase system without installing any new software on your computer. In fact, you don't even need to use a computer at all. Pen, paper, and some folders work well for small TreeBases.

Can I use TreeBase with my existing SQL databases?
--------------------------------------------------

Yes. With one command you can turn your TreeBase database into a SQL database. There is no lock-in.

Can I use TreeBase with my existing JSON or CSV workflows?
----------------------------------------------------------

Yes. With one command you can convert your TreeBase data into JSON, CSV, TSV, etc. There is no lock-in.

Does TreeBase scale?
--------------------

Yes. We have been using TreeBase for over 2 years in systems with millions of rows and dozens of collaborators. While we don't recommend TreeBase for mission critical applications yet, there is no reason to think it will not scale to that as well, as the community grows and improves the core libraries in different host languages.

Similar Projects
----------------

- [Forest 1.0](https://www.cs.princeton.edu/research/techreps/TR-904-11)

Footnotes
---------

1. To be precise, TreeBase is more like [MediaWiki](https://www.mediawiki.org/wiki/MediaWiki) than Wikipedia.
