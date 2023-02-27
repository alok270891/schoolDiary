const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const studentValidator = require('./studentValidator');
const studentModel = require('./studentModel');
const resultModel = require('./resultModel');

let studentMiddleware = {};

studentMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var studentValidators = {};
        var validators = studentValidator.getStudentValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    studentValidators[k] = validators[k];
                }
            }
        } else {
            studentValidators = validators
        }
        let error = _v.validate(req.body, studentValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


studentMiddleware.studentIdExists = (req, res, next) => {
    if (!utils.empty(req.body.studentId)) {
        studentModel.getstudentById(req.body.studentId, (studentDetails) => {
            if (!utils.empty(studentDetails)) {
                req.studentDetails = studentDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("STUDENT_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("STUDENT_ID_NOT_VALID") });
    }
}

studentMiddleware.studentExists = (req, res, next) => {
    let filter = {
        studentName: req.body.studentName
    };
    if (!utils.empty(req.body.studentId)) {
        filter.id = { "$ne": req.body.studentId };
    }
    studentModel.getstudent(filter, (result) => {
        if (!utils.empty(result) && result.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("STUDENT_NAME_ALREADY_EXISTS", { FIELD: 'english' }) });
        } else {
            next();
        }
    });
}

studentMiddleware.rollNumberExists = (req, res, next) => {
    let loginUser = req.authUser;
    let filter = {
        rollNumber: req.body.rollNumber,
        classId: req.body.classId
    };
    if (!utils.empty(req.body.studentId)) {
        filter.id = { "$ne": req.body.studentId };
    }
    studentModel.getstudent(filter, (result) => {
        if (!utils.empty(result) && result.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("STUDENT_ROLL_ALREADY_EXISTS", { FIELD: 'english' }) });
        } else {
            next();
        }
    });
}

studentMiddleware.checkResult = (req, res, next) => {
    let loginUser = req.authUser;
    let filter = {
        examTimeTableId: req.body.examTimeTableId
    };
    resultModel.getresultsIds(filter, (result) => {
        if (!utils.empty(result) && result.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("RESULT_ALREADY_EXISTS", { FIELD: 'english' }) });
        } else {
            next();
        }
    });
}

module.exports = studentMiddleware;