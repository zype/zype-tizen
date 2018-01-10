(function(exports){
    "use strict";

    var VideoPlayerView = function(){
        EventsHandler.call(this, ["loadComplete", "updateState", "updateTime", "show", "hide", "fadeOut", "close"]);
        var _this = this;
        var templateId = "#video-player-ui-view-template";

        this.id = null;

        this.title = null;
        this.description = null;
        this.duration = null;
        this.currentTime = null;
        this.state = null;

        this.lastFadeOutTime = null;
        
        function secondsToMinutesString(secs){
            if(!secs && secs <= 0){
              return "0:00:00";
            }

            if ( secs / 3600 > 0 ){
                var hours = Math.floor( secs / 3600 );
                secs -= hours * 3600;
            } else {
                var hours = 0;
            }

            if ( secs / 60 > 0 ){
                var mins = Math.floor( secs / 60 );
                secs -= mins * 60;
            } else {
                var mins = 0;
            }

            secs = Math.floor(secs);

            var hoursString = (hours >= 10) ? String(hours) : "0" + String(hours);
            var minsString = (mins >= 10) ? String(mins) : "0" + String(mins);
            var remainderString = (secs >= 10) ? String(secs) : "0" + String(secs);

            return hoursString + ":" + minsString + ":" + remainderString;
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
            this.currentTime = args.currentTime;
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
        };

        this.updateProgressBar = function(){
            var percent = (this.currentTime / this.duration) * 100;
            $(this.id + " .progress-bar").css({ width: String(percent) + "%" });
        };

        this.updateCurrentTime = function(){
            var currentTimeString = secondsToMinutesString(this.currentTime);
            $(this.id + " .current-time").text(currentTimeString);
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
            $(this.id).removeClass("invisible");
        };

        this.hide = function(){
            $(this.id).addClass("invisible");
        };

        this.close = function(){
            $(this.id).remove();
        };

        this.fadeIn = function(secs){
            if (!secs){ secs = 0; }
            $(this.id).fadeIn(secs * 1000);
        };

        this.fadeOut = function(secs){
            if (!secs){ secs = 0; }
            $(this.id).fadeOut(secs * 1000);
        };

        this.prepareView = function(){
            this.updateProgressBar();
            this.setState();
            this.show();
        };

        this.registerHandler("hide", this.hide, this);
        this.registerHandler("loadComplete", this.prepareView, this);
        this.registerHandler("updateTime", this.updateTime, this);
        this.registerHandler("updateState", this.setState, this);
        this.registerHandler("fadeOut", this.fadeOut, this);
        this.registerHandler("close", this.close, this);
    };

  	if (!exports.VideoPlayerView) { exports.VideoPlayerView = VideoPlayerView; }
})(window);
