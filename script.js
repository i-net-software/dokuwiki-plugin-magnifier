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
	
	var magnifier = function(magnifierNode) {
	
		var self = this;
		self.rootNode = magnifierNode;
		self.magnifierImage = new Image();
		self.magnifierContent = null;
		self.magnifierImage.src = self.rootNode.attr('magnifierImage');
		self.magnifierRoot = null;
		self.currentAngleSheet = null;
		
		self.init = function(){
			self.rootNode.bind('mouseenter', self.mouseover);
		}
		
		self.mouseover = function(event)
		{
			if ( self.magnifierRoot == null ) {

				self.magnifierRoot = $('<svg></svg>').addClass('magnifierWrapper').attr('pointer-events', 'none');
				self.magnifierContent = $('<rect></rect>').addClass('magnifierContent').css('backgroundImage', 'url(' + self.rootNode.attr('magnifierImage') + ')');
				self.magnifierRoot.append(self.magnifierContent);
	
				// register other handlers
				self.rootNode.bind('mousemove', self.mousemove);
				self.rootNode.bind('mouseout', self.mouseout);
				
				// macht im Opera Problem ...
				$("body").append(self.magnifierRoot);
			}
	
			self.mousemove(event);			
		};
		
		self.mousemove = function(event)
		{
			self.setPosition(event.pageX,event.pageY, event.offsetX, event.offsetY);
		};

		self.mouseout = function(event)
		{
			var rootOffset = self.rootNode.offset();
			// Check Position over Element before removing!
			if ( rootOffset.left > event.offsetX || 
				 (rootOffset.left + self.rootNode.width()) < event.offsetX ||
				 rootOffset.top < event.offsetY || 
				 (rootOffset.top + rootOffset.height) > event.offsetY )
				 {
					// Clean up
					self.rootNode.unbind('mousemove', self.mousemove);
					self.rootNode.unbind('mouseout', self.mouseout);
					
					if ( self.magnifierRoot ) {
						self.magnifierRoot.remove();
						self.magnifierRoot = null;
					}
				 }

		};
		
		self.setPosition = function(x, y, contentX, contentY)
		{
			if ( !self.magnifierImage || !contentX || !contentY ) {
				return;
			}
			
			// Background position
			var posX = -(contentX / self.rootNode.width() * self.magnifierImage.width - self.magnifierContent.width() / 2);
			var posY = -(contentY / self.rootNode.height() * self.magnifierImage.height - self.magnifierContent.height() / 2);
			
			// Radial position
			var position = (1 / self.rootNode.width() * (self.rootNode.width() - contentX));
			var arc = -(110 * position + 35) * Math.PI / 180;

			var left0 = 202;
			var top0 = 0;
			
			var left = left0 * Math.cos(arc) - top0 * Math.sin(arc) - 165;
			var top = left0 * Math.sin(arc) + top0 * Math.cos(arc) + 113;
			var angle = 'rotate(' + (position * -110) + 'deg)';

			if ( self.currentAngleSheet != null ) {
				$(self.currentAngleSheet).remove();
			}

			self.currentAngleSheet = addCSSRule("div.magnifierWrapper:after,svg.magnifierWrapper:after", {
																'-webkit-transform': angle,
																'-moz-transform': angle,
																'-o-transform': angle,
																'-ms-transform': angle
									});
							
			self.magnifierContent.css({
										'backgroundPositionX': posX,
										'backgroundPositionY': posY,
										'margin-left' : left,
										'margin-top': top
									});
									
			if ( !self.magnifierRoot || !x || !y ) {
				return;
			}
			
			self.magnifierRoot.offset({ left:x - 18, top: y - self.magnifierRoot.height() });
		};
	};

	$(function(){
		$('img.magnifierImage').each(function(index, item){
			(new magnifier($(item))).init();
		});
	});

})(jQuery);