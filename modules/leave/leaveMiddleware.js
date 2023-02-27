const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const leaveValidator = require('./leaveValidator');
const leaveModel = require('./leaveModel');

let leaveMiddleware = {};

leaveMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var leaveValidators = {};
        var validators = leaveValidator.getLeaveValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    leaveValidators[k] = validators[k];
                }
            }
        } else {
            leaveValidators = validators
        }
        let error = _v.validate(req.body, leaveValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


leaveMiddleware.leaveIdExists = (req, res, next) => {
    if (!utils.empty(req.body.leaveId)) {
        leaveModel.getleaveById(req.body.leaveId, (leaveDetails) => {
            if (!utils.empty(leaveDetails)) {
                req.leaveDetails = leaveDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("LEAVE_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("LEAVE_ID_NOT_VALID") });
    }
}

leaveMiddleware.leaveExists = (req, res, next) => {
    let filter = {
        leaveName: req.body.leaveName
    };
    if (!utils.empty(req.body.leaveId)) {
        filter.id = { "$ne": req.body.leaveId };
    }
    leaveModel.getleave(filter, (result) => {
        if (!utils.empty(result) && result.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("leave_NAME_ALREADY_EXISTS", { FIELD: 'english' }) });
        } else {
            next();
        }
    });
}

module.exports = leaveMiddleware;