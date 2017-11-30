(function(exports){
    "use strict";

    var MediaGridController = function(){
        EventsHandler.call(this, ['buttonPress']);
        var _this = this;

        var mediaGridCss = function(id){
            return {
                classes: { theme: appDefaults.theme },
                ids: { id: "media-grid-container-" + id}
            };
        };

        this.playlistLevel = null;
        this.mediaContent = [];

        this.view = null;

        this.structuredData = function(mediaContent){
            var structuredData = [];

            for (var i = 0; i < mediaContent.length; i++) {
                var row = {
                    title: mediaContent[i].title,
                    type: mediaContent[i].type,
                    thumbnailLayout: mediaContent[i].thumbnailLayout,
                    content: []
                };

                if (mediaContent[i].type == "videos"){
                    for (var x = 0; x < mediaContent[i].content.length; x++) {
                        var video = new VideoModel(mediaContent[i].content[x]);
                        row.content.push(video);
                    }
                } else if (mediaContent[i].type = "playlists") {
                    for (var x = 0; x < mediaContent[i].content.length; x++) {
                        var playlist = new PlaylistModel(mediaContent[i].content[x]);
                        row.content.push(playlist)
                    }
                }

                structuredData.push(row);
            }

            return structuredData;
        };

        this.init = function(args){
            this.playlistLevel = args.playlistLevel;
            this.mediaContent = args.mediaContent;

            var structuredData = this.structuredData(this.mediaContent);

            var viewArgs = {
                mediaContent: structuredData,
                playlistLevel: this.playlistLevel,
                css: mediaGridCss(this.playlistLevel)
            };

            var view = new MediaGridView();
            view.init(viewArgs);
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
