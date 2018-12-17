(function(exports){
    "use strict";

    let ZypeApiHelpers = function(){
        let _this = this;

        this.getPlaylistChildren = (zypeApi, playlistId) => {
            return new Promise((resolve, reject) => {
                let params = {
                  parent_id: playlistId,
                  per_page: 50,
                  sort: "priority",
                  order: "dsc",
                  page: 1
                };

                zypeApi.getPlaylists(params)
                .then(
                    (playlistsResp) => {
                        let playlistChildrenArray = [];

                        if (playlistsResp && playlistsResp.response.length > 0) {
                            let playlists = playlistsResp.response;

                            let functionCallsArray = [];
                            for (let i = 0; i < playlists.length; i++) {
                                // video playlist
                                if (playlists[i].playlist_item_count > 0){
                                    functionCallsArray.push([
                                        zypeApi.getPlaylistVideos,
                                        [ playlists[i]._id, {per_page: 50} ]
                                    ]);

                                    playlistChildrenArray.push({
                                        id: playlists[i]._id,
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
                                        id: playlists[i]._id,
                                        type: "playlists",
                                        title: playlists[i].title,
                                        thumbnailLayout: playlists[i].thumbnail_layout
                                    })
                                }
                            }

                            zypeApi.callMultiple(functionCallsArray)
                            .then(
                                (resps) => {
                                    for (let i = 0; i < playlistChildrenArray.length; i++) {
                                        playlistChildrenArray[i].content = resps[i].response;
                                    }
          
                                    resolve(playlistChildrenArray)
                                },
                                (err) => {
                                    reject(err);
                                }
                            );


                        } 
                        else {
                            zypeApi.getPlaylist(playlistId, {})
                            .then(
                                (playlistResp) => {
                                    let playlist = playlistResp.response;

                                    zypeApi.getPlaylistVideos(playlistId, {per_page: 50})
                                    .then(
                                        (resp) => {
                                            playlistChildrenArray.push({
                                                type: "videos",
                                                title: playlist.title,
                                                thumbnailLayout: playlist.thumbnail_layout,
                                                content: resp.response
                                            });

                                            resolve(playlistChildrenArray);
                                        },
                                        (err) => { reject(err); }
                                    );
                                },
                                (err) => { reject(err); }
                            );
                        }
                    },
                    (err) => { reject(err); }
                );
            });
        };
    };

    exports.ZypeApiHelpers = new ZypeApiHelpers();
})(window);
