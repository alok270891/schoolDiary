let jwt = require('../../helper/jwt');
let utils = require('../../helper/utils');
let eventUtil = {}

eventUtil.saveEventImage = (file, old_path, cb) => {
    if (!utils.empty(file) && !utils.empty(file.eventPoster) && file.eventPoster) {
        utils.uploadImageInServer(file.eventPoster, config.EVENT_IMAGE_PATH, old_path, cb);
    } else {
        cb(null, null);
    }
};
eventUtil.saveEventPhotos = (file, old_path, cb) => {
    if (!utils.empty(file) && !utils.empty(file.photos) && file.photos) {
        utils.imageArr = [];
        utils.uploadImageInServermulti(file.photos, config.EVENT_IMAGE_PATH, 0, cb);
    } else {
        cb(null, null);
    }
};

module.exports = eventUtil