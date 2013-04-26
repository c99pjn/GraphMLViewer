var transformprop = getsupportedprop(["transform", "MozTransform", "webkitTransform"]);    
var transformoriginprop = getsupportedprop(["transformOrigin", "MozTransformOrigin", "webkitTransformOrigin"]);   


function getsupportedprop(proparray){
    var root=document.documentElement;
    for (var i=0; i<proparray.length; i++){
        if (typeof root.style[proparray[i]]=="string"){
            return proparray[i];
        }
    }
}
