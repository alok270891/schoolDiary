const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const breakfastValidator = require('./breakfastValidator');
const breakfastModel = require('./breakfastModel');

let breakfastMiddleware = {};

breakfastMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var breakfastValidators = {};
        var validators = breakfastValidator.getBreakfastValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    breakfastValidators[k] = validators[k];
                }
            }
        } else {
            breakfastValidators = validators
        }
        let error = _v.validate(req.body, breakfastValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


breakfastMiddleware.breakfastIdExists = (req, res, next) => {
    if (!utils.empty(req.body.breakfastId)) {
        breakfastModel.getbreakfastById(req.body.breakfastId, (breakfastDetails) => {
            if (!utils.empty(breakfastDetails)) {
                req.breakfastDetails = breakfastDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("BREAKFAST_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("BREAKFAST_ID_NOT_VALID") });
    }
}

breakfastMiddleware.breakfastExists = (req, res, next) => {
    let loginUser = req.authUser;
    let filter = {
        day: req.body.day,
        schoolId: (loginUser && loginUser.userRole && loginUser.userRole === 1) ? req.body.schoolId : loginUser.schoolId
    };
    if (!utils.empty(req.body.breakfastId)) {
        filter.id = { "$ne": req.body.breakfastId };
    }
    breakfastModel.getbreakfast(filter, (result) => {
        if (!utils.empty(result) && result.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("BREAKFAST_NAME_ALREADY_EXISTS", { FIELD: 'english' }) });
        } else {
            next();
        }
    });
}

module.exports = breakfastMiddleware;