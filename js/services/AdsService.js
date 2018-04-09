(function(exports){
	"use strict";

	var AdsService = function(){
		var _this = this;

		this.adContainerId = "ads-container";
		this.adContainer = document.getElementById(this.adContainerId);

		this.resumeVideoPlayerCallback = null;
		this.pauseVideoPlayerCallback = null;

		this.adsManager = null;

		this.showAdPlayer = () => { 
			$("#" + this.adContainerId).removeClass("invisible"); 
		};
		this.hideAdPlayer = () => { 
			$("#" + this.adContainerId).addClass("invisible"); 
		};

		// MARK: - Ad request event handlers
		// onAdError() handles the error from requested ad
		this.onAdError = adErrorEvent => {
			console.log(adErrorEvent.getError());
			this.hideAdPlayer();

			// resume video
			this.resumeVideoPlayerCallback();

			try {
				if (this.adsManager) this.adsManager.destroy();
			} catch(e) {
				console.log(e)
			}
		};

		// onPauseRequested() pauses the video player using callback passed in requestAd()
		this.onPauseRequested = () => {
			try {
				console.log("Pausing for ad...");
				this.showAdPlayer();
				this.pauseVideoPlayerCallback();
			} catch(e){
				console.log(e);
			}
		};

		// onResumeRequested() resumes the video player using callback passed in requestAd()
		this.onResumeRequested = () => {
			try {
				console.log("Coming back from ad...");
				this.hideAdPlayer();
				this.resumeVideoPlayerCallback();
			} catch(e){
				console.log(e);
			}
		};

		// closeAdManager() cleans up adsManager when the user is not watching video
		this.closeAdManager = () => {
			try {
				if (this.adsManager) {
					if (this.adsManager.getRemainingTime() > 0) this.adsManager.stop();
					this.adsManager.destroy();
				}
			} catch(e) { console.error(e); }
		};

		// onManagerLoaded() - creates this.adsManager when ad request is fulfilled
		this.onManagerLoaded = adsManagerLoadedEvent => {
			console.log("Ads manager loaded: ");
			console.log(adsManagerLoadedEvent);

			let video = document.createElement("video");
			this.adsManager = adsManagerLoadedEvent.getAdsManager(video);

			// attach ad event handlers
			this.adsManager.addEventListener(
				google.ima.AdErrorEvent.Type.AD_ERROR,
				_this.onAdError
			);
			this.adsManager.addEventListener(
				google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
				_this.onPauseRequested
			);
			this.adsManager.addEventListener(
				google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
				_this.onResumeRequested
			);
			this.adsManager.addEventListener(
				google.ima.AdEvent.Type.COMPLETE,
				_this.onResumeRequested
			);
			this.adsManager.addEventListener(
				google.ima.AdEvent.Type.STARTED,
				function(){ hideSpinner(); }
			);

			try {
				this.adsManager.init(window.innerWidth, window.innerHeight, google.ima.ViewMode.NORMAL);
				this.adsManager.start();
			} catch(e) {
				this.hideAdPlayer();
				this.resumeVideoPlayerCallback();
			}
		};

		// MARK: - Initialize Google IMA
		// Ads Display Container
		this.adsDisplayContainer = new google.ima.AdDisplayContainer(this.adContainer);
		this.adsDisplayContainer.initialize();

		// Ads Loader
		this.adsLoader = new google.ima.AdsLoader(this.adsDisplayContainer);
		this.adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, _this.onManagerLoaded, false);
		this.adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, _this.onAdError, false);

		/**
		 * requestAd() 
		 * @param {String} adTagUrl 
		 * @param {Function} pauseCallback
		 * @param {Function} resumeCallback
		 */
		this.requestAd = (adTagUrl, pauseCallback, resumeCallback) => {
			try {
				this.pauseVideoPlayerCallback = pauseCallback;
				this.resumeVideoPlayerCallback = resumeCallback;

				let adsRequest = new google.ima.AdsRequest();
				adsRequest.adTagUrl = adTagUrl;

				adsRequest.linearAdSlotWidth = window.innerHeight;
				adsRequest.linearAdSlotHeight = window.innerHeight;
				adsRequest.nonLinearAdSlotWidth = window.innerWidth;
				adsRequest.nonLinearAdSlotHeight = window.innerHeight * 0.375;

				this.adsLoader.requestAds(adsRequest);
			} catch(e){
				console.log(e);
			}
		};

	};

	exports.AdsService = new AdsService();
})(window);