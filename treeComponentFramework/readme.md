TreeComponentFramework
======================

TreeComponentFramework is a **research** web framework for building reactive web apps using entirely Tree Notation.

## The Vision

With TreeComponentFramework, you build your components in Tree Languages: instead of CSS use Hakon; instead of HTML use Stump; and instead of TypeScript/Javascript use TreeScript (coming soon). You define your components in those and then you create a high level Tree Language specifically for your app to stitch those components together.

In the future as Tree Notation and Tree Language tooling improves you will be able to build enormously powerful and complex app webs using a single universal syntax from top to bottom. We think this will greatly simplify and improve the reliability of web apps.

Today, your TreeComponentFramework apps are compiled to Javascript and HTML and then run on Virtual Machines like v8/Chromium, which will further compile your code to assembly/machine code and then send that to microprocessors which then compile it to microcode before final execution on hardware. In the long run if people build Tree Machines your code could be run directly as is on those.

## Using it

This framework is currently a **research project**. We expect to have **version 1 released sometime in 2020, if ever**. Feedback is much appreciated and feel free to experiment, but it is not recommended for production use at this time.

## Examples

The [github repo](https://github.com/treenotation/jtree/tree/master/treeComponentFramework/sweepercraft) contains a demonstration game called "SweeperCraft" that let's you design your own Minesweeper board.

This framework also powers [Ohayo](https://github.com/treenotation/ohayo).

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

## FAQ

### Why build another web framework?

No one has built a web framework that allows you to build web apps using only one single syntax, Tree Notation. This is an experiment.

### I see the Hakon and Stump but then I see mostly TypeScript/Javascript, so how is this different?

An upcoming release will contain most of the TypeScript/Javascript converted to TreeScript. The design of TreeScript is still in heavy flux.

### How can I help?

We are trying to combine Tree Notation with the best ideas from the current leading web frameworks like [React](https://reactjs.org/), [Svelte](https://svelte.dev/), and [Vue](https://vuejs.org/). We are not web framework experts and would LOVE if any experts on frameworks like those could give us some code reviews and point out any obvious bad patterns that we could fix.
