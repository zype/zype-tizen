(function(exports){
    "use strict";

    var MediaGridController = function(){
        EventsHandler.call(this, ["loadComplete", "buttonPress", "show", "hide", "close"]);
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

        /**
		 * Callbacks
		 */
        this.createController = null;
        this.removeSelf = null;

        /**
         * Initialization
         */ 
        this.init = function(options){
            showSpinner();

            var args = options.args;
            var callbacks = options.callbacks;

            this.createController = callbacks.createController;
            this.removeSelf = callbacks.removeController;

            this.playlistLevel = args.playlistLevel;

            // fetch playlist and video content
            ZypeApiHelpers.getPlaylistChildren(zypeApi, args.playlistId)
            .then(
                (resp)  => { if (resp){ _this.trigger("loadComplete", resp); } },
                (err)   => {  this.removeSelf(); }
            );

        };
        
        /**
         * Update view
         */
        this.hide = function(){ this.view.trigger("hide"); };
        this.show = function(){ this.view.trigger("show"); };
        this.close = function(){
            if (this.view) {
                this.view.trigger("close");
                this.view = null;
            }
        };

        this.handleData = function(data){
            this.mediaContent = data;
            this.createView();

            // if deep linked, try to show video else, else show self
            if(exports.deepLinkedData){
                var parsedData = JSON.parse(exports.deepLinkedData);

                zypeApi.getVideo(parsedData.videoId, {})
                .then(
                    resp => {
                        _this.view.trigger("hide");
                        _this.createController(VideoDetailsController, { video: resp.response });
                    },
                    err => { hideSpinner(); }
                );
            } else {
                hideSpinner();
            }

            exports.deepLinkedData = null;
        };

        this.createView = function(){
            var structuredData = this.structuredData(this.mediaContent);

            var viewArgs = {
                mediaContent: structuredData,
                playlistLevel: this.playlistLevel,
                css: mediaGridCss(this.playlistLevel)
            };

            var view = new MediaGridView();
            view.init(viewArgs);
            this.view = view;
        };

        /**
         * Button Presses
         */ 
        this.handleButtonPress = function(buttonPress){
            if (this.view){
                switch (buttonPress) {
                    case TvKeys.UP:
                    case TvKeys.DOWN:
                        var canMove = this.canMoveVertically(buttonPress);
                        if (canMove) {
                            var newTopPosition = _this.getNewTopPosition(buttonPress);
                            this.view.updateRowsTopPercentage(newTopPosition);
                            this.view.currentPosition = this.getNewPosition(buttonPress);
                            this.view.resetRowMarginAtIndex(this.view.currentPosition[0]);
                            this.view.focusCurrentThumbnail();
                            this.view.updateFocusedInfoDisplay();
                        }
                        break;
                    case TvKeys.LEFT:
                    case TvKeys.RIGHT:
                        var canMove = this.canMoveHorizontally(buttonPress);
                        if (canMove) {
                            this.view.currentPosition = this.getNewPosition(buttonPress);
                            this.view.focusCurrentThumbnail();
                            this.view.updateFocusedInfoDisplay();

                            var focusedThumbnail =  this.view.getFocusedThumbnailInfo();
                            var touchesEdge = this.thumbnailOnEdge(focusedThumbnail);

                            if (touchesEdge){
                                var rowIndex = this.view.currentPosition[0];
                                if (buttonPress == TvKeys.LEFT){
                                    this.view.shiftRowAtIndex(rowIndex, TvKeys.RIGHT);
                                } else {
                                    this.view.shiftRowAtIndex(rowIndex, TvKeys.LEFT);
                                }
                            }
                        }
                        break;

                    case TvKeys.ENTER:
                        var itemSelected = this.focusedContent();

                        if (itemSelected.content){
                            this.view.trigger("hide");

                            if (itemSelected.contentType == "videos"){
                                this.createController(VideoDetailsController, {
                                    video: itemSelected.content
                                });
                            } else if (itemSelected.contentType == "playlists") {
                                this.createController(MediaGridController, {
                                    playlistLevel: this.playlistLevel + 1,
                                    playlistId: itemSelected.content._id
                                });
                            }
                        }
                      
                      break;

                    case TvKeys.RETURN:
                    case TvKeys.BACK:
                      this.removeSelf();
                      break;
                    default:
                      break;
                }
            }
        };


        /**
         * Helpers
         */
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

        this.canMoveVertically = function(dir){
            var currentPos = this.view.currentPosition;
            if (dir == TvKeys.UP){
                return (currentPos && currentPos[0] - 1 > -1) ? true : false;
            } else if (dir == TvKeys.DOWN) {
                return (currentPos && currentPos[0] + 1 < this.mediaContent.length) ? true : false;
            } else {
                return false;
            }
        };

        this.canMoveHorizontally = function(dir){
            var currentPos = this.view.currentPosition;
            var currentRowContent = this.mediaContent[currentPos[0]].content;

            if (dir == TvKeys.LEFT){
                return (currentPos[1] - 1 >= 0) ? true : false;
            } else if (dir == TvKeys.RIGHT) {
                return (currentPos[1] + 1 < currentRowContent.length ) ? true : false;
            }
        }

        this.getNewTopPosition = function(dir){
            var currentTopPos = this.view.currentRowsTopPosition;
            if (dir == TvKeys.UP) {
                return currentTopPos + this.view.getRowHeightAtIndex(this.view.currentPosition[0]);
            } else if (dir == TvKeys.DOWN) {
                var newRowIndex = this.view.currentPosition[0] + 1;
                return currentTopPos - this.view.getRowHeightAtIndex(newRowIndex);
            }
        };

        this.getNewPosition = function(dir){
            if(this.view){
                switch (dir) {
                  case TvKeys.UP:
                      var currPos = this.view.currentPosition;
                      currPos[0] = currPos[0] - 1;
                      currPos[1] = 0;
                      return currPos;
                  case TvKeys.DOWN:
                      var currPos = this.view.currentPosition;
                      currPos[0] = currPos[0] + 1;
                      currPos[1] = 0;
                      return currPos;
                  case TvKeys.LEFT:
                      var currPos = this.view.currentPosition;
                      currPos[1] = currPos[1] - 1;
                      return currPos;
                  case TvKeys.RIGHT:
                      var currPos = this.view.currentPosition;
                      currPos[1] = currPos[1] + 1;
                      return currPos;
                  default:
                      return this.view.currentPosition;
                }
            }
        };

        // gets info on current focused thumbnail
        // figures out if thumbnail is touching edge
        this.thumbnailOnEdge = function(focusedThumbnail){
            var windowWidth = $(window).width();
            var thumbnailRightPosition = focusedThumbnail.left + (1.25 * focusedThumbnail.width);

            var touchesLeftEdge = (focusedThumbnail.left <= 0 || thumbnailRightPosition <= 0);
            var touchesRightEdge = (focusedThumbnail.left >= windowWidth || thumbnailRightPosition >= windowWidth);

            return (touchesLeftEdge || touchesRightEdge) ? true : false;
        };

        this.focusedContent = function(){
            var currentPosition = this.view.currentPosition;
            return {
                content: this.mediaContent[currentPosition[0]].content[currentPosition[1]],
                contentType: this.mediaContent[currentPosition[0]].type
            };
        };

        /**
         * Register event handlers
         */ 
        this.registerHandler("loadComplete", this.handleData, this);
        this.registerHandler("buttonPress", this.handleButtonPress, this);
        this.registerHandler("show", this.show, this);
        this.registerHandler("hide", this.hide, this);
        this.registerHandler("close", this.close, this);
    };

    exports.MediaGridController = MediaGridController;
})(window);
