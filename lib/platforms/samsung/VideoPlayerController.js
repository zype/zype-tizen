(function(exports){
	"use strict";

	let VideoPlayerController = function(){
		EventsHandler.call(this, [
			"loadComplete",
			"playerError",
			"buttonPress",
			"show",
			"hide",
			"close",
			"updateViewTime",
			"networkDisconnect",
			"networkReconnect",
			"enterBackgroundState",
			"returnBackgroundState"
		]);
		
		let _this = this;
		let remoteKeys = ["MediaPlayPause", "MediaPlay", "MediaStop", "MediaPause", "MediaRewind", "MediaFastForward"];
		let fadeTime = 2;

		this.playerInfo = null;

		this.view = null;

		this.playerReady = false;
		this.playerClosed = false;
		this.stillInApp = true;

		this.analyticsManager = null;

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

			let videoId = args.videoId;
			let auth = args.auth;

			zypeApi.getPlayer(videoId, auth)
			.then(
				resp => {
					if (resp.response.body.outputs){ _this.trigger("loadComplete", resp.response); }
				},
				err => { _this.trigger("playerError", err); }
			);
		};

		/**
		 * Event handlers
		 */ 
		this.handlePlayerResp = resp => {
			this.playerInfo = resp;

			this.createView();
			this.prepareRemote();
			this.prepareAVPlayer();
		};

		this.handlePlayerError = err => {
			let args = {
				title: "Issue",
				message: err.message
			};

			this.createController(DialogController, args);
		};

		// create this.view
		// - ONLY call when this.playerInfo is set
		this.createView = function(){
			let video = this.playerInfo.video;

			let view = new VideoPlayerView();
			view.init({
				title: video.title,
				description: video.description,
				currentTime: 0,
				duration: video.duration || 0,
				state: "playing"
			});
			this.view = view;
		};

		/**
		 * Helpers
		 */ 
		this.prepareAVPlayer = () => {
			let source = this.playerInfo.body.outputs[0];

			let analyticsInfo = FormatHelpers.getAkamaiAnalytics(this.playerInfo, {});
			this.analyticsManager = new VideoAnalyticsManager(analyticsInfo);

			try {
				webapis.avplay.open(source.url);
				webapis.avplay.setListener({
					oncurrentplaytime: function(){ _this.trigger("updateViewTime"); },
					onstreamcompleted: function(){ 
						_this.analyticsManager.handleEnd("Play ended");
						_this.removeSelf();
					},
					onerror: function(){ _this.analyticsManager.handleError(); },
					onbufferingstart: function(){ _this.analyticsManager.handleBufferStart(); },
					onbufferingcomplete: function(){ _this.analyticsManager.handleBufferEnd(); }
				});

				let avplayBaseWidth = 1920;
				let ratio = avplayBaseWidth / window.document.documentElement.clientWidth;

				let displaySettings = { position: "absolute", top: 0, left: 0, width: 1920 * ratio, height: 1080 * ratio, "z-index": 1000};

				webapis.avplay.setDisplayRect(displaySettings.top,displaySettings.left, displaySettings.width, displaySettings.height);
				$("#zype-video-player").css(displaySettings);
				$("#zype-video-player").removeClass("invisible");

				webapis.avplay.prepareAsync(
					function(){
						if (!_this.stillInApp) {
							_this.view.trigger("updateTime", 0);
							_this.view.trigger("updateState", "paused");
							_this.view.trigger("loadComplete");
							_this.view.trigger("fadeOut", fadeTime);

							hideSpinner();
							_this.playerReady = true;
							webapis.avplay.pause();
						}
						else if (!_this.playerClosed) {
							_this.view.trigger("updateTime", 0);
							_this.view.trigger("updateState", "playing");
							_this.view.trigger("loadComplete");
							_this.view.trigger("fadeOut", fadeTime);

							hideSpinner();
							_this.playerReady = true;

							_this.analyticsManager.handleInitSession();
							_this.analyticsManager.handlePlay();

							webapis.avplay.play();
						}
						else {
							hideSpinner();
						}
					},
					function(){}
				);
			} catch(e){
				hideSpinner();
				_this.removeSelf();
			}
		};

		this.prepareRemote = () => {
			try {
				for (var i = 0; i < remoteKeys.length; i++) {
					tizen.tvinputdevice.registerKey(remoteKeys[i]);
				}
			} catch (e) {}
		};

		this.resetRemote = () => {
			try {
				for (var i = 0; i < remoteKeys.length; i++) {
					tizen.tvinputdevice.unregisterKey(remoteKeys[i]);
				}
			} catch (e) {}
		};

		// called which the video player is running
		this.updateViewCurrentTime = () => {
			try {
				let currentTime = (webapis.avplay.getCurrentTime() / 1000) || 0;

				if (this.view && currentTime){
					this.view.trigger("updateTime", [currentTime]);
				}
			} catch(e) {}
		};

		/**
		 * Update view
		 */ 
		this.show = () => {
			// if playerInfo was never received, go back
			if (!this.playerInfo) this.removeSelf();
		};

		this.hide = () => this.removeSelf();

		this.close = () => {
			this.playerClosed = true;

			if (this.view){ 
				this.view.trigger("close"); 
				this.view = null;
			}

			this.resetRemote();
			$("#zype-video-player").addClass("invisible");
			try {
				webapis.avplay.close();
			} catch(e){}
		};

		/**
		 * Button Presses
		 */ 
		this.handleButtonPress = buttonPress => {
			switch (buttonPress) {
				case TvKeys.LEFT:
				case TvKeys.RW:
					if (this.playerReady) {
						try {
							this.view.fadeIn();

							let currentTime = webapis.avplay.getCurrentTime();
							this.playerReady = false;

							let state = webapis.avplay.getState();

							let successCallback = () => {
								this.updateViewCurrentTime();
								if (state != "PAUSED") this.view.fadeOut(fadeTime);

								_this.playerReady = true;
							}

							webapis.avplay.jumpBackward(10000, successCallback);
						} catch (error) {}
					}

					break;

				case TvKeys.RIGHT:
				case TvKeys.FF:
					if (this.playerReady) {
						try {
							this.view.fadeIn();

							let currentTime = webapis.avplay.getCurrentTime();
							this.playerReady = false;

							let state = webapis.avplay.getState();

							let successCallback = () => {
								this.updateViewCurrentTime();
								if (state != "PAUSED") this.view.fadeOut(fadeTime);

								_this.playerReady = true;
							};

							webapis.avplay.jumpForward(10000, successCallback);
						} catch (error) {}
					}
					break;

				case TvKeys.ENTER:
				case TvKeys.PLAYPAUSE:
					try {
						let state = webapis.avplay.getState();

						this.updateViewCurrentTime();

						if (state == "PAUSED") {
							this.view.trigger("updateState", "playing");

							this.view.fadeIn();
							this.view.fadeOut(fadeTime);

							webapis.avplay.play();
							this.analyticsManager.handlePlay();
						} else {
							this.view.trigger("updateState", "paused");
							this.view.fadeIn();

							webapis.avplay.pause();
							this.analyticsManager.handlePause();
						}
						this.playerReady = true;
					} catch (error) {}
					break;

				case TvKeys.PLAY:
					try {
						this.updateViewCurrentTime();
						this.view.trigger("updateState", "playing");
						this.view.fadeIn();
						this.view.fadeOut(fadeTime);

						webapis.avplay.play();
						this.analyticsManager.handlePlay();
						this.playerReady = true;
					} catch (error) {}
					break;
				case TvKeys.PAUSE:
					try {
						this.updateViewCurrentTime();
						this.view.trigger("updateState", "paused");
						this.view.fadeIn();
						webapis.avplay.pause();
						this.analyticsManager.handlePause();
						this.playerReady = true;
					} catch (error) {}
					break;
				case TvKeys.STOP:
					this.analyticsManager.handleEnd("Viewer stopping watching");
					this.removeSelf();
					break;
				case TvKeys.BACK:
				case TvKeys.RETURN:
					this.analyticsManager.handleEnd("Viewer stopping watching");
					this.removeSelf();
					break;
				default:
					break;
			}
		};

		/**
		 * Handle network disconnect/reconnect
		 */
		this.handleNetworkDisconnect = () => {
			try {
				this.updateViewCurrentTime();
				this.view.trigger("updateState", "paused");
				webapis.avplay.pause();
				this.analyticsManager.handleAppExit();
			} catch(e){}
		};

		this.handleNetworkReconnect = () => {
			try {
				this.view.fadeIn();
				this.updateViewCurrentTime();
				this.view.trigger("updateState", "playing");

				this.view.fadeOut(fadeTime);

				webapis.avplay.play();
			} catch(e){}
		};

		this.enterBackgroundState = () => {
			try {
				this.stillInApp = false;
				webapis.avplay.suspend();
				this.analyticsManager.handleAppExit();
				console.log("Suspending");
			} catch(e){}
		};

		this.returnBackgroundState = () => {
			try {
				this.stillInApp = true;

				if (this.playerReady) {
					webapis.avplay.restore();
				}
				else {
					showSpinner();
					this.prepareAVPlayer();
				}
				console.log("Restoring");
			} catch(e){}
		};

		this.registerHandler("loadComplete", this.handlePlayerResp, this);
		this.registerHandler("playerError", this.handlePlayerError, this);
		this.registerHandler("buttonPress", this.handleButtonPress, this);
		this.registerHandler("updateViewTime", this.updateViewCurrentTime, this);
		this.registerHandler("show", this.show, this);
		this.registerHandler("hide", this.hide, this);
		this.registerHandler("close", this.close, this);
		this.registerHandler("networkDisconnect", this.handleNetworkDisconnect, this);
		this.registerHandler("networkReconnect", this.handleNetworkReconnect, this);
		this.registerHandler("enterBackgroundState", this.enterBackgroundState, this);
		this.registerHandler("returnBackgroundState", this.returnBackgroundState, this);
	};


	if (!exports.VideoPlayerController) { exports.VideoPlayerController = VideoPlayerController; }
})(window);
