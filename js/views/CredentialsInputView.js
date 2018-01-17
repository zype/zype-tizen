(function(exports){
    "use strict";

	/**
	 * Used for user credential input (signin or signup)
	 */ 
    var CredentialsInputView = function(){
		EventsHandler.call(this, ["loadComplete", "show", "hide", "close"]);
		var _this = this;

		var templateId = "#credentials-input-view-template";
		var containerId = "#credentials-input-container";

		this.id = null;

		this.title = null;
		this.confirmButtonText = null;

		this.email = null;
		this.password = null;
		
		this.init = function(args){
			// TODO: set this.id

			// TODO: create view

            this.trigger("loadComplete");
		};

		this.show = function(){
			$(this.id).removeClass("invisible");
		};

		this.hide = function(){
			$(this.id).addClass("invisible");
		};

		this.close = function(){
			$(this.id).remove();
		};

		this.registerHandler("loadComplete", this.show, this);
		this.registerHandler("show", this.show, this);
		this.registerHandler("hide", this.hide, this);
		this.registerHandler("close", this.close, this);
	};

	if (!exports.CredentialsInputView) { exports.CredentialsInputView = CredentialsInputView; };
})(window);
