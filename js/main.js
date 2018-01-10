$(document).ready(function() {
    loadTemplates().then(function(){
        $.when(
            $.getScript("js/deeplink.js"),
            $.getScript("js/helpers/spinner.js"),
            
            // Get dependencies
            $.getScript("lib/ZypeEndpoints.js"),
            $.getScript("lib/ZypeJSBase.js"),
            $.getScript("lib/EventsHandler.js"),

            $.getScript("js/helpers/zype-api-helpers.js"),

            // Models
            $.getScript("js/models/TvKeys.js"),
            $.getScript("js/models/VideoModel.js"),
            $.getScript("js/models/PlaylistModel.js"),

            // Views
            $.getScript("js/views/MediaGridView.js"),
            $.getScript("js/views/VideoDetailsView.js"),
            $.getScript("js/views/DialogView.js"),
            $.getScript("js/views/VideoPlayerView.js"),


            // Controllers
            $.getScript("js/controllers/DialogController.js"),
            $.getScript("js/controllers/VideoPlayerControllerNative.js"),
            $.getScript("js/controllers/VideoDetailsController.js"),
            $.getScript("js/controllers/MediaGridController.js"),
            $.getScript("js/controllers/AppController.js")

            // don't use videojs player for now
            // $.getScript("js/controllers/VideoPlayerController.js"),

        ).then(function() {
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
