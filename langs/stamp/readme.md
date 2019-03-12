# Stamp

Stamp is an alternative to zip files for sharing a small collection of folders and text files.

A Stamp Program is an easily readable plain text program that when executed creates the files and folders listed.

Stamp Programs can also prompt the user for input and use that input throughout the created files and folders.

Frequently programmers have templates that they start new projects with. Those templates can be turned into Stamp programs.

# The Problem

The web is full of project tutorials like <a href="https://docs.npmjs.com/getting-started/creating-node-modules">this one</a>
that ask their readers to go through a series of steps to create a particular folder and file structure for a new project.

The current options for this situation are:

*The Recipe Method - explain each step*
- Downside: If your basic project layout requires 10 files, that's 10 separate steps the reader has to do just to get started.
- Downside: The reader might make an error during one of those steps and lose even more time.
- Downside: Putting such steps in a narrative and updating that narrative if things change is time consuming as an author

*The Zip Method - zip the template directory*
- Downside: zip files are opaque and a user has no visibility into what they are creating
- Downside: everytime the template changes, author has to rezip and reupload the folder
- Downside: once unzipped, user has to manually change names to match the name of their project

*The Custom Utility Method - implement a custom command line program that generates new projects*
- Downside: No visibility into what is getting created
- Downside: If the template changes, now author needs to get users to install the new template program
- Downside: Now you have a whole new complicated program to write and maintain

*The GitHub method - create a repo for your template and have people git clone it
- Downside: no way of doing variable replacement post-clone
- Downside: no plain text way of distributing the template

## exampleFile.stamp

    #! /usr/local/bin/node --use_strict /usr/local/bin/tree
    folder myProject
    file myProject/index.js
     data
      console.log("Hello world")
    file myProject/readme.md
     data
      # My Readme

## Using Stamp

    npm install treeprogram
    npm install stamp-lang
    # todo: add automatic way to tell tree cli where stamp lang is
    ./exampleFile.stamp


## exampleWithPrompt.stamp

    #! /usr/local/bin/node --use_strict /usr/local/bin/tree
    prompt PROJECTNAME any Enter a name for your project
    folder PROJECTNAME
    file PROJECTNAME/index.js
     data
      console.log("Hello world")
    file PROJECTNAME/readme.md
     data
      # PROJECTNAME

## Similar Projects

- Wikipedia list of archive formats (https://en.wikipedia.org/wiki/List_of_archive_formats)
- ptar (https://github.com/jtvaughan/ptar) - full featured, but difference is the file output is a custom format (not a Tree Language)
- shar (https://en.wikipedia.org/wiki/Shar) - old school method that has the major security flaw of potentially running any shell command
- dar (http://dar.linux.free.fr/)
