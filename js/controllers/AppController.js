(function(exports){
    "use strict";

    var AppController = function(){
        EventsHandler.call(this, ['settingsLoaded',  'mediaLoaded',  'forceExitApp',  'exitApp',  'buttonPress',  'receivedPlayerInfo', 'videoFinished']);

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
            this.showContentLoadingSpinner(true);

            this.zypeApi.getApp().then(function(resp){
                if (resp){
                    _this.trigger('settingsLoaded', resp.response);
                } else {
                    _this.trigger('forceExitApp', 'App misconfigured. Exitting...');
                }
            });
        };

        /**
         * Hide content loading spinner
         */
        this.hideContentLoadingSpinner = function() {
          $('#app-loading-spinner').hide();

          if ($('#app-overlay').css('display') !== 'none') {
            $('#app-overlay').fadeOut(250);
          }
        };

        /**
         * Show content loading spinner
         * @param {Boolean} showOverlay if true show the app overlay
         */
        this.showContentLoadingSpinner = function(showOverlay) {

          $('#app-loading-spinner').show();

          if (showOverlay) {
            $('#app-overlay').show();
          }
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
                    this.showContentLoadingSpinner(true);
                    this.handleBackButtonPress();
                    break;
                  default:
                    break;
                }
            }
        };

        this.addMediaContent = function(playlistId, playlistLevel){
            ZypeApiHelpers.getPlaylistChildren(this.zypeApi, playlistId).then(
              function(data){
                _this.mediaGridContent.push(data);

                var mediaGridController = new MediaGridController();
                mediaGridController.init({
                    playlistLevel: _this.mediaGridControllersCount,
                    mediaContent: data
                });

                _this.controllers.push(mediaGridController);
                _this.mediaGridControllersCount += 1;

                // if deep linked, get video data then create VideoDetailsController
                if (window.deepLinkedData) {
                    var linkedData = JSON.parse(window.deepLinkedData);
                    var videoId = linkedData.videoId;

                    if (videoId) {
                        _this.zypeApi.getVideo(videoId, {}).then(function(resp){
                            if (resp) {
                                var lastController = _this.controllers[_this.controllers.length - 1];
                                lastController.trigger('hide');

                                var newController = new VideoDetailsController();
                                newController.init(resp.response);

                                _this.controllers.push(newController);

                                _this.hideContentLoadingSpinner();
                            } else {
                                _this.hideContentLoadingSpinner();
                            }
                        });
                    } else {
                        _this.hideContentLoadingSpinner();
                    }
                    window.deepLinkedData = null;
                // open app like normal
                } else {
                    _this.hideContentLoadingSpinner();
                }
              },

              function(){
                  var controllersCount = _this.controllers.length;
                  if (controllersCount > 0){
                      var lastController = _this.controllers[_this.controllers.length - 1];
                      lastController.trigger('show');
                  } else {
                      _this.trigger('exitApp');
                  }
              }
            );
        };

        this.handleBackButtonPress = function(){
            var lastController = _this.controllers.pop();

            // call .close if method exists
            if (lastController.close) {lastController.close()};

            _this.hideContentLoadingSpinner();

            if (_this.controllers.length == 0){
                _this.exitApp();
            } else {
                var previousController = _this.controllers[_this.controllers.length - 1];
                previousController.trigger('show');
            }
        };

        this.handleEnterButtonPress = function(){
            var controller = this.controllers[this.controllers.length - 1];
            var controllerName = controller.name;

            switch (controllerName) {
              case "MediaGridController":
                  var itemSelected = controller.focusedContent();

                  // TODO: need code for creating VideoDetailsController with view
                  if (itemSelected.content){
                        if (itemSelected.contentType == "videos"){
                            this.showContentLoadingSpinner(true);
                            var newController = new VideoDetailsController();
                            newController.init(itemSelected.content);

                            this.controllers.push(newController);

                            this.hideContentLoadingSpinner();
                        } else if (itemSelected.contentType == "playlists") {
                            this.addMediaContent(itemSelected.content._id, this.mediaGridControllersCount);
                        }
                    } else {
                        controller.trigger('show');
                    }

                  break;
              case "VideoDetailsController":
                  this.showContentLoadingSpinner(true);
                  var buttonSelected = controller.currentButton();
                  var videoId = buttonSelected.data.videoId;

                  if (buttonSelected.role == "play") {
                      this.zypeApi.getPlayer(videoId, { app_key: this.zypeApi.appKey })
                      .then(function(resp){
                          _this.trigger('receivedPlayerInfo', resp);
                      });
                  }

                  break;
                case "DialogController":
                  this.controllers.pop();

                  var lastController = this.controllers[this.controllers.length - 1];
                  lastController.trigger('show');
                  break;
              default:
                  break;
            }
        };

        this.handlePlayerRequestResp = function(resp){
            if (resp && typeof resp.response.body.outputs != "undefined"){
                var videoDetailsController = this.controllers[this.controllers.length - 1];

                var callback = _this.handleBackButtonPress;

                var videoPlayerController = new VideoPlayerController();
                this.controllers.push(videoPlayerController);
                this.controllers[this.controllers.length - 1].init({
                    videoInfo: videoDetailsController.content,
                    playerInfo: resp.response,
                    callbackFunc: callback,
                });

            } else {
                var videoDetailsController = this.controllers[this.controllers.length - 1];
                videoDetailsController.trigger('show');

                var dialogController = new DialogController();
                dialogController.init({
                    title: "Issue",
                    message: "Video playback error"
                });
                this.controllers.push(dialogController);
            }

            this.hideContentLoadingSpinner();
        };

        this.closeLastController = function(){
            var lastController = this.controllers[this.controllers.length - 1];
            lastController.close();

            this.controllers.pop();
            var currentController = this.controllers[this.controllers.length - 1];
            if (currentController){
                currentController.trigger('show');
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
        this.registerHandler('receivedPlayerInfo', this.handlePlayerRequestResp, this);
        this.registerHandler('videoFinished', this.closeLastController, this);

        $(document).keydown(function(e){
            _this.trigger('buttonPress', e.keyCode);
        });
    };

    exports.AppController = AppController;
})(window);
