(function(exports){
    "use strict";

    var SignInController = function(){
		EventsHandler.call(this, ["loadComplete", "buttonPress", "show", "hide", "close"]);

		var _this = this;
		
		/**
		 * Set as 0, 1, or 2
		 * 		0: Email input
		 * 		1: Password input
		 * 		2: Confirmation button
		 */
		this.currentIndex = null;

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

			var viewArgs = {
				title: "Sign in to your Account",
				confirmationText: "Sign In",
				id: "#sign-in-view"
			};

			var view = new CredentialsInputView();
			view.init(viewArgs);
			this.view = view;

			this.currentIndex = 0;

			hideSpinner();
		};

		this.handleButtonPress = function(buttonPress){
			switch (buttonPress) {
				case TvKeys.DOWN:
					// if user not updating input, handle down
					if (!this.view.isInputFocused){ this.handleDown(); }
					break;
				case TvKeys.UP:
					// if user not updating input, handle up
					if (!this.view.isInputFocused){ this.handleUp(); }
					break;
				case TvKeys.ENTER:
					// if not inputting
					if (!this.view.isInputFocused){ this.handleEnter(); }
					break;
				case TvKeys.BACK:
				case TvKeys.RETURN:
					this.removeSelf();
					break;
				default:
					break;
			}
		};

		this.handleDown = function(){
			switch(this.currentIndex) {
				case 0:
					this.view.trigger("highlightInput", "password");
					break;
				case 1:
					this.view.trigger("focusConfirm");
				default:
					break;
			}
		};

		this.handleUp = function(){
			switch(this.currentIndex) {
				case 1:
					this.view.trigger("highlightInput", "email");
					break;
				case 2:
					this.view.trigger("highlightInput", "password");
				default:
					break;
			}
		};

		this.handleEnter = function(){
			switch (this.currentIndex) {
				case 0:
					this.view.trigger("focusInput", "email");
					break;
				case 1:
					this.view.trigger("focusInput", "password");
					break;
				case 2:
					// TODO: logic for authenticating user
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
