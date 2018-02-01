(function(exports){
	"use strict";

	var NativePlatform = function(){
		let webapisDefined = !(typeof webapis === "undefined");

		this.exit = () => {
			try {
				if (webapisDefined) {
					tizen.application.getCurrentApplication().exit();
				} else {
					alert("Exiting");
				}
			} catch(e){ console.log(e); }
		};

		this.isNetworkConnected = () => {
			try {
				return (webapisDefined) ? webapis.network.isConnectedToGateway() : navigator.onLine; 
			} catch(e){ console.log(e); }
		};

		this.attachNetworkChangeCallbacks = (disconnectedCallback, reconnectedCallback) => {
			try {
				if (webapisDefined) {
					if (value == webapis.network.NetworkState.GATEWAY_DISCONNECTED) {
						disconnectedCallback();
					} else if (value == webapis.network.NetworkState.GATEWAY_CONNECTED) {
						reconnectedCallback();
					}

					webapis.network.addNetworkStateChangeListener(networkChangeCallback);
				} else {
					window.addEventListener("offline", disconnectedCallback);
					window.addEventListener("online", reconnectedCallback);
				}
			} catch(e){ console.log(e); }
		};
	};

	exports.NativePlatform = new NativePlatform();
})(window);