var PlaylistModel = function(args) {
    var _this = this;

    this.id = args.id || args._id;
    this.parentId = args.parent_id;

    this.playlistItemCount = args.playlist_item_count;
    this.title = args.title;
    this.description = args.description || "";
    this.thumbnails = args.thumbnails;
    this.images = args.images;
    this.categories = args.categories;

    this.thumbnailLayout = args.thumbnail_layout;

    this.getRegularThumbnailUrl = function() {
        for (i = 0; i < _this.thumbnails.length; i++) {
            var thumbnail = _this.thumbnails[i];

            if (thumbnail.width !== null && thumbnail.width >= 240) return thumbnail.url;
        }
        return appDefaults.thumbnailUrl;
    };

    this.getLargeThumbnailUrl = function() {
        var thumbnailUrl;
        var maxWidth = 0;
        for (i = 0; i < _this.thumbnails.length; i++) {
            var thumbnail = _this.thumbnails[i];

            if (thumbnail.width !== null && thumbnail.width >= maxWidth) {
                maxWidth = thumbnail.width;
                thumbnailUrl = thumbnail.url;
            };
        }
        return thumbnailUrl || appDefaults.thumbnailUrl;
    };

    this.getPosterThumbnailUrl = function() {
        if (_this.images){
            for (i = 0; i < _this.images.length; i++) {
                var image = _this.images[i];
                if (image.layout == "poster") return image.url;
            }
        }

        return this.getRegularThumbnailUrl();
    };

    this.smallThumbnailUrl = this.getRegularThumbnailUrl();
    this.largeThumbnailUrl = this.getLargeThumbnailUrl();
    this.posterThumbnailUrl = this.getPosterThumbnailUrl();
};
