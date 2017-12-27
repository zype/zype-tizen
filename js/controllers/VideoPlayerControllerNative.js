(function(exports){
    var VideoPlayerController = function(){
        EventsHandler.call(this, ['loadComplete', 'buttonPress', 'show', 'hide']);
        var _this = this;
		var remoteKeys = ["MediaPlayPause", "MediaPlay", "MediaStop", "MediaPause", "MediaRewind", "MediaFastForward"];

        this.name = null;
        this.playerInfo = null;

        this.closePlayerCallback = null;

        this.init = function(args){
            this.name = "VideoPlayerController";
            this.playerInfo = args.playerInfo;
            this.closePlayerCallback = args.callbackFunc;

            var videoId = this.playerInfo.video._id;
            var thumbnailUrl = this.playerInfo.video.thumbnails[0].url || appDefaults.thumbnailUrl;
            var videoUrl = this.playerInfo.body.outputs[0].url;
            var videoType = this.playerInfo.body.outputs[0].name;

			this.prepareRemote();

			try {
				webapis.avplay.open(videoUrl);
				webapis.avplay.setListener({
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
				webapis.avplay.close();
				this.closePlayerCallback();
			}
		};

		this.prepareRemote = function(){
			try {
				tizen.tvinputdevice.registerKeyBatch(remoteKeys);
			} catch (error) {}
		};
		
		this.close = function(){ webapis.avplay.close(); };

        this.handleButtonPress = function(buttonPress){
            switch (buttonPress) {
			  case TvKeys.LEFT:
			  case TvKeys.RW:
					try {
						webapis.avplay.pause();
						webapis.avplay.seekTo(webapis.avplay.getCurrentTime() - 10000);
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
						webapis.avplay.play();
					} catch (error) {
						webapis.avplay.play();
					}					
                    break;

              case TvKeys.ENTER:
			  case TvKeys.PLAYPAUSE:
					try {
						var state = webapis.avplay.getState();

						if (state == "PAUSED") {
							webapis.avplay.play();
						} else {
							webapis.avplay.pause();
						}
					} catch (error) {
						webapis.avplay.close();
						_this.closePlayerCallback();
					}
                  break;

			  case TvKeys.PLAY:
					try {
						webapis.avplay.play();
					} catch (error) {
						webapis.avplay.close();
						_this.closePlayerCallback();
					}
                    break;
			  case TvKeys.PAUSE:
					try {
						webapis.avplay.pause();
					} catch (error) {
						webapis.avplay.close();
						_this.closePlayerCallback();
					}
					break;
			  case TvKeys.STOP:
					try {
						tizen.tvinputdevice.unregisterKeyBatch(remoteKeys);
						webapis.avplay.close();
						_this.closePlayerCallback();
					} catch(e){}
			  		break;
              case TvKeys.BACK:
			  case TvKeys.RETURN:
					try {
						tizen.tvinputdevice.unregisterKeyBatch(remoteKeys);
						webapis.avplay.close();
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
