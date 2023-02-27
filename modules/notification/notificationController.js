const notificationModel = require('./notificationModel');
const utils = require('../../helper/utils');
const config = require('../../config/config');
const waterfall = require('async-waterfall');
let notificationCtr = {};

notificationCtr.create = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    waterfall([
        (callback) => {
            let notificationData = {
                notificationName: input.notificationName,
                notificationDate: input.notificationDate,
                schoolId: loginUser.schoolId
            };
            notificationModel.createnotification(notificationData, (notificationMaster) => {
                callback(null, notificationMaster.id);
            }, (error) => {
                console.log(error);
                callback(error);
            });
        }
    ], (err, notificationId) => {
        if (err) {
            return res.status(400).json({ "message": err, data: [], status: false });
        } else {
            let response = {
                "data": { "notificationId": notificationId },
                "message": req.t("notification_CREATED"),
                status: true
            }
            return res.status(200).json(response);
        }
    });
}

notificationCtr.notificationList = (req, res) => {
    let input = req.body;
    let limit = config.MAX_RECORDS;
    let loginUser = req.authUser;
    let filter = {};
    let pg = 0;
    if (utils.isDefined(req.body.pg) && (parseInt(req.body.pg) > 1)) {
        pg = parseInt(req.body.pg - 1) * limit;
    } else {
        if (req.body.pg == -1) {
            pg = 0;
            limit = null;
        }
    }
    if (!utils.empty(loginUser.userRole)) {
        filter['userId'] = loginUser.id;
    } else {
        filter['parentId'] = loginUser.id;
    }

    notificationModel.getnotificationList(filter, pg, limit, (total, data, unreadNotification) => {
        if (total > 0) {
            let pages = Math.ceil(total / ((limit) ? limit : total));
            let pagination = {
                pages: pages ? pages : 1,
                total: total,
                unreadNotification: unreadNotification,
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

notificationCtr.delete = (req, res) => {
    let input = req.body;
    let role = req.authUser.userRole;
    if (!utils.empty(role)) {
        let filter = { id: input.notificationId };
        notificationModel.deletenotification(filter, (userUpdate) => {
            return res.status(200).json({ data: [], status: true, message: req.t("notification_DELETE") });
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
        });
    } else {
        return res.status(500).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
    }
}

module.exports = notificationCtr;