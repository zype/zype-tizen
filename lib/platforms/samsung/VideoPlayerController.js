(function(exports){
    var VideoPlayerController = function(){
		EventsHandler.call(this, ["loadComplete", "playerError", "buttonPress", "show", "hide", "close", "updateViewTime"]);
		
        var _this = this;
		var remoteKeys = ["MediaPlayPause", "MediaPlay", "MediaStop", "MediaPause", "MediaRewind", "MediaFastForward"];
		var fadeTime = 2;

		this.playerInfo = null;

		this.view = null;

		/**
		 * Callbacks
		 */
		this.createController = null; // create new controller
		this.removeSelf = null; // remove self

		/**
		 * Initialization
		 */ 
        this.init = function(options){
			var args = options.args;
			var callbacks = options.callbacks;

			this.createController = callbacks.createController;
            this.removeSelf = callbacks.removeController;

			var videoId = args.videoId;
			var auth = args.auth;

			zypeApi.getPlayer(videoId, auth)
			.then(function(resp){
				if(resp && !resp.response.body.outputs !== "undefined"){
					_this.trigger("loadComplete", resp.response)
				} else {
					_this.trigger("playerError");
				}
			});
		};

		/**
		 * Event handlers
		 */ 
		this.handlePlayerResp = function(resp){
			this.playerInfo = resp;

			this.createView();
			this.prepareRemote();
			this.prepareAVPlayer();

			hideSpinner();
		};

		this.handlePlayerError = function(){
			var args = {
				title: "Issue",
				message: "Video playback error"
			};

			this.createController(DialogController, args);
		};

		// create this.view
		// - ONLY call when this.playerInfo is set
		this.createView = function(){
			var video = this.playerInfo.video;

			var view = new VideoPlayerView();
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
		this.prepareAVPlayer = function(){
			var source = this.playerInfo.body.outputs[0];

			try {
				webapis.avplay.open(source.url);
				webapis.avplay.setListener({
					oncurrentplaytime: function(){ _this.trigger("updateViewTime"); },
					onstreamcompleted: function(){ _this.removeSelf(); }
				});

				var avplayBaseWidth = 1920;
				var ratio = avplayBaseWidth / window.document.documentElement.clientWidth;

				var displaySettings = { position: "absolute", top: 0, left: 0, width: 1920 * ratio, height: 1080 * ratio, "z-index": 1000};

				webapis.avplay.setDisplayRect(displaySettings.top,displaySettings.left, displaySettings.width, displaySettings.height);
				$("#zype-video-player").css(displaySettings);
				$("#zype-video-player").removeClass("invisible");

				webapis.avplay.prepareAsync(
					function(){
						_this.view.trigger("updateTime", [0]);
						_this.view.trigger("updateState", ["playing"]);
						_this.view.trigger("loadComplete");
						setTimeout(function(){ _this.view.trigger("fadeOut", fadeTime); }, fadeTime * 1000);

						webapis.avplay.play();
					},
					function(){}
				);
			} catch(e){
				_this.removeSelf();
			}
		};

		this.prepareRemote = function(){
			try {
				for (var i = 0; i < remoteKeys.length; i++) {
					tizen.tvinputdevice.registerKey(remoteKeys[i]);
				}
			} catch (e) {}
		};

		this.resetRemote = function(){
			try {
				for (var i = 0; i < remoteKeys.length; i++) {
					tizen.tvinputdevice.unregisterKey(remoteKeys[i]);
				}
			} catch (e) {}
		};

		// called which the video player is running
		this.updateViewCurrentTime = function(){
			try {
				var currentTime = (webapis.avplay.getCurrentTime() / 1000) || 0;

				if (this.view && currentTime){
					this.view.trigger("updateTime", [currentTime]);
				}
			} catch(e) {}
		};

		/**
		 * Update view
		 */ 
		this.close = function(){
			if (this.view){ 
				this.view.trigger("close"); 
				this.view = null;
			}

			this.resetRemote();
			$("#zype-video-player").addClass("invisible");
			webapis.avplay.close();
		};

		/**
		 * Button Presses
		 */ 
        this.handleButtonPress = function(buttonPress){
            switch (buttonPress) {
			  case TvKeys.LEFT:
			  case TvKeys.RW:
					try {
						this.view.fadeIn();
						webapis.avplay.jumpBackward(10000);
						this.updateViewCurrentTime();
						this.view.trigger("updateState", ["playing"]);
						webapis.avplay.play();

						setTimeout(function(){ _this.view.fadeOut(fadeTime); }, fadeTime * 1000);
						} catch (error) {}
                    break;

			  case TvKeys.RIGHT:
			  case TvKeys.FF:
					try {
						this.view.fadeIn();
						webapis.avplay.jumpForward(10000);
						this.updateViewCurrentTime();
						this.view.trigger("updateState", ["playing"]);
						webapis.avplay.play();

						setTimeout(function(){ _this.view.fadeOut(fadeTime); }, fadeTime * 1000);
					} catch (error) {}
                    break;

              case TvKeys.ENTER:
			  case TvKeys.PLAYPAUSE:
					try {
						this.view.fadeIn();
						var state = webapis.avplay.getState();

						this.updateViewCurrentTime();

						if (state == "PAUSED") {
							this.view.trigger("updateState", ["playing"]);

							setTimeout(function(){ _this.view.fadeOut(fadeTime); }, fadeTime * 1000);

							webapis.avplay.play();
						} else {
							this.view.trigger("updateState", ["paused"]);
							webapis.avplay.pause();
						}
					} catch (error) {}
                  break;

			  case TvKeys.PLAY:
					try {
						this.view.fadeIn();
						this.updateViewCurrentTime();
						this.view.trigger("updateState", ["playing"]);


						setTimeout(function(){ _this.view.fadeOut(fadeTime); }, fadeTime * 1000);


						webapis.avplay.play();
					} catch (error) {}
                    break;
			  case TvKeys.PAUSE:
					try {
						this.view.fadeIn();
						this.updateViewCurrentTime();
						this.view.trigger("updateState", ["paused"]);
						webapis.avplay.pause();
					} catch (error) {}
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

		this.registerHandler("loadComplete", this.handlePlayerResp, this);
		this.registerHandler("playerError", this.handlePlayerError, this);
		this.registerHandler("buttonPress", this.handleButtonPress, this);
		this.registerHandler("updateViewTime", this.updateViewCurrentTime, this);
		this.registerHandler("close", this.close, this);
    };


    if (!exports.VideoPlayerController) { exports.VideoPlayerController = VideoPlayerController; }
})(window);
