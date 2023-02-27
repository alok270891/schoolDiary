const jwt = require('../../helper/jwt');
const parentModel = require('./parentModel');
const userTokenModel = require('../user/userTokenModel');
const utils = require('../../helper/utils');
const config = require('../../config/config');
const waterfall = require('async-waterfall');
const Sequelize = require('sequelize');
const parentInstallations = require('../user/installationModel');
const parentUtil = require('./parentHelper');
let parentCtr = {};


parentCtr.login = (req, res) => {
    let input = req.body;
    let filter = {};
    filter['grNumber'] = input.grNumber;
    if (!!input.schoolId) {
        filter['schoolId'] = input.schoolId;
    }
    if (!!input.email) {
        filter['email'] = input.email;
    }
    if (!!input.mobileNo) {
        filter['mobileNo'] = input.mobileNo;
    }
    parentModel.loadparent(filter, (parentData) => {
        if (!utils.empty(parentData) && parentData.length > 0) {
            let parent = parentData[0];
            if (!input.mobileNo && !parent.authenticate(input.password)) {
                return res.status(400).json({
                    data: [],
                    status: false,
                    message: req.t("NOT_VALID_EMAIL_PASSWORD")
                });
            } else if (parent.status === 'INACTIVE') {
                return res.status(400).json({
                    data: [],
                    status: false,
                    message: req.t("INACTIVE_ACCOUNT")
                });
            } else {
                let randomString = utils.getRandomString(2);
                let tokenData = {
                    uid: parent.id,
                    email: parent.email,
                    randomString: randomString
                };
                if (!utils.empty(input.installationId)) {
                    tokenData = {
                        uid: parent.id,
                        email: parent.email,
                        installationId: input.installationId,
                        randomString: randomString
                    };
                }

                let responseData = parent.dataValues;
                responseData["secretToken"] = jwt.createSecretToken(tokenData);
                parentModel.updateparent({
                    lastLoggedIn: Sequelize.fn('NOW')
                }, {
                    id: parent.id
                }, (data) => {}, (err) => {
                    console.log('err..', err)
                });
                delete responseData.password;
                let response = {
                    "data": responseData,
                    "message": req.t('LOGIN_SUCCESSFUL'),
                    "status": true
                }
                if (input.deviceId && input.deviceToken) {
                    parentInstallations.setParentInstallation(input, parent.id, (installationResult) => {}, (error) => {});
                }
                userTokenModel.createuserTokens({
                    parentId: responseData.id,
                    token: responseData.secretToken
                }, (tokenDetails) => {
                    return res.status(200).json(response);
                }, (err) => {
                    return res.status(500).json({
                        data: [],
                        status: false,
                        message: req.t("DB_ERROR")
                    });
                });
            }
        } else {
            res.status(400).json({
                data: [],
                status: false,
                message: req.t("NOT_VALID_EMAIL_PASSWORD")
            });
        }
    }, (error) => {
        console.log(error)
        return res.status(500).json({
            data: [],
            status: false,
            message: req.t("DB_ERROR")
        });
    });
};

parentCtr.create = (req, res) => {
    let input = req.body;

    waterfall([
        (callback) => {
            let parentData = {
                firstName: input.firstName,
                lastName: input.lastName,
                email: input.email,
                mobileNo: input.mobileNo,
                address: input.address,
                schoolId: input.schoolId,
                password: utils.getRandomString(5)
            };
            parentModel.createparent(parentData, (parentMaster) => {
                callback(null, parentMaster);
            }, (error) => {
                console.log(error);
                callback(error);
            });
        }
    ], (err, parentMaster) => {
        if (err) {
            return res.status(400).json({ "message": err, data: [], status: false });
        } else {
            let response = {
                "data": parentMaster,
                "message": req.t("PARENT_CREATED"),
                status: true
            }
            return res.status(200).json(response);
        }
    });
}

parentCtr.update = (req, res) => {
    let input = req.body;
    let parentId = req.body.parentId;
    let loginUser = req.authUser;
    if (!parentId) {
        parentId = loginUser.id;
    }
    waterfall([
        (callback) => {
            if (!utils.empty(req.files) && !utils.empty(req.files.profilePic)) {
                parentUtil.savestudentImage(req.files, null, (error, imagepath) => {
                    if (!utils.empty(error)) {
                        callback(error, "");
                    } else {
                        callback(null, imagepath);
                    }
                });
            } else {
                callback(null, null);
            }
        },
        (image, callback) => {
            let parentData = {};
            if (!utils.empty(input.firstName)) {
                parentData.firstName = input.firstName;
            }
            if (!utils.empty(input.lastName)) {
                parentData.lastName = input.lastName;
            }
            if (!utils.empty(input.email)) {
                parentData.email = input.email;
            }
            if (!utils.empty(input.mobileNo)) {
                parentData.mobileNo = input.mobileNo;
            }
            if (!utils.empty(input.address)) {
                parentData.address = input.address;
            }
            if (!utils.empty(input.schoolId)) {
                parentData.schoolId = input.schoolId;
            }
            if (!utils.empty(image)) {
                parentData['profilePic'] = image;
            }
            parentModel.updateparent(parentData, { id: parentId }, (parentDetail) => {
                callback(null, parentDetail);
            }, (err) => {
                console.log(err);
                callback(err);
            });
        },
        (parentDetail, callback) => {
            parentModel.getparent({ id: parentId }, (parentDetail) => {
                if (!utils.empty(parentDetail) && parentDetail.length > 0) {
                    callback(null, parentDetail[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t("DB_ERROR"));
            });
        }
    ], (err, parentDetail) => {
        if (err) {
            return res.status(400).json({ "message": err });
        } else {
            let response = {
                "data": parentDetail,
                "message": req.t("PARENT_UPDATED")
            }
            return res.status(200).json(response);
        }
    });
}

parentCtr.parentList = (req, res) => {
    let filter = {};
    let input = req.body;
    let limit = config.MAX_RECORDS;
    let searchName = '';
    let pg = 0;
    if (utils.isDefined(req.body.pg) && (parseInt(req.body.pg) > 1)) {
        pg = parseInt(req.body.pg - 1) * limit;
    } else {
        if (req.body.pg == -1) {
            pg = 0;
            limit = null;
        }
    }
    if (!utils.empty(input.searchName)) {
        searchName = input.searchName;
    }
    if (!utils.empty(input.status)) {
        filter['status'] = input.status.toUpperCase();
    }

    parentModel.getparentList(filter, searchName, pg, limit, (total, data) => {
        if (total > 0) {
            let pages = Math.ceil(total / ((limit) ? limit : total));
            let pagination = {
                pages: pages ? pages : 1,
                total: total,
                max: (limit) ? limit : total
            };
            return res.status(200).json({ pagination: pagination, data: data, message: '', status: true });
        } else {
            return res.status(200).json({ "message": req.t("NO_RECORD_FOUND"), data: [], status: true });
        }
    }, (err) => {
        return res.status(500).json({ "message": req.t("DB_ERROR"), data: [], status: false });
    });
}

parentCtr.getparentDetails = (req, res) => {
    return res.status(200).json({ "data": req.parent });
}

parentCtr.statusChange = (req, res) => {
    let input = req.body;
    let updateData = { status: input.status };
    let filter = { id: input.parentId };
    parentModel.updateparent(updateData, filter, (userUpdate) => {
        return res.status(200).json({ data: [], status: true, message: req.t("STATUS_CHANGE") });
    }, (err) => {
        console.log(err);
        return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
    });
}

module.exports = parentCtr;