(function(exports){
    var VideoPlayerController = function(){
        EventsHandler.call(this, ['loadComplete', 'buttonPress', 'show', 'hide']);
        var _this = this;
		var remoteKeys = ["MediaPlayPause", "MediaPlay", "MediaStop", "MediaPause", "MediaRewind", "MediaFastForward"];

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
						_this.updateViewCurrentTime();
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
			} catch(e){ 
				_this.view.close();
				webapis.avplay.close();
				this.closePlayerCallback();
			}
		};

		this.prepareRemote = function(){
			try {
				tizen.tvinputdevice.registerKeyBatch(remoteKeys);
			} catch (error) {}
		};

		// called which the video player is running
		this.updateViewCurrentTime = function(){
			try {
				var currentTimeInSecs = webapis.avplay.getCurrentTime() / 1000;
				if (this.view && currentTimeInSecs){
					this.view.trigger('updateTime', [currentTimeInSecs]);
				}
			} catch(e) {}
		};
		
		this.close = function(){ 
			if (this.view){
				this.view.close();
				this.view = null;
			}
			webapis.avplay.close(); 
		};

        this.handleButtonPress = function(buttonPress){
            switch (buttonPress) {
			  case TvKeys.LEFT:
			  case TvKeys.RW:
					try {
						webapis.avplay.pause();
						webapis.avplay.seekTo(webapis.avplay.getCurrentTime() - 10000);
						this.updateViewCurrentTime();
						_this.view.trigger('updateState', ["playing"]);
						webapis.avplay.play();						
					} catch (error) {
						webapis.avplay.play();
					}
                    break;

			  case TvKeys.RIGHT:
			  case TvKeys.FF:
					try {
						webapis.avplay.pause();
						webapis.avplay.seekTo(webapis.avplay.getCurrentTime() + 10000);
						this.updateViewCurrentTime();
						this.view.trigger('updateState', ["playing"]);
						webapis.avplay.play();
					} catch (error) {
						webapis.avplay.play();
					}					
                    break;

              case TvKeys.ENTER:
			  case TvKeys.PLAYPAUSE:
					try {
						var state = webapis.avplay.getState();

						this.updateViewCurrentTime();

						if (state == "PAUSED") {
							this.view.trigger('updateState', ["playing"]);
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
						this.updateViewCurrentTime();
						this.view.trigger('updateState', ["playing"]);
						webapis.avplay.play();
					} catch (error) {
						webapis.avplay.close();
						_this.closePlayerCallback();
					}
                    break;
			  case TvKeys.PAUSE:
					try {
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
						tizen.tvinputdevice.unregisterKeyBatch(remoteKeys);
						this.closed();
						_this.closePlayerCallback();
					} catch(e){}
			  		break;
              case TvKeys.BACK:
			  case TvKeys.RETURN:
					try {
						tizen.tvinputdevice.unregisterKeyBatch(remoteKeys);
						this.closed();
					} catch (error) {
						_this.closePlayerCallback();
					}
                    break;

			  default:
                    break;
            }
        };

        this.registerHandler('buttonPress', this.handleButtonPress, this);
    };


    if (!exports.VideoPlayerController) { exports.VideoPlayerController = VideoPlayerController; }
})(window);
