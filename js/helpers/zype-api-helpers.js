(function(exports){
    var ZypeApiHelpers = function(){
        var _this = this;

        this.getPlaylistChildren = function(zypeApi, playlistId){
            return new Promise(function(resolve, reject){
                var params = {
                  parent_id: playlistId,
                  per_page: 50,
                  sort: "priority",
                  order: "dsc",
                  page: 1
                };

                zypeApi.getPlaylists(params).then(function(playlistsResp){
                    var playlistChildrenArray = [];


                    if (playlistsResp) {
                        var playlists = playlistsResp.response;

                        var functionCallsArray = [];
                        for (var i = 0; i < playlists.length; i++) {
                            // video playlist
                            if (playlists[i].playlist_item_count > 0){
                                functionCallsArray.push([
                                    zypeApi.getPlaylistVideos,
                                    [ playlists[i]._id, {per_page: 50} ]
                                ]);

                                playlistChildrenArray.push({type: "videos"})
                            }
                            // playlist of playlists
                            else {
                                functionCallsArray.push([
                                    zypeApi.getPlaylists,
                                    [ {parent_id: playlists[i]._id, per_page: 50} ]
                                ]);

                                playlistChildrenArray.push({type: "playlists"})
                            }
                        }

                        zypeApi.callMultiple(functionCallsArray).then(function(resps){

                          for (var i = 0; i < playlistChildrenArray.length; i++) {
                              playlistChildrenArray[i].content = resps[i].response;
                          }

                          resolve(playlistChildrenArray)
                        });


                    } else {
                        zypeApi.getPlaylistVideos(playlistId, {per_page: 50}).then(function(resp){
                            playlistChildrenArray.push({type: "videos", content: resp.response});
                            resolve(playlistChildrenArray);
                        });
                    }
                });
            });
        };
    };

    exports.ZypeApiHelpers = new ZypeApiHelpers();
})(window);
