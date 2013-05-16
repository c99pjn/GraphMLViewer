var GraphMLViewer = GraphMLViewer || {};
GraphMLViewer.Plotter = GraphMLViewer.Plotter || {};

GraphMLViewer.Plotter.Simple = GraphMLViewer.Plotter.Simple || {};

GraphMLViewer.Plotter.Simple.plotElement = function(e,c, doc) {
    if (e.geometry) {
        var div = document.createElement('div');
        div.classList.add('node');
        div.style.left = e.position.x;
        div.style.top = e.position.y;
        div.style.width = e.geometry.width;
        div.style.height = e.geometry.height;
        div.gmlId = e.id;
        div.classList.add('simple');
        c.appendChild(div);
    } else if (e.path) {
        var edge = document.createElement("div");
        edge.classList.add("edge");
        var source = {"x": parseInt(e.src.position.x, 10)+parseInt(e.src.geometry.width/2, 10)+parseInt(e.path.sx, 10), "y": parseInt(e.src.position.y, 10)+parseInt(e.src.geometry.height/2, 10)+parseInt(e.path.sy, 10)};
        var target = {"x": parseInt(e.target.position.x, 10)+parseInt(e.target.geometry.width/2, 10)+parseInt(e.path.tx, 10), "y": parseInt(e.target.position.y, 10)+parseInt(e.target.geometry.height/2, 10)+parseInt(e.path.ty, 10)};
        edge.style.left = source.x+"px";
        edge.style.top = source.y+"px";    
        var l = document.createElement("div");
        var d = {x:target.x-source.x,y:target.y-source.y};
        var length = Math.sqrt(d.x*d.x + d.y*d.y);
        var angle = Math.atan2(d.y,d.x)-Math.PI/2;
        l.style.height = length+"px";
        l.style.left = "0px";
        l.style.top = "0px";
        l.style[transformprop] = "rotate("+angle+"rad)";
        l.className = "line";
        l.angle = angle;
        l.style.borderLeft = "1px solid black";
        if (e.directed == "true" || e.parent.edgedefault == "directed") {
            var head = document.createElement("div");
            head.classList.add("arrow");
            head.classList.add("standard");
            head.style.bottom = "0px";   
            l.appendChild(head);
        }
        edge.appendChild(l);
        edge.gmlId = e.id;
        c.appendChild(edge);        
    }
    
}






GraphMLViewer.Plotter.yEd = GraphMLViewer.Plotter.yEd || {};

