const breakfastModel = require('./breakfastModel');
const utils = require('../../helper/utils');
const config = require('../../config/config');
const waterfall = require('async-waterfall');
let breakfastCtr = {};

breakfastCtr.create = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    waterfall([
        (callback) => {
            let breakfastData = {
                breakfastName: input.breakfastName,
                day: input.day,
                schoolId: loginUser.schoolId
            };
            if (!utils.empty(input.description)) {
                breakfastData.description = input.description;
            }
            breakfastModel.createbreakfast(breakfastData, (breakfastMaster) => {
                callback(null, breakfastMaster);
            }, (error) => {
                console.log(error);
                callback(error);
            });
        }
    ], (err, breakfastMaster) => {
        if (err) {
            return res.status(400).json({ "message": err, data: [], status: false });
        } else {
            let response = {
                "data": breakfastMaster,
                "message": req.t("BREAKFAST_CREATED"),
                status: true
            }
            return res.status(200).json(response);
        }
    });
}

breakfastCtr.update = (req, res) => {
    let input = req.body;
    let breakfastId = req.body.breakfastId;
    let loginUser = req.authUser;
    waterfall([
        (callback) => {
            let breakfastData = {};
            if (!utils.empty(input.breakfastName)) {
                breakfastData.breakfastName = input.breakfastName;
            }
            if (!utils.empty(input.day)) {
                breakfastData.day = input.day;
            }
            if (!utils.empty(input.description)) {
                breakfastData.description = input.description;
            }
            if (!utils.empty(input.status)) {
                breakfastData.status = input.status;
            }
            breakfastModel.updatebreakfast(breakfastData, { id: breakfastId }, (breakfastDetail) => {
                callback(null);
            }, (err) => {
                console.log(err);
                callback(err);
            });
        },
        (callback) => {
            breakfastModel.getbreakfast({ id: breakfastId }, (breakfastDetails) => {
                if (!utils.empty(breakfastDetails) && breakfastDetails.length > 0) {
                    callback(null, breakfastDetails[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t("DB_ERROR"));
            });
        }
    ], (err, breakfastDetails) => {
        if (err) {
            return res.status(400).json({ "message": err });
        } else {
            let response = {
                "data": breakfastDetails,
                "message": req.t("BREAKFAST_UPDATED")
            }
            return res.status(200).json(response);
        }
    });
}

breakfastCtr.breakfastList = (req, res) => {
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
    if (!utils.empty(input.day)) {
        filter['day'] = input.day;
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

    breakfastModel.getbreakfastList(filter, searchName, pg, limit, (total, data) => {
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

breakfastCtr.delete = (req, res) => {
    let input = req.body;
    let role = req.authUser.userRole;
    if (!utils.empty(role)) {
        let filter = { id: input.breakfastId };
        breakfastModel.deletebreakfast(filter, (userUpdate) => {
            return res.status(200).json({ data: [], status: true, message: req.t("BREAKFAST_DELETE") });
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
        });
    } else {
        return res.status(500).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
    }
}

module.exports = breakfastCtr;