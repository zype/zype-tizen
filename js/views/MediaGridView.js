(function(exports) {
    "use strict";

    var MediaGridView = function() {
        EventsHandler.call(this, ["loadComplete", "show", "hide", "moveIndex", "close"]);
        var _this = this;

        // id of handlebars template
        var templateId = "#media-grid-view-template";
        // id of div to attach view to
        var mediaGridContainerId = "#media-grid-container";

        this.id = null;   // id of view once attached to DOM
        this.currentPosition = [];
        this.currentRowsTopPosition = null;
        this.rowsLeftPositions = [];

        // used in view's id, so DOM can be manipulated
        this.mediaContent = null;

        /**
         * Initialization
         */ 
        this.init = function(args) {
            this.mediaContent = args.mediaContent;
            // TODO: delete later if playlist level is not being used
            this.playlistLevel = args.playlistLevel;
            this.currentPosition = [0, 0];
            this.currentRowsTopPosition = 0;

            for (var i = 0; i < this.mediaContent.length; i++) {
                this.rowsLeftPositions.push(0);
            }

            this.id = "#" + args.css.ids.id;

            var context = {
                rowData: this.mediaContent,
                css: args.css,
                images: {
                    appIcon: appDefaults.appIconUrl
                }
            };

            var template = $(templateId);
            var renderedTemplate = Utils.buildTemplate(template, context);
            $(mediaGridContainerId).append(renderedTemplate);

            this.trigger("loadComplete");
        };

        this.prepareView = function(){
            if (this.focusedContent()){
                this.focusCurrentThumbnail();
            }
            this.updateFocusedInfoDisplay();
            this.show();
        };
        
        /**
         * Button Press
         */ 
        this.handleButtonPress = function(buttonPress){
            var myText = "TizenKey: " + TvKeys[buttonPress] + "\n";
            myText += "buttonPress: " + buttonPress;
            $(this.id + " .focused-content-info-description").text(myText);
        };


        /**
         * Helpers
         */ 
        this.focusedContent = function(){
            if (!this.mediaContent) {
                return null;
            } else {
                var row = this.currentPosition[0];
                var col = this.currentPosition[1];
                return this.mediaContent[row].content[col];
            }
        };

        this.focusSmallThumbnail = function(){
            $(this.id + " .media-grid-thumbnail").each(function(index, value){
                var thumbnailFocused = $(this).hasClass("focused-thumbnail");
                if (thumbnailFocused) $(this).removeClass("focused-thumbnail");
            });

            var currentRow = $(this.id + " .media-grid-row")[this.currentPosition[0]];
            var currentThumbnail = $(currentRow).find(".media-grid-thumbnail")[this.currentPosition[1]];
            $(currentThumbnail).addClass("focused-thumbnail");
        };

        this.focusLargeThumbnail = function(){
            var focusedContent = this.focusedContent();
            var rowNum = this.currentPosition[0];

            var largeThumb = $(this.id + " .large-thumbnail");            

            if (focusedContent){
                var thumbnailLayout = this.mediaContent[rowNum].thumbnailLayout;

                if (thumbnailLayout && thumbnailLayout == "poster"){
                    largeThumb.attr("src", focusedContent.posterThumbnailUrl);
                } else {
                    largeThumb.attr("src", focusedContent.largeThumbnailUrl);
                }
            } else {
                largeThumb.attr("src", appDefaults.thumbnailUrl);
            }
        };

        this.getRowHeightAtIndex = function(index){
            var nextRow = $(this.id + " .media-grid-row")[index];
            return $(nextRow).height();
        };

        this.getFocusedThumbnailInfo = function(){
            var focusedThumbnail = $(this.id + " .focused-thumbnail")[0];

            if (focusedThumbnail){
                var focusedThumbnailInfo = {
                    height: $(focusedThumbnail).height(),
                    width: $(focusedThumbnail).width(),
                    top: $(focusedThumbnail).position().top,
                    left: $(focusedThumbnail).position().left
                };
                return focusedThumbnailInfo;
            } else {
                return null;
            }
        };

        /**
         * Update DOM
         */ 
        this.focusCurrentThumbnail = function(){
            this.focusSmallThumbnail();
            this.focusLargeThumbnail();
        };

        this.hideRowsAboveLimit = function(){
            $(this.id + " .media-grid-row").each(function(index, value){
                var row = $(this);
                if (row.hasClass("invisible")){
                  $(this).removeClass("invisible");
                }

                if ($(this).position().top < 0){
                    $(this).addClass("invisible");
                }
            });
        };

        this.updateFocusedInfoDisplay = function(){
            var focusedContent = this.focusedContent();
            var title = "";
            var description = "";

            if (focusedContent){
                title = focusedContent.title;
                description = focusedContent.description;
            }

            $(this.id + " .focused-content-info-title").text(title);
            $(this.id + " .focused-content-info-description").text(description);
        };

        this.updateRowsTopPercentage = function(percent){
            this.currentRowsTopPosition = percent;
            $(this.id + " .media-grid-rows-container").css({top: String(percent) + "px"});
            this.hideRowsAboveLimit();
        };

        this.shiftRowAtIndex = function(rowIndex, dir){
            var row = $(this.id + " .media-grid-row .media-grid-row-thumbnails-container")[rowIndex];
            var focusedThumb = $(row).find(".media-grid-thumbnail")[0];
            var thumbnailWidth = (2 * $(focusedThumb).width() / $(window).width()) * 100;

            if (dir == TvKeys.RIGHT){
                var newLeftPosition = this.rowsLeftPositions[rowIndex] + thumbnailWidth;

                this.rowsLeftPositions[rowIndex] = newLeftPosition;
                $(row).css({ "margin-left": String(newLeftPosition) + "%" });
            } else if (dir == TvKeys.LEFT) {
                var newLeftPosition = this.rowsLeftPositions[rowIndex] - thumbnailWidth;

                this.rowsLeftPositions[rowIndex] = newLeftPosition;
                $(row).css({ "margin-left": String(newLeftPosition) + "%" });
            }
        };

        this.resetRowMarginAtIndex = function(index){
            var row = $(this.id + " .media-grid-row .media-grid-row-thumbnails-container")[index];
            $(row).css({ "margin-left": "0px" });
        };

        /**
         * show / hide / close self
         */ 
        this.show = function(){
            $(this.id).removeClass("invisible");
        };

        this.hide = function(){
            $(this.id).addClass("invisible");
        };

        this.close = function() {
            $(this.id).remove();
        };


        /**
         * Register event handlers
         */ 
        this.registerHandler("show", this.show, this);
        this.registerHandler("hide", this.hide, this);
        this.registerHandler("close", this.close, this);
        this.registerHandler("loadComplete", this.prepareView, this);
    };

    if (!exports.MediaGridView) { exports.MediaGridView = MediaGridView; }
})(window);
