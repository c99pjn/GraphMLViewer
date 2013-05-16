var GraphMLViewer = GraphMLViewer || {};

GraphMLViewer.DOMRenderer = function(xmlDoc, gcontainer, plotElement, layouter) {
    var json = XMLObjectifier.xmlToJSON(xmlDoc);
    this.doc = GraphMLViewer.parseGraphml(json);
    //console.log(this.doc);
    this.graphs = this.doc.graphs;
    this.gcontainer = gcontainer;
    this.plotElement = plotElement;
    this.layouter = layouter;
    this.scale = 1;
    this.dragStartHandler = this.handleDragStart.bind(this);
    this.dragHandler = this.handleDrag.bind(this);
    this.releaseHandler = this.handleRelease.bind(this);
    this.zoomHandler = this.handleZoom.bind(this);
    this.onModel = {'left': 0, 'top': 0};
    this.lastC = {'left': 0, 'top': 0};
};

GraphMLViewer.DOMRenderer.prototype.init = function() {
    for(var i=0;i<this.graphs.length;i++) {
        if (this.layouter) {
            var lay = new this.layouter(this.graphs[i])//, this.render.bind(this));
            lay.layout();
        }
    }
    this.render();
}


GraphMLViewer.DOMRenderer.prototype.render = function() {
    this.gcontainer.innerHTML = '';
    this.container = document.createElement('div');
    this.container.classList.add('container');
    this.container.addEventListener('mousedown', this.dragStartHandler);
    this.container.addEventListener('mousewheel', this.zoomHandler);
    this.container.addEventListener('DOMMouseScroll', this.zoomHandler);         
    this.gcontainer.appendChild(this.container);
    for(var i=0;i<this.graphs.length;i++) {
        this.renderModel(this.graphs[i]);
    }
};

GraphMLViewer.DOMRenderer.prototype.renderModel = function(graph) {
    var c = document.createElement("div");
    c.classList.add("model");
    c.gmlId = graph.id;
    this.renderGraph(graph, c); 
    this.container.appendChild(c);
    var bcl = c.getBoundingClientRect();
    var ul = this.findUpperLeft(c, {'left': Infinity, 'top': Infinity});
    this.transform = {'left': bcl.left-ul.left+10, 'top': bcl.top-ul.top+10};
    c.style[transformprop] = 'translate('+this.transform.left+'px,'+this.transform.top+'px)';  
}


GraphMLViewer.DOMRenderer.prototype.handleZoom = function(e) {
    e.preventDefault();
    this.onModel = {'left': this.onModel.left-(this.lastC.left-e.offsetX)/this.scale, 'top': this.onModel.top-(this.lastC.top-e.offsetY)/this.scale};
    if (e.wheelDeltaY > 0 || e.detail < 0) {
        this.scale = this.scale*1.1;
    } else {
        this.scale = this.scale/1.1;
    }
    this.lastC = {'left': e.offsetX, 'top': e.offsetY};    
    this.container.firstChild.style[transformprop] = 'scale('+this.scale+') translate('+(this.transform.left+(this.lastC.left-this.onModel.left)/this.scale)+'px,'+(this.transform.top+(this.lastC.top-this.onModel.top)/this.scale)+'px)';
    this.container.firstChild.style[transformoriginprop] = this.onModel.left+'px '+this.onModel.top+'px';    
};

GraphMLViewer.DOMRenderer.prototype.handleDragStart = function(e) {
    if (e.button === 0) {
        this.draggedTarget = e.target;
        this.draggedNode = undefined;
        outer:
        do {
            for (var i=0; i<this.graphs.length; i++) {
                if (this.graphs[i].getNodeById(this.draggedTarget.gmlId)) {
                    this.draggedNode = this.graphs[i].getNodeById(this.draggedTarget.gmlId);
                    this.nsX = this.draggedNode.position.x;
                    this.nsY = this.draggedNode.position.y;
                    break outer;
                }
            }
        } while ((this.draggedTarget != this.container) && (this.draggedTarget = this.draggedTarget.parentNode))
        this.sX = e.clientX;
        this.sY = e.clientY;
        window.addEventListener('mousemove', this.dragHandler);
        window.addEventListener('mouseup', this.releaseHandler);
    }
};

