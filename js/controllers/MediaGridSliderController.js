(function(exports){
  "use strict";

  let MediaGridSliderController = function(){
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

    let mediaGridCss = id => {
      return {
        classes: { theme: appDefaults.theme },
        ids: { id: "media-grid-container-" + id}
      };
    };

    let navigationCss = id => {
      return {
        classes: { theme: appDefaults.theme },
        ids: { id: "navigation-view-" + id}
      };
    };

    this.playlistLevel = null;
    this.mediaContent = [];
    this.sliders = [];

    this.controllerIndex = null;

    this.gridView = null;
    this.navView = null;
    this.confirmExitView = null;

    const ViewIndexes = {
      NAVIGATION: 0,
      MEDIA_GRID: 1,
      CONFIRM_DIALOG: 2
    };

    this.viewIndex = null;

    /**
     * Callbacks
     */
    this.createController = null;
    this.removeSelf = null;

    /**
     * Initialization
     */ 
    this.init = options => {
      showSpinner();

      let args = options.args;
      let callbacks = options.callbacks;

      this.controllerIndex = args.controllerIndex;

      this.createController = callbacks.createController;
      this.removeSelf = callbacks.removeController;

      this.playlistLevel = args.playlistLevel;
      if (args.sliders) this.sliders = this.parsedSliders(args.sliders);

      // fetch playlist and video content
      ZypeApiHelpers.getPlaylistChildren(zypeApi, args.playlistId)
      .then(
        resp  => { 
          if (resp) _this.trigger("loadComplete", resp);
        },
        err   => {  this.removeSelf(); }
      );

    };

    /**
     * Update view
     */
    this.hide = () => {
      // this.navView.trigger("hide");
      this.gridView.trigger("hide");
    };
    this.show = () => {
      // this.navView.trigger("show");
      this.gridView.trigger("show");
    };
    this.close = () => {
      if (this.gridView) {
        this.gridView.trigger("close");
        this.gridView = null;
      }

      if (this.confirmExitView) {
        this.confirmExitView.trigger("close");
        this.confirmExitView = null;
      }

      // if (this.navView) {
      //   this.navView.trigger("close");
      //   this.navView = null;
      // }
    };

    /**
     * Handle network disconnect/reconnect
     */
    this.handleNetworkDisconnect = () => {};
    this.handleNetworkReconnect = () => {};

    this.handleData = data => {
      this.mediaContent = data;
      this.viewIndex = ViewIndexes.MEDIA_GRID;

      let createViewCallback = () => {
        this.createView();

        // TODO: remove in future when adding nav bar back
        this.gridView.setFocus();

        // this.viewIndex = ViewIndexes.NAVIGATION;
        // this.navView.focusTab();

        // if deep linked, try to show video else, else show self
        if(exports.deepLinkedData) {
          let parsedData = JSON.parse(exports.deepLinkedData);

          zypeApi.getVideo(parsedData.videoId, {})
          .then(
            resp => {
              // _this.navView.trigger("hide");
              _this.gridView.trigger("hide");
              _this.createController(VideoDetailsController, { video: resp.response });
            },
            err => { hideSpinner(); }
          );
        } else {
          hideSpinner();
        }
      };

      // Get playlist_bg_color
      zypeApi.getZObjects("playlist_bg_color", {
        "per_page": 500
      }).then(
        resp => {
          _this.playlistColors = resp.response;
          
          for (let i = 0; i < _this.mediaContent.length; i++) {
            const playlist = _this.mediaContent[i];
            const playlistColorObj = resp.response.find((colorObj) => { return colorObj.playlist_id == playlist.id });

            if (playlistColorObj) _this.mediaContent[i].colorObj = playlistColorObj;
          }

          createViewCallback();
        },
        err => {
          createViewCallback();
        }
      );
    };

    this.createView = () => {
      let structuredData = this.structuredData(this.mediaContent);

      let gridViewArgs = {
        mediaContent: structuredData,
        sliders: this.sliders,
        playlistLevel: this.playlistLevel,
        css: mediaGridCss(this.playlistLevel)
      };

      let gridView = new MediaGridSliderView();
      gridView.init(gridViewArgs);
      this.gridView = gridView;

      // let navViewArgs = { css: navigationCss(this.playlistLevel) };
      
      // let navView = new NavigationView();
      // navView.init(navViewArgs);
      // this.navView = navView;


      let dialogViewArgs = {
        id: "controller-" + String(this.controllerIndex) + "-dialog",
        text: "Do you wish to exit the app?",
        confirmText: "Okay",
        cancelText: "Cancel"
       };

       let dialogView = new ConfirmDialogView();
       dialogView.init(dialogViewArgs);
       this.confirmExitView = dialogView;
    };

    /**
     * Button Presses
     */ 
    this.handleButtonPress = buttonPress => {
      let currentPos = this.gridView.currentPosition;
      let currentRowContent = this.mediaContent[currentPos[0]].content;

      switch (buttonPress) {
        case TvKeys.UP:
          let gridCanMoveUp = (currentPos && currentPos[0] - 1 > -1);

          if (this.viewIndex == ViewIndexes.CONFIRM_DIALOG) {
            // do nothing
          } else if (gridCanMoveUp) {
            // not at top row of grid view
            this.gridView.shiftRowsDown();
            this.gridView.currentPosition = this.getNewPosition(buttonPress);
            this.gridView.resetRowMarginAt(this.gridView.currentPosition[0]);
            this.gridView.setFocus();
          
          // cannot go up in grid view. focus the nav bar
          } 
          // else {
          //   this.gridView.unfocusThumbnails();
            
          //   this.viewIndex = ViewIndexes.NAVIGATION;
          //   this.navView.focusTab();
          // }
          break;

        case TvKeys.DOWN:
          let gridCanMoveDown = (currentPos && currentPos[0] + 1 < this.mediaContent.length);

          // if (this.viewIndex == ViewIndexes.NAVIGATION) {
          //   this.navView.unfocusTabs();

          //   this.viewIndex = ViewIndexes.MEDIAGRID;
          //   this.gridView.setFocus();

          // } else if ((this.viewIndex == ViewIndexes.MEDIAGRID) &&  gridCanMoveDown) {

          if (this.viewIndex == ViewIndexes.CONFIRM_DIALOG) {
            // do nothing
          } else if (gridCanMoveDown) {

            this.gridView.shiftRowsUp();
            this.gridView.currentPosition = this.getNewPosition(buttonPress);
            this.gridView.resetRowMarginAt(this.gridView.currentPosition[0]);
            this.gridView.setFocus();
          }
          break;

        case TvKeys.LEFT:
          let gridCanMoveLeft = (currentPos[1] - 1 >= 0);

          // if (this.viewIndex == ViewIndexes.NAVIGATION) {
          //   this.navView.decrementTab();
          // } else if ((this.viewIndex == ViewIndexes.MEDIAGRID) && gridCanMoveLeft) {
          if (this.viewIndex == ViewIndexes.CONFIRM_DIALOG) {
            this.confirmExitView.trigger("focusConfirm");
          } else if (gridCanMoveLeft) {
            this.gridView.unfocusThumbnails();
            this.gridView.currentPosition = this.getNewPosition(buttonPress);
            this.gridView.setFocus();

            if (this.gridView.focusedThumbTouchesEdge()) {
              this.gridView.shiftRowRightAt(this.gridView.currentPosition[0]);

              // if column index is 1 or less, reset margin
              if (currentPos[1] <= 1) this.gridView.resetRowMarginAt(this.gridView.currentPosition[0]);
            }
          }

          break;

        case TvKeys.RIGHT:
          let gridCanMoveRight = (currentPos[1] + 1 < currentRowContent.length );

          // if (this.viewIndex == ViewIndexes.NAVIGATION) {
          //   this.navView.incrementTab();
          // } else if ((this.viewIndex == ViewIndexes.MEDIAGRID) && gridCanMoveRight) {
          if (this.viewIndex == ViewIndexes.CONFIRM_DIALOG) {
            this.confirmExitView.trigger("focusCancel");
          } else if (gridCanMoveRight) {
            this.gridView.unfocusThumbnails();
            this.gridView.currentPosition = this.getNewPosition(buttonPress);
            this.gridView.setFocus();

            if (this.gridView.focusedThumbTouchesEdge()) {
              this.gridView.shiftRowLeftAt(this.gridView.currentPosition[0]);
            }
          }
          break;

        case TvKeys.ENTER:

          // // Nav View
          // if (this.viewIndex == ViewIndexes.NAVIGATION) {
          //   let currentTab = this.navView.currentTab();

          //   if (currentTab.role == "home") {
          //     this.navView.unfocusTabs();
          //     this.viewIndex = ViewIndexes.MEDIAGRID;
          //     this.gridView.setFocus();
          //   } else if (currentTab.role == "account") {
          //     let controllerArgs = {};
          //     this.createController(AccountController, controllerArgs);
          //   }


          if (this.viewIndex == ViewIndexes.CONFIRM_DIALOG) {
            let exitApp = this.confirmExitView.value;

            if (exitApp) {
              // AppController exits app if no more controllers
              this.removeSelf();
            } else {
              this.confirmExitView.trigger("hide");
              this.viewIndex = ViewIndexes.MEDIA_GRID;
              this.gridView.setFocus();
            }
          // // Grid View
          } else if (this.viewIndex == ViewIndexes.MEDIA_GRID) {

            let itemSelected = this.focusedContent();

            if (itemSelected.content){
              this.gridView.trigger("hide");

              if (itemSelected.contentType == "videos"){
                this.createController(VideoDetailsController, {
                  video: itemSelected.content
                });
              } else if (itemSelected.contentType == "playlists") {
                this.createController(MediaGridSliderController, {
                  playlistLevel: this.playlistLevel + 1,
                  playlistId: itemSelected.content._id
                });
              }
            }

          }
          break;

        case TvKeys.RETURN:
        case TvKeys.BACK:
          if (this.controllerIndex == 0 && (this.viewIndex != ViewIndexes.CONFIRM_DIALOG)) {
            this.viewIndex = ViewIndexes.CONFIRM_DIALOG;
            this.confirmExitView.trigger("show");
          } else if (this.controllerIndex == 0) {
            this.viewIndex = ViewIndexes.MEDIA_GRID;
            this.confirmExitView.trigger("hide");
          } else {
            this.removeSelf();
          }

          break;

        default:
          break;
      }
    };


    /**
     * Helpers
     */
    this.structuredData = mediaContent => {
      let structuredData = [];

      for (let i = 0; i < mediaContent.length; i++) {
        let row = {
          title: mediaContent[i].title,
          type: mediaContent[i].type,
          thumbnailLayout: mediaContent[i].thumbnailLayout,
          content: [],
          colorObj: mediaContent[i].colorObj
        };

        if (mediaContent[i].type == "videos"){
          for (let x = 0; x < mediaContent[i].content.length; x++) {
            let video = new VideoModel(mediaContent[i].content[x]);
            row.content.push(video);
          }
        } else if (mediaContent[i].type = "playlists") {
          for (let x = 0; x < mediaContent[i].content.length; x++) {
            let playlist = new PlaylistModel(mediaContent[i].content[x]);
            row.content.push(playlist)
          }
        }

        structuredData.push(row);
      }

      return structuredData;
    };

    this.getNewPosition = dir => {
      if(this.gridView){
        let currPos = null;
        switch (dir) {
          case TvKeys.UP:
            currPos = this.gridView.currentPosition;
            currPos[0] = currPos[0] - 1;
            currPos[1] = 0;
            return currPos;
          case TvKeys.DOWN:
            currPos = this.gridView.currentPosition;
            currPos[0] = currPos[0] + 1;
            currPos[1] = 0;
            return currPos;
          case TvKeys.LEFT:
            currPos = this.gridView.currentPosition;
            currPos[1] = currPos[1] - 1;
            return currPos;
          case TvKeys.RIGHT:
            currPos = this.gridView.currentPosition;
            currPos[1] = currPos[1] + 1;
            return currPos;
          default:
            return this.gridView.currentPosition;
        }
      }
    };

    this.focusedContent = () => {
      let currentPosition = this.gridView.currentPosition;
      return {
        content: this.mediaContent[currentPosition[0]].content[currentPosition[1]],
        contentType: this.mediaContent[currentPosition[0]].type
      };
    };

    // Accept array of sliders and only return valid ones (has video or playlist id)
    this.parsedSliders = sliders => {
      let validSliders = [];
      for (let i = 0; i < sliders.length; i++) {
        if (sliders[i].videoid || sliders[i].playlistid) validSliders.push(sliders[i]);
      }
      return validSliders;
    };

    this.enterBackgroundState = () => {};
    this.returnBackgroundState = () => {};

    /**
     * Register event handlers
     */ 
    this.registerHandler("loadComplete", this.handleData, this);
    this.registerHandler("buttonPress", this.handleButtonPress, this);
    this.registerHandler("show", this.show, this);
    this.registerHandler("hide", this.hide, this);
    this.registerHandler("close", this.close, this);
    this.registerHandler("networkDisconnect", this.handleNetworkDisconnect, this);
    this.registerHandler("networkReconnect", this.handleNetworkReconnect, this);
    this.registerHandler("enterBackgroundState", this.enterBackgroundState, this);
    this.registerHandler("returnBackgroundState", this.returnBackgroundState, this);
  };

  exports.MediaGridSliderController = MediaGridSliderController;
})(window);