GraphMLViewer.Plotter.yEd.plotElement = function(e,c, doc) {
    if (e.geometry) {
        plotNode(e, c);
    } else if (e.path) {
        plotEdge(e, c);
    }

    function plotNode(n, c) {
        for(var i=0;i<n.datas.length;i++) {
            plotData(n.datas[i], c);
        }
    }
        
    function plotEdge(e, c) {
        for(var i=0;i<e.datas.length;i++) {
            plotData(e.datas[i], c);
        }
    }
            
    function plotData(d, c) {
        if (typeof(d.value)=="object") {
            var type = Object.keys(d.value)[0];
            var gn, div;
            if (type=="GenericNode" || type=="TableNode") {
                gn = d.value[type][0];
                d.parent.geometry.width = gn.Geometry[0].width;
                d.parent.geometry.height = gn.Geometry[0].height;
                div = createNode(gn.BorderStyle, gn.Fill, d.parent.geometry, d.parent.position, gn.NodeLabel, gn.DropShadow, gn.Shape, gn.StyleProperties, gn.configuration);
                div.gmlId = d.parent.id;
                c.appendChild(div);
            }
            if (type=="ShapeNode") {
                gn = d.value[type][0];
                d.parent.geometry.width = gn.Geometry[0].width;
                d.parent.geometry.height = gn.Geometry[0].height;
                div = createNode(gn.BorderStyle, gn.Fill, d.parent.geometry, d.parent.position, gn.NodeLabel, gn.DropShadow, gn.Shape, gn.StyleProperties);
                div.gmlId = d.parent.id;
                c.appendChild(div);
            }
            if (type=="SVGNode") {
                gn = d.value[type][0];
                d.parent.geometry.width = gn.Geometry[0].width;
                d.parent.geometry.height = gn.Geometry[0].height;
                div = createNode(gn.BorderStyle, gn.Fill, d.parent.geometry, d.parent.position, gn.NodeLabel, gn.DropShadow, gn.Shape, gn.StyleProperties, undefined, gn.SVGModel, d.parent.id);
                div.gmlId = d.parent.id;
                c.appendChild(div);
            }
            if (type=="ProxyAutoBoundsNode") {
                var active = parseInt(d.value[type][0].Realizers[0].active, 10);
                gn = d.value[type][0].Realizers[0].GroupNode[active];
                d.parent.geometry.width = gn.Geometry[0].width;
                d.parent.geometry.height = gn.Geometry[0].height;
                div = createGroupNode(gn.BorderInsets, gn.BorderStyle, gn.Fill, d.parent.geometry, d.parent.position, gn.NodeLabel, gn.DropShadow, gn.Shape, gn.Insets, gn.State);
                div.gmlId = d.parent.id;
                c.appendChild(div);
            }
            if (type.indexOf("Edge")>-1) {
                gn = d.value[type][0];
              //  d.parent.path = gn.Path[0];
              //  moveToNodeEdge(d.parent);
                div = createEdge(d.parent, gn.Arrows, gn.EdgeLabel, gn.LineStyle, d.parent.path, gn.Arc, gn.BendStyle);
                div.gmlId = d.parent.id;
                c.appendChild(div);
            }
        }
    }

    function createGroupNode(borderInsets, borderStyle, fill, geometry, position, nodeLabel, dropShadow, shape, insets, state) {
        var div = document.createElement("div");
        div.classList.add("groupnode");
        setGeometry(div, geometry, position);
        if (nodeLabel) {setNodeLabel(div, nodeLabel[0]);}
        setFill(div, fill[0]);
        setBorderStyle(div, borderStyle[0]);
        if(dropShadow) {setDropShadow(div, dropShadow[0]);}
        if(shape) {setShape(div, shape[0]);}
        return div;
    }
        
    function createNode(borderStyle, fill, geometry, position, nodeLabel, dropShadow, shape, styleProperties, configuration, SVGModel, gmlId) {
        var div = document.createElement("div");
        //div.draggable = "true";
        div.classList.add("node");
        if (configuration) {div.classList.add(configuration);}
        setGeometry(div, geometry, position);
        if (nodeLabel) {setNodeLabel(div, nodeLabel[0]);}
        if (fill && !SVGModel) {setFill(div, fill[0]);}
        if (borderStyle && !SVGModel) {setBorderStyle(div, borderStyle[0]);}
        if (dropShadow) {setDropShadow(div, dropShadow[0]);}
        if (shape) {setShape(div, shape[0]);}
        if (styleProperties) {setStyleProperties(div, styleProperties[0]);}
        if (SVGModel) {setSVGModel(div, SVGModel[0], geometry, gmlId);}
        return div;
    }

    function createEdge(e, arrows, edgeLabel, lineStyle, path, arc, bendStyle) {
        var edge = document.createElement("div");
        edge.classList.add("edge");
        var source = {"x": parseInt(e.src.position.x, 10)+parseInt(e.src.geometry.width/2, 10)+parseInt(path.sx, 10), "y": parseInt(e.src.position.y, 10)+parseInt(e.src.geometry.height/2, 10)+parseInt(path.sy, 10)};
        var target = {"x": parseInt(e.target.position.x, 10)+parseInt(e.target.geometry.width/2, 10)+parseInt(path.tx, 10), "y": parseInt(e.target.position.y, 10)+parseInt(e.target.geometry.height/2, 10)+parseInt(path.ty, 10)};
        edge.style.left = source.x+"px";
        edge.style.top = source.y+"px";
       /* var nrLines = 1;
        
        if (path && path[0].Point) {nrLines = path[0].Point.length+1;};
        console.log(nrLines);*/
        if(edgeLabel) {setEdgeLabel(edge, edgeLabel[0]);}
        //if(lineStyle) {setLineStyle(edge, lineStyle[0]);}
        setPath(edge, path, source, target, lineStyle[0]);
        if(arrows) {setArrows(edge, arrows[0]);}
        //if(arc) {setArc(edge, arc[0]);}
        //if(bendStyle) {setBendStyle(edge, bendStyle[0]);}
        return edge;
    }

    function setEdgeLabel(e, edgeLabel) {
        var s = document.createElement("span");
        s.style.position = "absolute";
        var text = document.createTextNode(edgeLabel.Text);
        s.appendChild(text);
        setLabel(s, edgeLabel);  
        e.appendChild(s);  
    }

    function setArrows(e, arrows) {
       var lines = e.getElementsByClassName('line');
       var head;
       if (arrows.source !="none") {
            head = document.createElement("div");
            head.classList.add("arrow");
            head.classList.add(arrows.source);
            head.style.top = "0px";
            head.style[transformprop] = "rotate(180deg)";
            lines[0].appendChild(head);
        }
        if (arrows.target !="none") {
            head = document.createElement("div");
            head.classList.add("arrow");
            head.classList.add(arrows.target);
            head.style.bottom = "0px";   
            lines[lines.length-1].appendChild(head);
        }
    }

    function setLineStyle(e, lineStyle) {
        if (lineStyle.hasColor!="false") {
            if (lineStyle.type == "line") {
                e.style.borderLeft = lineStyle.width+"px solid "+lineStyle.color;
            } else {
                e.style.borderLeft = lineStyle.width+"px "+lineStyle.type+" "+lineStyle.color;
            }
        }
    }

    function setPath(e, p, src, target, ls) {
        var s = src;
        var t = target;
        var d, length, l, angle;
        if (p.Point) {
            for(var i=0;i<p.Point.length;i++) {
                d = {x:p.Point[i].x-s.x,y:p.Point[i].y-s.y};
                length = Math.sqrt(d.x*d.x + d.y*d.y);
                angle = Math.atan2(d.y,d.x)-Math.PI/2;
                l = document.createElement("div");
                l.style.height = length+"px";
                l.style.left = 1*s.x-1*src.x+"px";
                l.style.top = 1*s.y-1*src.y+"px";
                l.style[transformprop] = "rotate("+angle+"rad)";
                l.className = "line";
                l.angle = angle;
                setLineStyle(l, ls);
                e.appendChild(l);
                s = p.Point[i];
            }
        }
        
        l = document.createElement("div");
        d = {x:target.x-s.x,y:target.y-s.y};
        length = Math.sqrt(d.x*d.x + d.y*d.y);
        angle = Math.atan2(d.y,d.x)-Math.PI/2;
        l.style.height = length+"px";
        l.style.left = 1*s.x-1*src.x+"px";
        l.style.top = 1*s.y-1*src.y+"px";
        l.style[transformprop] = "rotate("+angle+"rad)";
        l.className = "line";
        l.angle = angle;
        setLineStyle(l, ls);
        e.appendChild(l);
    }

    function setBendStyle(e, bendStyle) {

    }

    function setSVGModel(div, SVGModel, geometry, gmlId) {
        var temp = document.createElement('div');
        var resources = doc.datas[0].value.Resources[0].Resource;
        for (var i=0;i<resources.length;i++) {
            if(resources[i].id == SVGModel.SVGContent[0].refid) {
                var text = resources[i].Text;
                reg = new RegExp(/id="(.*?)"/g);   
                var result;
                while((result = reg.exec(text)) !== null) {
                    var re = new RegExp(result[1], "g");
                    text = text.replace(re, gmlId+'_'+result[1]);
                }
                temp.innerHTML = text;
                var svg = temp.getElementsByTagName('svg')[0];
                delete temp;
                svg.style[transformoriginprop] = "0px 0px";
                svg.style[transformprop] = 'scale('+geometry.width/svg.width.baseVal.value+','+geometry.height/svg.height.baseVal.value+')';
                div.appendChild(svg);
            }
        }
    }

    function setStyleProperties(e, styleProperties) {
        for (var i=0;i<styleProperties.Property.length;i++) {
            if (styleProperties.Property[i].name == "ModernNodeRadius") {
                e.style.borderRadius = styleProperties.Property[i].value+"px";
            }
        }
    }

    function setDropShadow(e, dropShadow) {
        e.style.boxShadow = dropShadow.offsetX+"px "+dropShadow.offsetY+"px 4px "+dropShadow.color;
    }

    function setShape(e, shape) {
        e.classList.add(shape.type);
    }

    function setBorderStyle(e, borderStyle) {
        if (borderStyle.hasColor!="false") {
            e.style.borderColor = borderStyle.color;
            e.style.borderWidth = borderStyle.width+"px";
            if (borderStyle.type == "line") {
                e.style.borderStyle = "solid";
            } else {
                e.style.borderStyle = borderStyle.type;
            }
        }
    }


    function setGeometry(e, geometry, position) {
        e.style.width = geometry.width+"px";
        e.style.height = geometry.height+"px";
        e.style.left = position.x+"px";
        e.style.top = position.y+"px";
    }

    function setFill(e, fill) {
        if (fill.hasColor!="false") {
            e.style.backgroundColor = hexToRgba(fill.color);
            if (fill.color2) {
                e.style.background = "-moz-linear-gradient(top , "+hexToRgba(fill.color)+", "+hexToRgba(fill.color2)+")";
                e.style.background = "-webkit-linear-gradient(top, "+hexToRgba(fill.color)+", "+hexToRgba(fill.color2)+")";
            }
            if (fill.transparent == "true") {
                e.style.background = "transparent";
            }
        }
    }

    function setNodeLabel(e, nodeLabel) {
        var s = document.createElement("span");
        s.style.position = "absolute";
        if (nodeLabel.autoSizePolicy) {}
        if (nodeLabel.modelName) {}
        if (nodeLabel.modelPosition) {};
        var text = document.createTextNode(nodeLabel.Text);
        s.appendChild(text);
        setLabel(s, nodeLabel);  
        e.appendChild(s);     
    }

    function setLabel(e, label) {
        if (label.visible != "false") {
            if (label.alignment) {e.style.textAlign = label.alignment; e.style.verticalAlign = "middle";}
            if (label.fontFamily) {e.style.fontFamily = label.fontFamily;}
            if (label.fontSize) {e.style.fontSize = label.fontSize;}
            if (label.fontStyle) {
                if (label.fontStyle == "plain") {
                    e.style.fontStyle = "normal";
                }
                if (label.fontStyle == "italic") {
                    e.style.fontStyle = "italic";
                }
                if (label.fontStyle == "bold") {
                    e.style.fontStyle = "normal";
                }
                if (label.fontStyle == "bolditalic") { 
                    e.style.fontStyle = "italic";
                    e.style.fontWeight = "bold"; 
                }
            }
            if (label.hasBackgroundColor != "false") {
                if (label.backgroundColor) {e.style.backgroundColor = label.backgroundColor;}
            }
            if (label.height) {e.style.height = label.height+"px";}
            if (label.horizontalTextPosition) {}
            if (label.icon) {}
            if (label.iconData) {}
            if (label.iconTextGap) {}
            if (label.image) {}
            if (label.hasLineColor == "true") {
                if (label.lineColor) {e.style.borderColor = label.lineColor;e.style.bordeWidth="1px";}
            }
            if (label.rotationAngle) {e.style[transformprop] = "rotate("+label.rotationAngle+"deg)";}
            if (label.textColor) {e.style.color = label.textColor;}
            if (label.underlinedText) {}
            if (label.verticalTextPosition) {}
            
            if (label.width) {e.style.width = label.width+"px";}
            if (label.x) {e.style.left = label.x+"px";}
            if (label.y) {e.style.top = label.y+"px";}
        }
    }

    function hexToRgba(hex) {
        var h = hex.replace('#','');
        var r = parseInt(h.substring(0,2), 16);
        var g = parseInt(h.substring(2,4), 16);    
        var b = parseInt(h.substring(4,6), 16);
        var a = 1;
        if (h.length>6) {
            a = parseInt(h.substring(6,8), 16)/255;
        }
        return 'rgba('+r+','+g+','+b+','+a+')';
    }
}
