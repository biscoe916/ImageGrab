(function() {
	// Helper functions
	function is_set(o) {
		return typeof o !== 'undefined' ? true : false;
	}
	function not_set(o) {
		return typeof o === 'undefined' ? true : false;
	}
	function observe(obj, type, fn) {
	  if (obj.attachEvent) {
		obj['e'+type+fn] = fn;
		obj[type+fn] = function(){obj['e'+type+fn](window.event);}
		obj.attachEvent('on'+type, obj[type+fn]);
	  } else
		obj.addEventListener(type, fn, false);
	}
	function stopObserve(obj, type, fn) {
	  if (obj.detachEvent) {
		obj.detachEvent('on'+type, obj[type+fn]);
		obj[type+fn] = null;
	  } else
		obj.removeEventListener(type, fn, false);
	}
	function getEventElement(e) {
		return e.target || e.srcElement;
	}
	function addElement(element_type, parent_element, style, tags) {
		var r = document.createElement(element_type);
		if(style) for(var x in style) r.style[x] = style[x];
		if(tags) for(var x in tags) {r[x] = tags[x];}
		parent_element.appendChild(r);
		return(r);
	}
	function removeElement(node) {
		 if(node) {
			removeAllChildren(node);
			node.parentNode.removeChild(node);
		}
	}
	function removeAllChildren(node) {
		if(node) {
			if(node.childNodes) {
				for(var x = node.childNodes.length - 1; x >= 0; x--) { //delete all of node's children
					var childNode = node.childNodes[x];
					if(childNode.hasChildNodes()) { //if the child node has children then delete them first
						removeAllChildren(childNode);
					}
					node.removeChild(childNode);  /* remove the child from the DOM tree  XXX might be leaving a memory leak... need to completely remove event listners and object variables */
					childNode=null;
				}
			}
		}
	}
	function elementDimensions(ele) {
		var display = ele.style.display;
		if(display !== 'none' && display !== null){
			return {width: ele.offsetWidth, height: ele.offsetHeight}; /* safari issue */
		}
		var els = ele.style;
		var Vis0 = els.visibility; var Pos0 = els.position; var Disp0 = els.display; /* save original */
		els.visibility = 'hidden'; els.position = 'absolute'; els.display = 'block';
		var w = ele.clientWidth; var h = ele.clientHeight; /* get dims */
		els.display = Disp0; els.position = Pos0; els.visibility = Vis0; /* restore original */
		return {width: w, height: h};
	}
	function elementPosition(ele, wrt_ele) {
		var get_offset = function(obj, offset) {
			if (!obj) return;
			offset.x += obj.offsetLeft;
			offset.y += obj.offsetTop;
			get_offset(obj.offsetParent, offset);
		}
		var get_scroll = function(obj, scroll) {
			if (!obj) return;
			scroll.x += obj.scrollLeft;
			scroll.y += obj.scrollTop;
			if (obj.tagName.toLowerCase() !== 'html') {get_scroll(obj.parentNode, scroll);}
		}
		var offset = {x:0, y:0};
		get_offset(ele, offset);
		var scroll = {x:0, y:0};
		get_scroll(ele.parentNode, scroll);
		var ret = {};
		ret.left = offset.x - scroll.x;
		ret.top = offset.y - scroll.y;
		if(is_set(wrt_ele)) {
			var wrt = NS.dom.element_position(wrt_ele);
			ret.left -= wrt.left;
			ret.top -= wrt.top;
		}
		return(ret);
	}
	function getIframeDocument(iFrame) {
		return iFrame.contentDocument ? iFrame.contentDocument : iFrame.contentWindow.document;
	}
	//--
	// Hide flash embeds, fix for this may come later.
	function hideFlash() {
		var embed = document.getElementsByTagName('embed');
		var object = document.getElementsByTagName('object');
		for(var i = 0; i < embed.length; i++){
			embed[i].temp_storage = embed[i].style.display;
			embed[i].style.visibility = 'hidden';
		}

		for(var i = 0; i < object.length; i++){
			object[i].temp_storage = object[i].style.display;
			object[i].style.visibility = 'hidden';
		}
	}
	function getImages() {
		var imgs = [];
		for(var i=0; i<document.images.length; i++){
			var dim = elementDimensions(document.images[i]);
			if((dim.width>60 || dim.height>60) && dim.width>40 && dim.height>40) {
				imgs.push({src: document.images[i].src, page_url: window.location.href});
			}
		}
		var iframes = document.getElementsByTagName("iframe");
		for(var j = 0;j < iframes.length;j++) {
			try {
				var doc = iDoc(iframes[j]);
				var dim = elementDimensions(document.images[i]);
				if((dim.width>60 || dim.height>60) && dim.width>40 && dim.height>40) {
					imgs.push({src: document.images[i].src, page_url: window.location.href});
				}
			} catch(err) {
				console.log('Error', err);
			}
		}
	}

	console.log(getImages());
	
	
})();