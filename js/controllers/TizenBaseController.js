function TizenBaseController(args) {
    var _this = this;
    this.id = args.id;
    this.active = false;

    $(document).keydown(function(e) {
        if (_this.active) _this.handleEvent("buttonPress", e.keyCode);
    });
}

TizenBaseController.prototype.handleEvent = function(eventType, data) {
    switch (eventType) {
        case "buttonPress":
            this.handleButtonPress(data);
            break;
        default:
            break;
    }
};

TizenBaseController.prototype.handleButtonPress = function(keyCode) {
    switch (keyCode) {
        default: break;
    }
};