const db = require("../../config/database");
const parentModel = require("../parent/parentModel");
const eventModel = require("./eventModel");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let eventStatus = sequelize.define('eventStatus', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    eventId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'eventId',
        references: {
            model: eventModel,
            key: 'id'
        }
    },
    parentId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'parentId',
        references: {
            model: parentModel,
            key: 'id'
        },
    },
    status: {
        type: Sequelize.ENUM,
        field: 'status',
        values: ['Interested', 'Ignore', 'Going'],
        defaultValue: null,
    }
}, {
    updatedAt: false,
    createdAt: false,
    freezeTableName: true
});

eventStatus.belongsTo(parentModel, { foreignKey: 'parentId' });
parentModel.hasMany(eventStatus, { foreignKey: 'parentId' });
eventStatus.belongsTo(eventModel, { foreignKey: 'eventId' });
eventModel.hasMany(eventStatus, { foreignKey: 'eventId' });


eventStatus.createeventStatusMulti = function(createData, success, error) {
    this.bulkCreate(createData).then(success).catch(error);
}

eventStatus.createeventStatus = function(eventStatusData, success, error) {
    this.create(eventStatusData).then(success).catch(error);
}

eventStatus.updateeventstatus = function(details, filter, success, error) {
    this.findOne({ where: filter }).then(function(obj) {
        if (obj) {
            // update
            obj.update(details).then(success).catch(error);
        } else {
            // insert
            this.create(details).then(success).catch(error);
        }
    });
}

eventStatus.geteventStatus = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter
    }).then(success).catch(error);
};
eventStatus.geteventStatusById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

eventStatus.geteventStatusList = function(filter, searchName, pg, limit, callback, error) {
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

        currentObject.findAll(nextQuery).then(function(eventStatusIds) {
            let ids = eventStatusIds.map(obj => obj.id);
            currentObject.geteventStatus({ id: { $in: ids } }, function(eventStatuss) {
                callback(count, eventStatuss);
            }, error);
        });
    }).catch(error);
}

module.exports = eventStatus;