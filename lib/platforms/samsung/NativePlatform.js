(function(exports){
	"use strict";

	var NativePlatform = function(){
		this.exit = function(){
			try {
				tizen.application.getCurrentApplication().exit();
			} catch(e){}
		};

		this.isNetworkConnected = () => {
			try { 
				return webapis.network.isConnectedToGateway(); 
			} catch(e){}
		};

		this.attachNetworkChangeCallbacks = (disconnectedCallback, reconnectedCallback) => {
			try {
				let networkChangeCallback = value => {
					if (value == webapis.network.NetworkState.GATEWAY_DISCONNECTED) {
						disconnectedCallback();
					} else if (value == webapis.network.NetworkState.GATEWAY_CONNECTED) {
							reconnectedCallback();
					}
				};

				webapis.network.addNetworkStateChangeListener(networkChangeCallback);
			} catch(e){}
		};
	};

	exports.NativePlatform = new NativePlatform();
})(window);