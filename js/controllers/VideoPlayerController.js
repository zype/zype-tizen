(function(exports){
    var VideoPlayerController = function(){
        EventsHandler.call(this, ['loadComplete', 'buttonPress', 'show', 'hide']);
        var _this = this;

        var templateId = "#video-player-view-template"
        var videoPlayerContainerId = "#video-player-container";

        this.playerInfo = null;
        this.player = null;
        this.id = null; // HTML id for DOM manipulation

        this.closePlayerCallback = null;

        this.init = function(args){
            this.playerInfo = args.playerInfo;
            this.closePlayerCallback = args.callbackFunc;

            var videoId = this.playerInfo.video._id;
            var thumbnailUrl = this.playerInfo.video.thumbnails[0].url || appDefaults.thumbnailUrl;
            var videoUrl = this.playerInfo.body.outputs[0].url;
            var videoType = this.playerInfo.body.outputs[0].name;

            this.id = "#video-player-" + videoId;

            var context = {
                css: { ids: { id: "video-player-" + videoId } },
                width: $(window).width(),
                height: $(window).height(),
                thumbnail: thumbnailUrl,
                videoUrl: videoUrl,
                videoType: videoType
            };

            var template = $(templateId);
            var renderedTemplate = Utils.buildTemplate(template, context);
            $(videoPlayerContainerId).append(renderedTemplate);

            $(this.id).removeClass("invisible");

            this.player = videojs(this.id);

            this.player.on("ready", function(){
                this.play();
            });
            this.player.on("ended", function(){
                $(_this.id).addClass("invisible");
                this.dispose();
                _this.closePlayerCallback();
                _this.closePlayerCallback = null;
            });
        };

        this.close = function(){
            $(this.id).remove();
        };

        this.handleButtonPress = function(buttonPress){
            switch (buttonPress) {
              case TvKeys.LEFT:
                  var currentTime = this.player.currentTime();
                  this.player.pause();
                  this.player.currentTime(currentTime - 10);
                  this.player.play();
                  break;

              case TvKeys.RIGHT:
                  var currentTime = this.player.currentTime();
                  this.player.pause();
                  this.player.currentTime(currentTime + 10);
                  this.player.play();
                  break;

              case TvKeys.ENTER:
              case TvKeys.PLAYPAUSE:
                      if (!this.player.paused()){
                        this.player.pause();
                      } else {
                        this.player.play();
                      }
                  break;

              case TvKeys.PLAY:
                  this.player.play();
                  break;
              case TvKeys.PAUSE:
                  this.player.pause();
                  break;
              case TvKeys.BACK:
              case TvKeys.RETURN:
                  this.player.pause();
                  this.player.dispose();
                  this.closePlayerCallback = null;
                  break;

              default:
                  break;
            }
        };

        this.registerHandler('buttonPress', this.handleButtonPress, this);
    };


    if (!exports.VideoPlayerController) { exports.VideoPlayerController = VideoPlayerController; }
})(window);
