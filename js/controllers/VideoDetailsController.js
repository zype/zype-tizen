(function(exports){
    "use strict";

    var VideoDetailsController = function(){
        EventsHandler.call(this, ["buttonPress", "action", "show", "hide", "close"]);
        var _this = this;

        this.content = null;
        this.view = null;
        this.buttons = [];
        this.currentButtonIndex = null;

        /**
		 * Callbacks
		 */
		this.createController = null; // create new controller
		this.removeSelf = null; // remove self

        var videoDetailsCss = function(id){
            return {
                classes: { theme: appDefaults.theme },
                ids: { id: "video-details-container-" + id }
            };
        };

        /**
         * Initialization
         */ 
        this.init = function(options){
            showSpinner();

            var args = options.args;
            var callbacks = options.callbacks;

            this.createController = callbacks.createController;
            this.removeSelf = callbacks.removeController;

            this.content = args.video;

            this.createView();
        };

        /**
         * Update view
         */ 
        this.show = function(){
            this.view.show();
        };

        this.hide = function(){
            this.view.hide();
        };

        this.close = function(){
          if (this.view){
            this.view.trigger("close");
            this.view = null;
          }
        };

        /**
         * Event Handlers
         */ 
        this.createView = function(){
            this.buttons = this.getButtons(this.content._id);
            this.currentButtonIndex = 0;

            var viewArgs = {
                css: videoDetailsCss(this.content._id),
                data: new VideoModel(this.content),
                buttons: this.buttons
            };

            var view = new VideoDetailsView();
            view.init(viewArgs);
            this.view = view;
            this.view.focusButtonAtIndex(this.currentButtonIndex);

            hideSpinner();
        };

        this.handleButtonPress = function(buttonPress){
            switch (buttonPress) {
                case TvKeys.UP:
                    if (this.currentButtonIndex - 1 >= 0){
                        this.currentButtonIndex -= 1;
                        this.view.focusButtonAtIndex(this.currentButtonIndex);
                    }

                    break;
                case TvKeys.DOWN:
                    if (this.currentButtonIndex + 1 < this.buttons.length){
                        this.currentButtonIndex += 1;
                        this.view.focusButtonAtIndex(this.currentButtonIndex);
                    }

                    break;
                case TvKeys.ENTER:
                    var buttonSelected = this.currentButton();
                    this.trigger("action", buttonSelected.role, buttonSelected.data);
                        
                    break;
                case TvKeys.BACK:
                case TvKeys.RETURN:
                    this.removeSelf();
                    break;
                default:
                    break;
            }
        };

        this.handleAction = function(action, data){
            switch (action) {
                case "play":
                    this.view.trigger("hide");

                    var videoId = data.videoId;
                    var auth = { app_key: zypeApi.appKey };

                    this.createController(VideoPlayerController, {
                        videoId: videoId,
                        auth: auth
                    });
                    break;

                case "signin":
                    this.view.trigger("hide");
                    this.createController(SignInController, {});
                    break;
                default:
                    break;
            }
        };

        /**
         * Helpers
         */
        this.getButtons = function(videoId){
            var buttons = [];

            var requiresEntitlement = this.videoRequiresEntitlement();
            var signedIn = this.isSignedIn();

            if (!requiresEntitlement || signedIn){
                buttons.push({ title: appDefaults.labels.playButton, role: "play", data: { videoId: videoId }  });
            } else {
                buttons.push({ title: appDefaults.labels.signInButton, role: "signin", data: {} });
            }

            return buttons;
        };

        this.currentButton = function(){
            return this.buttons[this.currentButtonIndex];
        };

        this.videoRequiresEntitlement = function(){
            var video = this.content;
            return (video.pass_required || video.purchase_required || video.rental_required || video.subscription_required);
        };

        this.isSignedIn = function(){
            var accessToken = localStorage.getItem("accessToken");
            return (accessToken) ? true : false;
        };

        /**
         * Register event handlers
         */ 
        this.registerHandler("buttonPress", this.handleButtonPress, this);
        this.registerHandler("action", this.handleAction, this);
        this.registerHandler("show", this.show, this);
        this.registerHandler("hide", this.hide, this);
        this.registerHandler("close", this.close, this);
    };

    exports.VideoDetailsController = VideoDetailsController;
})(window);
