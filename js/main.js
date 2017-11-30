$(document).ready(function() {
    loadTemplates().then(function(){
        $.when(
            // Get dependencies
            $.getScript("lib/ZypeEndpoints.js"),
            $.getScript("lib/ZypeJSBase.js"),
            $.getScript("lib/EventsHandler.js"),

            $.getScript("js/helpers/zype-api-helpers.js"),

            $.getScript("js/models/TvKeys.js"),
            $.getScript("js/models/VideoModel.js"),
            $.getScript("js/models/PlaylistModel.js"),

            $.getScript("js/controllers/AppController.js"),
            $.getScript("js/controllers/MediaGridController.js"),

            $.getScript("js/views/MediaGridView.js")
        ).then(function() {
            var app = new AppController();
            app.init({});
        });
    });
});
