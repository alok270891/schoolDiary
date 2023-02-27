let db = require("../../config/database");
let utils = require('../../helper/utils');
let notificationUtils = require("../../helper/notificationUtils");
let user = require("./userModel");
let sequelize = db.sequelize;
let Sequelize = db.Sequelize;
let installations = sequelize.define('installations', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    timezone: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'timezone'
    },
    appVersion: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'appVersion'
    },
    buildNumber: {
        type: Sequelize.STRING,
        field: 'buildNumber',
        allowNull: true,
    },
    appName: {
        type: Sequelize.STRING,
        field: 'appName',
        allowNull: true,
    },
    deviceType: {
        type: Sequelize.ENUM,
        values: ['ios', 'android'],
        allowNull: false,
        field: 'deviceType',
        defaultValue: 'android'
    },
    owner: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {
            // This is a reference to another model
            model: user,
            // This is the column name of the referenced model
            key: 'id'
        }
    },
    parentId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'parentId',
        allowNull: true
    },
    badge: {
        type: Sequelize.INTEGER,
        field: 'badge',
        defaultValue: 0,
    },
    notification: {
        type: Sequelize.INTEGER,
        field: 'notification',
        defaultValue: 0
    },
    appIdentifier: {
        type: Sequelize.STRING,
        field: 'appIdentifier',
        allowNull: true
    },
    localeIdentifier: {
        type: Sequelize.STRING,
        field: 'localeIdentifier',
        allowNull: true
    },
    deviceToken: {
        type: Sequelize.STRING,
        field: 'deviceToken',
        allowNull: true
    },
    deviceId: {
        type: Sequelize.STRING,
        field: 'deviceId',
        allowNull: false
    }
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

/**
 * static function
 */
installations.load = function(installationId, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find({ _id: installationId }, select).exec(callback);
};

installations.existsId = function(installationId, callback) {
    if (!installationId) {
        callback(false);
    } else {
        this.load(installationId, (err, existsResult) => {
            console.log(err);
            callback((!utils.isDefined(err) && existsResult.length > 0) ? true : false);
        });
    }
};

installations.getTimezone = function(installationId, callback) {
    this.find({ _id: installationId }).select("timezone").lean().exec(callback);
};

installations.loadByOwner = function(owner, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find({ owner: owner }, select).exec(callback);
};

installations.loadByOwnerAndInstallation = function(installationId, owner, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find({ owner: owner, _id: installationId }, select).exec(callback);
};

installations.loadByToken = function(deviceToken, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find({ "deviceToken": deviceToken }, select).exec(callback);
};

installations.removeTokens = function(filter, callback) {
    this.findAllAndRemove(filter, callback);
}

installations.setUserInstallation = function(input, owner, callback, error) {
    let conditions = { where: { deviceId: input.deviceId } }
    let notification = notificationUtils.getNotificationType();
    let updateData = { owner: owner, notification: notification, badge: 0, deviceToken: input.deviceToken };
    this.findAll(conditions).then(function(details) {
        if (!utils.empty(details) && details.length > 0) {
            this.update(updateData, conditions, { multi: true }, callback);
        } else {
            this.create(updateData).then(success).catch(error);
        }
    }).catch(error);
};

installations.setParentInstallation = function(input, owner, callback, error) {
    let conditions = { where: { deviceId: input.deviceId } }
    let notification = notificationUtils.getNotificationType();
    let updateData = { parentId: owner, notification: notification, badge: 0, deviceToken: input.deviceToken };

    this.findAll(conditions).then(function(details) {
        if (!utils.empty(details) && details.length > 0) {
            this.update(updateData, conditions, { multi: true }, callback);
        } else {
            this.create(updateData).then(success).catch(error);
        }
    }).catch(error);
};

installations.updateDeviceToken = function(deviceToken, newDeviceToken, callback) {
    if (typeof newDeviceToken === 'function' && !callback) {
        callback = newDeviceToken;
        newDeviceToken = 0;
    }
    let conditions = { deviceToken: deviceToken };
    this.update(conditions, { $set: { deviceToken: newDeviceToken } }, { multi: true }, callback);
}

installations.addRecord = function(user, success, error) {
    this.findAll({ where: { id: user.deviceId } }).then(function(details) {
        if (!utils.empty(details) && details.length > 0) {
            this.update(user, { where: { deviceId: user.deviceId } }).then(success).catch(error);
        } else {
            this.create(user).then(success).catch(error);
        }
    }).catch(error);
}

installations.deleteDevice = function(user, success, error) {
    this.destroy({ where: user }).then(success).catch(error);
}

installations.loadRecords = function(filter, callback, error) {
    this.findAll({ where: filter }).then(callback).catch(error);
}

module.exports = installations;