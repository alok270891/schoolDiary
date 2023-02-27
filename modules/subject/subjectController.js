const subjectModel = require('./subjectModel');
const utils = require('../../helper/utils');
const config = require('../../config/config');
const waterfall = require('async-waterfall');
let subjectCtr = {};

subjectCtr.create = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    if (loginUser && loginUser.userRole && loginUser.userRole === 3) {
        return res.status(400).json({ "message": req.t("NOT_AUTHORIZED_TO_CREATE", { FIELD: "subject" }), data: [], status: false });
    }
    if (loginUser && loginUser.userRole && loginUser.userRole === 1 && utils.empty(input.schoolId)) {
        return res.status(400).json({ "message": req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "School" }), data: [], status: false });
    }
    waterfall([
        (callback) => {
            let subjectData = {
                subjectName: input.subjectName.trim(),
                schoolId: (loginUser && loginUser.userRole && loginUser.userRole === 1) ? input.schoolId : loginUser.schoolId
            };
            console.log(subjectData)
            subjectModel.createsubject(subjectData, (subjectMaster) => {
                callback(null, subjectMaster);
            }, (error) => {
                console.log(error);
                callback(error);
            });
        }
    ], (err, subjectMaster) => {
        if (err) {
            return res.status(400).json({ "message": err, data: [], status: false });
        } else {
            let response = {
                "data": subjectMaster,
                "message": req.t("SUBJECT_CREATED"),
                status: true
            }
            return res.status(200).json(response);
        }
    });
}

subjectCtr.update = (req, res) => {
    let input = req.body;
    let subjectId = req.body.subjectId;
    let loginUser = req.authUser;
    waterfall([
        (callback) => {
            let subjectData = {};

            if (!utils.empty(input.subjectName)) {
                subjectData.subjectName = input.subjectName;
            }
            subjectModel.updatesubject(subjectData, { id: subjectId }, (subjectDetail) => {
                callback(null);
            }, (err) => {
                console.log(err);
                callback(err);
            });
        },
        (callback) => {
            subjectModel.getsubject({ id: subjectId }, (subjectDetails) => {
                if (!utils.empty(subjectDetails) && subjectDetails.length > 0) {
                    callback(null, subjectDetails[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t("DB_ERROR"));
            });
        }
    ], (err, subjectDetails) => {
        if (err) {
            return res.status(400).json({ "message": err });
        } else {
            let response = {
                "data": subjectDetails,
                "message": req.t("SUBJECT_UPDATED")
            }
            return res.status(200).json(response);
        }
    });
}

subjectCtr.subjectList = (req, res) => {
    let filter = {};
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
    if (!utils.empty(input.status)) {
        filter["status"] = (input.status).toUpperCase();
    }

    subjectModel.getsubjectList(filter, searchName, pg, limit, (total, data) => {
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

subjectCtr.getsubjectDetails = (req, res) => {
    return res.status(200).json({ "data": req.subject });
}

subjectCtr.statusChange = (req, res) => {
    let input = req.body;
    let role = req.authUser.userRole;
    if (!utils.empty(role)) {
        let updateData = { status: input.status };
        let filter = { id: input.subjectId };
        subjectModel.updatesubject(updateData, filter, (userUpdate) => {
            return res.status(200).json({ data: [], status: true, message: req.t("STATUS_CHANGE") });
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
        });
    } else {
        return res.status(500).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
    }
}

module.exports = subjectCtr;