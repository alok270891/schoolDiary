let apns = require("apn");
let utils = require('./utils');
const FCM = require('fcm-push')
let fcm = new FCM(process.env.serverKeyForTeacher);
let fcmp = new FCM(process.env.serverKeyForParent);
let notificationUtil = {};

notificationUtil.getNotificationType = (type) => {
    if (typeof type === "undefined")
        type = "DEFAULT";
    var types = {
        "DEFAULT": 1
    }
    return types[type];
};

notificationUtil.createNotification = (data) => {
    var notification = new apns.Notification();
    var payload = {};
    for (var key in data) {
        switch (key) {
            case 'alert':
                notification.alert = data.alert;
                break;
            case 'badge':
                notification.badge = data.badge;
                break;
            case 'sound':
                notification.sound = data.sound;
                break;
            case 'content-available':
                //notification.setNewsstandAvailable(true);
                var isAvailable = data['content-available'] === 1;
                notification.contentAvailable = isAvailable;
                break;
            case 'category':
                notification.category = data.category;
                break;
            case 'topic':
                notification.topic = data.topic;
                break;
            default:
                payload[key] = data[key];
                break;
        }
    }
    notification.payload = payload;
    notification.expiry = Math.floor(Date.now() / 1000) + 3600;
    return notification;
};

/*
 * Send notifiction to ios
 */
notificationUtil.sendNotification = (data, deviceToken, cb) => {
    if (!utils.empty(deviceToken)) {
        data.topic = process.env.APP_IDENTIFIER;
        var connection = new apns.Provider(config.NOTIFICATION_OPTIONS);
        var notification = notificationUtil.createNotification(data);

        if (!utils.isObject(deviceToken) && utils.isDefined(deviceToken)) {
            deviceToken = [deviceToken];
        }
        if (utils.isObject(deviceToken) && deviceToken.length > 0) {
            connection.send(notification, deviceToken)
                .then((result) => {
                    var successMessage = [];
                    var failureMessage = [];
                    result.sent.forEach((token) => {
                        successMessage.push(token);
                    });
                    result.failed.forEach((failure) => {
                        // A transport-level error occurred (e.g. network problem)
                        failureMessage.push(failure);
                    });
                    if (typeof cb === 'function') {
                        cb(successMessage, failureMessage);
                    } else {
                        console.log("Notification Sent => ");
                        console.log(successMessage);
                        console.log("Notification Failed => ");
                        console.log(failureMessage);
                    }
                });
        }
    }
};

/**
 * Android push notification
 * @param {*} data 
 * @param {*} deviceToken 
 * @param {*} cb 
 */

notificationUtil.sendPushNotification = (data, deviceToken, cb, error) => {
    var message = {
        to: deviceToken, // required fill with device token or topics
        collapse_key: 'your_collapse_key',
        data: {
            order: data
        },
        notification: {
            title: data.title,
            body: data.body
        }
    };

    //callback style
    if (data.sendto === 'parent') {
        fcmp.send(message, function(err, response) {
            if (err) {
                console.log("Something has gone wrong!");
                error(err)
            } else {
                console.log("Successfully sent with response: ", response);
                cb(response);
            }
        });
    } else {
        fcm.send(message, function(err, response) {
            if (err) {
                console.log("Something has gone wrong!");
                error(err)
            } else {
                console.log("Successfully sent with response: ", response);
                cb(response);
            }
        });
    }

}

module.exports = notificationUtil;