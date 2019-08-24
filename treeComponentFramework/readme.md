TreeComponent Framework
=======================

TreeComponent is an experimental web framework for building reactive web apps using Tree Notation.

## Basic design

TreeComponent allows you to define your reactive single page web app as a very high level Tree Language. TreeComponent integrates Hakon for CSS, Stump for HTML, and in the future a Tree Language for Javascript, so your app has a universal syntax from top to bottom. Design your app once and it runs in the browser and NodeJS (the latter mainly for faster testing).

## Using it

This framework is currently in heavy development. Feedback is much appreciated and feel free to experiment, but it is recommended it not be used in production for some time.

## Examples

This framework powers https://ohayo.computer

## Willow

Willow shims the environment so your app works with Willow and Willow handles system calls whether it is running in the browser or NodeJs.

## Current Architecture

The chart below was designed using textik (https://textik.com/#5d3d5f6ffc50de4b)

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
