(function(exports){
    "use strict";

    var AppController = function(){
        EventsHandler.call(this, [
            "settingsLoaded",
            "forceExitApp",
            "exitApp",
            "buttonPress",
            "networkDisconnect",
            "networkReconnect"
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

            zypeApi.getApp().then(
                resp  => { _this.trigger("settingsLoaded", resp.response); },
                err   => {  _this.trigger("forceExitApp", "App misconfigured. Exitting..."); }
            );
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
            _this.exitApp();
        };

        this.confirmAppExit = function(){
            var leaveApp = confirm("Do you want to leave the app?");

            if (leaveApp){ _this.exitApp(); }
        };

        /**
         * Handle network disconnect/reconnect
         */
        this.handleNetworkDisconnect = () => {
            let currentController = this.controllers[ this.controllers.length - 1 ];
            currentController.trigger("networkDisconnect");
        };

        this.handleNetworkReconnect = () => {
            let currentController = this.controllers[ this.controllers.length - 1 ];
            currentController.trigger("networkReconnect");
        };

        /**
         * Register event handlers
         */
        this.registerHandler("settingsLoaded", this.handleAppLoad, this);
        this.registerHandler("forceExitApp", this.forceAppExit, this);
        this.registerHandler("exitApp", this.confirmAppExit, this);
        this.registerHandler("buttonPress", this.handleButtonPress, this);
        this.registerHandler("networkDisconnect", this.handleNetworkDisconnect, this);
        this.registerHandler("networkReconnect", this.handleNetworkReconnect, this);


        $(document).keydown(function(e){
            let networkConnected = webapis.network.isConnectedToGateway();
            if (networkConnected) { _this.trigger("buttonPress", e.keyCode); }
        });

        try {
          webapis.network.addNetworkStateChangeListener(function(value) {
            let currentController = _this.controllers[ _this.controllers.length - 1 ];
            if (value == webapis.network.NetworkState.GATEWAY_DISCONNECTED) {
                showSpinner();
                showNetworkText();
                currentController.trigger("networkDisconnect");
            } else if (value == webapis.network.NetworkState.GATEWAY_CONNECTED) {
                hideSpinner();
                hideNetworkText();
                currentController.trigger("networkReconnect");
            }
          });

          var connectedToNetwork = webapis.network.isConnectedToGateway();
          if (!connectedToNetwork) { _this.forceExitApp("No network connection. Closing app."); }
        } catch (e) {}
    };

    exports.AppController = AppController;
})(window);
