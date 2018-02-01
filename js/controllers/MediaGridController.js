(function(exports){
	"use strict";

	let MediaGridController = function(){
		EventsHandler.call(this, [
			"loadComplete",
			"buttonPress",
			"show",
			"hide",
			"close",
			"networkDisconnect",
			"networkReconnect"
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

		this.gridView = null;
		this.navigationView = null;

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

			this.createController = callbacks.createController;
			this.removeSelf = callbacks.removeController;

			this.playlistLevel = args.playlistLevel;

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
		this.hide = () => this.gridView.trigger("hide");
		this.show = () => this.gridView.trigger("show");
		this.close = () => {
			if (this.gridView) {
				this.gridView.trigger("close");
				this.gridView = null;
			}
		};

		/**
		 * Handle network disconnect/reconnect
		 */
		this.handleNetworkDisconnect = () => {};
		this.handleNetworkReconnect = () => {};

		this.handleData = data => {
			this.mediaContent = data;
			this.createView();

			// if deep linked, try to show video else, else show self
			if(exports.deepLinkedData) {
				let parsedData = JSON.parse(exports.deepLinkedData);

				zypeApi.getVideo(parsedData.videoId, {})
				.then(
					resp => {
						_this.gridView.trigger("hide");
						_this.createController(VideoDetailsController, { video: resp.response });
					},
					err => { hideSpinner(); }
				);
			} else {
				hideSpinner();
			}

			exports.deepLinkedData = null;
		};

		this.createView = () => {
			let structuredData = this.structuredData(this.mediaContent);

			let gridViewArgs = {
				mediaContent: structuredData,
				playlistLevel: this.playlistLevel,
				css: mediaGridCss(this.playlistLevel)
			};

			let gridView = new MediaGridView();
			gridView.init(gridViewArgs);
			this.gridView = gridView;

			let navViewArgs = { css: navigationCss(this.playlistLevel) };
			
			let navView = new NavigationView();
			navView.init(navViewArgs);
			this.navigationView = navView;
		};

		/**
		 * Button Presses
		 */ 
		this.handleButtonPress = buttonPress => {
			if (this.gridView){
				let canMove = null;
				switch (buttonPress) {
					case TvKeys.UP:
					case TvKeys.DOWN:
						canMove = this.canMoveVertically(buttonPress);
						if (canMove) {
							let newTopPosition = _this.getNewTopPosition(buttonPress);
							this.gridView.updateRowsTopPercentage(newTopPosition);
							this.gridView.currentPosition = this.getNewPosition(buttonPress);
							this.gridView.resetRowMarginAtIndex(this.gridView.currentPosition[0]);
							this.gridView.focusCurrentThumbnail();
							this.gridView.updateFocusedInfoDisplay();
						}
						break;
					case TvKeys.LEFT:
					case TvKeys.RIGHT:
						canMove = this.canMoveHorizontally(buttonPress);
						if (canMove) {
							this.gridView.currentPosition = this.getNewPosition(buttonPress);
							this.gridView.focusCurrentThumbnail();
							this.gridView.updateFocusedInfoDisplay();

							let focusedThumbnail =  this.gridView.getFocusedThumbnailInfo();
							let touchesEdge = this.thumbnailOnEdge(focusedThumbnail);

							if (touchesEdge){
								let rowIndex = this.gridView.currentPosition[0];
								if (buttonPress == TvKeys.LEFT){
									this.gridView.shiftRowAtIndex(rowIndex, TvKeys.RIGHT);
								} else {
									this.gridView.shiftRowAtIndex(rowIndex, TvKeys.LEFT);
								}
							}
						}
						break;

					case TvKeys.ENTER:
						let itemSelected = this.focusedContent();

						if (itemSelected.content){
							this.gridView.trigger("hide");

							if (itemSelected.contentType == "videos"){
								this.createController(VideoDetailsController, {
									video: itemSelected.content
								});
							} else if (itemSelected.contentType == "playlists") {
								this.createController(MediaGridController, {
									playlistLevel: this.playlistLevel + 1,
									playlistId: itemSelected.content._id
								});
							}
						}

						break;

					case TvKeys.RETURN:
					case TvKeys.BACK:
						this.removeSelf();
						break;
					default:
						break;
				}
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
					content: []
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

		this.canMoveVertically = dir => {
			let currentPos = this.gridView.currentPosition;
			if (dir == TvKeys.UP){
				return (currentPos && currentPos[0] - 1 > -1) ? true : false;
			} else if (dir == TvKeys.DOWN) {
				return (currentPos && currentPos[0] + 1 < this.mediaContent.length) ? true : false;
			} else {
				return false;
			}
		};

		this.canMoveHorizontally = dir => {
			let currentPos = this.gridView.currentPosition;
			let currentRowContent = this.mediaContent[currentPos[0]].content;

			if (dir == TvKeys.LEFT){
				return (currentPos[1] - 1 >= 0) ? true : false;
			} else if (dir == TvKeys.RIGHT) {
				return (currentPos[1] + 1 < currentRowContent.length ) ? true : false;
			}
		};

		this.getNewTopPosition = dir => {
			let currentTopPos = this.gridView.currentRowsTopPosition;
			if (dir == TvKeys.UP) {
				return currentTopPos + this.gridView.getRowHeightAtIndex(this.gridView.currentPosition[0]);
			} else if (dir == TvKeys.DOWN) {
				let newRowIndex = this.gridView.currentPosition[0] + 1;
				return currentTopPos - this.gridView.getRowHeightAtIndex(newRowIndex);
			}
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

		// gets info on current focused thumbnail
		// figures out if thumbnail is touching edge
		this.thumbnailOnEdge = focusedThumbnail => {
			let windowWidth = $(window).width();
			let thumbnailRightPosition = focusedThumbnail.left + (1.25 * focusedThumbnail.width);

			let touchesLeftEdge = (focusedThumbnail.left <= 0 || thumbnailRightPosition <= 0);
			let touchesRightEdge = (focusedThumbnail.left >= windowWidth || thumbnailRightPosition >= windowWidth);

			return (touchesLeftEdge || touchesRightEdge) ? true : false;
		};

		this.focusedContent = () => {
			let currentPosition = this.gridView.currentPosition;
			return {
				content: this.mediaContent[currentPosition[0]].content[currentPosition[1]],
				contentType: this.mediaContent[currentPosition[0]].type
			};
		};

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
	};

	exports.MediaGridController = MediaGridController;
})(window);
