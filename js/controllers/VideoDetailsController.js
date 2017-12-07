(function(exports){
    "use strict";

    var VideoDetailsController = function(){
        EventsHandler.call(this, ['loadComplete', 'buttonPress']);
        var _this = this;

        this.content = null;
        this.view = null;
        this.buttons = [];
        this.currentButtonIndex = null;

        var videoDetailsCss = function(id){
            return {
                classes: { theme: appDefaults.theme },
                ids: { id: 'video-details-container-' + id }
            };
        };

        this.init = function(data){
            this.content = data;

            this.buttons = this.getButtons(this.content._id);
            this.currentButtonIndex = 0;

            var viewArgs = {
                css: videoDetailsCss(this.content._id),
                data: new VideoModel(this.content),
                buttons: this.buttons
            };

            var view = new VideoDetailsView();
            view.init(viewArgs);
            this.view = view;
            this.view.focusButtonAtIndex(this.currentButtonIndex);
        };

        this.handleButtonPress = function(buttonPress){
            switch (buttonPress) {
              case TvKeys.UP:
                  if (this.currentButtonIndex - 1 >= 0){
                      this.currentButtonIndex -= 1;
                      this.view.focusButtonAtIndex(this.currentButtonIndex);
                  }

                  break;
              case TvKeys.DOWN:
                  if (this.currentButtonIndex + 1 < this.buttons.length){
                      this.currentButtonIndex += 1;
                      this.view.focusButtonAtIndex(this.currentButtonIndex);
                  }

                  break;
              case TvKeys.ENTER:
                  this.view.hide();
                  break;
              case TvKeys.BACK:
              case TvKeys.RETURN:
                  this.view.hide();
                  break;
              default:
                  break;
            }
        };

        this.getButtons = function(videoId){
            var buttons = [];

            buttons.push({ title: appDefaults.labels.playButton, role: "play", data: { videoId: videoId }  });

            // TODO: add logic to determine which buttons to display

            return buttons;
        };

        this.currentButton = function(){
            return this.buttons[this.currentButtonIndex];
        };

        this.close = function(){
          if (this.view){
            this.view.close();
            this.view = null;
          }
        };


        this.registerHandler('buttonPress', this.handleButtonPress, this);
        this.registerHandler('close', this.close, this);
    };

    exports.VideoDetailsController = VideoDetailsController;
})(window);
