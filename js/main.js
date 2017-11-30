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
            // Run app
            // var zypejsbase = ZypeJSBase({
            //     appKey: "WxM7GGP33B68HIMJT_YqhqFUQneKEgZ3kvDIvdLGCmTB-wHtSxQfdHpHEftNc6xx",
            //     clientId: "0eec661d88f4f5b53a640a9df70e2989467f9ae1e2c7c88cfd1915e1cd89010e",
            //     clientSecret: "75c9109d13af5cfc5833978d33e1aa686bf66ff3378e9a1d629898b6e1829f86"
            // });
            //
            // ZypeApiHelpers.getPlaylistChildren(zypejsbase, "577e65c85577de0d1000c1ee")
            // .then(function(resp){
            // });

            var app = new AppController();
            app.init({});
        });
    });
});
