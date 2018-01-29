(function(exports){
    "use strict";

    var SignInController = function(){
		EventsHandler.call(this, [
			"loadComplete",
			"buttonPress",
			"show",
			"hide",
			"close",
			"signIn",
			"networkDisconnect",
			"networkReconnect"
		]);

		let _this = this;
		
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

		/**
		 * Initialization
		 */
		this.init = options => {
			showSpinner();

			let args = options.args;
			let callbacks = options.callbacks;

			this.createController = callbacks.createController;
			this.removeSelf = callbacks.removeController;

			let viewArgs = {
				title: "Sign in to your Account",
				confirmButton: "Sign In",
				id: "sign-in-view"
			};

			let view = new CredentialsInputView();
			view.init(viewArgs);
			this.view = view;

			this.currentIndex = 0;

			hideSpinner();
		};

		/**
		 * Handle user input 
		 */
		this.handleButtonPress = buttonPress => {
			switch (buttonPress) {
				case TvKeys.DOWN:
					// if user not updating input, handle down
					if (this.view.isInputFocused() == false){ this.handleDown(); }
					break;
				case TvKeys.UP:
					// if user not updating input, handle up
					if (this.view.isInputFocused() == false){ this.handleUp(); }
					break;
				case TvKeys.ENTER:
					// if not inputting
					this.handleEnter();
					break;
				// case TvKeys.BACK:
				case TvKeys.RETURN:
					if (this.view.isInputFocused()) {
						this.view.trigger("blurInputs");
					} else {
						this.removeSelf();
					}
					break;

				// Keyboard
				case TvKeys.DONE:
				case TvKeys.CANCEL:
					this.view.trigger("blurInputs");
					break;
				default:
					break;
			}
		};

		this.handleDown = () => {
			switch(this.currentIndex) {
				case 0:
					this.currentIndex += 1;
					this.view.trigger("highlightInput", "password");
					break;
				case 1:
					this.currentIndex += 1;
					this.view.trigger("removeHighlights");
					this.view.trigger("focusConfirm");
				default:
					break;
			}
		};

		this.handleUp = () => {
			switch(this.currentIndex) {
				case 1:
					this.currentIndex -= 1;
					this.view.trigger("highlightInput", "email");
					break;
				case 2:
					this.currentIndex -= 1;
					this.view.trigger("unfocusConfirm");
					this.view.trigger("highlightInput", "password");
				default:
					break;
			}
		};

		this.handleEnter = () =>{
			switch (this.currentIndex) {
				case 0:
					this.view.trigger("focusInput", "email");
					break;
				case 1:
					this.view.trigger("focusInput", "password");
					break;
				case 2:
					var credentials = this.view.getCurrentValues();
					this.trigger("signIn", credentials);
					break;
				default:
					break;
			}
		};

		/**
		 * Handle Sign In
		 */
		this.signIn = credentials => {
			let email = credentials.email, password = credentials.password;
			if (email.length == 0){
				alert("Email is empty");
			} else if (password.length == 0){
				alert("Password is empty");
			} else {
				zypeApi.createLoginAccessToken(credentials.email, credentials.password)
				.then(
					resp => { _this.saveUser(resp, credentials) },
					err => { alert("Cannot find user") }
				);
			}
		};
		this.saveUser = (tokenResp, credentials) => {
			alert("You got this back: " + JSON.stringify(tokenResp) + "\n\nusing these credentials: " + JSON.stringify(credentials) );
			// TODO: save access token and credentials
		};

		/**
		 * show / hide / close self
		 */
		this.show = () => this.view.trigger("show");
		this.hide = () => this.view.trigger("hide");
		this.close = () => {
			this.view.close();
			this.view = null;
		};

		/**
		 * Handle network disconnect/reconnect
		 */
		this.handleNetworkDisconnect = () => {};
		this.handleNetworkReconnect = () => {};

		this.registerHandler("loadComplete", this.show, this);
		this.registerHandler("buttonPress", this.handleButtonPress, this);
		this.registerHandler("show", this.show, this);
		this.registerHandler("hide", this.hide, this);
		this.registerHandler("close", this.close, this);
		this.registerHandler("signIn", this.signIn, this);
		this.registerHandler("networkDisconnect", this.handleNetworkDisconnect, this);
		this.registerHandler("networkReconnect", this.handleNetworkReconnect, this);
	};

	if (!exports.SignInController) { exports.SignInController = SignInController; };
})(window);
