const dailyTimeTableModel = require('./dailyTimeTableModel');
const utils = require('../../helper/utils');
const config = require('../../config/config');
const waterfall = require('async-waterfall');
let dailyTimeTableCtr = {};

dailyTimeTableCtr.create = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    waterfall([
        (callback) => {
            let dailyTimeTableData = {
                teacherId: input.teacherId,
                subject: input.subject,
                duration: input.duration,
                day: input.day,
                schoolId: loginUser.schoolId
            };
            dailyTimeTableModel.createdailyTimeTable(dailyTimeTableData, (dailyTimeTableMaster) => {
                callback(null, dailyTimeTableMaster.id);
            }, (error) => {
                console.log(error);
                callback(error);
            });
        },
        (dailyTimeTableId, callback) => {
            dailyTimeTableModel.getdailyTimeTable({ id: dailyTimeTableId }, (dailyTimeTableDetails) => {
                if (!utils.empty(dailyTimeTableDetails) && dailyTimeTableDetails.length > 0) {
                    callback(null, dailyTimeTableDetails[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t("DB_ERROR"));
            });
        }
    ], (err, dailyTimeTableDetails) => {
        if (err) {
            return res.status(400).json({ "message": err, data: [], status: false });
        } else {
            let response = {
                "data": dailyTimeTableDetails,
                "message": req.t("DAILY_TIME_TABLE_CREATED"),
                status: true
            }
            return res.status(200).json(response);
        }
    });
}

dailyTimeTableCtr.update = (req, res) => {
    let input = req.body;
    let dailyTimeTableId = req.body.dailyTimeTableId;
    let loginUser = req.authUser;
    waterfall([
        (callback) => {
            let dailyTimeTableData = {};
            if (!utils.empty(input.teacherId)) {
                dailyTimeTableData.teacherId = input.teacherId;
            }
            if (!utils.empty(input.day)) {
                dailyTimeTableData.day = input.day;
            }
            if (!utils.empty(input.subject)) {
                dailyTimeTableData.subject = input.subject;
            }
            if (!utils.empty(input.duration)) {
                dailyTimeTableData.duration = input.duration;
            }
            if (!utils.empty(input.status)) {
                dailyTimeTableData.status = input.status;
            }
            dailyTimeTableModel.updatedailyTimeTable(dailyTimeTableData, { id: dailyTimeTableId }, (dailyTimeTableDetail) => {
                callback(null);
            }, (err) => {
                console.log(err);
                callback(err);
            });
        },
        (callback) => {
            dailyTimeTableModel.getdailyTimeTable({ id: dailyTimeTableId }, (dailyTimeTableDetails) => {
                if (!utils.empty(dailyTimeTableDetails) && dailyTimeTableDetails.length > 0) {
                    callback(null, dailyTimeTableDetails[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t("DB_ERROR"));
            });
        }
    ], (err, dailyTimeTableDetails) => {
        if (err) {
            return res.status(400).json({ "message": err });
        } else {
            let response = {
                "data": dailyTimeTableDetails,
                "message": req.t("DAILY_TIME_TABLE_UPDATED")
            }
            return res.status(200).json(response);
        }
    });
}

dailyTimeTableCtr.dailyTimeTableList = (req, res) => {
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
    if (!utils.empty(input.subject)) {
        filter['subject'] = input.subject;
    }
    if (!utils.empty(input.teacherId)) {
        filter['teacherId'] = input.teacherId;
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

    dailyTimeTableModel.getdailyTimeTableList(filter, searchName, pg, limit, (total, data) => {
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

dailyTimeTableCtr.delete = (req, res) => {
    let input = req.body;
    let role = req.authUser.userRole;
    if (!utils.empty(role)) {
        let filter = { id: input.dailyTimeTableId };
        dailyTimeTableModel.deletedailyTimeTable(filter, (userUpdate) => {
            return res.status(200).json({ data: [], status: true, message: req.t("DAILY_TIME_TABLE_DELETE") });
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
        });
    } else {
        return res.status(500).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
    }
}

module.exports = dailyTimeTableCtr;