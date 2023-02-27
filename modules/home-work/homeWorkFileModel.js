const db = require("../../config/database");
const utils = require("../../helper/utils");
const homeworkModel = require("./homeWorkModel");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let homeworkdocument = sequelize.define('homeworkdocuments', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    homeworkId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'homeworkId',
        allowNull: false
    },
    documentFile: {
        type: Sequelize.STRING(255),
        field: 'documentFile',
        allowNull: true,
        get: function() {
            // 'this' allows you to access attributes of the instance
            var image = this.getDataValue('documentFile');
            if (!utils.empty(image) && !utils.empty(image.match(/https:/gi))) {
                return image;
            } else {
                // return (utils.empty(image)) ? "" : process.env.S3_BASE_URL + process.env.BUCKET_NAME + "/" + config.USER_IMAGE_PATH + image;
                // return (utils.empty(image)) ? "" : process.env.S3_BASE_URL + config.HOMEWORK_IMAGE_PATH + image;
                return (utils.empty(image)) ? "" : process.env.S3_BASE_URL + config.HOMEWORK_IMAGE_PATH + image;
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
            return this.getDataValue('documentFile');
        }
    },
    type: {
        type: Sequelize.VIRTUAL,
        get() {
            return this.getDataValue('mimetype');
        }
    }
}, {
    updatedAt: false,
    createdAt: false,
    freezeTableName: true // Model tableName will be the same as the model name
});

homeworkdocument.belongsTo(homeworkModel, { foreignKey: 'homeworkId' });
homeworkModel.hasMany(homeworkdocument, { foreignKey: 'homeworkId' });


homeworkdocument.createhomeworkdocumentMulti = function(createData, success, error) {
    this.bulkCreate(createData).then(success).catch(error);
}

homeworkdocument.createhomeworkdocument = function(homeworkdocumentData, success, error) {
    this.create(homeworkdocumentData).then(success).catch(error);
}

homeworkdocument.updatehomeworkdocument = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

homeworkdocument.gethomeworkdocument = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter
    }).then(success).catch(error);
};
homeworkdocument.gethomeworkdocumentById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

homeworkdocument.gethomeworkdocumentList = function(filter, searchName, pg, limit, callback, error) {
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

        currentObject.findAll(nextQuery).then(function(homeworkdocumentIds) {
            let ids = homeworkdocumentIds.map(obj => obj.id);
            currentObject.gethomeworkdocument({ id: { $in: ids } }, function(homeworkdocuments) {
                callback(count, homeworkdocuments);
            }, error);
        });
    }).catch(error);
}

module.exports = homeworkdocument;