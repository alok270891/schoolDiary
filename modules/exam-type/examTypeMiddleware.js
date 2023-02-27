const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const examTypeValidator = require('./examTypeValidator');
const examTypeModel = require('./examTypeModel');
const standardModel = require('../standard/standardModel');

let examTypeMiddleware = {};

examTypeMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var examTypeValidators = {};
        var validators = examTypeValidator.getExamTypeValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    examTypeValidators[k] = validators[k];
                }
            }
        } else {
            examTypeValidators = validators
        }
        let error = _v.validate(req.body, examTypeValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


examTypeMiddleware.examTypeIdExists = (req, res, next) => {
    if (!utils.empty(req.body.examTypeId)) {
        examTypeModel.getexamTypesById(req.body.examTypeId, (examTypeDetails) => {
            if (!utils.empty(examTypeDetails)) {
                req.examTypeDetails = examTypeDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("EXAM_TYPE_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("EXAM_TYPE_ID_NOT_VALID") });
    }
}

examTypeMiddleware.examTypeExists = (req, res, next) => {
    let loginUser = req.authUser;
    let filter = {
        name: req.body.name,
        schoolId: (loginUser && loginUser.userRole && loginUser.userRole === 1) ? input.schoolId : loginUser.schoolId
    };
    if (!utils.empty(req.body.examTypeId)) {
        filter.id = { "$ne": req.body.examTypeId };
    }
    examTypeModel.getexamTypes(filter, (result) => {
        if (!utils.empty(result) && result.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("EXAM_TYPE_NAME_ALREADY_EXISTS", { FIELD: 'english' }) });
        } else {
            next();
        }
    });
}


module.exports = examTypeMiddleware;