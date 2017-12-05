(function(exports){
    "use strict";

    var VideoDetailsController = function(){
        EventsHandler.call(this, ['loadComplete', 'buttonPress']);
        var _this = this;

        this.content = null;
        this.view = null;

        var videoDetailsCss = function(id){
            return {
                classes: { theme: appDefaults.theme },
                ids: { id: 'video-details-container-' + id }
            };
        };

        this.init = function(data){
            this.content = data;

            var viewArgs = {
                css: videoDetailsCss(this.content.id),
                data: new VideoModel(this.content)
            };

            var view = new VideoDetailsView();
            view.init(viewArgs);
            this.view = view;
        };

        this.handleButtonPress = function(buttonPress){
            switch (buttonPress) {
              case TvKeys.BACK:
              case TvKeys.RETURN:
                this.view.hide();
                break;
              default:
                console.log("default");
                break;
            }
        };

        this.registerHandler('buttonPress', this.handleButtonPress, this);
    };

    exports.VideoDetailsController = VideoDetailsController;
})(window);
