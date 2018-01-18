(function(exports){
    "use strict";

	/**
	 * Used for user credential input (signin or signup)
	 */ 
    var CredentialsInputView = function(){
		EventsHandler.call(this, ["loadComplete" , "show", "hide", "close", "blurInputs", "focusInput", "setInput", "focusConfirm", "unfocusConfirm", "highlightInput", "removeHightlights"]);
		var _this = this;

		var templateId = "#credentials-input-view-template";
		var containerId = "#credentials-input-container";

		this.id = null;

		this.title = null;
		this.confirmButton = null;

		this.email = null;
		this.password = null;
		
		/**
		 * Initialization
		 */
		this.init = function(args){
			this.title 			= args.title;
			this.confirmButton 	= args.confirmButton;

			this.id = args.id;

			var context = {
				title: 			this.title,
				confirmButton: 	this.confirmButton,
				css: {
					classes: 	{ theme: appDefaults.theme },
					ids: 		{ id: this.id }
				}
			};

			var template = $(templateId);
			var renderedTemplate = Utils.buildTemplate(template, context);
			$(containerId).append(renderedTemplate);
			
            this.trigger("loadComplete");
		};

		/**
		 * Getters
		 */ 
		this.getCurrentValues = function(){
			this.email 		= $(this.id + " .email-input").val();
			this.password 	= $(this.id + " .password-input").val();

			return {
				email: this.email,
				password: this.password
			};
		};

		this.isInputFocused = function(){
			$(this.id + " input").each(function(){
				var isFocused = $(this).is(":focus");
				if (isFocused){ return isFocused; }
			});

			return false;
		};

		/**
		 * Update Inputs
		 */
		this.blurInputs = function(){
			$(this.id + " input").blur();
		};

		this.removeHighlights = function(){
			$(this.id + " input").removeClass("highlight");
		};

		this.highlightInput = function(inputType){
			this.removeHighlights();

			if (inputType == "email"){
				$(this.id + " input.email-input").addClass("highlight");
			} else if (inputType == "password"){
				$(this.id + " input.password-input").addClass("highlight");
			}
		};

		this.focusInput = function(inputType){
			this.blurInputs();
			this.removeHightlights();
			this.unfocusConfirmButton();

			if (inputType == "email"){
				$(this.id + " input.email-input").focus();
			} else if (inputType == "password") {
				$(this.id + " input.password-input").focus();
			}
		};

		this.setInput = function(inputType, value){
			if (inputType == "email"){
				$(this.id + " input.email-input").val(value);
			} else if (inputType == "password"){
				$(this.id + " input.password-input").val(value);
			}
		};

		/**
		 * Update confirmation button
		 */
		this.focusConfirmButton = function(){
			this.blurInputs();
			this.removeHightlights();
			$(this.id + " .confirm-button").addClass("focused");
		};

		this.unfocusConfirmButton = function(){
			this.blurInputs();
			this.removeHightlights();
			$(this.id + " .confirm-button").removeClass("focused");
		};

		/**
		 * show / hide / remove self from DOM
		 */ 
		this.show = function(){
			this.blurInputs();
			this.removeHighlights();
			this.highlightInput("email");

			$(this.id).removeClass("invisible");
		};

		this.hide = function(){
			$(this.id).addClass("invisible");
		};

		this.close = function(){
			$(this.id).remove();
		};

		/**
		 * Register event handlers
		 */ 
		this.registerHandler("loadComplete", this.show, this);
		this.registerHandler("show", this.show, this);
		this.registerHandler("hide", this.hide, this);
		this.registerHandler("close", this.close, this);
		this.registerHandler("blurInputs", this.blurInputs, this);
		this.registerHandler("focusInput", this.focusInput, this);
		this.registerHandler("setInput", this.setInput, this);
		this.registerHandler("focusConfirm", this.focusConfirmButton, this);
		this.registerHandler("unfocusConfirm", this.unfocusConfirmButton, this);
		this.registerHandler("highlightInput", this.highlightInput, this);
		this.registerHandler("removeHightlights", this.removeHighlights, this);
	};

	if (!exports.CredentialsInputView) { exports.CredentialsInputView = CredentialsInputView; };
})(window);
