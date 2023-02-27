const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const examTimeTableValidator = require('./examTimeTableValidator');
const examTimeTableModel = require('./examTimeTableModel');
const userModel = require('../user/userModel');

let examTimeTableMiddleware = {};

examTimeTableMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var examTimeTableValidators = {};
        var validators = examTimeTableValidator.getExamTimeTableValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    examTimeTableValidators[k] = validators[k];
                }
            }
        } else {
            examTimeTableValidators = validators
        }
        let error = _v.validate(req.body, examTimeTableValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


examTimeTableMiddleware.examTimeTableIdExists = (req, res, next) => {
    if (!utils.empty(req.body.examTimeTableId)) {
        examTimeTableModel.getexamTimeTableById(req.body.examTimeTableId, (examTimeTableDetails) => {
            if (!utils.empty(examTimeTableDetails)) {
                req.examTimeTableDetails = examTimeTableDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("EXAM_TIME_TABLE_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("EXAM_TIME_TABLE_ID_NOT_VALID") });
    }
}

examTimeTableMiddleware.teacherIdExists = (req, res, next) => {
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

module.exports = examTimeTableMiddleware;