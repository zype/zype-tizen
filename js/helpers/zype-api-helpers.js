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

                    if (playlistsResp && playlistsResp.response.length > 0) {
                        var playlists = playlistsResp.response;

                        var functionCallsArray = [];
                        for (var i = 0; i < playlists.length; i++) {
                            // video playlist
                            if (playlists[i].playlist_item_count > 0){
                                functionCallsArray.push([
                                    zypeApi.getPlaylistVideos,
                                    [ playlists[i]._id, {per_page: 50} ]
                                ]);

                                playlistChildrenArray.push({
                                    type: "videos",
                                    title: playlists[i].title,
                                    thumbnailLayout: playlists[i].thumbnail_layout
                                });
                            }
                            // playlist of playlists
                            else {
                                functionCallsArray.push([
                                    zypeApi.getPlaylists,
                                    [ {parent_id: playlists[i]._id, per_page: 50, sort: "priority", order: "dsc"} ]
                                ]);

                                playlistChildrenArray.push({
                                    type: "playlists",
                                    title: playlists[i].title,
                                    thumbnailLayout: playlists[i].thumbnail_layout
                                })
                            }
                        }

                        zypeApi.callMultiple(functionCallsArray).then(function(resps){

                          for (var i = 0; i < playlistChildrenArray.length; i++) {
                              playlistChildrenArray[i].content = resps[i].response;
                          }

                          resolve(playlistChildrenArray)
                        });


                    } else {
                        zypeApi.getPlaylist(playlistId, {}).then(function(playlistResp){

                          if(playlistResp){
                              var playlist = playlistResp.response;
                              zypeApi.getPlaylistVideos(playlistId, {per_page: 50}).then(function(resp){
                                  playlistChildrenArray.push({
                                      type: "videos",
                                      title: playlist.title,
                                      thumbnailLayout: playlist.thumbnail_layout,
                                      content: resp.response
                                  });

                                  resolve(playlistChildrenArray);
                              });
                          } else {
                              reject("Unable to load content");
                          }

                        });
                    }
                });
            });
        };
    };

    exports.ZypeApiHelpers = new ZypeApiHelpers();
})(window);
