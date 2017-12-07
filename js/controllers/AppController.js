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
            var lastController = this.controllers.pop();

            // call .close if method exists
            if (lastController.close) {lastController.close()};

            if (this.controllers.length == 0){
                this.exitApp();
            } else {
                var previousController = this.controllers[this.controllers.length - 1];
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
                          var mockedResp = {response:{body:{outputs:[{url:"https://player.zype.com/manifest/5751d861b0cc5b0d24000fcf.m3u8?ad_enabled=false&app_key=WxM7GGP33B68HIMJT_YqhqFUQneKEgZ3kvDIvdLGCmTB-wHtSxQfdHpHEftNc6xx&https=true",name:"hls"}],files:[{url:"https://player.zype.com/manifest/5751d861b0cc5b0d24000fcf.m3u8?ad_enabled=false&app_key=WxM7GGP33B68HIMJT_YqhqFUQneKEgZ3kvDIvdLGCmTB-wHtSxQfdHpHEftNc6xx&https=true",name:"hls"}],on_air:false,analytics:{beacon:"https://ma1169-r.analytics.edgekey.net/config/beacon-10061.xml?enableGenericAPI=1",dimensions:{video_id:"5751d861b0cc5b0d24000fcf",site_id:"571e32ef973e2807f601267a",player_id:"zype_roku",device:"roku"}},subtitles:[]},video:{_id:"5751d861b0cc5b0d24000fcf",active:true,country:"",created_at:"2016-06-03T15:20:01.856-04:00",custom_attributes:{},description:"AbattlebetweenJeffandHuric",disable_at:null,discovery_url:"",duration:745,enable_at:null,episode:null,featured:false,foreign_id:null,friendly_title:"chess-match",images:[{_id:"59821f161d1f4313e200b136",caption:"thisisasample",layout:"poster",title:"samplethumbnail",updated_at:"2017-08-02T14:51:02.473-04:00",url:"http://upload.zype.com/571e32ef973e2807f601267a/video_image/59821f161d1f4313e200b136/1501699862/original.jpg?1501699862"}],keywords:["Yo","Hey","Hello"],mature_content:false,on_air:false,ott_description:"AbattlebetweenJeffandHuric",pass_required:false,preview_ids:[],program_guide_id:null,published_at:null,purchase_price:"2.0",purchase_required:false,rating:0,related_playlist_ids:[],rental_duration:1,rental_price:"1.0",rental_required:false,request_count:510,season:null,segments:[{_id:"58f52d61b13fd61456024fd2",description:"Start",end:121000,start:61000}],site_id:"571e32ef973e2807f601267a",source_id:"",status:"created",subscription_ads_enabled:false,subscription_required:false,title:"ChessMatch",updated_at:"2017-12-07T09:19:28.101-05:00",zobject_ids:[],crunchyroll_id:null,hulu_id:null,mrss_id:null,kaltura_id:null,thumbnails:[{aspect_ratio:null,height:240,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5751d861b0cc5b0d24000fcf/custom_thumbnail/240.png?1507575048",width:426},{aspect_ratio:null,height:480,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5751d861b0cc5b0d24000fcf/custom_thumbnail/480.png?1507575048",width:854},{aspect_ratio:null,height:720,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5751d861b0cc5b0d24000fcf/custom_thumbnail/720.png?1507575048",width:1280},{aspect_ratio:null,height:1080,name:null,url:"https://image.zype.com/571e32ef973e2807f601267a/5751d861b0cc5b0d24000fcf/custom_thumbnail/1080.png?1507575048",width:1920}],transcoded:true,vimeo_id:null,youtube_id:null,short_description:"Deathmatch"},device:{_id:"5429b1c769702d2f7c120000",description:"AccessedviaRokuSetTopBox",name:"Roku"},revenue_model:{_id:"5429b1c269702d2f7c010000",description:"AdvertisingVideoOnDemand",name:"AVOD"},player:{_id:"54400a3969702d681f000000",name:"ZypeRokuPlayer"},provider:{_id:"5429b1ca69702d2f7c190000",name:"Zype"}}};

                          _this.trigger('receivedPlayerInfo', mockedResp);
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

                var videoPlayerController = new VideoPlayerController();
                this.controllers.push(videoPlayerController);
                this.controllers[this.controllers.length - 1].init({
                    videoInfo: videoDetailsController.content,
                    playerInfo: resp.response
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
