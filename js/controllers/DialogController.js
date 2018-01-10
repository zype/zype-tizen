(function(exports){
    "use strict";

    var DialogController = function(){
		EventsHandler.call(this, ["loadComplete", "buttonPress", "show", "hide", "close"]);

		var _this = this;
		
		this.view = null;

		/**
		 * Callbacks
		 */
		this.createController = null; // create new controller
		this.removeSelf = null; // remove self

		this.init = function(options){
			var args = options.args;
			var callbacks = options.callbacks;

			this.createController = callbacks.createController;
			this.removeSelf = callbacks.removeController;

			var viewArgs = {
				title: args.title,
				message: args.message
			};

			var view = new DialogView();
			view.init(viewArgs);
			this.view = view;
			this.trigger("loadComplete");

			hideSpinner();
		};

		this.handleButtonPress = function(buttonPress){
			switch (buttonPress) {
				case TvKeys.LEFT:
				case TvKeys.RIGHT:
				case TvKeys.UP:
				case TvKeys.DOWN:
					break;
			
				case TvKeys.ENTER:
					this.removeSelf();
					break;
				case TvKeys.RETURN:
				case TvKeys.BACK:
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

	if (!exports.DialogController) { exports.DialogController = DialogController };
})(window);
