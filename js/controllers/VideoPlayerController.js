(function(exports){
    var VideoPlayerController = function(){
        EventsHandler.call(this, ['loadComplete', 'buttonPress']);
        var _this = this;

        // default number of milliseconds for forward/backward
        var jumpMilliseconds = 10000;

        this.playerInfo = null;
        this.videoInfo = null;
        this.currentTime = null;
        this.duration = null;

        this.init = function(args){
            this.videoInfo = args.videoInfo;
            this.playerInfo = args.playerInfo;

            var videoUrl = this.playerInfo.body.outputs[0].url;
            var displayOptions = {
                top: 0,
                left: 0,
                width: $(window).width(),
                height: $(window).height()
            };

            webapis.avplay.open(videoUrl);
            webapis.avplay.setDisplayRect(displayOptions.left, displayOptions.top, displayOptions.width, displayOptions.height);
            // webapis.avplay.setListener(this.videoPlayerListeners());

            // current playback time in milliseconds
            this.currentTime = 0;
            try {
              this.duration = webapis.avplay.getDuration();
            } catch(e){}

            webapis.avplay.play();
        };

        this.handleButtonPress = function(buttonPress){
            switch (buttonPress) {
              case TvKeys.LEFT:
                  try {
                    webapis.avplay.pause();

                    webapis.avplay.jumpBackward(jumpMilliseconds);
                    this.currentTime = webapis.avplay.getCurrentTime();
                    webapis.avplay.play();
                  } catch(e){ console.log(e); }
                  break;

              case TvKeys.RIGHT:
                  try {
                    webapis.avplay.pause();

                    webapis.avplay.jumpForward(jumpMilliseconds);
                    this.currentTime = webapis.avplay.getCurrentTime();
                    webapis.avplay.play();
                  } catch(e){ console.log(e); }
                  break;

              case TvKeys.ENTER:
              case TvKeys.PLAYPAUSE:
                  try {
                      var state = webapis.avplay.getState();

                      if (state == "PAUSED"){
                          this.currentTime = webapis.avplay.getCurrentTime();
                          webapis.avplay.play();
                      } else {
                          webapis.avplay.pause();
                          webapis.avplay.getCurrentTime();
                      }

                  } catch(e) {}
                  break;

              case TvKeys.PLAY:
                  try {
                      this.currentTime = webapis.avplay.getCurrentTime();
                      webapis.avplay.play();
                  } catch (e) {}
                  break;

              case TvKeys.PAUSE:
                  try {
                      webapis.avplay.pause();
                      this.currentTime = webapis.avplay.getCurrentTime();
                  } catch (e) {}
              case TvKeys.BACK:
              case TvKeys.RETURN:

                  try {                  
                      webapis.avplay.close();
                  } catch(e){
                      alert("Got this error" + JSON.stringify(e));
                  }
                  break;

              default:
                  break;
            }
        };

        this.videoPlayerListeners = function(){
            return {
                onerror: webapis.avplay.close(),
                onstreamcompleted: webapis.avplay.close()
            };
        };

        this.registerHandler('buttonPress', this.handleButtonPress, this);
    };

    if (!exports.VideoPlayerController){ exports.VideoPlayerController = VideoPlayerController; }
})(window);
