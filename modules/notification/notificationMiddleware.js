const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const notificationValidator = require('./notificationValidator');
const notificationModel = require('./notificationModel');

let notificationMiddleware = {};

notificationMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var notificationValidators = {};
        var validators = notificationValidator.getnotificationValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    notificationValidators[k] = validators[k];
                }
            }
        } else {
            notificationValidators = validators
        }
        let error = _v.validate(req.body, notificationValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


notificationMiddleware.notificationIdExists = (req, res, next) => {
    if (!utils.empty(req.body.notificationId)) {
        notificationModel.getnotificationById(req.body.notificationId, (notificationDetails) => {
            if (!utils.empty(notificationDetails)) {
                req.notificationDetails = notificationDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("notification_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("notification_ID_NOT_VALID") });
    }
}

notificationMiddleware.notificationExists = (req, res, next) => {
    let filter = {
        notificationName: req.body.notificationName
    };
    if (!utils.empty(req.body.notificationId)) {
        filter.id = { "$ne": req.body.notificationId };
    }
    notificationModel.getnotification(filter, (result) => {
        if (!utils.empty(result) && result.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("notification_NAME_ALREADY_EXISTS", { FIELD: 'english' }) });
        } else {
            next();
        }
    });
}

module.exports = notificationMiddleware;