GraphMLViewer.DOMRenderer.prototype.handleDrag = function(e) {
    if (this.draggedNode) {
        this.draggedTarget.style[transformprop] = 'translate('+(e.clientX-this.sX)/this.scale+'px,'+(e.clientY-this.sY)/this.scale+'px)';
        this.draggedNode.position.x = 1*this.nsX+(e.clientX-this.sX)/this.scale;
        this.draggedNode.position.y = 1*this.nsY+(e.clientY-this.sY)/this.scale;
        var c = this.draggedTarget.parentNode;
        for (var i=0; i<this.draggedNode.sourceOf.length; i++) {
            resetAnchors(this.draggedNode.sourceOf[i]);
            var edge = findEdgeByGmlId(this.draggedNode.sourceOf[i].id, c);
            edge.parentNode.removeChild(edge);
            this.renderEdge(this.draggedNode.sourceOf[i], c);
        }
        for (i=0; i<this.draggedNode.targetOf.length; i++) {
            resetAnchors(this.draggedNode.targetOf[i]);
            edge = findEdgeByGmlId(this.draggedNode.targetOf[i].id, c);
            edge.parentNode.removeChild(edge);
            this.renderEdge(this.draggedNode.targetOf[i], c);
        }
    } else {
        this.draggedTarget.firstChild.style[transformprop] = 'scale('+this.scale+') translate('+(this.transform.left+(e.clientX-this.sX+this.lastC.left-this.onModel.left)/this.scale)+'px,'+(this.transform.top+(e.clientY-this.sY+this.lastC.top-this.onModel.top)/this.scale)+'px)';
    }
    
    function resetAnchors(e) {
        e.path.sx = 0;
        e.path.sy = 0;
        e.path.tx = 0;
        e.path.ty = 0;
    }
    
    function findEdgeByGmlId(gmlId, c) {
        var edges = c.getElementsByClassName('edge');
        for (var i=0;i<edges.length; i++) {
            if (edges[i].gmlId == gmlId) {
                return edges[i];
            }
        }
        return undefined;
    }
};

GraphMLViewer.DOMRenderer.prototype.handleRelease = function(e) {
    window.removeEventListener('mousemove', this.dragHandler);
    window.removeEventListener('mouseup', this.releaseHandler);
    if (this.draggedNode) {
        var c = this.draggedTarget.parentNode;
        this.draggedTarget.parentNode.removeChild(this.draggedTarget);
        this.renderNode(this.draggedNode, c);
    } else {
        this.transform.left += (e.clientX-this.sX)/this.scale;
        this.transform.top += (e.clientY-this.sY)/this.scale;
    }
};

GraphMLViewer.DOMRenderer.prototype.findUpperLeft = function(e, m) {
    var c = e.childNodes;
    for (var i=0; c && i<c.length;i++) {
        var br = c[i].getBoundingClientRect();
        if (br.left < m.left) {m.left = br.left;}
        if (br.top < m.top) {m.top = br.top;}
    }
    return {'left': m.left, 'top':m.top};
};


GraphMLViewer.DOMRenderer.prototype.renderGraph = function(g, c) {
    for(var i=0;i<g.nodes.length;i++) {
        this.renderNode(g.nodes[i], c);
    }
    for(i=0;i<g.edges.length;i++) {
        this.renderEdge(g.edges[i], c);
    }
};
    
GraphMLViewer.DOMRenderer.prototype.renderNode = function(n, c) {
    this.plotElement(n, c, this.doc);
    for(var i=0;i<n.graphs.length;i++) {
        this.renderGraph(n.graphs[i], c);
    }
};

