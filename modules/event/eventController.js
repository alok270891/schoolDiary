const eventModel = require('./eventModel');
const utils = require('../../helper/utils');
const config = require('../../config/config');
const waterfall = require('async-waterfall');
const eventUtil = require('./eventHelper');
const eventStatusModel = require('./eventStatusModel');
const eventFilesModel = require('./eventFilesModel');
const notificationUtils = require('../../helper/notificationUtils');
const studentModel = require('../student/studentModel');
const notificationModel = require('../notification/notificationModel');
const cloudinary = require('cloudinary').v2;
let eventCtr = {};

eventCtr.create =(req, res) => {
let url;
    let input = req.body;
    let loginUser = req.authUser;
    if (loginUser && loginUser.userRole && loginUser.userRole !== 1) {
        input["schoolId"] = loginUser.schoolId;
    }

    waterfall([
        (callback) => {
            if (!utils.empty(req.files) && !utils.empty(req.files.eventPoster)) {
                eventUtil.saveEventImage (req.files, null, async(error, imagepath) => {
                    if (!utils.empty(error)) {
                        callback(error, "");
                    } else {         
                        const file=req.files.eventPoster.path
                       url= await cloudinary.uploader.upload(file, {
                        resource_type: 'auto',
                        folder: 'eventPoster',
                      })
                        callback(null, imagepath);
                    }
                });
            } else {
                callback(null, null);
            }
        },
        (image, callback) => {
            let eventData = {
                title: input.title,
                location: input.location,
                eventTime: input.eventTime,
                eventDate: input.eventDate,
                description: input.description,
                schoolId: input.schoolId,
                createdBy: loginUser.id
            };
            if (input.classId) {
                eventData['classId'] = input.classId;
            }
            if (image) {
                eventData['eventPoster'] = url.secure_url;
            }
            eventModel.createevent(eventData, (eventMaster) => {
                callback(null, eventMaster);
            }, (error) => {
                console.log(error);
                callback(error);
            });
        }
    ], (err, eventdetails) => {
        if (err) {
            return res.status(400).json({ "message": err, data: [], status: false });
        } else {

            eventCtr.sendnotification(input);
            let response = {
                "data": eventdetails,
                "message": req.t("EVENT_CREATED"),
                status: true
            }
            return res.status(200).json(response);
        }
    });
}

