const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const attendanceValidator = require('./attendanceValidator');
const attendanceModel = require('./attendanceModel');

let attendanceMiddleware = {};

attendanceMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var attendanceValidators = {};
        var validators = attendanceValidator.getAttendanceValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    attendanceValidators[k] = validators[k];
                }
            }
        } else {
            attendanceValidators = validators
        }
        let error = _v.validate(req.body, attendanceValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


attendanceMiddleware.attendanceIdExists = (req, res, next) => {
    if (!utils.empty(req.body.attendanceId)) {
        attendanceModel.gethomwWorkById(req.body.attendanceId, (attendanceDetails) => {
            if (!utils.empty(attendanceDetails)) {
                req.attendanceDetails = attendanceDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("attendance_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("attendance_ID_NOT_VALID") });
    }
}

attendanceMiddleware.commentExists = (req, res, next) => {
    let loginUser = req.authUser;
    commentModel.getattendancecomment({ attendanceId: req.body.attendanceId, parentId: loginUser.id }, (attendanceDetails) => {
        if (!utils.empty(attendanceDetails) && attendanceDetails.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("attendance_COMMENT_EXISTS") });
        } else {
            next();
        }
    }, (err) => {
        console.log(err);
        return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
    });
}

attendanceMiddleware.commentIdExists = (req, res, next) => {
    commentModel.getattendancecommentById(req.body.commentId, (attendanceDetails) => {
        if (!utils.empty(attendanceDetails)) {
            next();
        } else {
            return res.status(400).json({ data: [], status: false, "message": req.t("COMMENT_ID_NOT_VALID") });
        }
    }, (err) => {
        return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
    });
}

module.exports = attendanceMiddleware;