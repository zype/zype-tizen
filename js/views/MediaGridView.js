(function(exports) {
    "use strict";

    var MediaGridView = function() {
        EventsHandler.call(this, ["loadComplete"]);
        var _this = this;

        var templateId = "#media-grid-view-template";
        var mediaGridContainerId = "#media-grid-container";

        this.id = null;
        this.currentPosition = [];

        // used in view's id, so DOM can be manipulated
        this.playlistLevel = null;
        this.mediaContent = null;

        this.focusedContent = function(){
            if (!this.mediaContent) {
                return null;
            } else {
                var row = this.currentPosition[0];
                var col = this.currentPosition[1];
                return this.mediaContent[row].content[col];
            }
        };

        this.show = function(){
            $(this.id).removeClass('invisible');
        };

        this.hide = function(){
            $(this.id).removeClass('invisble');
        };

        this.focusSmallThumbnail = function(){
            $(mediaGridContainerId + " .media-grid-thumbnail").each(function(index, value){
                var thumbnailFocused = $(this).hasClass("focused-thumbnail");
                if (thumbnailFocused) $(this).removeClass("focused-thumbnail");
            });

            var currentRow = $(mediaGridContainerId + " .media-grid-row")[this.currentPosition[0]];
            var currentThumbnail = $(currentRow).find(".media-grid-thumbnail")[this.currentPosition[1]];
            $(currentThumbnail).addClass("focused-thumbnail");
        };

        this.focusLargeThumbnail = function(){
            var focusedContent = this.focusedContent();
            var rowNum = this.currentPosition[0];
            var thumbnailLayout = this.mediaContent[rowNum].thumbnailLayout;

            if (thumbnailLayout == "poster") {
                var largeThumb = $(this.id + " .large-thumbnail");
                largeThumb.attr("src", focusedContent.posterThumbnailUrl);
            } else {
                var largeThumb = $(this.id + " .large-thumbnail");
                largeThumb.attr("src", focusedContent.largeThumbnailUrl);
            }
        };

        this.focusCurrentThumbnail = function(){
            this.focusSmallThumbnail();
            this.focusLargeThumbnail();
        };

        this.registerHandler('loadComplete', function() {
            this.focusCurrentThumbnail();
            this.show();
        }, this);

        this.init = function(args) {
            this.mediaContent = args.mediaContent;
            this.playlistLevel = args.playlistLevel;
            this.currentPosition = [0, 0];

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

            this.trigger('loadComplete');
        };

    };

    if (!exports.MediaGridView) { exports.MediaGridView = MediaGridView; }
})(window);
