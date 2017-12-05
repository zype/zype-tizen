(function(exports){
    "use strict";

    var AppController = function(){
        EventsHandler.call(this, ['settingsLoaded', 'mediaLoaded', 'forceExitApp', 'exitApp', 'buttonPress']);

        var _this = this;

        this.appSettings = {};
        this.zypeApi = ZypeJSBase({
            appKey: appDefaults.appKey,
            clientId: appDefaults.clientId,
            clientSecret: appDefaults.clientSecret
        });

        this.mediaGridContent = [];
        this.mediaGridControllersCount = 0;

        this.controllers = [];

        this.init = function(args){
            this.zypeApi.getApp().then(function(resp){
                if (resp){
                    _this.trigger('settingsLoaded', resp.response);
                } else {
                    _this.trigger('forceExitApp', 'App misconfigured. Exitting...');
                }
            });
        };

        this.handleButtonPress = function(keyCode){
            if (this.controllers.length > 0){
                var currentController = this.controllers[this.controllers.length - 1];
                currentController.trigger('buttonPress', keyCode);

                switch (keyCode) {
                  case TvKeys.ENTER:
                    this.handleEnterButtonPress();
                    break;
                  case TvKeys.RETURN:
                  case TvKeys.BACK:
                    this.handleBackButtonPress();
                    break;
                  default:
                    break;
                }
            }
        };

        this.addMediaContent = function(playlistId, playlistLevel){
            ZypeApiHelpers.getPlaylistChildren(this.zypeApi, playlistId).then(function(data){
                console.log("got this playlist id: ", playlistId);
                console.log("new content: ", data);

                _this.mediaGridContent.push(data);

                var mediaGridController = new MediaGridController();
                mediaGridController.init({
                    playlistLevel: _this.mediaGridControllersCount,
                    mediaContent: data
                });

                _this.controllers.push(mediaGridController);
                _this.mediaGridControllersCount += 1;
            });
        };

        this.handleBackButtonPress = function(){
            var lastController = this.controllers.pop();
            if (this.controllers.length == 0){
                this.exitApp();
            } else {
                var previousController = _this.controllers[_this.controllers.length - 1];
                previousController.trigger('show');
            }
        };

        this.handleEnterButtonPress = function(){
            var controller = this.controllers[this.controllers.length - 1];
            var controllerName = ObjectHelpers.getObjectName(controller);

            switch (controllerName) {
              case "MediaGridController":
                var itemSelected = controller.focusedContent();

                // TODO: need code for creating VideoDetailsController with view
                if (itemSelected.contentType == "videos"){
                    var newController = new VideoDetailsController();
                    newController.init(itemSelected.content);

                    this.controllers.push(newController);
                } else if (itemSelected.contentType == "playlists") {
                    this.addMediaContent(itemSelected.content._id, this.mediaGridControllersCount);
                }
                break;
              default:
                break;
            }
        };

        this.forceExitApp = function(message){
            alert(message);
            setTimeout(this.exitApp, 1000);
        };

        this.exitApp = function(){
            tizen.application.getCurrentApplication().exit();
        };

        this.registerHandler('settingsLoaded', function(appSettings){
            if (!appSettings.featured_playlist_id) appSettings.featured_playlist_id = appDefaults.rootPlaylistId;

            this.appSettings = appSettings;

            this.addMediaContent(this.appSettings.featured_playlist_id, 0);
        }, this);

        this.registerHandler('mediaLoaded', this.displayMediaGridView, this);

        this.registerHandler('forceExitApp', this.forceExitApp, this);
        this.registerHandler('exitApp', this.exitApp, this);

        this.registerHandler('buttonPress', this.handleButtonPress, this);

        $(document).keydown(function(e){
            _this.trigger('buttonPress', e.keyCode);
        });
    };

    exports.AppController = AppController;
})(window);
