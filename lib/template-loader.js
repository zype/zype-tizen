(function(exports){
    var getTemplates = function(){
        var templateSources = [
            "templates/media-grid-view.html",
            "templates/video-details-view.html",
            "templates/video-player-view.html",
            "templates/dialog-view.html",
            "templates/video-player-ui-view.html",
            "templates/credentials-input-view.html"
        ];

        var getTemplate = function(templateSource){
            return $.ajax(templateSource);
        };

        var templatePromises = templateSources.map(getTemplate);

        return Promise.all(templatePromises);
    }

    function loadTemplates(){
        return new Promise(function(resolve, reject){
            getTemplates().then(
                function(tmpls){
                    for (var i = 0; i < tmpls.length; i++) {
                      $("#template-loader").append(tmpls[i]);
                    }
                    resolve(true);
                },
                function(){ reject(false); }
            )
        });
    }

    exports.loadTemplates = loadTemplates;
})(window);
