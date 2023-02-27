const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const userValidator = require('./userValidator');
const userModel = require('./userModel');

let userMiddleware = {};

userMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        req.action = 'user';
        var userValidators = {};
        var validators = userValidator.getUserValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    userValidators[k] = validators[k];
                }
            }
        } else {
            userValidators = validators
        }
        var error = _v.validate(req.body, userValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}

userMiddleware.emailExists = (req, res, next) => {
    if (!utils.empty(req.body.email)) {
        let userId;
        if (!utils.empty(req.authUser)) {
            userId = req.authUser.id;
        }
        if (req.body.userId) {
            userId = req.body.userId;
        }
        let filter = { email: req.body.email };
        if (!utils.empty(userId)) {
            filter.id = { "$ne": userId };
        }
        userModel.loaduser(filter, (user) => {
            if (!utils.empty(user) && user.length > 0) {
                return res.status(400).json({ data: [], status: false, "message": req.t("USER_ALREADY_EXISTS", { FIELD: "email" }) });
            } else {
                next();
            }
        }, (err) => {
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        next();
    }
}


userMiddleware.mobileNOExists = (req, res, next) => {
    if (!utils.empty(req.body.mobileNo)) {
        let userId;
        if (!utils.empty(req.authUser)) {
            userId = req.authUser.id;
        }
        if (req.body.userId) {
            userId = req.body.userId;
        }
        let filter = { mobileNo: req.body.mobileNo };
        if (!utils.empty(userId) && req.originalUrl !== '/api/v1/user/create') {
            filter.id = { "$ne": userId };
        }
        userModel.loaduser(filter, (user) => {
            if (!utils.empty(user) && user.length > 0) {
                return res.status(400).json({ data: [], status: false, "message": req.t("USER_ALREADY_EXISTS", { FIELD: "mobile no" }) });
            } else {
                next();
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        next();
    }
}

userMiddleware.userIdExists = (req, res, next) => {
    if (!utils.empty(req.body.userId)) {
        userModel.loaduser({ id: req.body.userId }, (user) => {
            if (!utils.empty(user) && user.length > 0) {
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("USERID_NOT_VALID") });
            }
        }, (err) => {
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("USERID_NOT_VALID") });
    }
}

userMiddleware.checkImage = (req, res, next) => {
    if (!utils.empty(req.files) && !utils.empty(req.files.profilePic)) {
        let error = "";
        error = utils.checkValidImageFile(req.files.profilePic, req);
        if (!utils.empty(error)) {
            return res.status(400).json({ data: [], status: false, message: error });
        }
    }
    next();
};

userMiddleware.checkUserid = (req, res, next) => {
    if (req.body.sendto === 'selecteduser') {
        userMiddleware.userIdExists(req, res, next);
    } else {
        next();
    }
};
userMiddleware.checkUserRole = (req, res, next) => {
    if (req.body.userRole === 1) {
        return res.status(400).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED_TO_CREATE", { FIELD: "admin" }) });
    } else {
        next();
    }
};


module.exports = userMiddleware;