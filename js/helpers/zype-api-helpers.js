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

		this.getVideoQueries = video => {
			const maxNumOfSearches = 10;

			let searchCategories = [];
			let searchZobjects = [];

			if (video.categories.length > 0) {
				video.categories.forEach((category, index) => {
					if (searchCategories.length >= maxNumOfSearches) { return; }

					category.value.forEach((value, i) => {
						if (searchCategories.length >= maxNumOfSearches) { return; }

						let searchCategory = {
							title: category.title,
							value: value
						};
						searchCategories.push(searchCategory);
					});
				});
			}

			if (video.zobject_ids.length > 0) {
				video.zobject_ids.forEach((zobject_id, index) => {
					if (searchCategories.length + searchZobjects.length >= maxNumOfSearches) { return; }
					searchZobjects.push(zobject_id);
				});
			}

			return {
				categories: searchCategories,
				zobjectIds: searchZobjects
			};
		};

		/**
		 * getContentBasedRecommendations() returns an array of video recommendations
		 * - using content based filtering return top x results for requested video
		 *
		 * @param {String} videoId
		 */
		this.getContentBasedRecommendations = (zypeApi, videoId) => {
			return new Promise((resolve, reject) => {
				// key = video id, value = similarity score
				let recommendedVideos = {};

				zypeApi.getVideo(videoId, {})
				.then(
					videoResp => {
						let video = videoResp.response;

						let videoQueries = _this.getVideoQueries(video);
						let categories = videoQueries.categories;
						let zobjectIds = videoQueries.zobjectIds;

						let functionCallsArray = [];

						categories.forEach(category => {
							functionCallsArray.push([
								zypeApi.getVideosByCategory,
								[ category.title, category.value, { per_page: 100, "id!": video._id } ]
							]);
						});

						zobjectIds.forEach(zobjectId => {
							functionCallsArray.push([
								zypeApi.getVideosByZObject,
								[ zobjectId, { per_page: 100, "id!": video._id  } ]
							]);
						});

						zypeApi.callMultiple(functionCallsArray)
						.then(
							resps => {

								resps.forEach(videosResp => {

									let videos = videosResp.response;

									videos.forEach(video => {
										if (recommendedVideos.hasOwnProperty(video._id)) {
											recommendedVideos[video._id].score += 1;
										}
										else {
											video.score = 1;
											recommendedVideos[video._id] = video;
										}
									});

								});

								let recommendedVideosArray = Object.keys(recommendedVideos).map(id => recommendedVideos[id]);
								let sortedRecommendedVideos = recommendedVideosArray.sort((v1, v2) => v2.score - v1.score );

								resolve(sortedRecommendedVideos);
							},
							err => { reject(err); }
						);

					},
					err => { reject(err); }
				);



			});

		};
	};

	exports.ZypeApiHelpers = new ZypeApiHelpers();
})(window);
