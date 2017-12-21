(function(exports){
    var VideoPlayerController = function(){
        EventsHandler.call(this, ['loadComplete', 'buttonPress', 'show', 'hide']);
        var _this = this;

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

				$("#zype-video-player").css({
					top: 0,
					left: 0,
					width: 1920 * ratio,
					height: 1080 * ratio
				});

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
		
		this.close = function(){ webapis.avplay.close(); };

        this.handleButtonPress = function(buttonPress){
            switch (buttonPress) {
			  case TvKeys.LEFT:
					try {
						webapis.avplay.pause();
						webapis.avplay.seekTo(webapis.avplay.getCurrentTime() - 10000);
						webapis.avplay.play();						
					} catch (error) {
						webapis.avplay.play();
					}
                  break;

			  case TvKeys.RIGHT:
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
              case TvKeys.BACK:
			  case TvKeys.RETURN:
					try {
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
