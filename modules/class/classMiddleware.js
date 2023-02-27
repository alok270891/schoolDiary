const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const classValidator = require('./classValidator');
const classModel = require('./classModel');
const standardModel = require('../standard/standardModel');

let classMiddleware = {};

classMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var classValidators = {};
        var validators = classValidator.getClassValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    classValidators[k] = validators[k];
                }
            }
        } else {
            classValidators = validators
        }
        let error = _v.validate(req.body, classValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


classMiddleware.classIdExists = (req, res, next) => {
    if (!utils.empty(req.body.classId)) {
        classModel.getclassesById(req.body.classId, (classDetails) => {
            if (!utils.empty(classDetails)) {
                req.classDetails = classDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("CLASS_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("CLASS_ID_NOT_VALID") });
    }
}

classMiddleware.classExists = (req, res, next) => {
    let loginUser = req.authUser;
    let input = req.body;
    let filter = {
        className: req.body.className,
        standardId: req.body.standardId,
        schoolId: (loginUser && loginUser.userRole && loginUser.userRole === 1) ? input.schoolId : loginUser.schoolId
    };
    if (!utils.empty(req.body.classId)) {
        filter.id = { "$ne": req.body.classId };
    }
    classModel.getclasses(filter, (result) => {
        if (!utils.empty(result) && result.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("CLASS_NAME_ALREADY_EXISTS", { FIELD: 'english' }) });
        } else {
            next();
        }
    });
}

classMiddleware.standardIdExists = (req, res, next) => {
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
        next();
    }
}

module.exports = classMiddleware;