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

		this.player = null;
		this.playerReady = false;

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
					_this.trigger("loadComplete", resp.response);
				},
				err => { _this.trigger("playerError", err); }
			);
		};

		/**
		 * Event handlers
		 */ 
		this.handlePlayerResp = resp => {
			_this.playerInfo = resp;

			this.createView();
			this.prepareRemote();
			this.preparePlayer();
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
		this.preparePlayer = () => {
			$(".zype-player").empty();

			let zypePlayer = document.querySelector(".zype-player");
			this.player = new THEOplayer.Player(zypePlayer, {
				libraryLocation: "lib/theoplayer",
				allowNativeFullscreen: true
			});

			let source = null;

			if (this.playerInfo.body) {
				let body = this.playerInfo.body;
				source = body.outputs[0] || body.files[0];
			}

			if (source) {
				let type = (source.name == "m3u8" || source.name == "hls") ? 
						"application/x-mpegurl" : 
						"application/dash+xml";

				this.player.source = {
					sources: [{
						src: source.url,
						type: type
					}]
				};
				this.player.volume = 1;
				this.player.autoplay = false;
				this.player.controls = false;

				this.player.addEventListener("timeupdate", e => _this.trigger("updateViewTime") );
				this.player.addEventListener("ended", e=> _this.removeSelf() );
				this.player.addEventListener("error", e => console.log(e.error) );

				let playerReadyCallback = () => {
					_this.view.trigger("updateTime", 0);
					_this.view.trigger("updateState", "playing");
					_this.view.trigger("loadComplete");
					_this.view.trigger("fadeOut", fadeTime);

					_this.player.play();
					hideSpinner();
					_this.playerReady = true;
				};

				this.player.addEventListener("readystatechange", e => {
					if (e.readyState == 4) playerReadyCallback();
				});

				this.player.play();
			}
			else {
				this.removeSelf();
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
				let currentTime = this.player.currentTime || 0;

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
			try {
				this.player.destroy();
				$(".zype-player").addClass("invisible");
			} catch(e){
				console.log(e);
			}

			if (this.view){ 
				this.view.trigger("close"); 
				this.view = null;
			}

			this.resetRemote();
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

							this.playerReady = false;

							let currentTime = this.player.currentTime;
							this.player.currentTime = currentTime - 10;

							this.updateViewCurrentTime();
							this.view.trigger("updateState", "playing");
							this.view.fadeOut(fadeTime);

							this.player.play();
							this.playerReady = true;
						} catch(e){ 
							console.log(e);
						}
					}

					break;

				case TvKeys.RIGHT:
				case TvKeys.FF:
					if (this.playerReady) {
						try {
							this.view.fadeIn();

							this.playerReady = false;

							let currentTime = this.player.currentTime;
							this.player.currentTime = currentTime + 10;

							this.updateViewCurrentTime();
							this.view.trigger("updateState", "playing");
							this.view.fadeOut(fadeTime);

							this.player.play();
							this.playerReady = true;
						} catch(e){ 
							console.log(e);
						}
					}
					break;

				case TvKeys.ENTER:
				case TvKeys.PLAYPAUSE:
					try {
						let paused = this.player.paused;

						this.updateViewCurrentTime();

						if (paused) {
							this.view.trigger("updateState", "playing");

							this.view.fadeIn();
							this.view.fadeOut(fadeTime);

							this.player.play();
						} else {
							this.view.trigger("updateState", "paused");
							this.view.fadeIn();

							this.player.pause();
						}
						this.playerReady = true;

					} catch (e) {
						console.log(e);
					}
					break;

				case TvKeys.PLAY:
					try {
						this.updateViewCurrentTime();
						this.view.trigger("updateState", "playing");
						this.view.fadeIn();
						this.view.fadeOut(fadeTime);

						this.player.play();
						this.playerReady = true;

					} catch (error) {
						console.log(e);
					}
					break;

				case TvKeys.PAUSE:
					try {
						this.updateViewCurrentTime();
						this.view.trigger("updateState", "paused");
						this.view.fadeIn();
						this.player.pause();
						this.playerReady = true;
					} catch (error) {
						console.log(e);
					}
					break;

				case TvKeys.STOP:
					this.removeSelf();
					break;

				case TvKeys.BACK:
				case TvKeys.RETURN:
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
				this.player.pause();

				this.updateViewCurrentTime();
				this.view.trigger("updateState", "paused");

				console.log("Network disconnect");
			} catch(e){}
		};

		this.handleNetworkReconnect = () => {
			try {
				this.player.play();

				this.view.fadeIn();
				this.updateViewCurrentTime();
				this.view.trigger("updateState", "playing");

				this.view.fadeOut(fadeTime);

				console.log("Network reconnect");
			} catch(e){}
		};

		this.enterBackgroundState = () => {
			try {
				this.player.pause();
				console.log("Suspending");
			} catch(e){}
		};

		this.returnBackgroundState = () => {
			try {
				let callback = () => {
					if (this.player.paused) this.player.play();
					console.log("Playing video");
				};

				setTimeout(callback, 500);

				this.view.fadeIn();
				this.updateViewCurrentTime();
				this.view.trigger("updateState", "playing");

				this.view.fadeOut(fadeTime);

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
