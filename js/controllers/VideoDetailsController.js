(function(exports){
    "use strict";

    var VideoDetailsController = function(){
        EventsHandler.call(this, ['loadComplete']);
        var _this = this;

        this.data = null;
        this.view = null;

        this.init = function(args){
            this.data = args.data;

            var view = new VideoDetailsView();
            view.init(data);
            this.view = view;
        };
    };

    exports.VideoDetailsController = VideoDetailsController;
})(window);
