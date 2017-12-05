(function(exports){
    "use strict";

    var VideoDetailsView = function(){
        EventsHandler.call(this, ['loadComplete', 'show', 'hide']);

        this.buttons = [];
        this.data = null;

        this.init = function(args){
            this.data = args.data;
        };

    };

    if (!exports.VideoDetailsView) { exports.VideoDetailsView = VideoDetailsView; }
})(window);
