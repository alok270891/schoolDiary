const db = require("../../config/database");
const utils = require("../../helper/utils");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let notification = sequelize.define('notifications', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'userId',
        allowNull: true
    },
    parentId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'parentId',
        allowNull: true
    },
    title: {
        type: Sequelize.TEXT,
        field: 'title',
        allowNull: false
    },
    dateTime: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'dateTime'
    },
    readFlag: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'readFlag',
        defaultValue: 1
    }
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

notification.createnotification = function(notificationData, success, error) {
    this.create(notificationData).then(success).catch(error);
}

notification.deletenotification = function(filter, success, error) {
    this.destroy({ where: filter }).then(success).catch(error);
}
notification.updatenotification = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

notification.getnotification = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter
    }).then(success).catch(error);
};
notification.getnotificationById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

notification.getnotificationList = function(filter, pg, limit, callback, error) {
    let currentObject = this;
    let query = {
        subQuery: false,
        where: filter,
        attributes: [],
        offset: pg,
        limit: limit
    }
    currentObject.count(query).then(function(count) {
        let nextQuery = _.extend(query, {
            attributes: ["id"],
            group: [
                ["id"]
            ]
        });

        currentObject.findAll(nextQuery).then(function(notificationIds) {
            let ids = notificationIds.map(obj => obj.id);
            currentObject.getnotification({ id: { $in: ids } }, function(notifications) {
                filter['readFlag'] = 1;
                currentObject.count({ where: filter }).then(function(unreadNotification) {
                    callback(count, notifications, unreadNotification);
                }, error);
            }, error);
        });
    }).catch(error);
}

module.exports = notification;