(function(exports){
    var VideoPlayerController = function(){
        EventsHandler.call(this, ['loadComplete', 'buttonPress', 'show', 'hide', 'updateViewTime']);
        var _this = this;
		var remoteKeys = ["MediaPlayPause", "MediaPlay", "MediaStop", "MediaPause", "MediaRewind", "MediaFastForward"];
		var fadeTime = 2;

        this.name = null;
		this.playerInfo = null;
		
		this.view = null;

		this.closePlayerCallback = null;
		
        this.init = function(args){
            this.name = "VideoPlayerController";
            this.playerInfo = args.playerInfo;
            this.closePlayerCallback = args.callbackFunc;

            var videoId = this.playerInfo.video._id;
            var thumbnailUrl = this.playerInfo.video.thumbnails[0].url || appDefaults.thumbnailUrl;
            var videoUrl = this.playerInfo.body.outputs[0].url;
			var videoType = this.playerInfo.body.outputs[0].name;
			
			
			var view = new VideoPlayerView();
			view.init({
				title: this.playerInfo.video.title,
				description: this.playerInfo.video.description,
				currentTime: 0,
				duration: this.playerInfo.video.duration,
				state: "playing"
			});
			this.view = view;

			this.prepareRemote();

			try {
				webapis.avplay.open(videoUrl);
				webapis.avplay.setListener({
					oncurrentplaytime: function(){
						_this.trigger('updateViewTime');
					},
					onstreamcompleted: function(){
						webapis.avplay.stop();
						webapis.avplay.close();
						_this.closePlayerCallback();
					}
				});

				var avplayBaseWidth = 1920;
				var ratio = avplayBaseWidth / window.document.documentElement.clientWidth;

				var displaySettings = {
					top: 0,
					left: 0,
					width: 1920 * ratio,
					height: 1080 * ratio,
					"z-index": 1000
				};

				webapis.avplay.setDisplayRect(displaySettings.top,displaySettings.left, displaySettings.width, displaySettings.height);
				$("#zype-video-player").css(displaySettings);

				webapis.avplay.prepareAsync(
					// success
					function(){ 
						try{
							_this.view.trigger('updateTime', [0]);
							_this.view.trigger('updateState', ["playing"]);
							_this.view.trigger('loadComplete');
							setTimeout(function(){_this.view.fadeOut(fadeTime);}, fadeTime * 1000)

							webapis.avplay.play(); 
						}catch(e){
							webapis.avplay.close();
							_this.closePlayerCallback();
						}
					},
					// failure
					function(){
						_this.closePlayerCallback(); 
					}
				);
			} catch(e){}
		};

		this.prepareRemote = function(){
			try {
				for (var i = 0; i < remoteKeys.length; i++) {
					tizen.tvinputdevice.registerKey(remoteKeys[i])
				}
			} catch (e) {}
		};

		this.resetRemote = function(){
			try {
				for (var i = 0; i < remoteKeys.length; i++) {
					tizen.tvinputdevice.unregisterKey(remoteKeys[i])
				}
			} catch (e) {}
		};

		// called which the video player is running
		this.updateViewCurrentTime = function(){
			try {
				var currentTime = webapis.avplay.getCurrentTime() || 0;
				
				if (this.view && currentTime){
					this.view.trigger('updateTime', [currentTime]);
				}
			} catch(e) {}
		};
		
		this.close = function(){ 
			if (this.view){
				this.view.close();
			}
		};

        this.handleButtonPress = function(buttonPress){
            switch (buttonPress) {
			  case TvKeys.LEFT:
			  case TvKeys.RW:
					try {
						this.view.fadeIn();
						webapis.avplay.jumpBackward(10000);
						_this.updateViewCurrentTime();
						this.view.trigger('updateState', ["playing"]);

						setTimeout(function(){ _this.view.fadeOut(fadeTime); }, fadeTime * 1000);
						} catch (error) {}
                    break;

			  case TvKeys.RIGHT:
			  case TvKeys.FF:
					try {
						this.view.fadeIn();
						webapis.avplay.jumpForward(10000);
						_this.updateViewCurrentTime();
						this.view.trigger('updateState', ["playing"]);

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
							this.view.trigger('updateState', ["playing"]);

							setTimeout(function(){ _this.view.fadeOut(fadeTime); }, fadeTime * 1000);

							webapis.avplay.play();
						} else {
							this.view.trigger('updateState', ["paused"]);
							webapis.avplay.pause();
						}
					} catch (error) {
						webapis.avplay.close();
						_this.closePlayerCallback();
					}
                  break;

			  case TvKeys.PLAY:
					try {
						this.view.fadeIn();
						this.updateViewCurrentTime();
						this.view.trigger('updateState', ["playing"]);


						setTimeout(function(){ _this.view.fadeOut(fadeTime); }, fadeTime * 1000);
						
						
						webapis.avplay.play();
					} catch (error) {
						webapis.avplay.close();
						_this.closePlayerCallback();
					}
                    break;
			  case TvKeys.PAUSE:
					try {
						this.view.fadeIn();
						this.updateViewCurrentTime();
						this.view.trigger('updateState', ["paused"]);
						webapis.avplay.pause();
					} catch (error) {
						webapis.avplay.close();
						_this.closePlayerCallback();
					}
					break;
			  case TvKeys.STOP:
					try {
						this.resetRemote();
						this.closePlayerCallback();
					} catch(error) {}
			  		break;
              case TvKeys.BACK:
			  case TvKeys.RETURN:
					try {
						this.resetRemote();
					} catch (error) {}
                    break;

			  default:
                    break;
            }
        };

		this.registerHandler('buttonPress', this.handleButtonPress, this);
		this.registerHandler('updateViewTime', this.updateViewCurrentTime, this);
    };


    if (!exports.VideoPlayerController) { exports.VideoPlayerController = VideoPlayerController; }
})(window);
