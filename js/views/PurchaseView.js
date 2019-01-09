(function(exports){
  "use strict";

  let PurchaseView = function(){
    EventsHandler.call(this, [
      "loadComplete",
      "show",
      "hide",
      "close"
    ]);

    let _this = this;

    this.video = null;
    this.products = [];

    // MARK: - HTML ids
    let templateId = "#purchase-view-template";
    let purchaseContainerId = "#purchase-container";

    this.id = null;
    
    this.init = args => {
      this.video = args.video;
      this.products = args.products;

      let id = "purchase-view";
      this.id = "#" + id;

      let context = {
        video: this.video,
        products: this.products,
        css: {
          classes: { theme: appDefaults.theme },
          ids: { id: id }
        }
      };

      let template = $(templateId);
      let renderedTemplate = Utils.buildTemplate(template, context);
      $(purchaseContainerId).append(renderedTemplate);

      this.trigger("loadComplete");
    };

    // MARK: - Update view state
    this.show = () => $(this.id).removeClass("invisible"); 
    this.hide = () => $(this.id).addClass("invisible");
    this.close = () => $(this.id).remove();

    this.registerHandler("loadComplete", this.show, this);
    this.registerHandler("show", this.show, this);
    this.registerHandler("hide", this.hide, this);
    this.registerHandler("close", this.close, this);
  };

  if (!exports.PurchaseView) { exports.PurchaseView = PurchaseView; };
})(window);
