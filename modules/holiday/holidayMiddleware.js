const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const holidayValidator = require('./holidayValidator');
const holidayModel = require('./holidayModel');

let holidayMiddleware = {};

holidayMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var holidayValidators = {};
        var validators = holidayValidator.getHolidayValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    holidayValidators[k] = validators[k];
                }
            }
        } else {
            holidayValidators = validators
        }
        let error = _v.validate(req.body, holidayValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


holidayMiddleware.holidayIdExists = (req, res, next) => {
    if (!utils.empty(req.body.holidayId)) {
        holidayModel.getholidayById(req.body.holidayId, (holidayDetails) => {
            if (!utils.empty(holidayDetails)) {
                req.holidayDetails = holidayDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("HOLIDAY_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("HOLIDAY_ID_NOT_VALID") });
    }
}

holidayMiddleware.holidayExists = (req, res, next) => {
    let loginUser = req.authUser;
    let filter = {
        holidayName: req.body.holidayName,
        schoolId: loginUser.schoolId
    };
    if (!utils.empty(req.body.holidayId)) {
        filter.id = { "$ne": req.body.holidayId };
    }
    holidayModel.getholiday(filter, (result) => {
        if (!utils.empty(result) && result.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("HOLIDAY_NAME_ALREADY_EXISTS", { FIELD: 'english' }) });
        } else {
            next();
        }
    });
}

module.exports = holidayMiddleware;