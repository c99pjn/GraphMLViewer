# GraphMLViewer

UNDER CONSTRUCTION

Simple javascript library that renders graphml files in the browser.

The structure is probably super weird :).

## Overview

### Graph model

graph.js is a simple implementation of graphml objects

grapmlparser.js parses the grapml document in XML format and creates the graphml object

### Layouting

At the moment there are 2 layout implementations. One using yEd encoded positions and one using a simple force directed spring layout.

Its should be quite easy to implement new layouters.

### Plotter

The plotter creates the nodes and edges and styles them accordingly. At the moment there are 2 implementations, one really simple one and one that tries to mimic yEd styling.

### Renderers

The renderer is responsible for parsing the XML, layout the graph and plot it in the browser. At the moment there is only one renderer, the DOMRenderer which renders the graphs using divs.

It takes as parameters the XML encoded graphml document, the container element to render the graph in, function to be used to plot the elements and the layout engine to use.

## Examples

To use the library you need the javascript file and the css file located under target.

See example.html

    renderer = new GraphMLViewer.DOMRenderer(xmlDoc, document.getElementById("graphsContainer"), 
                                             GraphMLViewer.Plotter.yEd.plotElement, GraphMLViewer.Layout.yEd);
    renderer.init();

## Building

I use [compressJS](https://github.com/dfsq/compressJS.sh) for building the concatenated file.