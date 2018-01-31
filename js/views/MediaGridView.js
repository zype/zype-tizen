(function(exports) {
	"use strict";

	let MediaGridView = function() {
		EventsHandler.call(this, [
			"loadComplete",
			"show",
			"hide",
			"moveIndex",
			"close"
		]);

		let _this = this;

		// id of handlebars template
		let templateId = "#media-grid-view-template";
		// id of div to attach view to
		let mediaGridContainerId = "#media-grid-container";

		this.id = null;   // id of view once attached to DOM
		this.currentPosition = [];
		this.currentRowsTopPosition = null;
		this.rowsLeftPositions = [];

		// used in view's id, so DOM can be manipulated
		this.mediaContent = null;

		/**
		 * Initialization
		 */ 
		this.init = args => {
			this.mediaContent = args.mediaContent;
			// TODO: delete later if playlist level is not being used
			this.playlistLevel = args.playlistLevel;
			this.currentPosition = [0, 0];
			this.currentRowsTopPosition = 0;

			for (let i = 0; i < this.mediaContent.length; i++) {
				this.rowsLeftPositions.push(0);
			}

			this.id = "#" + args.css.ids.id;

			let context = {
				rowData: this.mediaContent,
				css: args.css,
				images: {
					appIcon: appDefaults.appIconUrl
				}
			};

			let template = $(templateId);
			let renderedTemplate = Utils.buildTemplate(template, context);
			$(mediaGridContainerId).append(renderedTemplate);

			this.trigger("loadComplete");
		};

		this.prepareView = () => {
			if (this.focusedContent()){
				this.focusCurrentThumbnail();
			}
			this.updateFocusedInfoDisplay();
			this.show();
		};

		/**
		 * Button Press
		 */ 
		this.handleButtonPress = buttonPress => {
			let myText = "TizenKey: " + TvKeys[buttonPress] + "\n";
			myText += "buttonPress: " + buttonPress;
			$(this.id + " .focused-content-info-description").text(myText);
		};


		/**
		 * Helpers
		 */ 
		this.focusedContent = () => {
			if (!this.mediaContent) {
				return null;
			} else {
				let row = this.currentPosition[0];
				let col = this.currentPosition[1];
				return this.mediaContent[row].content[col];
			}
		};

		this.focusSmallThumbnail = () => {
			$(this.id + " .media-grid-thumbnail").each( (index, value) => {
				let thumbnailFocused = $(value).hasClass("focused-thumbnail");
				if (thumbnailFocused) $(value).removeClass("focused-thumbnail");
			});

			let currentRow = $(this.id + " .media-grid-row")[this.currentPosition[0]];
			let currentThumbnail = $(currentRow).find(".media-grid-thumbnail")[this.currentPosition[1]];
			$(currentThumbnail).addClass("focused-thumbnail");
		};

		this.focusLargeThumbnail = () => {
			let focusedContent = this.focusedContent();
			let rowNum = this.currentPosition[0];

			let largeThumb = $(this.id + " .large-thumbnail");            

			if (focusedContent){
				let thumbnailLayout = this.mediaContent[rowNum].thumbnailLayout;

				if (thumbnailLayout && thumbnailLayout == "poster"){
					largeThumb.attr("src", focusedContent.posterThumbnailUrl);
				} else {
					largeThumb.attr("src", focusedContent.largeThumbnailUrl);
				}
			} else {
				largeThumb.attr("src", appDefaults.thumbnailUrl);
			}
		};

		this.getRowHeightAtIndex = index => {
			let nextRow = $(this.id + " .media-grid-row")[index];
			return $(nextRow).height();
		};

		this.getFocusedThumbnailInfo = () => {
			let focusedThumbnail = $(this.id + " .focused-thumbnail")[0];

			if (focusedThumbnail) {
				let focusedThumbnailInfo = {
					height: $(focusedThumbnail).height(),
					width: $(focusedThumbnail).width(),
					top: $(focusedThumbnail).position().top,
					left: $(focusedThumbnail).position().left
				};
				return focusedThumbnailInfo;
			} else {
				return null;
			}
		};

		/**
		 * Update DOM
		 */ 
		this.focusCurrentThumbnail = () => {
			this.focusSmallThumbnail();
			this.focusLargeThumbnail();
		};

		this.hideRowsAboveLimit = () => {
			$(this.id + " .media-grid-row").each( (index, value) => {
				let row = $(value);
				if (row.hasClass("invisible")){
					$(value).removeClass("invisible");
				}

				if ($(value).position().top < 0){
					$(value).addClass("invisible");
				}
			});
		};

		this.updateFocusedInfoDisplay = () => {
			let focusedContent = this.focusedContent();
			let title = "";
			let description = "";

			if (focusedContent){
				title = focusedContent.title;
				description = focusedContent.description;
			}

			$(this.id + " .focused-content-info-title").text(title);
			$(this.id + " .focused-content-info-description").text(description);
		};

		this.updateRowsTopPercentage = percent => {
			this.currentRowsTopPosition = percent;
			$(this.id + " .media-grid-rows-container").css({top: String(percent) + "px"});
			this.hideRowsAboveLimit();
		};

		this.shiftRowAtIndex = (rowIndex, dir) => {
			let row = $(this.id + " .media-grid-row .media-grid-row-thumbnails-container")[rowIndex];
			let focusedThumb = $(row).find(".media-grid-thumbnail")[0];
			let thumbnailWidth = (2 * $(focusedThumb).width() / $(window).width()) * 100;

			if (dir == TvKeys.RIGHT){
				let newLeftPosition = this.rowsLeftPositions[rowIndex] + thumbnailWidth;

				this.rowsLeftPositions[rowIndex] = newLeftPosition;
				$(row).css({ "margin-left": String(newLeftPosition) + "%" });
			} else if (dir == TvKeys.LEFT) {
				let newLeftPosition = this.rowsLeftPositions[rowIndex] - thumbnailWidth;

				this.rowsLeftPositions[rowIndex] = newLeftPosition;
				$(row).css({ "margin-left": String(newLeftPosition) + "%" });
			}
		};

		this.resetRowMarginAtIndex = index => {
			let row = $(this.id + " .media-grid-row .media-grid-row-thumbnails-container")[index];
			$(row).css({ "margin-left": "0px" });
		};

		/**
		 * show / hide / close self
		 */ 
		this.show = () => $(this.id).removeClass("invisible");
		this.hide = () => $(this.id).addClass("invisible");
		this.close = () => $(this.id).remove();


		/**
		 * Register event handlers
		 */ 
		this.registerHandler("show", this.show, this);
		this.registerHandler("hide", this.hide, this);
		this.registerHandler("close", this.close, this);
		this.registerHandler("loadComplete", this.prepareView, this);
	};

	if (!exports.MediaGridView) exports.MediaGridView = MediaGridView;
})(window);
