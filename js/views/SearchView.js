(function(exports){
  "use strict";

  let SearchView = function(){
    EventsHandler.call(this, [
      "loadComplete",
      "show",
      "hide",
      "close",
      "focusButton"
    ]);

    let _this = this;

    // MARK: - HTML ids
    let templateId = "#search-view-template";
    let searchContainerId = "#search-container";

    this.id = null;

    this.init = args => {
      let id = "search-view";
      this.id = "#" + id;

      let context = {
        css: {
          classes: { theme: appDefaults.theme },
          ids: { id: id }
        },
        appIconUrl: appDefaults.appIconUrl
      };

      let template = $(templateId);
      let renderedTemplate = Utils.buildTemplate(template, context);
      $(searchContainerId).append(renderedTemplate);

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
    this.registerHandler("focusButton", this.focusButtonAt, this);
  };

  if (!exports.SearchView) { exports.SearchView = SearchView; };
})(window);
