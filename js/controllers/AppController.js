(function(exports){
	"use strict";

	let AppController = function(){
		EventsHandler.call(this, [
			"settingsLoaded",
			"forceExitApp",
			"exitApp",
			"buttonPress",
			"networkDisconnect",
			"networkReconnect"
		]);

		let _this = this;

		exports.zypeApi = ZypeJSBase({
			appKey: appDefaults.appKey,
			clientId: appDefaults.clientId,
			clientSecret: appDefaults.clientSecret
		});

		exports.appState = {};

		this.controllers = [];

		/**
		 * Initilize by fetching app settings
		 */
		this.init = args => {
			showSpinner();

			zypeApi.getApp().then(
				resp  => { _this.trigger("settingsLoaded", resp.response); },
				err   => {  _this.trigger("forceExitApp", "App misconfigured. Exitting..."); }
			);
		};

		/**
		 * Helpers
		 */
		this.currentController = () => {
			return (this.controllers.length > 0) ? this.controllers[this.controllers.length - 1] : null;
		};

		this.createControllerCallback = (controller, args) => {
			_this.createNewController(controller, args);
		};

		this.removeControllerCallback = () => {
			_this.removeCurrentController();
		};

		this.handleAppLoad = settings => {
			// accessible from all controllers
			exports.zypeAppSettings = settings;

			let playlistId = zypeAppSettings.featured_playlist_id || appDefaults.rootPlaylistId;
			let controllerArgs = {
				playlistLevel: 0,
				playlistId: playlistId
			};

			let accessToken = localStorage.getItem("accessToken");
			let refreshToken = localStorage.getItem("refreshToken");
			if (accessToken && refreshToken) {
				zypeApi.refreshAccessToken(refreshToken)
				.then(
					resp => { _this.handleRefreshToken(resp); },
					err => { _this.handleRefreshTokenErr(); }
				);
			}	else {
				// create first controller
				this.createNewController(MediaGridController, controllerArgs);
			}
		};

		/**
		 * handleRefreshTokenResp() stores new access and refresh tokens then loads first controller
		 * @param {Object} tokenResp - resp object returned from refresh token call
		 */
		this.handleRefreshTokenResp = tokenResp => {
			localStorage.setItem("accessToken", tokenResp.access_token);
			localStorage.setItem("refreshToken", tokenResp.refresh_token);

			this.createNewController(MediaGridController, controllerArgs);
		};

		/**
		 * handleRefreshTokenErr() tries to create new token then load first controller
		 * if fail to create, clear out account related data
		 */
		this.handleRefreshTokenErr = () => {
			let email = localStorage.getItem("email");
			let password = localStorage.getItem("password");

			zypeApi.createLoginAccessToken(email, password)
			.then(
				resp => {
					localStorage.setItem("accessToken", resp.access_token);
					localStorage.setItem("refreshToken", resp.refreshToken);

					_this.createNewController(MediaGridController, controllerArgs);
				},
				err => {
					localStorage.removeItem("accessToken");
					localStorage.removeItem("refreshToken");
					localStorage.removeItem("email");
					localStorage.removeItem("password");

					_this.createNewController(MediaGridController, controllerArgs);
				}
			);
		};

		/**
		 * Create / Remove controllers
		 */
		this.createNewController = (controller, args) => {
			if (this.controllers.length > 0){
				let currentController = this.currentController();
				currentController.trigger("hide");
			}

			let newController = new controller();

			args.controllerIndex = this.controllers.length;

			this.controllers.push(newController);

			newController.init({
				args: args,
				callbacks: {
					createController: this.createControllerCallback,
					removeController: this.removeControllerCallback
				}
			});
		};

		this.removeCurrentController = () => {
			if (this.controllers.length > 0){
				let oldController = this.controllers.pop();
				oldController.trigger("close");

				if (this.controllers.length == 0){
					this.exitApp();
				} else {
					hideSpinner();
					let currentController = this.currentController();
					currentController.trigger("show");
				}
			}
		};

		/**
		 * Show / Hide current controller
		 */
		this.showCurrentController = () => {
			let currentController = this.currentController();
			currentController.trigger("show");
		};

		this.hideCurrentController = () => {
			let currentController = this.currentController();
			currentController.trigger("hide");
		};


		/**
		 * Button Presses
		 */
		this.handleButtonPress = keyCode => {
			let currentController = this.currentController();
			currentController.trigger("buttonPress", keyCode);
		};

		/**
		 * Exiting
		 */
		this.exitApp = () => {
			NativePlatform.exit();
		};

		this.forceAppExit = message => {
			alert(message);
			_this.exitApp();
		};

		this.confirmAppExit = () => {
			let leaveApp = confirm("Do you want to leave the app?");

			if (leaveApp){ _this.exitApp(); }
		};

		/**
		 * Handle network disconnect/reconnect
		 */
		this.handleNetworkDisconnect = () => {
			let currentController = this.currentController();
			currentController.trigger("networkDisconnect");
		};

		this.handleNetworkReconnect = () => {
			let currentController = this.currentController();
			currentController.trigger("networkReconnect");
		};

		this.handleVisibilityChange = () => {
			let currentController = this.currentController();

			if (document.hidden) {
				currentController.trigger("enterBackgroundState");
			} else {
				currentController.trigger("returnBackgroundState");
			}
		};

		/**
		 * Register event handlers
		 */
		this.registerHandler("settingsLoaded", this.handleAppLoad, this);
		this.registerHandler("forceExitApp", this.forceAppExit, this);
		this.registerHandler("exitApp", this.confirmAppExit, this);
		this.registerHandler("buttonPress", this.handleButtonPress, this);
		this.registerHandler("networkDisconnect", this.handleNetworkDisconnect, this);
		this.registerHandler("networkReconnect", this.handleNetworkReconnect, this);

		$(document).keydown(e => {
			let networkConnected = NativePlatform.isNetworkConnected();
			if (networkConnected) { _this.trigger("buttonPress", e.keyCode); }
		});

		/**
		 * Handle network disconnects / reconnects
		 */ 
		let disconnectedCallback = () => {
			let currentController = _this.controllers[ _this.controllers.length - 1 ];
			showSpinner();
			showNetworkText();
			currentController.trigger("networkDisconnect");
		};

		let reconnectedCallback = () => {
			let currentController = _this.controllers[ _this.controllers.length - 1 ];
			hideSpinner();
			hideNetworkText();
			currentController.trigger("networkReconnect");
		};

		// Pass in callbacks to handle network changes
		NativePlatform.attachNetworkChangeCallbacks(disconnectedCallback, reconnectedCallback);
		if (NativePlatform.isNetworkConnected() == false) this.forceAppExit("No network connection. Closing app.");

		// In case user deep links within app
		NativePlatform.setReLinkCallback(this.createControllerCallback);
		window.addEventListener('appcontrol', NativePlatform.handleReLink);

		document.addEventListener('visibilitychange', this.handleVisibilityChange);
	};

	exports.AppController = AppController;
})(window);
