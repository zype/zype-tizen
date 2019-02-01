(function(exports){
  "use strict";

  let FavoritesController = function(){
    EventsHandler.call(this, [
      "loadComplete",
      "buttonPress",
      "show",
      "hide",
      "close",
      "networkDisconnect",
      "networkReconnect",
      "enterBackgroundState",
      "returnBackgroundState"
    ]);

    let _this = this;

    this.controllerIndex = null;

    this.view = null;

    /**
     * Callbacks
     */
    this.createController = null; // create new controller
    this.removeSelf = null; // remove self

    this.init = options => {
      showSpinner();

      let args = options.args;
      let callbacks = options.callbacks;

      this.controllerIndex = args.controllerIndex;

      this.createController = callbacks.createController;
      this.removeSelf = callbacks.removeController;

      this.createView();
    };

    this.createView = () => {
      let viewArgs = {};

      let view = new FavoritesView();
      view.init(viewArgs);
      this.view = view;
      this.trigger("loadComplete");

      hideSpinner();
    };

    /**
     * Event Handlers
     */
    this.handleButtonPress = buttonPress => {
      switch (buttonPress) {
        case TvKeys.UP:
          break;

        case TvKeys.DOWN:
          break;

        case TvKeys.LEFT:
          break;

        case TvKeys.RIGHT:
          break
        case TvKeys.ENTER:
          break;
        case TvKeys.BACK:
        case TvKeys.RETURN:
          this.removeSelf();
          break;
        default:
          break;
      }
    };

    this.show = () => {
			this.view.trigger("show");
    };

    this.hide = () => {
      this.view.trigger("hide");
    };

    this.close = () => {
      if (this.view) {
        this.view.close();
        this.view = null;
      }
    };

    /**
     * Handle network disconnect/reconnect
     */
    this.handleNetworkDisconnect = () => {};
    this.handleNetworkReconnect = () => {};

    this.enterBackgroundState = () => {};
    this.returnBackgroundState = () => {};

    this.registerHandler("loadComplete", this.show, this);
    this.registerHandler("buttonPress", this.handleButtonPress, this);
    this.registerHandler("show", this.show, this);
    this.registerHandler("hide", this.hide, this);
    this.registerHandler("close", this.close, this);
    this.registerHandler("networkDisconnect", this.handleNetworkDisconnect, this);
    this.registerHandler("networkReconnect", this.handleNetworkReconnect, this);
    this.registerHandler("enterBackgroundState", this.enterBackgroundState, this);
    this.registerHandler("returnBackgroundState", this.returnBackgroundState, this);
  };

  if (!exports.FavoritesController) { exports.FavoritesController = FavoritesController; };
})(window);
