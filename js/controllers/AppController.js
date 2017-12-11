(function(exports){
    "use strict";

    var AppController = function(){
        EventsHandler.call(this, ['settingsLoaded',  'mediaLoaded',  'forceExitApp',  'exitApp',  'buttonPress',  'receivedPlayerInfo', 'videoFinished']);

        var _this = this;

        this.appSettings = {};
        this.zypeApi = ZypeJSBase({
            appKey: appDefaults.appKey,
            clientId: appDefaults.clientId,
            clientSecret: appDefaults.clientSecret
        });

        this.mediaGridContent = [];
        this.mediaGridControllersCount = 0;

        this.controllers = [];

        this.init = function(args){
            this.zypeApi.getApp().then(function(resp){
                if (resp){
                    _this.trigger('settingsLoaded', resp.response);
                } else {
                    _this.trigger('forceExitApp', 'App misconfigured. Exitting...');
                }
            });
        };

        this.handleButtonPress = function(keyCode){
            if (this.controllers.length > 0){
                var currentController = this.controllers[this.controllers.length - 1];
                currentController.trigger('buttonPress', keyCode);

                switch (keyCode) {
                  case TvKeys.ENTER:
                    this.handleEnterButtonPress();
                    break;
                  case TvKeys.RETURN:
                  case TvKeys.BACK:
                    this.handleBackButtonPress();
                    break;
                  default:
                    break;
                }
            }
        };

        this.addMediaContent = function(playlistId, playlistLevel){
            ZypeApiHelpers.getPlaylistChildren(this.zypeApi, playlistId).then(function(data){
                _this.mediaGridContent.push(data);

                var mediaGridController = new MediaGridController();
                mediaGridController.init({
                    playlistLevel: _this.mediaGridControllersCount,
                    mediaContent: data
                });

                _this.controllers.push(mediaGridController);
                _this.mediaGridControllersCount += 1;
            });
        };

        this.handleBackButtonPress = function(){
            var lastController = _this.controllers.pop();

            // call .close if method exists
            if (lastController.close) {lastController.close()};

            if (_this.controllers.length == 0){
                _this.exitApp();
            } else {
                var previousController = _this.controllers[_this.controllers.length - 1];
                previousController.trigger('show');
            }
        };

        this.handleEnterButtonPress = function(){
            var controller = this.controllers[this.controllers.length - 1];
            var controllerName = ObjectHelpers.getObjectName(controller);

            switch (controllerName) {
              case "MediaGridController":
                  var itemSelected = controller.focusedContent();

                  // TODO: need code for creating VideoDetailsController with view
                  if (itemSelected.contentType == "videos"){
                      var newController = new VideoDetailsController();
                      newController.init(itemSelected.content);

                      this.controllers.push(newController);
                  } else if (itemSelected.contentType == "playlists") {
                      this.addMediaContent(itemSelected.content._id, this.mediaGridControllersCount);
                  }

                  break;
              case "VideoDetailsController":
                  var buttonSelected = controller.currentButton();
                  var videoId = buttonSelected.data.videoId;

                  if (buttonSelected.role == "play") {
                      this.zypeApi.getPlayer(videoId, { app_key: this.zypeApi.appKey })
                      .then(function(resp){
                          var mockedResps = {"5744abef9958b70d060008d3":{response:{body:{outputs:[{url:"https://player.zype.com/manifest/5744abef9958b70d060008d3.m3u8?ad_enabled=false&app_key=WxM7GGP33B68HIMJT_YqhqFUQneKEgZ3kvDIvdLGCmTB-wHtSxQfdHpHEftNc6xx&https=true",name:"hls"}],files:[{url:"https://player.zype.com/manifest/5744abef9958b70d060008d3.m3u8?ad_enabled=false&app_key=WxM7GGP33B68HIMJT_YqhqFUQneKEgZ3kvDIvdLGCmTB-wHtSxQfdHpHEftNc6xx&https=true",name:"hls"}],on_air:!1,analytics:{beacon:"https://ma1169-r.analytics.edgekey.net/config/beacon-10061.xml?enableGenericAPI=1",dimensions:{video_id:"5744abef9958b70d060008d3",site_id:"571e32ef973e2807f601267a",player_id:"zype_roku",device:"roku"}},subtitles:[]},video:{_id:"5744abef9958b70d060008d3",active:!0,country:"",created_at:"2016-05-24T15:30:55.934-04:00",custom_attributes:{},description:"",disable_at:null,discovery_url:"",duration:21,enable_at:null,episode:null,featured:!1,foreign_id:null,friendly_title:"road",keywords:[],mature_content:!1,on_air:!1,ott_description:null,pass_required:!1,preview_ids:[],program_guide_id:null,published_at:null,purchase_price:null,purchase_required:!1,rating:0,related_playlist_ids:[],rental_duration:null,rental_price:null,rental_required:!1,request_count:13,season:null,site_id:"571e32ef973e2807f601267a",source_id:"",status:"created",subscription_ads_enabled:!0,subscription_required:!1,title:"Road",updated_at:"2017-12-09T21:18:53.213-05:00",zobject_ids:[],crunchyroll_id:null,hulu_id:null,mrss_id:null,kaltura_id:null,thumbnails:[{aspect_ratio:null,height:240,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5744abef9958b70d060008d3/custom_thumbnail/240.png?1507628468",width:426},{aspect_ratio:null,height:480,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5744abef9958b70d060008d3/custom_thumbnail/480.png?1507628468",width:854},{aspect_ratio:null,height:720,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5744abef9958b70d060008d3/custom_thumbnail/720.png?1507628468",width:1280},{aspect_ratio:null,height:1080,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5744abef9958b70d060008d3/custom_thumbnail/1080.png?1507628468",width:1920}],transcoded:!0,vimeo_id:null,youtube_id:null,short_description:""},device:{_id:"5429b1c769702d2f7c120000",description:"Accessed via Roku Set Top Box",name:"Roku"},revenue_model:{_id:"5429b1c269702d2f7c010000",description:"Advertising Video On Demand",name:"AVOD"},player:{_id:"54400a3969702d681f000000",name:"Zype Roku Player"},provider:{_id:"5429b1ca69702d2f7c190000",name:"Zype"}}},"5744ac0b8c55000d0f00092e":{response:{body:{outputs:[{url:"https://player.zype.com/manifest/5744ac0b8c55000d0f00092e.m3u8?ad_enabled=false&app_key=WxM7GGP33B68HIMJT_YqhqFUQneKEgZ3kvDIvdLGCmTB-wHtSxQfdHpHEftNc6xx&https=true",name:"hls"}],files:[{url:"https://player.zype.com/manifest/5744ac0b8c55000d0f00092e.m3u8?ad_enabled=false&app_key=WxM7GGP33B68HIMJT_YqhqFUQneKEgZ3kvDIvdLGCmTB-wHtSxQfdHpHEftNc6xx&https=true",name:"hls"}],on_air:!1,analytics:{beacon:"https://ma1169-r.analytics.edgekey.net/config/beacon-10061.xml?enableGenericAPI=1",dimensions:{video_id:"5744ac0b8c55000d0f00092e",site_id:"571e32ef973e2807f601267a",player_id:"zype_roku",device:"roku"}},subtitles:[]},video:{_id:"5744ac0b8c55000d0f00092e",active:!0,country:"",created_at:"2016-05-24T15:31:23.980-04:00",custom_attributes:{},description:"",disable_at:null,discovery_url:"",duration:38,enable_at:null,episode:null,featured:!1,foreign_id:null,friendly_title:"waterfall",keywords:[],mature_content:!1,on_air:!1,ott_description:null,pass_required:!1,preview_ids:[],program_guide_id:null,published_at:null,purchase_price:null,purchase_required:!1,rating:0,related_playlist_ids:[],rental_duration:null,rental_price:null,rental_required:!1,request_count:12,season:null,site_id:"571e32ef973e2807f601267a",source_id:"",status:"created",subscription_ads_enabled:!0,subscription_required:!1,title:"Waterfall",updated_at:"2017-12-09T22:07:47.729-05:00",zobject_ids:[],crunchyroll_id:null,hulu_id:null,mrss_id:null,kaltura_id:null,thumbnails:[{aspect_ratio:null,height:240,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5744ac0b8c55000d0f00092e/custom_thumbnail/240.png?1507619954",width:426},{aspect_ratio:null,height:480,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5744ac0b8c55000d0f00092e/custom_thumbnail/480.png?1507619954",width:854},{aspect_ratio:null,height:720,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5744ac0b8c55000d0f00092e/custom_thumbnail/720.png?1507619954",width:1280},{aspect_ratio:null,height:1080,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5744ac0b8c55000d0f00092e/custom_thumbnail/1080.png?1507619954",width:1920}],transcoded:!0,vimeo_id:null,youtube_id:null,short_description:""},device:{_id:"5429b1c769702d2f7c120000",description:"Accessed via Roku Set Top Box",name:"Roku"},revenue_model:{_id:"5429b1c269702d2f7c010000",description:"Advertising Video On Demand",name:"AVOD"},player:{_id:"54400a3969702d681f000000",name:"Zype Roku Player"},provider:{_id:"5429b1ca69702d2f7c190000",name:"Zype"}}},"5744abf6865bd60d77000b0f":{response:{body:{outputs:[{url:"https://player.zype.com/manifest/5744abf6865bd60d77000b0f.m3u8?ad_enabled=false&app_key=WxM7GGP33B68HIMJT_YqhqFUQneKEgZ3kvDIvdLGCmTB-wHtSxQfdHpHEftNc6xx&https=true",name:"hls"}],files:[{url:"https://player.zype.com/manifest/5744abf6865bd60d77000b0f.m3u8?ad_enabled=false&app_key=WxM7GGP33B68HIMJT_YqhqFUQneKEgZ3kvDIvdLGCmTB-wHtSxQfdHpHEftNc6xx&https=true",name:"hls"}],on_air:!1,analytics:{beacon:"https://ma1169-r.analytics.edgekey.net/config/beacon-10061.xml?enableGenericAPI=1",dimensions:{video_id:"5744abf6865bd60d77000b0f",site_id:"571e32ef973e2807f601267a",player_id:"zype_roku",device:"roku"}},subtitles:[]},video:{_id:"5744abf6865bd60d77000b0f",active:!0,country:"",created_at:"2016-05-24T15:31:02.468-04:00",custom_attributes:{},description:"",disable_at:null,discovery_url:"",duration:21,enable_at:null,episode:null,featured:!1,foreign_id:null,friendly_title:"bridge",keywords:[],mature_content:!1,on_air:!1,ott_description:null,pass_required:!1,preview_ids:[],program_guide_id:null,published_at:null,purchase_price:null,purchase_required:!1,rating:0,related_playlist_ids:[],rental_duration:null,rental_price:null,rental_required:!1,request_count:36,season:null,site_id:"571e32ef973e2807f601267a",source_id:"",status:"created",subscription_ads_enabled:!0,subscription_required:!1,title:"Bridge",updated_at:"2017-12-10T08:12:49.052-05:00",zobject_ids:[],crunchyroll_id:null,hulu_id:null,mrss_id:null,kaltura_id:null,thumbnails:[{aspect_ratio:null,height:240,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5744abf6865bd60d77000b0f/custom_thumbnail/240.png?1507624289",width:426},{aspect_ratio:null,height:480,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5744abf6865bd60d77000b0f/custom_thumbnail/480.png?1507624289",width:854},{aspect_ratio:null,height:720,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5744abf6865bd60d77000b0f/custom_thumbnail/720.png?1507624289",width:1280},{aspect_ratio:null,height:1080,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5744abf6865bd60d77000b0f/custom_thumbnail/1080.png?1507624289",width:1920}],transcoded:!0,vimeo_id:null,youtube_id:null,short_description:""},device:{_id:"5429b1c769702d2f7c120000",description:"Accessed via Roku Set Top Box",name:"Roku"},revenue_model:{_id:"5429b1c269702d2f7c010000",description:"Advertising Video On Demand",name:"AVOD"},player:{_id:"54400a3969702d681f000000",name:"Zype Roku Player"},provider:{_id:"5429b1ca69702d2f7c190000",name:"Zype"}}}};

                          _this.trigger('receivedPlayerInfo', mockedResps[videoId]);
                          // _this.trigger('receivedPlayerInfo', resp);
                      });
                  }

                  break;
              default:
                  break;
            }
        };

        this.handlePlayerRequestResp = function(resp){
            if (resp && typeof resp.response.body.outputs != "undefined"){
                var videoDetailsController = this.controllers[this.controllers.length - 1];

                var callback = _this.handleBackButtonPress;

                var videoPlayerController = new VideoPlayerController();
                this.controllers.push(videoPlayerController);
                this.controllers[this.controllers.length - 1].init({
                    videoInfo: videoDetailsController.content,
                    playerInfo: resp.response,
                    callbackFunc: callback,
                });

            // Javascript body
            } else if (resp){
                // var player = resp.response.body;
                // alert("Got this player: " + JSON.stringify(player));

            // null
            } else {
                var videoDetailsController = this.controllers[this.controllers.length - 1];
                videoDetailsController.trigger('show');
                alert("Video playback error");
            }
        };

        this.closeLastController = function(){
            var lastController = this.controllers[this.controllers.length - 1];
            lastController.close();

            this.controllers.pop();
            var currentController = this.controllers[this.controllers.length - 1];
            if (currentController){
                currentController.trigger('show');
            }
        };

        this.forceExitApp = function(message){
            alert(message);
            setTimeout(this.exitApp, 1000);
        };

        this.exitApp = function(){
            tizen.application.getCurrentApplication().exit();
        };

        this.registerHandler('settingsLoaded', function(appSettings){
            if (!appSettings.featured_playlist_id) appSettings.featured_playlist_id = appDefaults.rootPlaylistId;

            this.appSettings = appSettings;

            this.addMediaContent(this.appSettings.featured_playlist_id, 0);
        }, this);

        this.registerHandler('mediaLoaded', this.displayMediaGridView, this);

        this.registerHandler('forceExitApp', this.forceExitApp, this);
        this.registerHandler('exitApp', this.exitApp, this);

        this.registerHandler('buttonPress', this.handleButtonPress, this);
        this.registerHandler('receivedPlayerInfo', this.handlePlayerRequestResp, this);
        this.registerHandler('videoFinished', this.closeLastController, this);

        $(document).keydown(function(e){
            _this.trigger('buttonPress', e.keyCode);
        });
    };

    exports.AppController = AppController;
})(window);
