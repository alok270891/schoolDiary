const holidayModel = require('./holidayModel');
const utils = require('../../helper/utils');
const config = require('../../config/config');
const waterfall = require('async-waterfall');
let holidayCtr = {};

holidayCtr.create = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    waterfall([
        (callback) => {
            let holidayData = {
                holidayName: input.holidayName,
                holidayDate: input.holidayDate,
                schoolId: loginUser.schoolId
            };
            holidayModel.createholiday(holidayData, (holidayMaster) => {
                callback(null, holidayMaster);
            }, (error) => {
                console.log(error);
                callback(error);
            });
        }
    ], (err, holidayMaster) => {
        if (err) {
            return res.status(400).json({ "message": err, data: [], status: false });
        } else {
            let response = {
                "data": holidayMaster,
                "message": req.t("HOLIDAY_CREATED"),
                status: true
            }
            return res.status(200).json(response);
        }
    });
}

holidayCtr.update = (req, res) => {
    let input = req.body;
    let holidayId = req.body.holidayId;
    let loginUser = req.authUser;
    waterfall([
        (callback) => {
            let holidayData = {};
            if (!utils.empty(input.holidayName)) {
                holidayData.holidayName = input.holidayName;
            }
            if (!utils.empty(input.holidayDate)) {
                holidayData.holidayDate = input.holidayDate;
            }
            if (!utils.empty(input.status)) {
                holidayData.status = input.status;
            }
            holidayModel.updateholiday(holidayData, { id: holidayId }, (holidayDetail) => {
                callback(null);
            }, (err) => {
                console.log(err);
                callback(err);
            });
        },
        (callback) => {
            holidayModel.getholiday({ id: holidayId }, (holidayDetails) => {
                if (!utils.empty(holidayDetails) && holidayDetails.length > 0) {
                    callback(null, holidayDetails[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t("DB_ERROR"));
            });
        }
    ], (err, holidayDetails) => {
        if (err) {
            return res.status(400).json({ "message": err });
        } else {
            let response = {
                "data": holidayDetails,
                "message": req.t("HOLIDAY_UPDATED")
            }
            return res.status(200).json(response);
        }
    });
}

holidayCtr.holidayList = (req, res) => {
    let loginUser = req.authUser;
    let filter = {};
    let input = req.body;
    let limit = config.MAX_RECORDS;
    let searchName = '';
    let pg = 0;
    if (utils.isDefined(req.body.pg) && (parseInt(req.body.pg) > 1)) {
        pg = parseInt(req.body.pg - 1) * limit;
    } else {
        if (req.body.pg == -1) {
            pg = 0;
            limit = null;
        }
    }
    if (!utils.empty(input.searchName)) {
        searchName = input.searchName;
    }
    if (!utils.empty(req.body.status)) {
        filter["status"] = (req.body.status).toUpperCase();
    }
    if (loginUser && loginUser.userRole && loginUser.userRole === 1) {
        if (!utils.empty(input.schoolId)) {
            filter["schoolId"] = input.schoolId;
        }
    } else {
        filter["schoolId"] = loginUser.schoolId;
    }

    holidayModel.getholidayList(filter, searchName, pg, limit, (total, data) => {
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
        return res.status(500).json({ "message": req.t("DB_ERROR"), data: [], status: false });
    });
}

holidayCtr.delete = (req, res) => {
    let input = req.body;
    let role = req.authUser.userRole;
    if (!utils.empty(role)) {
        let filter = { id: input.holidayId };
        holidayModel.deleteholiday(filter, (userUpdate) => {
            return res.status(200).json({ data: [], status: true, message: req.t("HOLIDAY_DELETE") });
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
        });
    } else {
        return res.status(500).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
    }
}

module.exports = holidayCtr;