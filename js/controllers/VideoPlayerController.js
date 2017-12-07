(function(exports){
    var VideoPlayerController = function(){
        EventsHandler.call(this, ['loadComplete', 'buttonPress']);
        var _this = this;

        // default number of milliseconds for forward/backward
        var jumpMilliseconds = 10000;

        this.playerInfo = null;
        this.videoInfo = null;
        this.player = null;
        this.currentTime = null;
        this.duration = null;

        this.closePlayerCallback = null;

        this.init = function(args){
            this.videoInfo = args.videoInfo;
            this.playerInfo = args.playerInfo;
            this.closePlayerCallback = args.closePlayerCallback;

            var videoUrl = this.playerInfo.body.outputs.url;
            var displayOptions = {
                top: 0,
                left: 0,
                width: $(window).width(),
                height: $(window).height()
            };

            this.player = webapis.avplay.open(videoUrl);
            this.player.setDisplayRect(displayOptions.left, displayOptions.top, displayOptions.width, displayOptions.height);
            this.player.setListener(this.videoPlayerListeners());

            // current playback time in milliseconds
            this.currentTime = 0;
            try {
              this.duration = this.player.getDuration();
            } catch(e){}

            this.player.play();
        };

        this.handleButtonPress = function(buttonPress){
            switch (buttonPress) {
              case TvKeys.LEFT:
                  try {
                    this.player.pause();

                    this.player.jumpBackward(jumpMilliseconds);
                    this.currentTime = this.player.getCurrentTime();
                    this.player.play();
                  } catch(e){ console.log(e); }
                  break;

              case TvKeys.RIGHT:
                  try {
                    this.player.pause();

                    this.player.jumpForward(jumpMilliseconds);
                    this.currentTime = this.player.getCurrentTime();
                    this.player.play();
                  } catch(e){ console.log(e); }
                  break;

              case TvKeys.ENTER:
              case TvKeys.PLAYPAUSE:
                  try {
                      var state = this.player.getState();

                      if (state == "PAUSED"){
                          this.currentTime = this.player.getCurrentTime();
                          this.player.play();
                      } else {
                          this.player.pause();
                          this.player.getCurrentTime();
                      }

                  } catch(e) {}
                  break;

              case TvKeys.PLAY:
                  try {
                      this.currentTime = this.player.getCurrentTime();
                      this.player.play();
                  } catch (e) {}
                  break;

              case TvKeys.PAUSE:
                  try {
                      this.player.pause();
                      this.currentTime = this.player.getCurrentTime();
                  } catch (e) {}
              case TvKeys.BACK:
              case TvKeys.RETURN:
                  this.player.pause();
                  this.player.close();
                  this.closePlayerCallback();
                  break;

              default:
                  break;
            }
        };

        this.videoPlayerListeners = function(){
            return {
                onerror: this.closePlayerCallback,
                onstreamcompleted: this.closePlayerCallback
            };
        };

        this.registerHandler('buttonPress', this.handleButtonPress, this);
    };

    if (!exports.VideoPlayerController){ exports.VideoPlayerController = VideoPlayerController; }
})(window);
