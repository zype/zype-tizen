(function(exports){
    "use strict";

    var SignInController = function(){
		EventsHandler.call(this, ["loadComplete", "buttonPress", "show", "hide", "close"]);

		var _this = this;
		
		this.view = null;

		/**
		 * Callbacks
		 */
		this.createController = null; // create new controller
		this.removeSelf = null; // remove self

		this.init = function(options){
			showSpinner();

			var args = options.args;
			var callbacks = options.callbacks;

			this.createController = callbacks.createController;
			this.removeSelf = callbacks.removeController;

			// TODO: create this.view

			hideSpinner();
		};

		this.handleButtonPress = function(buttonPress){
			switch (buttonPress) {
				case TvKeys.ENTER:

					// TODO: logic for focusing view and keyboard

					break;
				case TvKeys.BACK:
				case TvKeys.RETURN:
					this.removeSelf();
					break;
				default:
					break;
			}
		};

		this.show = function(){
			this.view.trigger("show");
		};

		this.hide = function(){
			this.view.trigger("hide");
		};

		this.close = function(){
			this.view.close();
			this.view = null;
		};

		this.registerHandler("loadComplete", this.show, this);
		this.registerHandler("buttonPress", this.handleButtonPress, this);
		this.registerHandler("show", this.show, this);
		this.registerHandler("hide", this.hide, this);
		this.registerHandler("close", this.close, this);
	};

	if (!exports.SignInController) { exports.SignInController = SignInController; };
})(window);
