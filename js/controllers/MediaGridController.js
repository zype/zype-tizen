(function(exports){
    "use strict";

    var MediaGridController = function(){
        EventsHandler.call(this, ['buttonPress']);
        var _this = this;

        this.playlistLevel = null;
        this.mediaContent = [];

        this.init = function(args){
            _this.playlistLevel = args.playlistLevel;
            _this.mediaContent = args.mediaContent;
        };

        this.handleButtonPress = function(buttonPress){
            console.log("Inside MediaGridController. Got this key: ", buttonPress);
            console.log("\tMediaGridController.playlistLevel", this.playlistLevel);
            console.log("\tThis is the data", this.mediaContent);
        };

        this.registerHandler('buttonPress', this.handleButtonPress, this);
    };

    exports.MediaGridController = MediaGridController;
})(window);
