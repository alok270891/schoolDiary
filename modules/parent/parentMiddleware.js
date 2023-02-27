const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const parentValidator = require('./parentValidator');
const parentModel = require('./parentModel');

let parentMiddleware = {};

parentMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        req.action = 'parent';
        var parentValidators = {};
        var validators = parentValidator.getParentValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    parentValidators[k] = validators[k];
                }
            }
        } else {
            parentValidators = validators
        }
        let error = _v.validate(req.body, parentValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


parentMiddleware.parentIdExists = (req, res, next) => {
    if (!utils.empty(req.body.parentId)) {
        parentModel.getparentById(req.body.parentId, (parentDetails) => {
            if (!utils.empty(parentDetails)) {
                req.parentDetails = parentDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("PARENT_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("PARENT_ID_NOT_VALID") });
    }
}


parentMiddleware.parentGrNumberExists = (req, res, next) => {
    let input = req.body;
    let loginUser = req.authUser;
    let filter = {
        grNumber: req.body.grNumber,
        schoolId: (loginUser && loginUser.userRole && loginUser.userRole === 1) ? input.schoolId : loginUser.schoolId
    };
    if (!utils.empty(req.body.parentId)) {
        filter.id = { "$ne": req.body.parentId };
    }
    parentModel.getparent(filter, (result) => {
        if (!utils.empty(result) && result.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("PARENT_GRNUMBER_ALREADY_EXISTS") });
        } else {
            next();
        }
    });
}

module.exports = parentMiddleware;