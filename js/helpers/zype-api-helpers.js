(function(exports){
  "use strict";

  let ZypeApiHelpers = function(){
    let _this = this;

    this.findPlanByMarketplaceId = (zypeApi, marketplace, productId) => {
      return new Promise((resolve, reject) => {
        let params = { "per_page": 500 };

        zypeApi.getPlans(params)
        .then(
          resp => {
            let plans = resp.response;
            let matchingPlan;

            for (let i = 0; i < plans.length; i++) {
              const plan = plans[i];
              if (plan.marketplace_ids && plan.marketplace_ids[marketplace] == productId) {
                matchingPlan = plan;
                break;
              }
            }

            if (matchingPlan) {
              resolve(matchingPlan);
            } else {
              reject(null);
            }
          },
          err => {
            reject(null);
          }
        );
      });
    };

    this.searchVideos = (zypeApi, query, playlistId) => {
      return new Promise((resolve, reject) => {
        let params = {
          "q": query,
          "per_page": 500,
          "playlist_id.inclusive": playlistId || ""
        };

        zypeApi.getVideos(params)
        .then(
          resp => {
            let videos = resp.response;
            resolve(videos);
          },
          err => { // error. return empty array
            resolve([]);
          }
        );
      });
    };

    // find the consumer id then get consumer info
    this.getConsumer = (zypeApi, accessToken) => {
      return new Promise((resolve, reject) => {
        zypeApi.getAccessTokenStatus(accessToken)
        .then(
          tokenStatus => {
            let consumerId = tokenStatus.resource_owner_id;
            if (consumerId) {
              zypeApi.getConsumer(consumerId, accessToken, {})
              .then(
                consumerResp => resolve(consumerResp.response),
                err => reject(err)
              );
            } else {
              reject(null);
            }
          },
          err => reject(err)
        );
      });
    };

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
    }; // getPlaylistChildren()
  };

  exports.ZypeApiHelpers = new ZypeApiHelpers();
})(window);
