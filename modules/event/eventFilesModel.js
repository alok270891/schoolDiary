const db = require("../../config/database");
const eventModel = require("./eventModel");
const utils = require("../../helper/utils");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let eventFiles = sequelize.define('eventFiles', {
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
    photo: {
        type: Sequelize.STRING(255),
        field: 'photo',
        allowNull: true,
        get: function() {
            var image = this.getDataValue('photo');
            if (!utils.empty(image) && !utils.empty(image.match(/https:/gi))) {
                return image;
            } else {
                return (utils.empty(image)) ? "" : process.env.S3_BASE_URL + config.EVENT_IMAGE_PATH + image;
            }
        }
    },
    size: {
        type: Sequelize.STRING(255),
        field: 'size',
        allowNull: true
    },
    mimetype: {
        type: Sequelize.STRING(255),
        field: 'mimetype',
        allowNull: true
    },
    name: {
        type: Sequelize.VIRTUAL,
        get() {
            return this.getDataValue('photo');
        }
    }
}, {
    updatedAt: false,
    createdAt: false,
    freezeTableName: true
});

eventFiles.belongsTo(eventModel, { foreignKey: 'eventId' });
eventModel.hasMany(eventFiles, { foreignKey: 'eventId' });


eventFiles.createeventFilesMulti = function(createData, success, error) {
    this.bulkCreate(createData).then(success).catch(error);
}

eventFiles.createeventFiles = function(eventFilesData, success, error) {
    this.create(eventFilesData).then(success).catch(error);
}

eventFiles.updateeventFiles = function(details, filter, success, error) {
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

eventFiles.geteventFiles = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter
    }).then(success).catch(error);
};
eventFiles.geteventFilesById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

eventFiles.geteventFilesList = function(filter, searchName, pg, limit, callback, error) {
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

        currentObject.findAll(nextQuery).then(function(eventFilesIds) {
            let ids = eventFilesIds.map(obj => obj.id);
            currentObject.geteventFiles({ id: { $in: ids } }, function(eventFiless) {
                callback(count, eventFiless);
            }, error);
        });
    }).catch(error);
}

module.exports = eventFiles;