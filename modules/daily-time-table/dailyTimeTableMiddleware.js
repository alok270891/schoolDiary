const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const dailyTimeTableValidator = require('./dailyTimeTableValidator');
const dailyTimeTableModel = require('./dailyTimeTableModel');
const userModel = require('../user/userModel');

let dailyTimeTableMiddleware = {};

dailyTimeTableMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var dailyTimeTableValidators = {};
        var validators = dailyTimeTableValidator.getDailyTimeTableValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    dailyTimeTableValidators[k] = validators[k];
                }
            }
        } else {
            dailyTimeTableValidators = validators
        }
        let error = _v.validate(req.body, dailyTimeTableValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


dailyTimeTableMiddleware.dailyTimeTableIdExists = (req, res, next) => {
    if (!utils.empty(req.body.dailyTimeTableId)) {
        dailyTimeTableModel.getdailyTimeTableById(req.body.dailyTimeTableId, (dailyTimeTableDetails) => {
            if (!utils.empty(dailyTimeTableDetails)) {
                req.dailyTimeTableDetails = dailyTimeTableDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("DAILY_TIME_TABLE_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("DAILY_TIME_TABLE_ID_NOT_VALID") });
    }
}

dailyTimeTableMiddleware.teacherIdExists = (req, res, next) => {
    if (!utils.empty(req.body.teacherId)) {
        userModel.loaduser({ id: req.body.teacherId }, (user) => {
            if (!utils.empty(user) && user.length > 0) {
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("TEACHERID_NOT_VALID") });
            }
        }, (err) => {
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        next();
    }
}

module.exports = dailyTimeTableMiddleware;