eventCtr.update = (req, res) => {
    let url;
    let input = req.body;
    waterfall([
        (callback) => {
            eventModel.loadEvent({ id: input.eventId }, (eventDetail) => {
                callback(null, eventDetail[0].dataValues);
            }, (err) => {
                callback(err);
            });
        },
        (eventDetail, callback) => {
            if (!utils.empty(req.files) && !utils.empty(req.files.eventPoster)) {
                eventUtil.saveEventImage(req.files, config.SYSTEM_IMAGE_PATH + config.EVENT_IMAGE_PATH + eventDetail.eventPoster, async(error, result) => {
                    if (!utils.empty(error)) {
                        callback(error, "");
                    } else {
                        const file=req.files.eventPoster.path
                        url= await cloudinary.uploader.upload(file, {
                         resource_type: 'auto',
                         folder: 'eventPoster',
                       })
                        callback(null, result);
                    }
                });
            } else {
                callback(null, null);
            }
        },
        (image, callback) => {
            let eventData = {};

            if (image) {
                eventData['eventPoster'] = url.secure_url;
            }
            if (input.title) {
                eventData['title'] = input.title;
            }
            if (input.description) {
                eventData['description'] = input.description;
            }
            if (input.location) {
                eventData['location'] = input.location;
            }
            if (input.eventTime) {
                eventData['eventTime'] = input.eventTime;
            }
            if (input.eventDate) {
                eventData['eventDate'] = input.eventDate;
            }
            if (input.status) {
                eventData['status'] = input.status;
            }

            eventModel.updateevent(eventData, { id: input.eventId }, (eventDetail) => {
                callback(null);
            }, (err) => {
                console.log(err);
                callback(err);
            });
        },
        (callback) => {
            eventModel.getevent({ id: input.eventId }, (eventDetails) => {
                if (!utils.empty(eventDetails) && eventDetails.length > 0) {
                    callback(null, eventDetails[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t("DB_ERROR"));
            });
        }
    ], (err, eventDetails) => {
        if (err) {
            return res.status(400).json({ "message": err });
        } else {
            let response = {
                "data": eventDetails,
                "message": req.t("EVENT_UPDATED")
            }
            return res.status(200).json(response);
        }
    });
}

eventCtr.eventList = (req, res) => {
    let input = req.body;
    let limit = config.MAX_RECORDS;
    let searchName = '';
    let loginUser = req.authUser;
    let pg = 0;
    if (utils.isDefined(req.body.pg) && (parseInt(req.body.pg) > 1)) {
        pg = parseInt(req.body.pg - 1) * limit;
    } else {
        if (req.body.pg == -1) {
            pg = 0;
            limit = null;
        }
    }
    let filter = {};
    if (!utils.empty(input.searchName)) {
        searchName = input.searchName;
    }
    if (!utils.empty(input.status)) {
        filter['status'] = input.status;
    }
    if (!utils.empty(input.classId)) {
        filter['classId'] = input.classId;
    }
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    if (input.action === 'upcoming') {
        filter['eventDate'] = { $gt: today };
    }
    if (input.action === 'past') {
        filter['eventDate'] = { $lt: today };
    }
    if (loginUser && loginUser.userRole && loginUser.userRole === 1) {
        if (!utils.empty(input.schoolId)) {
            filter["schoolId"] = input.schoolId;
        }
    } else {
        filter["schoolId"] = loginUser.schoolId;
    }

    eventModel.geteventList(filter, searchName, pg, limit, (total, data) => {
        if (total > 0) {
            let pages = Math.ceil(total / ((limit) ? limit : total));
            let pagination = {
                pages: pages ? pages : 1,
                total: total,
                max: (limit) ? limit : total
            };
            return res.status(200).json({ pagination: pagination, data: data, message: '', status: true });
        } else {
            return res.status(200).json({ "message": req.t("NO_RECORD_FOUND"), data: [], status: true });
        }
    }, (err) => {
        console.log(err);
        return res.status(500).json({ "message": req.t("DB_ERROR"), data: [], status: false });
    });
}

eventCtr.geteventDetails = (req, res) => {
    return res.status(200).json({ "data": req.event });
}


eventCtr.statusChange = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    let updateData = { status: input.status, eventId: input.eventId, parentId: loginUser.id };
    let filter = { eventId: input.eventId, parentId: loginUser.id };
    eventStatusModel.updateeventstatus(updateData, filter, (userUpdate) => {
        return res.status(200).json({ data: [], status: true, message: req.t("STATUS_CHANGE") });
    }, (err) => {
        console.log(err);
        return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
    });
}

eventCtr.uploadeventfile = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    if (loginUser && loginUser.userRole) {
        waterfall([
            (callback) => {
                if (!utils.empty(req.files) && !utils.empty(req.files.photos)) {
                    eventUtil.saveEventPhotos(req.files, null, (error, photos) => {
                        if (!utils.empty(error)) {
                            callback(error, "");
                        } else {
                            
                            callback(null, photos);
                        }
                    });
                } else {
                    callback(null, null);
                }
            },
            (images, callback) => {
                if (images && images.length > 0) {
                    let fileData = [];
                    images.map(obj => {
                        fileData.push({ eventId: input.eventId, photo: obj.name, size: obj.size, mimetype: obj.mimetype });
                    });
                    eventFilesModel.createeventFilesMulti(fileData, (res) => {
                        callback(null);
                    }, (error) => {
                        callback(error);
                    });
                } else {
                    callback(null);
                }
            }
        ], (err) => {
            if (err) {
                return res.status(400).json({ "message": err });
            } else {
                let response = {
                    "data": [],
                    "message": req.t("EVENT_PHOTOS_UPLOAD"),
                    status: true
                }
                return res.status(200).json(response);
            }
        });
    } else {
        let response = {
            "data": [],
            "message": req.t("ONLY_TEACHER_UPLOAD"),
            status: true
        }
        return res.status(200).json(response);
    }
}

eventCtr.sendnotification = (input, type) => {
    let parentsIds = [];
    studentModel.loaduser({ schoolId: input.schoolId }, (res) => {
        if (res && res.length > 0) {
            res.map((obj) => {
                let data = {
                    parentId: obj.parentId,
                    title: 'New event added for date ' + input.eventDate,
                    dateTime: Date.now()
                }
                parentsIds.push(obj.parentId);
                notificationModel.createnotification(data, (res) => {}, (err) => {});
            });
            let filter = {};
            input['title'] = 'New event';
            input['body'] = 'New event added for date ' + input.eventDate;
            input['sendto'] = 'parent';
            filter = { parentId: { $in: parentsIds } };
            eventCtr.sndnotification(input, filter);
        }
    }, (err) => {});
}


eventCtr.sndnotification = (input, filter) => {
    userInstallations.loadRecords(filter, (deviceList) => {
        deviceList = deviceList.map(function(sensor) { return sensor.dataValues });
        if (!utils.empty(deviceList) && deviceList.length > 0) {
            deviceList.map((obj) => {
                notificationUtils.sendPushNotification(input, obj.deviceToken, (user) => {}, (err) => {});
            });
        }
    }, (err) => {});
}


module.exports = eventCtr;