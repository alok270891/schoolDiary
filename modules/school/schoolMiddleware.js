const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const schoolValidator = require('./schoolValidator');
const schoolModel = require('./schoolModel');

let schoolMiddleware = {};

schoolMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var schoolValidators = {};
        var validators = schoolValidator.getschoolValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    schoolValidators[k] = validators[k];
                }
            }
        } else {
            schoolValidators = validators
        }
        let error = _v.validate(req.body, schoolValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


schoolMiddleware.schoolIdExists = (req, res, next) => {
    if (!utils.empty(req.body.schoolId)) {
        schoolModel.getschoolById(req.body.schoolId, (schoolDetails) => {
            if (!utils.empty(schoolDetails)) {
                req.schoolDetails = schoolDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("SCHOOL_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("SCHOOL_ID_NOT_VALID") });
    }
}

schoolMiddleware.schoolExists = (req, res, next) => {
    let filter = {
        schoolName: req.body.schoolName
    };
    if (!utils.empty(req.body.schoolId)) {
        filter.id = { "$ne": req.body.schoolId };
    }
    schoolModel.getschool(filter, (result) => {
        if (!utils.empty(result) && result.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("SCHOOL_NAME_ALREADY_EXISTS", { FIELD: 'english' }) });
        } else {
            next();
        }
    });
}

module.exports = schoolMiddleware;