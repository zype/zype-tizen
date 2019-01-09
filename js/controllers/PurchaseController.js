(function(exports){
  "use strict";

  let PurchaseController = function(){
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
    this.video = null; // video that triggered purchase flow
    this.products = [];

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
      this.video = args.video;

      this.createController = callbacks.createController;
      this.removeSelf = callbacks.removeController;

      let successCb = resp => {
        this.createView();
      };
      let errorCb = resp => {
        this.removeSelf();
      };

      this.fetchAssociatedProducts(successCb, errorCb);
    };

    /**
     * Private Helpers
     */

    // fetchAssociatedProducts() - finds products associated with video and creates view if success
    this.fetchAssociatedProducts = (successCallback, errCallback) => {
      if (this.video) {
        // list support monetizations
        let subRequired = this.video.subscription_required;

        let productsCb = resp => {
          if (resp.ItemDetails && resp.ItemDetails.length > 0) {
            let products = [];

            for (let i = 0; i < resp.ItemDetails.length; i++) {
              let product = resp.ItemDetails[i];
              if (subRequired && product.ItemType == 4) products.push(product);
            }

            this.products = products;

            successCallback();
          } else {
            errCallback();
          }
        };

        // only works when running on device
        NativeMarket.requestProducts(appDefaults.marketplace, productsCb, errCallback);

      } else {
        errCallback();
      }
    };

    this.createView = () => {
      let viewArgs = {
        video: this.video,
        products: this.products
      };

      let view = new PurchaseView();
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
      this.view.close();
      this.view = null;
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

  if (!exports.PurchaseController) { exports.PurchaseController = PurchaseController; };
})(window);
