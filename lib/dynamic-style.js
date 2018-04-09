(function(){
	var appOverlay = document.getElementById("app-overlay");
	var networkText = document.getElementById("network-status-text");
	var spinner = document.getElementById("app-loading-spinner");

	if (appDefaults.theme) {
		appOverlay.classList.add(appDefaults.theme);
		networkText.classList.add(appDefaults.theme);
	}

	if (appDefaults.brandColor) {
		spinner.style.borderTopColor = appDefaults.brandColor;
	}
})();