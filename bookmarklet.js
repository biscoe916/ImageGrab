var pResponse = (function() {
	'use strict';
	// Properties
	var properties = {
		upload_script: 'http://www.yoursite.com/imagegrabber/ul.php',
		upload_directory: 'http://www.yoursite.com/imagegrabber/', // Use full path as in this example
		secret_key: 'CHANGEME', // Update secret key in ul.php, or whichever custom upload script you use to match this key.
		min_image_h: 120,
		min_image_w: 120,
		check_iframes: true,
		ask_for_confirmation: true
	}, resp_fns = {};
	// Helper functions
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
	function getIframeDocument(iFrame) {
		return iFrame.contentDocument ? iFrame.contentDocument : iFrame.contentWindow.document;
	}
	function gen_uuid (length) {
		var random = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
		return typeof length !== 'undefined' ? random.substring(0, length > 36 ? 36 : length) : random;
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
	function jsonP(script, args, callback_fn) {
		var full_url = script +'?', rand = gen_uuid(), ret, xmlhttp;
		for(var ind in args) {
			full_url +=ind + '=' + args[ind] +'&';
		}
		full_url += 'resp_str=' + rand;
		resp_fns[rand] = callback_fn;
		loadScript(full_url, function() {
			console.log('Do nothing');
		});
	}
	function pResponse(data) {
		if(typeof resp_fns[data.resp_str] !== 'undefined') {
			resp_fns[data.resp_str](data);
		} else {
			console.log('Error: Callback function not defined');
		}
	}
	// Hide flash embeds, fix for this may come later.
	function hideFlash() {
		var embed = document.getElementsByTagName('embed');
		var object = document.getElementsByTagName('object');
		for(var i = 0; i < embed.length; i++){
			embed[i].temp_storage = embed[i].style.visibility;
			embed[i].style.visibility = 'hidden';
		}

		for(var i = 0; i < object.length; i++){
			object[i].temp_storage = object[i].style.visibility;
			object[i].style.visibility = 'hidden';
		}
	}
	function showFlash() {
		var embed = document.getElementsByTagName('embed');
		var object = document.getElementsByTagName('object');
		for(var i = 0; i < embed.length; i++){
			embed[i].style.visibility = object[i].temp_storage
		}

		for(var i = 0; i < object.length; i++){
			object[i].style.visibility = object[i].temp_storage
		}
	}
	// Returns an array of all images on the page
	function getAndDrawImages() {
		var imgs = [], drawn_images = [], ind;
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
				cursor: 'pointer',
				position: 'relative',
				overflow: 'hidden'
			});
			image.image = addElement('img', image.container, {
				maxWidth: '200px',
				maxHeight:'200px',
				boxShadow: '0px 0px 2px black'
			}, {src: img_obj.src});
			image.confirm_div = addElement('div', image.container, {
				width: '100%',
				position: 'absolute',
				bottom: '0px',
				left: '0px',
				backgroundColor: 'white',
				paddingTop: '5px',
				paddingBottom: '5px',
				borderTop: 'thin solid rgb(200,200,200)',
				boxShadow: '0px 0px 6px black',
				display: 'none',
				fontFamily: 'arial',
				color: 'black',
				fontSize: '12px',
				textAlign: 'center'
			});
			image.confirm_div.innerHTML = 'Are you sure? ';
			image.yes_span = addElement('span', image.confirm_div, {
				fontFamily: 'arial',
				color: 'green',
				fontSize: '12px',
				fontWeight: 'bold',
				marginLeft: '5px'
			});
			image.yes_span.innerHTML = 'Yes';
			image.yes_span.onmouseover = function(e) {
				image.yes_span.style.textDecoration = 'underline';
			};
			image.yes_span.onmouseout = function(e) {
				image.yes_span.style.textDecoration = 'none';
			};
			image.yes_span.onclick = function(e) {
				image.upload(img_obj);
			};
			image.no_span = addElement('span', image.confirm_div, {
				fontFamily: 'arial',
				color: 'red',
				fontSize: '12px',
				fontWeight: 'bold',
				marginLeft: '5px'
			});
			image.no_span.innerHTML = 'Cancel';
			image.no_span.onmouseover = function(e) {
				image.no_span.style.textDecoration = 'underline';
			};
			image.no_span.onmouseout = function(e) {
				image.no_span.style.textDecoration = 'none';
			};
			image.no_span.onclick = function(e) {
				if (!e) var e = window.event;
				e.cancelBubble = true;
				if (e.stopPropagation) e.stopPropagation();
				image.confirm_div.style.display = 'none';
			};
			image.upload = function(img) {
				jsonP(properties.upload_script, {
					img_url: img.src,
					secret_key: encodeURIComponent(properties.secret_key),
					directory: encodeURIComponent(properties.upload_directory)
				}, function(data) {
					if(data.status === 'success') {
						image.confirm_div.style.display = 'none';
						image.success_div = addElement('div', image.container, {
							width: '100%',
							position: 'absolute',
							bottom: '0px',
							left: '0px',
							backgroundColor: 'white',
							paddingTop: '5px',
							paddingBottom: '5px',
							borderTop: 'thin solid rgb(200,200,200)',
							boxShadow: '0px 0px 6px black',
							fontFamily: 'arial',
							color: 'black',
							fontSize: '12px',
							textAlign: 'left'
						});
						image.success__label_div = addElement('div', image.success_div, {
							fontFamily: 'arial',
							color: 'green',
							fontSize: '12px',
							fontWeight: 'bold',
							marginLeft: '5px'
						});
						image.success__label_div.innerHTML = 'Success!';
						image.url_label_div = addElement('div', image.success_div, {
							fontFamily: 'arial',
							color: 'black',
							fontSize: '12px',
							fontWeight: 'bold',
							marginLeft: '5px'
						});
						image.url_label_div.innerHTML = 'Image URL: ';
						image.url_text_area = addElement('textarea', image.success_div, {
							fontFamily: 'arial',
							color: 'black',
							fontSize: '11px',
							width: '100%',
							height: '35px',
							border: 'none',
							outline: 'none',
							resize: 'none',
							overflow: 'hidden',
							marginLeft: '5px'
						});
						image.url_text_area.innerHTML = data.url;
						image.url_text_area.select();
						image.url_text_area.onclick = function() {
						image.url_text_area.select();
					};
					} else if(data.status === 'failed') {
						image.confirm_div.style.color = 'red';
						image.confirm_div.innerHTML = data.fail_reason;
					} else {
						image.confirm_div.style.color = 'red';
						image.confirm_div.innerHTML = 'Failed';
					}
				});
				image.confirm_div.innerHTML = 'Saving...';
			};
			image.container.onmouseover = function(e) {
				image.container.style.backgroundColor = 'rgb(230,230,230)';
			};
			image.container.onmouseout = function(e) {
				image.container.style.backgroundColor = '';
			};
			image.container.onclick = function(e) {
				if(properties.ask_for_confirmation === true) {
					image.confirm_div.style.display = '';
					for(var i = 0;i < drawn_images.length;i++) {
						drawn_images[i].confirm_div.style.display = 'none';
					};
					image.confirm_div.style.display = '';
				} else {
					image.upload(img_obj);
				}
			};
			return image;
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
			if(imgs[n].dim.height >= properties.min_image_h && imgs[n].dim.width >= properties.min_image_w) {
				drawn_images.push(draw_image(imgs[n]));
			}
		}
		return imgs;
	}
	// Draw
	var obscure = addElement('div', document.body, {
		position: 'fixed',
		width: '100%',
		height: '100%',
		top: '0px',
		left: '0px',
		backgroundColor: 'rgba(0,0,0,0.7)',
		zIndex: '9999'
		
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
	title_div.innerHTML = 'ImageGrab: ';
	var sub_title_span = addElement('span', title_div, {
		fontWeight: 'normal'
	});
	sub_title_span.innerHTML = ' Select images below';
	var close_button = addElement('div', title_div, {
		position: 'absolute',
		right: '0px',
		top: '0px',
		lineHeight: '55px',
		height: '55px',
		fontFamily: 'arial',
		color: 'black',
		fontSize: '14px',
		borderLeft: 'thin solid darkgrey',
		cursor: 'pointer',
		paddingLeft: '10px',
		paddingRight: '10px',
		fontWeight: 'normal'
	});
	close_button.innerHTML = 'Finished';
	close_button.onclick = function() {
		removeElement(obscure);
		showFlash();
	};
	var images_screen = addElement('div', main_container, {
		position: 'absolute',
		top: '55px',
		bottom: '0px',
		width: '100%',
		overflow: 'auto',
		backgroundColor: 'white',
		zIndex: '0'
	});
	getAndDrawImages();
	hideFlash();
	return pResponse;
})();
