const standardModel = require('./standardModel');
const utils = require('../../helper/utils');
const config = require('../../config/config');
const waterfall = require('async-waterfall');
let standardCtr = {};

standardCtr.create = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    if (loginUser && loginUser.userRole && loginUser.userRole === 3) {
        return res.status(400).json({ "message": req.t("NOT_AUTHORIZED_TO_CREATE", { FIELD: "standard" }), data: [], status: false });
    }
    if (loginUser && loginUser.userRole && loginUser.userRole === 1 && utils.empty(input.schoolId)) {
        return res.status(400).json({ "message": req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "School" }), data: [], status: false });
    }
    waterfall([
        (callback) => {
            let standardData = {
                standardName: input.standardName,
                schoolId: (loginUser && loginUser.userRole && loginUser.userRole === 1) ? input.schoolId : loginUser.schoolId
            };
            standardModel.createstandard(standardData, (standardMaster) => {
                callback(null, standardMaster);
            }, (error) => {
                console.log(error);
                callback(error);
            });
        }
    ], (err, standardMaster) => {
        if (err) {
            return res.status(400).json({ "message": err, data: [], status: false });
        } else {
            let response = {
                "data": standardMaster,
                "message": req.t("STANDARD_CREATED"),
                status: true
            }
            return res.status(200).json(response);
        }
    });
}

standardCtr.update = (req, res) => {
    let input = req.body;
    let standardId = req.body.standardId;
    let loginUser = req.authUser;
    waterfall([
        (callback) => {
            let standardData = {};

            if (!utils.empty(input.standardName)) {
                standardData.standardName = input.standardName;
            }
            standardModel.updatestandard(standardData, { id: standardId }, (standardDetail) => {
                callback(null);
            }, (err) => {
                console.log(err);
                callback(err);
            });
        },
        (callback) => {
            standardModel.getstandard({ id: standardId }, (standardDetails) => {
                if (!utils.empty(standardDetails) && standardDetails.length > 0) {
                    callback(null, standardDetails[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t("DB_ERROR"));
            });
        }
    ], (err, standardDetails) => {
        if (err) {
            return res.status(400).json({ "message": err });
        } else {
            let response = {
                "data": standardDetails,
                "message": req.t("STANDARD_UPDATED")
            }
            return res.status(200).json(response);
        }
    });
}

standardCtr.standardList = (req, res) => {
    let filter = {};
    let input = req.body;
    let limit = config.MAX_RECORDS;
    let searchName = '';
    let pg = 0;
    let loginUser = req.authUser;
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
    if (loginUser && loginUser.userRole && loginUser.userRole === 1) {
        if (!utils.empty(input.schoolId)) {
            filter["schoolId"] = input.schoolId;
        }
    } else {
        filter["schoolId"] = loginUser.schoolId;
    }
    if (!utils.empty(req.body.status)) {
        filter["status"] = (req.body.status).toUpperCase();
    }

    standardModel.getstandardList(filter, searchName, pg, limit, (total, data) => {
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

standardCtr.getstandardDetails = (req, res) => {
    return res.status(200).json({ "data": req.standard });
}

standardCtr.statusChange = (req, res) => {
    let input = req.body;
    let role = req.authUser.userRole;
    if (!utils.empty(role)) {
        let updateData = { status: input.status };
        let filter = { id: input.standardId };
        standardModel.updatestandard(updateData, filter, (userUpdate) => {
            return res.status(200).json({ data: [], status: true, message: req.t("STATUS_CHANGE") });
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
        });
    } else {
        return res.status(500).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
    }
}

module.exports = standardCtr;