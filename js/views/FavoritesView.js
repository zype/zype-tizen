(function(exports){
  "use strict";

  let FavoritesView = function(){
    EventsHandler.call(this, [
      "loadComplete",
      "show",
      "hide",
      "close"
    ]);

    let _this = this;

    // MARK: - HTML ids
    let templateId = "#favorites-view-template";
    let favoritesContainerId = "#favorites-container";

    this.id = null;

    /**
     * Initialization
     */
    this.init = args => {
      let id = "favorites-view";
      this.id = "#" + id;

      let context = {
        css: {
          classes: { theme: appDefaults.theme },
          brandColor: appDefaults.brandColor,
          ids: { id: id }
        }
      };

      let template = $(templateId);
      let renderedTemplate = Utils.buildTemplate(template, context);
      $(favoritesContainerId).append(renderedTemplate);

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

  if (!exports.FavoritesView) { exports.FavoritesView = FavoritesView; };
})(window);
