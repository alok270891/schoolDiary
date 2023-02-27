const classModel = require('./classModel');
const utils = require('../../helper/utils');
const config = require('../../config/config');
const waterfall = require('async-waterfall');
let classCtr = {};

classCtr.create = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    if (loginUser && loginUser.userRole && loginUser.userRole === 3) {
        return res.status(400).json({ "message": req.t("NOT_AUTHORIZED_TO_CREATE", { FIELD: "class" }), data: [], status: false });
    }
    if (loginUser && loginUser.userRole && loginUser.userRole === 1 && utils.empty(input.schoolId)) {
        return res.status(400).json({ "message": req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "School" }), data: [], status: false });
    }
    waterfall([
        (callback) => {
            let classData = {
                standardId: input.standardId,
                className: input.className,
                medium: input.medium,
                schoolId: (loginUser && loginUser.userRole && loginUser.userRole === 1) ? input.schoolId : loginUser.schoolId
            };
            classModel.createclasses(classData, (classMaster) => {
                callback(null, classMaster);
            }, (error) => {
                console.log(error);
                callback(error);
            });
        },
        (classMaster, callback) => {
            classModel.getclasses({ id: classMaster.id }, (classDetails) => {
                if (!utils.empty(classDetails) && classDetails.length > 0) {
                    callback(null, classDetails[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t("DB_ERROR"));
            });
        }
    ], (err, classMaster) => {
        if (err) {
            return res.status(400).json({ "message": err, data: [], status: false });
        } else {
            let response = {
                "data": classMaster,
                "message": req.t("CLASS_CREATED"),
                status: true
            }
            return res.status(200).json(response);
        }
    });
}

classCtr.update = (req, res) => {
    let input = req.body;
    let classId = req.body.classId;
    let loginUser = req.authUser;
    waterfall([
        (callback) => {
            let classData = {};

            if (!utils.empty(input.standardId)) {
                classData.standardId = input.standardId;
            }
            if (!utils.empty(input.className)) {
                classData.className = input.className;
            }
            if (!utils.empty(input.medium)) {
                classData.medium = input.medium;
            }
            classModel.updateclasses(classData, { id: classId }, (classDetail) => {
                callback(null);
            }, (err) => {
                console.log(err);
                callback(err);
            });
        },
        (callback) => {
            classModel.getclasses({ id: classId }, (classDetails) => {
                if (!utils.empty(classDetails) && classDetails.length > 0) {
                    callback(null, classDetails[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t("DB_ERROR"));
            });
        }
    ], (err, classDetails) => {
        if (err) {
            return res.status(400).json({ "message": err });
        } else {
            let response = {
                "data": classDetails,
                "message": req.t("CLASS_UPDATED")
            }
            return res.status(200).json(response);
        }
    });
}

classCtr.classList = (req, res) => {
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
    if (!utils.empty(req.body.medium)) {
        filter["medium"] = (req.body.medium).toUpperCase();
    }
    if (!utils.empty(req.body.status)) {
        filter["status"] = (req.body.status).toUpperCase();
    }
    if (!utils.empty(req.body.standardId)) {
        filter["standardId"] = req.body.standardId;
    }
    if (!utils.empty(input.searchName)) {
        searchName = input.searchName;
    }

    classModel.getclassesList(filter, searchName, pg, limit, (total, data) => {
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

classCtr.getclassDetails = (req, res) => {
    return res.status(200).json({ "data": req.class });
}

classCtr.statusChange = (req, res) => {
    let input = req.body;
    let role = req.authUser.userRole;
    if (!utils.empty(role)) {
        let updateData = { status: input.status };
        let filter = { id: input.classId };
        classModel.updateclasses(updateData, filter, (userUpdate) => {
            return res.status(200).json({ data: [], status: true, message: req.t("STATUS_CHANGE") });
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
        });
    } else {
        return res.status(500).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
    }
}

module.exports = classCtr;