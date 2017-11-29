(function(exports) {
    "use strict";

    var MediaGridView = function() {
        EventsHandler.call(this, ["loadComplete"]);

        var templateId = "#media-grid-view-template";
        var mediaGridContainerId = "#media-grid-container";

        this.registerHandler('loadComplete', function(args) {
            this.focusCurrentThumbnail();
        }, this);

        this.id = null;
        this.currentPosition = [];
        this.playlistLevel = null;
        this.rowData = [];

        this.init = function(args) {
            this.rowData = args.rowData;
            this.playlistLevel = args.playlistLevel;
            this.currentPosition = [0, 0];

            this.id = "#media-grid-view-" + String(this.playlistLevel);

            var context = {
                rowData: this.rowData,
                css: args.css,
                images: {
                    appIcon: appDefaults.appIconUrl
                }
            };

            var template = $(templateId);
            var renderedTemplate = Utils.buildTemplate(template, context);
            $(mediaGridContainerId).append(renderedTemplate);

            this.trigger('loadComplete', [1, 2, 3]);
        };


        this.focusCurrentThumbnail = function(){
            $(mediaGridContainerId + " .media-grid-thumbnail").each(function(index, value){
                var thumbnailFocused = $(this).hasClass("focused-thumbnail");
                if (thumbnailFocused) $(this).removeClass("focused-thumbnail");
            });

            var currentRow = $(mediaGridContainerId + " .media-grid-row")[this.currentPosition[0]];
            var currentThumbnail = $(currentRow).find(".media-grid-thumbnail")[this.currentPosition[1]];
            $(currentThumbnail).addClass("focused-thumbnail");
        };
    };

    if (!exports.MediaGridView) { exports.MediaGridView = MediaGridView; }
})(window);
