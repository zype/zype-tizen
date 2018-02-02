(exports => {

	let cssFiles = [
		"css/style.css",
    "css/stylesheets/Spinner.css",
    "css/stylesheets/AppIcon.css",
    "css/stylesheets/MediaGrid.css",
    "css/stylesheets/VideoDetails.css",
    "css/stylesheets/Dialog.css",
    "css/stylesheets/VideoPlayer.css",
		"css/stylesheets/CredentialsInput.css",
		"css/stylesheets/Navigation.css",
		"css/stylesheets/Account.css"
	];

	for (let i = 0; i < cssFiles.length; i++) {
		let linkTag = document.createElement("link");
		linkTag.type = "text/css";
		linkTag.rel = "stylesheet";
		linkTag.href = cssFiles[i];
		
		$("head").append(linkTag);
	}


})(window);