GraphMLViewer.DOMRenderer.prototype.renderEdge = function(e, c) {
    moveToNodeEdge(e);
    this.plotElement(e, c, this.doc);
    
    function moveToNodeEdge(e) {
        var to, from;
        if (e.path.Point) {
            to = {'x': 1*e.path.Point[0].x, 'y': 1*e.path.Point[0].y};
        } else {
            to = {'x': 1*e.path.tx+1*e.target.position.x+1*e.target.geometry.width/2, 'y': 1*e.path.ty+1*e.target.position.y+1*e.target.geometry.height/2};
        }
        from = {'x': 1*e.path.sx+1*e.src.position.x+1*e.src.geometry.width/2, 'y': 1*e.path.sy+1*e.src.position.y+1*e.src.geometry.height/2};
        d = {x: to.x-from.x, y:to.y-from.y};
        bp = {'x1': 1*e.src.position.x, 'y1': 1*e.src.position.y, 'x2': 1*e.src.position.x+1*e.src.geometry.width, 'y2': 1*e.src.position.y+1*e.src.geometry.height};
        var xi, yi;
        if (d.y>=0) {
            xi = intersectsAt(from.x, from.y, to.x, to.y, bp.x1, bp.y2, bp.x2, bp.y2);
            if (d.x>=0) {
                yi = intersectsAt(from.x, from.y, to.x, to.y, bp.x2, bp.y1, bp.x2, bp.y2);
            } else {
                yi = intersectsAt(from.x, from.y, to.x, to.y, bp.x1, bp.y1, bp.x1, bp.y2);                
            }
        } else {
            xi = intersectsAt(from.x, from.y, to.x, to.y, bp.x1, bp.y1, bp.x2, bp.y1);
            if (d.x>=0) {
                yi = intersectsAt(from.x, from.y, to.x, to.y, bp.x2, bp.y1, bp.x2, bp.y2);                
            } else {
                yi = intersectsAt(from.x, from.y, to.x, to.y, bp.x1, bp.y1, bp.x1, bp.y2);
            }
        }
        if (xi && yi) {
            if (xi && xi.x > bp.x1 && xi.x < bp.x2) {
                e.path.sx = xi.x-from.x+1*e.path.sx;
                e.path.sy = xi.y-from.y+1*e.path.sy;
            } else {
                e.path.sx = yi.x-from.x+1*e.path.sx;
                e.path.sy = yi.y-from.y+1*e.path.sy;
            }
        }

        if (e.path.Point) {
            from = {'x': 1*e.path.Point[e.path.Point.length-1].x, 'y': 1*e.path.Point[e.path.Point.length-1].y};
        } else {
            from = {'x': 1*e.path.sx+1*e.src.position.x+1*e.src.geometry.width/2, 'y': 1*e.path.sy+1*e.src.position.y+1*e.src.geometry.height/2};
        }
        to = {'x': 1*e.path.tx+1*e.target.position.x+1*e.target.geometry.width/2, 'y': 1*e.path.ty+1*e.target.position.y+1*e.target.geometry.height/2};
        d = {x: to.x-from.x, y:to.y-from.y};
        bp = {'x1': 1*e.target.position.x, 'y1': 1*e.target.position.y, 'x2': 1*e.target.position.x+1*e.target.geometry.width, 'y2': 1*e.target.position.y+1*e.target.geometry.height}
        
        if (d.y<=0) {
            xi = intersectsAt(from.x, from.y, to.x, to.y, bp.x1, bp.y2, bp.x2, bp.y2);
            if (d.x<=0) {
                yi = intersectsAt(from.x, from.y, to.x, to.y, bp.x2, bp.y1, bp.x2, bp.y2);
            } else {
                yi = intersectsAt(from.x, from.y, to.x, to.y, bp.x1, bp.y1, bp.x1, bp.y2);                
            }
        } else {
            xi = intersectsAt(from.x, from.y, to.x, to.y, bp.x1, bp.y1, bp.x2, bp.y1);
            if (d.x<=0) {
                yi = intersectsAt(from.x, from.y, to.x, to.y, bp.x2, bp.y1, bp.x2, bp.y2);                
            } else {
                yi = intersectsAt(from.x, from.y, to.x, to.y, bp.x1, bp.y1, bp.x1, bp.y2);
            }
        }
        if (xi && yi) {
            if (xi.x > bp.x1 && xi.x < bp.x2) {
                e.path.tx = xi.x-to.x+1*e.path.tx;
                e.path.ty = xi.y-to.y+1*e.path.ty;
            } else {
                e.path.tx = yi.x-to.x+1*e.path.tx;
                e.path.ty = yi.y-to.y+1*e.path.ty;
            }
        }
        function intersectsAt(x1,y1,x2,y2,x3,y3,x4,y4) {
            var denom = ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
            if (denom !==0) {
                return {'x':((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/denom, 'y':((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/denom};
            } else {
                return undefined;
            }
        }    
    }
};
