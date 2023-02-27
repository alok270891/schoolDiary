const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const homeWorkValidator = require('./homeWorkValidator');
const homeWorkModel = require('./homeWorkModel');
const commentModel = require('./commentModel');

let homeWorkMiddleware = {};

homeWorkMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var homeWorkValidators = {};
        var validators = homeWorkValidator.getHomeWorkValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    homeWorkValidators[k] = validators[k];
                }
            }
        } else {
            homeWorkValidators = validators
        }
        let error = _v.validate(req.body, homeWorkValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


homeWorkMiddleware.homeWorkIdExists = (req, res, next) => {
    if (!utils.empty(req.body.homeworkId)) {
        homeWorkModel.gethomwWork({ id: req.body.homeworkId }, (homeWorkDetails) => {
            if (!utils.empty(homeWorkDetails) && homeWorkDetails.length > 0) {
                req.homeWorkDetails = homeWorkDetails[0].dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("HOMEWORK_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("HOMEWORK_ID_NOT_VALID") });
    }
}

homeWorkMiddleware.commentExists = (req, res, next) => {
    let loginUser = req.authUser;
    commentModel.gethomeworkcomment({ homeworkId: req.body.homeworkId, parentId: loginUser.id }, (homeWorkDetails) => {
        if (!utils.empty(homeWorkDetails) && homeWorkDetails.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("HOMEWORK_COMMENT_EXISTS") });
        } else {
            next();
        }
    }, (err) => {
        console.log(err);
        return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
    });
}

homeWorkMiddleware.commentIdExists = (req, res, next) => {
    commentModel.gethomeworkcommentById(req.body.commentId, (homeWorkDetails) => {
        if (!utils.empty(homeWorkDetails)) {
            next();
        } else {
            return res.status(400).json({ data: [], status: false, "message": req.t("COMMENT_ID_NOT_VALID") });
        }
    }, (err) => {
        return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
    });
}

module.exports = homeWorkMiddleware;