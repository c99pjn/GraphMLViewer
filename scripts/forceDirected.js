var GraphMLViewer = GraphMLViewer || {};
GraphMLViewer.Layout = GraphMLViewer.Layout || {};

GraphMLViewer.Layout.yEd = function(graph) {
    this.graph = graph;
};

GraphMLViewer.Layout.yEd.prototype.layout = function() {
    for (var i = 0; i < this.graph.nodes.length; i++) {
        var node = this.graph.nodes[i];
        for (var j = 0; j < node.datas.length; j++) {
            var data = node.datas[j];
            if (typeof(data.value) == "object") {
                var type = Object.keys(data.value)[0];
                if (data.value[type][0].Geometry) {
                    node.position.x = data.value[type][0].Geometry[0].x;
                    node.position.y = data.value[type][0].Geometry[0].y;
                    node.geometry.width = data.value[type][0].Geometry[0].width;
                    node.geometry.height = data.value[type][0].Geometry[0].height;
                }
            }
        }
    }
    for (var i = 0; i < this.graph.edges.length; i++) {
        var edge = this.graph.edges[i];
        for (var j = 0; j < edge.datas.length; j++) {
            var data = edge.datas[j];
            if (typeof(data.value) == "object") {
                var type = Object.keys(data.value)[0];
                if (data.value[type][0].Path) {
                    edge.path = data.value[type][0].Path[0];
                }
            }
        }   
    }
};

GraphMLViewer.Layout.Spring = function(graph) {
    this.graph = graph;
    this.iterations = 500;
    this.maxRepulsiveForceDistance = 1000000;
    this.k = 100;
    this.c = 0.01;
    this.maxVertexMovement = 0.5;
};

GraphMLViewer.Layout.Spring.prototype = {
        layout: function() {
                this.layoutPrepare();
                for (var i = 0; i < this.iterations; i++) {
                        this.layoutIteration();       
                }
        },
 
        layoutPrepare: function() {
            for (var i = 0; i < this.graph.nodes.length; i++) {
                    var node = this.graph.nodes[i];
                        node.geometry.width = 20;
                        node.geometry.height = 20;
                        node.position.x = Math.random()*10;
                        node.position.y = Math.random()*10;
                        node.layoutForceX = 0;
                        node.layoutForceY = 0;
                }               
        },
 
        layoutIteration: function() {
                // Forces on nodes due to node-node repulsions
            for (var i = 0; i < this.graph.nodes.length; i++) {
                    var node1 = this.graph.nodes[i];
                    for (var j = i + 1; j < this.graph.nodes.length; j++) {
                            var node2 = this.graph.nodes[j];
                                this.layoutRepulsive(node1, node2);
                        }
                }
                // Forces on nodes due to edge attractions
            for (var i = 0; i < this.graph.edges.length; i++) {
                    var edge = this.graph.edges[i];
                        this.layoutAttractive(edge);             
                }
 
                // Move by the given force
            for (var i = 0; i < this.graph.nodes.length; i++) {
                    var node = this.graph.nodes[i];
                    var xmove = this.c * node.layoutForceX;
                    var ymove = this.c * node.layoutForceY;

                    var max = this.maxVertexMovement;
                    if(xmove > max) xmove = max;
                    if(xmove < -max) xmove = -max;
                    if(ymove > max) ymove = max;
                    if(ymove < -max) ymove = -max;

                    node.position.x += xmove;
                    node.position.y += ymove;
                    node.layoutForceX = 0;
                    node.layoutForceY = 0;
                }
        },
 
 
        layoutRepulsive: function(node1, node2) {
                var dx = node2.position.x - node1.position.x;
                var dy = node2.position.y - node1.position.y;
                var d2 = dx * dx + dy * dy;
                if(d2 < 0.01) {
                        dx = 0.1 * Math.random() + 0.1;
                        dy = 0.1 * Math.random() + 0.1;
                        var d2 = dx * dx + dy * dy;
                }
                var d = Math.sqrt(d2);
                if(d < this.maxRepulsiveForceDistance) {
                        var repulsiveForce = this.k * this.k / d;
                        node2.layoutForceX += repulsiveForce * dx / d;
                        node2.layoutForceY += repulsiveForce * dy / d;
                        node1.layoutForceX -= repulsiveForce * dx / d;
                        node1.layoutForceY -= repulsiveForce * dy / d;
                }
        },
 
        layoutAttractive: function(edge) {
                var node1 = edge.src;
                var node2 = edge.target;
                var dx = node2.position.x - node1.position.x;
                var dy = node2.position.y - node1.position.y;
                var d2 = dx * dx + dy * dy;
                if(d2 < 0.01) {
                        dx = 0.1 * Math.random() + 0.1;
                        dy = 0.1 * Math.random() + 0.1;
                        var d2 = dx * dx + dy * dy;
                }
                var d = Math.sqrt(d2);
                if(d > this.maxRepulsiveForceDistance) {
                        d = this.maxRepulsiveForceDistance;
                        d2 = d * d;
                }
                var attractiveForce = (d2 - this.k * this.k) / this.k;
                if(edge.weight == undefined || edge.weight < 1) edge.weight = 1;
                attractiveForce *= Math.log(edge.weight) * 0.5 + 1;
 
                node2.layoutForceX -= attractiveForce * dx / d;
                node2.layoutForceY -= attractiveForce * dy / d;
                node1.layoutForceX += attractiveForce * dx / d;
                node1.layoutForceY += attractiveForce * dy / d;
        }
};
