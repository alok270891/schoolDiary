let utils = require('../helper/utils');
let jwt = require('../helper/jwt');
let userModel = require('../modules/user/userModel');
let parentModel = require('../modules/parent/parentModel');
const userTokenModel = require('../modules/user/userTokenModel');
let auth = {};

auth.checkToken = (req, res, next) => {
    let token = (req.headers && req.headers['auth-token']);
    if (utils.empty(token)) {
        token = (req.body && req.body['auth-token']);
    }
    if (utils.empty(token)) {
        return res.status(401).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
    }
    req.token = token;
    next();
}

auth.isAuthenticatedUser = (req, res, next) => {
    let token = (req.headers && req.headers['auth-token']);
    if (utils.empty(token)) {
        token = (req.body && req.body['auth-token']);
    }
    let userData = jwt.decodeToken(token);
    let condition = { token: token };
    if (!utils.empty(userData.userRole) && userData.userRole > 0) {
        condition.userId = userData.uid;
    } else {
        condition.parentId = userData.uid;
    }
    userTokenModel.loadData(condition, (tokenData) => {
        if (!utils.empty(tokenData) && tokenData.length > 0) {
            if (utils.empty(userData.uid)) {
                return res.status(401).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
            } else {
                if (!utils.empty(userData.userRole) && userData.userRole > 0) {
                    userModel.loaduser({ id: userData.uid }, (user) => {
                        if (!utils.empty(user) && user.length > 0) {
                            req.authUser = user[0].toJSON();
                            req.authUserInstallationId = userData.installationId;
                            req.userRole = user.userRole;
                            next();
                        } else {
                            return res.status(401).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
                        }
                    }, (err) => {
                        console.log(err, '>>>>>>>??????????');
                        return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
                    });
                } else {
                    parentModel.loadparent({ id: userData.uid }, (user) => {
                        if (!utils.empty(user) && user.length > 0) {
                            req.authUser = user[0].toJSON();
                            req.authUserInstallationId = userData.installationId;
                            next();
                        } else {
                            return res.status(400).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
                        }
                    });
                }
            }
        } else {
            return res.status(401).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
        }
    });
}

auth.isVerified = (req, res, next) => {
    if (!Boolean(req.authUser.isVerified)) {
        return res.status(400).send(req.t("NOT_VERIFIED"));
    }
    next();
}

auth.verifyHash = (req, res, next) => {
    if ("params" in req && "hash" in req.params) {
        if (utils.empty(req.params.hash))
            return res.status(400).send(req.t("HASH_NOT_FOUND"));
        else {
            try {
                var decryptedHash = utils.dataDecrypt(req.params.hash);
                req.decryptedHash = decryptedHash;
            } catch (ex) {
                return res.status(400).send(req.t("INVALID_HASH"));
            }
        }
    }
    next();
}

auth.hasPermission = (permissionName) => {
    return (req, res, next) => {
        if (!utils.empty(req.role)) {
            rolePermission.hasPermission(req.role, permissionName, (data) => {
                if (utils.empty(data)) {
                    return res.status(400).send(req.t("NOT_AUTHORIZED"));
                } else {
                    next();
                }
            }, (err) => {
                console.log(err);
                return res.status(500).send(req.t("DB_ERROR"));
            });
        } else {
            return res.status(400).send(req.t("NOT_AUTHORIZED"));
        }
    }
}
module.exports = auth