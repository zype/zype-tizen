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
            }
        };

        this.addMediaContent = function(playlistId, playlistLevel){
            ZypeApiHelpers.getPlaylistChildren(this.zypeApi, playlistId).then(function(data){
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
