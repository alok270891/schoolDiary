const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const subjectValidator = require('./subjectValidator');
const subjectModel = require('./subjectModel');

let subjectMiddleware = {};

subjectMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var subjectValidators = {};
        var validators = subjectValidator.getSubjectValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    subjectValidators[k] = validators[k];
                }
            }
        } else {
            subjectValidators = validators
        }
        let error = _v.validate(req.body, subjectValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


subjectMiddleware.subjectIdExists = (req, res, next) => {
    if (!utils.empty(req.body.subjectId)) {
        subjectModel.getsubjectById(req.body.subjectId, (subjectDetails) => {
            if (!utils.empty(subjectDetails)) {
                req.subjectDetails = subjectDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("SUBJECT_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("SUBJECT_ID_NOT_VALID") });
    }
}

subjectMiddleware.subjectExists = (req, res, next) => {
    let loginUser = req.authUser;
    let input = req.body;
    let filter = {
        subjectName: req.body.subjectName,
        schoolId: (loginUser && loginUser.userRole && loginUser.userRole === 1) ? input.schoolId : loginUser.schoolId
    };
    if (!utils.empty(req.body.subjectId)) {
        filter.id = { "$ne": req.body.subjectId };
    }
    subjectModel.getsubject(filter, (result) => {
        if (!utils.empty(result) && result.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("SUBJECT_NAME_ALREADY_EXISTS", { FIELD: 'english' }) });
        } else {
            next();
        }
    });
}

module.exports = subjectMiddleware;