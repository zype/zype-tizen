(function(exports){
    "use strict";

    var AppController = function(){
        EventsHandler.call(this, [
            "settingsLoaded",
            "forceExitApp",
            "exitApp",
            "buttonPress"
        ]);

        var _this = this;

        exports.zypeApi = ZypeJSBase({
            appKey: appDefaults.appKey,
            clientId: appDefaults.clientId,
            clientSecret: appDefaults.clientSecret
        });

        exports.appState = {};

        this.controllers = [];

        /**
         * Initilize by fetching app settings
         */
        this.init = function(args){
            showSpinner();

            zypeApi.getApp().then(function(resp){
                if (resp){
                    _this.trigger("settingsLoaded", resp.response);
                } else {
                    _this.trigger("forceExitApp", "App misconfigured. Exitting...");
                }
            });
        };

        /**
         * Helpers
         */
        this.currentController = function(){
            return (this.controllers.length > 0) ? this.controllers[this.controllers.length - 1] : null;
        };

        this.createControllerCallback = function(controller, args){
            _this.createNewController(controller, args);
        };

        this.removeControllerCallback = function(){
            _this.removeCurrentController();
        };

        this.handleAppLoad = function(settings){
            // accessible from all controllers
            exports.zypeAppSettings = settings;

            var playlistId = zypeAppSettings.featured_playlist_id || appDefaults.rootPlaylistId;
            var controllerArgs = {
                playlistLevel: 0,
                playlistId: playlistId
            };

            // create first controller
            this.createNewController(MediaGridController, controllerArgs);
        };

        /**
         * Create / Remove controllers
         */
        this.createNewController = function(controller, args){
            if (this.controllers.length > 0){
                var currentController = this.currentController();
                currentController.trigger("hide");
            }

            var newController = new controller();


            newController.init({
                args: args,
                callbacks: {
                    createController: this.createControllerCallback,
                    removeController: this.removeControllerCallback
                }
            });

            this.controllers.push(newController);
        };

        this.removeCurrentController = function(){
            if (this.controllers.length > 1){
                var oldController = this.controllers.pop();
                oldController.trigger("close");

                var currentController = this.currentController();
                currentController.trigger("show");

            // only controller. confirm app exit
            } else {
                this.confirmAppExit();
            }
        };

        /**
         * Show / Hide current controller
         */
        this.showCurrentController = function(){
            var currentController = this.currentController();
            currentController.trigger("show");
        };

        this.hideCurrentController = function(){
            var currentController = this.currentController();
            currentController.trigger("hide");
        };


        /**
         * Button Presses
         */
        this.handleButtonPress = function(keyCode){
            var currentController = this.currentController();
            currentController.trigger("buttonPress", keyCode);
        };

        /**
         * Exiting
         */
        this.exitApp = function(){
            NativePlatform.exit();
        };

        this.forceAppExit = function(message){
            alert(message);
            setTimeout(_this.exitApp, 1000);
        };

        this.confirmAppExit = function(){
            var leaveApp = confirm("Do you want to leave the app?");

            if (leaveApp){ _this.exitApp(); }
        };


        /**
         * Register event handlers
         */
        this.registerHandler("settingsLoaded", this.handleAppLoad, this);
        this.registerHandler("forceExitApp", this.forceAppExit, this);
        this.registerHandler("exitApp", this.confirmAppExit, this);
        this.registerHandler("buttonPress", this.handleButtonPress, this);


        $(document).keydown(function(e){
            _this.trigger("buttonPress", e.keyCode);
        });

        try {
          webapis.network.addNetworkStateChangeListener(function(value) {
            if (value == webapis.network.NetworkState.GATEWAY_DISCONNECTED) {
                _this.forceExitApp("Internet disconnected. Closing app.");
            } else if (value == webapis.network.NetworkState.GATEWAY_CONNECTED) {
                alert("Internet reconnected");
            }
          });

          var connectedToNetwork = webapis.network.isConnectedToGateway();
          if (!connectedToNetwork) { _this.forceExitApp("No network connection. Closing app."); }
        } catch (e) {}
    };

    exports.AppController = AppController;
})(window);
