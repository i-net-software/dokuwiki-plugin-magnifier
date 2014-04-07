(function ($){

	var addCSSRule = (function(style){
	    var sheet = document.head.appendChild(style).sheet;
	    return function(selector, css){
	        var propText = Object.keys(css).map(function(p){
	            return p+":"+css[p]
	        }).join(";");
	        sheet.insertRule(selector + "{" + propText + "}", sheet.cssRules.length);
	        return sheet;
	    }
	})(document.createElement("style"));
	
	/**
	 * normalizeEvent
	 *
	 * Firefox does not implement offsetX, OffsetY, so we have to detect for this an
	 * manually calculate it ourselves using the pageX, pageY less the event
	 * target's left offset and right offset
	 *
	 * If using a browser that supports offsetX, OffsetY, just return the event,
	 * don't need to do anything
	 */
	var normalizeEvent = function(event) {
	  if(!event.offsetX) {
	    event.offsetX = (event.pageX - $(event.target).offset().left);
	    event.offsetY = (event.pageY - $(event.target).offset().top);
	  }
	  return event;
	};
	
	// private
	var magnifier = function(){
	};
	
	(function(_){
		
		var rootNode = null;
		var magnifierImage = null;
		var magnifierContent = null;
		var magnifierRoot = null;
		var currentAngleSheet = null;

		_.init = function(magnifierNode) {
		
			rootNode = magnifierNode;
			magnifierImage = new Image();
			magnifierImage.src = rootNode.attr('magnifierImage');

			// register other handlers
			rootNode.mousemove(_.mousemove);
			rootNode.mouseout(_.mouseout);
			rootNode.mouseover(_.mouseover);
			return _;
		};
		
		_.mouseover = function(event)
		{
			if ( magnifierRoot == null ) {

				magnifierRoot = $('<svg></svg>').addClass('magnifierWrapper').attr('pointer-events', 'none');
				magnifierContent = $('<rect></rect>').addClass('magnifierContent').css('backgroundImage', 'url(' + rootNode.attr('magnifierImage') + ')');
				magnifierRoot.append(magnifierContent);
	
				// macht im Opera Problem ...
				$("body").append(magnifierRoot);
			}
	
			_.mousemove(event);			
		};
		
		_.mousemove = function(event)
		{
			normalizeEvent(event);
			_.setPosition(event.pageX,event.pageY, event.offsetX, event.offsetY);
		};

		_.mouseout = function(event)
		{
			normalizeEvent(event);
			var rootOffset = rootNode.offset();
			// Check Position over Element before removing!
			if ( rootOffset.left > event.offsetX || 
				 (rootOffset.left + rootNode.width()) < event.offsetX ||
				 rootOffset.top < event.offsetY || 
				 (rootOffset.top + rootOffset.height) > event.offsetY )
				 {
					if ( magnifierRoot ) {
						magnifierRoot.remove();
						magnifierRoot = null;
					}
				 }
		};
		
		_.setPosition = function(x, y, contentX, contentY)
		{
			if ( !magnifierImage || !contentX || !contentY ) {
				return;
			}
			
			// Background position
			var posX = -(contentX / rootNode.width() * magnifierImage.width - magnifierContent.width() / 2);
			var posY = -(contentY / rootNode.height() * magnifierImage.height - magnifierContent.height() / 2);
			
			// Radial position
			var position = (1 / rootNode.width() * (rootNode.width() - contentX));
			var arc = -(110 * position + 35) * Math.PI / 180;

			var left0 = 202;
			var top0 = 0;
			
			var left = left0 * Math.cos(arc) - top0 * Math.sin(arc) - 165;
			var top = left0 * Math.sin(arc) + top0 * Math.cos(arc) + 113;
			var angle = 'rotate(' + (position * -110) + 'deg)';

			if ( currentAngleSheet != null ) {
				$(currentAngleSheet).remove();
			}

			currentAngleSheet = addCSSRule("div.magnifierWrapper:after,svg.magnifierWrapper:after", {
																'-webkit-transform': angle,
																'-moz-transform': angle,
																'-o-transform': angle,
																'-ms-transform': angle
									});
							
			magnifierContent.css({
										'background-position': posX + "px " + posY + "px",
										'backgroundPositionX': posX,
										'backgroundPositionY': posY,
										'margin-left' : left,
										'margin-top': top
									});
									
			if ( !magnifierRoot || !x || !y ) {
				return;
			}
			
			magnifierRoot.offset({ left:x - 18, top: y - magnifierRoot.height() });
		};
	
	})(magnifier.prototype);
	
	// public
	$.magnify = function(magnifierNode) {
		return (new magnifier()).init(magnifierNode);
	}
	
	$(function(){
		$('img.magnifierImage').each(function(index, item){
			$.magnify($(item));
		});
	});

})(jQuery);
