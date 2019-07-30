TreeBase BETA
=============

What is TreeBase?
-----------------

TreeBase is the software-less database system for community knowledge bases.

Try It
------

    npm install -g jtree
    jtree base


How does it work?
-----------------

TreeBase stores data in plain text files using Tree Notation. Instead of storing an item's data in a row, you store the item's data in a file.

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

The Grammar file (aka Schema), for this file would be this:

    planetNode
     root
     inScope abstractIntPropertyNode abstractFloatPropertyNode
     catchAllNodeType errorNode
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

