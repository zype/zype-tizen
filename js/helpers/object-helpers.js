(function(exports){
    "use strict";

    var ObjectHelpers = function(){
        this.getObjectName = function(obj){
            return obj.constructor.name;
        };
    };

    exports.ObjectHelpers = new ObjectHelpers();
})(window);
