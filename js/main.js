$(document).ready(function() {
    loadTemplates().then(function(){
        $.when(
            // Get dependencies
            $.getScript("lib/ZypeEndpoints.js"),
            $.getScript("lib/ZypeJSBase.js"),
            $.getScript("lib/EventsHandler.js"),

            $.getScript("js/models/TvKeys.js"),
            $.getScript("js/models/VideoModel.js"),
            $.getScript("js/models/PlaylistModel.js"),

            $.getScript("js/views/MediaGridView.js")
        ).then(function() {
            // Run app
            
        });
    });
});
