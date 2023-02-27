const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const standardValidator = require('./standardValidator');
const standardModel = require('./standardModel');

let standardMiddleware = {};

standardMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var standardValidators = {};
        var validators = standardValidator.getStandardValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    standardValidators[k] = validators[k];
                }
            }
        } else {
            standardValidators = validators
        }
        let error = _v.validate(req.body, standardValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


standardMiddleware.standardIdExists = (req, res, next) => {
    if (!utils.empty(req.body.standardId)) {
        standardModel.getstandardById(req.body.standardId, (standardDetails) => {
            if (!utils.empty(standardDetails)) {
                req.standardDetails = standardDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("STANDARD_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("STANDARD_ID_NOT_VALID") });
    }
}

standardMiddleware.standardExists = (req, res, next) => {
    let loginUser = req.authUser;
    let filter = {
        standardName: req.body.standardName,
        schoolId: (loginUser && loginUser.userRole && loginUser.userRole === 1) ? req.body.schoolId : loginUser.schoolId
    };
    if (!utils.empty(req.body.standardId)) {
        filter.id = { "$ne": req.body.standardId };
    }
    standardModel.getstandard(filter, (result) => {
        if (!utils.empty(result) && result.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("STANDARD_NAME_ALREADY_EXISTS", { FIELD: 'english' }) });
        } else {
            next();
        }
    });
}

module.exports = standardMiddleware;