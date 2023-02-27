const examTypeModel = require('./examTypeModel');
const utils = require('../../helper/utils');
const config = require('../../config/config');
const waterfall = require('async-waterfall');
let examTypeCtr = {};

examTypeCtr.create = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    // if (loginUser && loginUser.userRole && loginUser.userRole === 1 && utils.empty(input.schoolId)) {
    //     return res.status(400).json({ "message": req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "School" }), data: [], status: false });
    // }
    waterfall([
        (callback) => {
            let examTypeData = {
                name: input.name,
                schoolId: (loginUser && loginUser.userRole && loginUser.userRole === 1) ? input.schoolId : loginUser.schoolId
            };
            examTypeModel.createexamTypes(examTypeData, (examTypeMaster) => {
                callback(null, examTypeMaster);
            }, (error) => {
                console.log(error);
                callback(error);
            });
        },
        (examTypeMaster, callback) => {
            examTypeModel.getexamTypes({ id: examTypeMaster.id }, (examTypeDetails) => {
                if (!utils.empty(examTypeDetails) && examTypeDetails.length > 0) {
                    callback(null, examTypeDetails[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t('DB_ERROR'));
            });
        }
    ], (err, examTypeMaster) => {
        if (err) {
            return res.status(400).json({ "message": err, data: [], status: false });
        } else {
            let response = {
                "data": examTypeMaster,
                "message": req.t("EXAM_TYPE_CREATED"),
                status: true
            }
            return res.status(200).json(response);
        }
    });
}

examTypeCtr.update = (req, res) => {
    let input = req.body;
    let examTypeId = req.body.examTypeId;
    let loginUser = req.authUser;
    waterfall([
        (callback) => {
            let examTypeData = {};

            if (!utils.empty(input.name)) {
                examTypeData.name = input.name;
            }
            if (!utils.empty(input.status)) {
                examTypeData.status = input.status;
            }
            examTypeModel.updateexamTypes(examTypeData, { id: examTypeId }, (examTypeDetail) => {
                callback(null);
            }, (err) => {
                console.log(err);
                callback(err);
            });
        },
        (callback) => {
            examTypeModel.getexamTypes({ id: examTypeId }, (examTypeDetails) => {
                if (!utils.empty(examTypeDetails) && examTypeDetails.length > 0) {
                    callback(null, examTypeDetails[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t("DB_ERROR"));
            });
        }
    ], (err, examTypeDetails) => {
        if (err) {
            return res.status(400).json({ "message": err });
        } else {
            let response = {
                "data": examTypeDetails,
                "message": req.t("EXAM_TYPE_UPDATED")
            }
            return res.status(200).json(response);
        }
    });
}

examTypeCtr.examTypeList = (req, res) => {
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
    if (!utils.empty(input.searchName)) {
        searchName = input.searchName;
    }

    examTypeModel.getexamTypesList(filter, searchName, pg, limit, (total, data) => {
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

examTypeCtr.getexamTypeDetails = (req, res) => {
    return res.status(200).json({ "data": req.examType });
}

examTypeCtr.statusChange = (req, res) => {
    let input = req.body;
    let role = req.authUser.userRole;
    if (!utils.empty(role)) {
        let updateData = { status: input.status };
        let filter = { id: input.examTypeId };
        examTypeModel.updateexamTypees(updateData, filter, (userUpdate) => {
            return res.status(200).json({ data: [], status: true, message: req.t("STATUS_CHANGE") });
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
        });
    } else {
        return res.status(500).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
    }
}

module.exports = examTypeCtr;