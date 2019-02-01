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
    const templateId = "#favorites-view-template";
    const favoritesContainerId = "#favorites-container";
    const favoritesHolderClass = " .favorites-holder";
    const favoritesInfoClass = " .favorites-info";
    const signInBtnClass = " .sign-in-button";
    const helperMsgClass = " .helper-message";

    this.id = null;

    this.favorites = null; // array of video objects
    this.signedIn = null;  // bool

    /**
     * Initialization
     */
    this.init = args => {
      const id = "favorites-view";
      this.id = "#" + id;

      this.setSignedIn(args.signedIn);

      const context = {
        css: {
          classes: { theme: appDefaults.theme },
          brandColor: appDefaults.brandColor,
          ids: { id: id }
        }
      };

      const template = $(templateId);
      const renderedTemplate = Utils.buildTemplate(template, context);
      $(favoritesContainerId).append(renderedTemplate);

      this.setFavorites(args.favorites);

      debugger;
    };

    /**
     * Private methods
     */
    const showFavorites = () => $(this.id + favoritesHolderClass).removeClass("invisible");
    const hideFavorites = () => $(this.id + favoritesHolderClass).addClass("invisible");

    const showInfo = () => $(this.id + favoritesInfoClass).removeClass("invisible");
    const hideInfo = () => $(this.id + favoritesInfoClass).addClass("invisible");

    /**
     * Update view
     */
    this.setSignedIn = signedIn => this.signedIn = signedIn;

    this.setFavorites = favs => {
      if (favs) this.favorites = favs;

      if (this.signedIn) {
        if (favs.length > 0) {
          showFavorites();
          hideInfo();
        } else {
          hideFavorites();
          this.showFavoritesHelperMsg();
        }
      } else {
        hideFavorites();
        this.showSignIn();
      }
    };

    this.showSignIn = () => {
      const signInMsg = "You need to sign in see favorites";
      $(this.id + helperMsgClass).text(signInMsg);
      $(this.id + signInBtnClass).removeClass("invisible");

      showInfo();
    };

    this.showFavoritesHelperMsg = () => {
      const favsHelperMsg = "You do not have any favorites";
      $(this.id + helperMsgClass).text(favsHelperMsg);
      $(this.id + signInBtnClass).addClass("invisible");

      showInfo();
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
