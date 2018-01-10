(function(exports){
    "use strict";

    var VideoDetailsView = function(){
        EventsHandler.call(this, ["loadComplete", "show", "hide", "close"]);

        // id of handlebars template
        var templateId = "#video-details-view-template";
        // id of div to attach view to
        var videoDetailsContainerId = "#video-details-container";

        this.id = null;   // id of view once attached to DOM
        this.buttons = [];
        this.data = null;

        this.init = function(args){
            this.data = args.data;
            this.buttons = args.buttons;
            for (var i = 0; i < this.buttons.length; i++) {
              this.buttons[i].id = "#video-details-button-" + String(this.data.id) + "-" + String(i);
            }

            // set id for manipulating DOM
            this.id = "#" + args.css.ids.id;

            var context = {
                data: this.data,
                buttons: this.buttons,
                css: args.css,
                images: {
                    appIcon: appDefaults.appIconUrl
                }
            };

            var template = $(templateId);
            var renderedTemplate = Utils.buildTemplate(template, context);
            $(videoDetailsContainerId).append(renderedTemplate);

            this.trigger("loadComplete");
        };

        this.focusButtonAtIndex = function(index){
            $(this.id + " .button.focused").removeClass("focused");

            var button = $(this.id + " .button")[index];
            $(button).addClass("focused");
        };

        this.setText = function(){
            $(this.id + " .video-details-title").text(this.data.title);
            $(this.id + " .video-details-description").text(this.data.description);
        };

        this.setThumbnail = function(){
            var largeThumbnail = $(this.id + " .large-thumbnail");
            largeThumbnail.attr("src", this.data.largeThumbnailUrl);
        };

        this.prepareView = function(){
            this.setText();
            this.setThumbnail();
            this.show();
        };

        this.show = function(){
            $(this.id).removeClass("invisible");
        };

        this.hide = function(){
            $(this.id).addClass("invisible");
        };

        this.close = function(){
            $(this.id).remove();
        };

        this.registerHandler("loadComplete", this.prepareView, this);
        this.registerHandler("close", this.close, this);
    };

    if (!exports.VideoDetailsView) { exports.VideoDetailsView = VideoDetailsView; }
})(window);
