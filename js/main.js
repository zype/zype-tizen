"use strict";

$(document).ready(function() {
    loadTemplates().then(function(){

        var nativePlatformLibs = getNativePlatformLibs(appDefaults.platform);

        $.when(
            $.getScript(nativePlatformLibs.deepLink),
            $.getScript("js/helpers/spinner.js"),
            
            // Get dependencies
            $.getScript("lib/ZypeEndpoints.js"),
            $.getScript("lib/ZypeJSBase.js"),
            $.getScript("lib/EventsHandler.js"),

            $.getScript("js/helpers/zype-api-helpers.js"),
						$.getScript(nativePlatformLibs.nativePlatform),
						$.getScript("js/helpers/css-helpers.js"),

            // Models
            $.getScript(nativePlatformLibs.keyCodes),
            $.getScript("js/models/VideoModel.js"),
            $.getScript("js/models/PlaylistModel.js"),

						// Views
						$.getScript("js/views/NavigationView.js"),
            $.getScript("js/views/CredentialsInputView.js"),
            $.getScript("js/views/DialogView.js"),
            $.getScript("js/views/VideoPlayerView.js"),
            $.getScript("js/views/VideoDetailsView.js"),
            $.getScript("js/views/MediaGridView.js"),


						// Controllers
            $.getScript("js/controllers/SignInController.js"),
            $.getScript("js/controllers/DialogController.js"),
            $.getScript(nativePlatformLibs.nativePlayerController),
            $.getScript("js/controllers/VideoDetailsController.js"),
            $.getScript("js/controllers/MediaGridController.js"),
            $.getScript("js/controllers/AppController.js")
        ).then(function() {
            // only if deep linking required
            if (handleDeepLinkedData){ handleDeepLinkedData() };
              
            if (window.innerWidth < window.innerHeight) {
            $("#overlay-message").html("please rotate your device back to landscpe");
            $("#app-overlay").css("display", "block");
            } else {
            $("#overlay-message").html("");
            $("#app-overlay").css("display", "none");
            }

            $("body").addClass(appDefaults.theme);
            var app = new AppController();
            app.init({});
        });
    });
});
