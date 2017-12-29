(function(exports){
    "use strict";

    var VideoPlayerView = function(){
        EventsHandler.call(this, ['loadComplete', 'updateState', 'updateTime', 'show', 'hide']);
        var _this = this;
        var templateId = "#video-player-ui-view-template";

        this.id = null;

        this.title = null;
        this.description = null;
        this.duration = null;
        this.currentTime = null;
        this.state = null;
        
        function secondsToMinutesString(secs){
            if(!secs && secs <= 0){
              return "0:00";
            }

            var mins = Math.floor( secs / 60 );
            var remainder = secs % 60;

            return mins + ":" + remainder;
        }

        function viewCss(id){
          return {
            classes: {
              theme: appDefaults.theme,
              brandColor: appDefaults.brandColor
            },
            ids: { id: id }
          }
        }

        this.init = function(args){
            this.title = args.title;
            this.description = args.description;
            this.duration = args.duration;
            this.currentTime = 0;
            this.state = args.state;

            var id = "video-player-ui";
            this.id = "#" + id;
            
            var context = {
                title: this.title,
                description: this.description,
                duration: secondsToMinutesString(this.duration),
                currentTime: secondsToMinutesString(this.currentTime),
                playPauseImage: appDefaults.pauseButtonUrl,
                css: viewCss(id)
            };

            var template = $(templateId);
            var renderedTemplate = Utils.buildTemplate(template, context);
            $("#app-container").append(renderedTemplate);

            this.trigger('loadComplete');
        };

        this.updateProgressBar = function(){
            var percent = (this.currentTime / this.duration) * 100;
            $(this.id + " .progress-bar").css({ width: String(percent) + "%" });
        };

        this.updateCurrentTime = function(){
            var currentTimeString = secondsToMinutesString(this.currentTime);
            $(this.id + ".current-time").text(currentTimeString);
        };

        this.updateTime = function(currentTime){
            if (currentTime){ this.currentTime = currentTime; }

            this.updateProgressBar();
            this.updateCurrentTime();
        };

        this.setState = function(state){
            if (state == "playing" || state == "paused"){ this.state = state; }

            if (this.state == "playing"){
                $(this.id + " .play-pause-image").attr("src", appDefaults.pauseButtonUrl);
            } else {
                $(this.id + " .play-pause-image").attr("src", appDefaults.playButtonUrl)
            }
        };

        this.show = function(){
            $(this.id).removeClass('invisible');
        };

        this.hide = function(){
            $(this.id).addClass('invisible');
        };

        this.prepareView = function(){
            this.updateProgressBar();
            this.show();
        };

        this.registerHandler('loadComplete', this.prepareView, this);
        this.registerHandler('updateTime', this.updateTime, this);
        this.registerHandler('updateState', this.setState, this);
    };

  	if (!exports.VideoPlayerView) { exports.VideoPlayerView = VideoPlayerView; }
})(window);
