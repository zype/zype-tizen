(function(exports){
	"use strict";

	let AccountView = function(){
		EventsHandler.call(this, [
			"loadComplete",
			"show",
			"hide",
			"close",
			"focusButton"
		]);

		let _this = this;

		// MARK: - HTML ids
		let templateId = "#account-view-template";
		let buttonsColTemplateId = "#buttons-col-template";
		let accountContainerId = "#account-container";

		this.id = null;
		
		this.init = args => {
			let id = "account-view";
			this.id = "#" + id;
			
			let context = {
				css: {
					classes: { theme: appDefaults.theme },
					ids: { id: id }
				}
			};

			let template = $(templateId);
			let renderedTemplate = Utils.buildTemplate(template, context);
			$(accountContainerId).append(renderedTemplate);

			this.trigger("loadComplete");
		};

		// MARK: - Helper Methods
		this.updateButtons = buttons => {
			let context = { buttons: buttons };

			let template = $(buttonsColTemplateId);
			let renderedTemplate = Utils.buildTemplate(template, context);
			$(this.id + " .buttons-container").html(renderedTemplate);
		};

		// MARK: - Update buttons
		this.unfocusButtons = () => {
			$(this.id + " .buttons-container .button").removeClass("focused");
		};

		/**
		 * focusButtonAt() updates the button at index
		 * @param {Integer} index - index of button to focus
		 */
		this.focusButtonAt = index => {
			let query = this.id + " .buttons-container .button[index=\'" + String(index) + "\'";
			$(query).addClass("focused");
		};

		// MARK: - Update view state
		this.show = buttons => {
			if (buttons && buttons.length > 0) this.updateButtons(buttons);
			$(this.id).removeClass("invisible"); 
		};
		this.hide = () => { $(this.id).addClass("invisible"); };
		this.close = () => { $(this.id).remove(); };

		this.registerHandler("loadComplete", this.show, this);
		this.registerHandler("show", this.show, this);
		this.registerHandler("hide", this.hide, this);
		this.registerHandler("close", this.close, this);
		this.registerHandler("focusButton", this.focusButtonAt, this);
	};

	if (!exports.AccountView) { exports.AccountView = AccountView; };
})(window);
