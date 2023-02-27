const db = require("../../config/database");
const utils = require("../../helper/utils");
const userModel = require("../user/userModel");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let event = sequelize.define('events', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    schoolId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'schoolId',
        allowNull: true
    },
    createdBy: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'createdBy',
        allowNull: false
    },
    classId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'classId',
        allowNull: true
    },
    title: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'title'
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'description'
    },
    eventDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'eventDate'
    },
    eventTime: {
        type: Sequelize.TIME,
        allowNull: true,
        field: 'eventTime'
    },
    eventPoster: {
        type: Sequelize.STRING,
        field: 'eventPoster',
        allowNull: true,
    },
    location: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'location'
    },
    status: {
        type: Sequelize.ENUM,
        field: 'status',
        values: ['ACTIVE', 'INACTIVE'],
        defaultValue: "ACTIVE",
    }
}, {
    freezeTableName: true //Model tableName will be the same as the model name
});

event.belongsTo(userModel, { foreignKey: 'createdBy' });
userModel.hasMany(event, { foreignKey: 'createdBy' });

event.createevent = function(eventData, success, error) {
    this.create(eventData).then(success).catch(error);
}

event.updateevent = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

event.getevent = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter,
        attributes: ["eventPoster", "id", "title", "description", "eventDate", "eventTime", "location"],
        include: [{
            model: sequelize.model("eventStatus"),
            where: {},
            attributes: ['id', 'status'],
            required: false,
            include: [{
                model: sequelize.model("parents"),
                where: {},
                attributes: ['id', 'firstName', 'lastName', 'grNumber'],
                required: false,
                include: [{
                    model: sequelize.model("students"),
                    where: {},
                    attributes: ['id', 'firstName', 'lastName', 'profilePic', 'rollNumber'],
                    required: false
                }]
            }]
        }, {
            model: sequelize.model("eventFiles"),
            where: {},
            attributes: ['id', 'photo', 'size', 'mimetype', 'name'],
            required: false,
        }, {
            model: sequelize.model("users"),
            where: {},
            attributes: ['id', 'firstName', 'lastName', 'profilePic'],
            required: false,
        }],
        order: [
            ['createdAt', 'DESC'],
        ]
    }).then(success).catch(error);
};
event.geteventById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

event.loadEvent = function(filter, callback, error) {
    this.findAll({
        where: filter
    }).then(callback).catch(error);
};

event.geteventList = function(filter, searchName, pg, limit, callback, error) {
    let currentObject = this;
    if (!utils.empty(searchName)) {
        filter['$or'] = [{ "title": { "$like": '%' + searchName + '%' } }];
    }

    let query = {
        subQuery: false,
        where: filter,
        attributes: [],
        offset: pg,
        limit: limit,
        order: [
            ['createdAt', 'DESC'],
        ]
    }
    currentObject.count(query).then(function(count) {
        let nextQuery = _.extend(query, {
            attributes: ["id"],
            group: [
                ["id"]
            ]
        });

        currentObject.findAll(nextQuery).then(function(eventIds) {
            let ids = eventIds.map(obj => obj.id);
            currentObject.getevent({ id: { $in: ids } }, function(events) {
                callback(count, events);
            }, error);
        });
    }).catch(error);
}

module.exports = event;