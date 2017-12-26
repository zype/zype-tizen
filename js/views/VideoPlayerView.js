(function(exports){
    "use strict";

    var VideoPlayerView = function(){
        EventsHandler.call(this, ['loadComplete', 'showPlay', 'showPause', 'updateTime', 'show', 'hide']);
        var _this = this;
        var templateId = "#video-player-ui-view-template";

        this.id = null;

        this.title = null;
        this.thumbnailUrl = null;
        this.duration = null;
        this.currentTime = null;
        
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
            this.thumbnailUrl = args.thumbnailUrl;
            this.duration = args.duration;
            this.currentTime = 0;

            var id = "video-player-ui";
            this.id = "#" + id;
            
            var context = {
                title: this.title,
                thumbnailUrl: this.thumbnailUrl,
                duration: secondsToMinutesString(this.duration),
                currentTime: secondsToMinutesString(this.currentTime),
                css: viewCss(id)
            };

            var template = $(templateId);
            var renderedTemplate = Utils.buildTemplate(template, context);
            $("#app-container").append(renderedTemplate);

            this.trigger('loadComplete');
        };

        // TODO: add functions to update UI

        // TODO: register event handlers
    };

  	if (!exports.VideoPlayerView) { exports.VideoPlayerView = VideoPlayerView; }
})(window);
