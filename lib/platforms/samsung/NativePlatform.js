(function(exports){
	"use strict";

	var NativePlatform = function(){
		this.exit = function(){
			try {
				tizen.application.getCurrentApplication().exit();
			} catch(e){

			}
		};
	};

	exports.NativePlatform = new NativePlatform();
})(window);