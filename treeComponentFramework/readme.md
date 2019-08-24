TreeComponentFramework
======================

TreeComponentFramework is an **experimental** web framework for building reactive web apps using entirely Tree Notation.

## The Vision

With TreeComponentFramework, you build your components in Tree Languages (Hakon for CSS, Stump for HTML, and TBD for Javascript) and then you create a high level Tree Language to stitch those components together.

In the future as Tree Notation and Tree Language tooling improves you will be able to build enormously powerful and complex app webs using a single universal syntax from top to bottom.

Your TreeComponentFramework apps are compiled to Javascript and HTML and then run on Virtual Machines like v8/Chromium, which will further compile your code to assembly/machine code and then send that to microprocessors which then compile it to microcode before final execution on hardware. In the long run if people build Tree Machines your code could be run directly as is on those.

## Using it

This framework is currently "alpha". Feedback is much appreciated and feel free to experiment, but it is recommended it not be used in production for some time.

## Examples

This framework powers https://ohayo.computer

## Current Architecture

TreeComponentFramework is designed to run in the browser and NodeJS. It runs in NodeJS for faster headless testing.

Willow shims the environment so your app works with Willow and Willow handles system calls whether it is running in the browser or NodeJs.

The diagram below was designed using textik (https://textik.com/#5d3d5f6ffc50de4b)

    +--------------------------+         +-------------------------+
    |          Browser         |         |          NodeJS         |
    +--------------------------+         +-------------------------+
                  |                                   |             
                  |                                   |             
    +--------------------------+        +--------------------------+
    |  External Dependencies:  |        |    External Dependencies:|
    |   jQuery, SuperAgent     |        |         Superagent       |
    +--------------------------+        +--------------------------+
                  |                                   |             
                  |    +----------------------------+ |             
                  |    | Tree Dependencies:         | |             
                  +----| JTree, Stump, Hakon        |-+             
                       +----------------------------+               
                                      |                             
                                      |                             
                       +----------------------------+               
                       | TreeComponentFramework &   |               
                       | Willow for browser shim    |               
                       +----------------------------+               
                                      |                             
                                      |                             
                       +----------------------------+               
                       |Your App                    |               
                       +----------------------------+               
