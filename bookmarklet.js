(function() {
	'use strict';
	// Helper functions
	function is_set(o) {
		return o !== undefined ? true : false;
	}
	function not_set(o) {
		return o === undefined ? true : false;
	}
	function observe(obj, type, fn) {
	  if(obj.attachEvent) {
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
	function applyStyle(ele, style, val) {
		switch(style) {
			case 'boxShadow':
				ele.style['boxShadow'] = val;
				ele.style['WebkitBoxShadow'] = val;
				ele.style['MozBoxShadow'] = val;
			break;
			case 'opacitiy':
				ele.style['opacity'] = val;
				ele.style['filter'] = 'alpha(opacity='+Math.round(val*100)+')';
				
			default:
				ele.style[style] = val;
			break;
		}
	}
	function addElement(element_type, parent_element, style, tags) {
		var r = document.createElement(element_type);
		if(style) {
			for(var x in style) {
				applyStyle(r, x, style[x]);
			}
		}
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
	function loadScript(src, callback_fn) {
		var s1 = document.createElement('script');
		s1.type = 'text/javascript';
		s1.src = src;
		document.getElementsByTagName('head')[0].appendChild(s1);
		s1.onreadystatechange = function(){
			if (this.readyState === 'complete' || this.readyState === 'loaded') {
				callback_fn();
			}
		};
		s1.onload = callback_fn;
	}
	
	// Properties
	var properties = {
		upload_script: 'http://www.tylerbiscoe.com/testbook/ul.php',
		secret_key: 'CHANGEME', // Update secret key in ul.php, or whichever custom upload script you use to match this key.
		min_image_h: 60,
		min_image_w: 60,
		check_iframes: true 
	};
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


	// Returns an array of all images on the page
	function getAndDrawImages() {
		var imgs = [], ind;
		var draw_image = function(img_obj) {
			var image = {};
			image.container = addElement('div', images_screen, {
				padding: '10px',
				height: '200px',
				width: '200px',
				'float': 'left',
				backgroundColor: '',
				borderRight: 'thin solid rgb(230,230,230)',
				borderBottom: 'thin solid rgb(230,230,230)',
				textAlign: 'center',
				cursor: 'pointer'
			});
			image.image = addElement('img', image.container, {
				maxWidth: '200px',
				maxHeight:'200px'
			}, {src: img_obj.src});
			image.container.onmouseover = function(e) {
				image.container.style.backgroundColor = 'rgb(240,240,255)';
			};
			image.container.onmouseout = function(e) {
				image.container.style.backgroundColor = '';
			};
			image.container.onclick = function(e) {
				uploadSetupPage(img_obj);
			};
		};
		for(var i=0; i<document.images.length; i++){
			var dim = elementDimensions(document.images[i]);
			imgs.push({src: document.images[i].src, page_url: window.location.href, dim: dim});
			
		}
		if(properties.check_iframes === true) {
			var iframes = document.getElementsByTagName("iframe");
			for(var j = 0;j < iframes.length;j++) {
				try {
					var doc = iDoc(iframes[j]);
					var dim = elementDimensions(document.images[i]);
					imgs.push({src: document.images[i].src, page_url: window.location.href, dim: dim});
				} catch(err) {
					console.log('Error', err);
				}
			}
		}
		for(var n = 0;n<imgs.length;n++) {
			draw_image(imgs[n]);
		}
		for(var n = 0;n<imgs.length;n++) {
			draw_image(imgs[n]);
		}
		for(var n = 0;n<imgs.length;n++) {
			draw_image(imgs[n]);
		}
		for(var n = 0;n<imgs.length;n++) {
			draw_image(imgs[n]);
		}
		
		return imgs;
	}
	
	// Upload Screen
	function uploadSetupPage(img_obj) {
		var src = properties.upload_script+'?img_url='+img_obj.src+'&secret_key='+properties.secret_key;
		var iframe = addElement('iframe', upload_screen, {
			width: '100%', 
			height: '100%'
		}, {src: src});
		images_screen.style.display = 'none';
		upload_screen.style.display = '';
	};
	
	// Draw
	var obscure = addElement('div', document.body, {
			position: 'fixed',
			width: '100%',
			height: '100%',
			top: '0px',
			left: '0px',
			backgroundColor: 'rgba(0,0,0,0.7)'
			
		});
	var main_container = addElement('div', obscure, {
		position: 'fixed',
		width: '80%',
		height: '500px',
		left: '50%',
		top: '50%',
		margin: '-300px 0 0 -40%',
		backgroundColor: 'white',
		border: 'thin solid black',
		boxShadow: '0px 2px 4px black',
		overflowY: 'auto',
		overflowX: 'hidden'
	});
	var title_div = addElement('div', main_container, {
		fontSize: '36px',
		color: 'black',
		fontFamily: 'arial',
		fontWeight: 'bold',
		boxShadow: '3px 0px 5px rgb(120,120,120)',
		paddingLeft: '10px',
		height: '55px',
		lineHeight: '55px',
		position: 'relative',
		zIndex: '1'
	});
	title_div.innerHTML = 'Select an image';
	var images_screen = addElement('div', main_container, {
		position: 'absolute',
		top: '55px',
		bottom: '0px',
		width: '100%',
		overflow: 'auto',
		zIndex: '0'
	});
	var upload_screen = addElement('div', main_container, {
		position: 'absolute',
		top: '55px',
		bottom: '0px',
		width: '100%',
		overflow: 'auto',
		display: 'none'
	});

	function init() {
		getAndDrawImages();
	}
	init();
})();

















