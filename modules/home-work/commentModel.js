const db = require("../../config/database");
const utils = require("../../helper/utils");
const homeworkModel = require("./homeWorkModel");
const parentModel = require("../parent/parentModel");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let homeworkcomment = sequelize.define('homeworkcomments', {
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
    parentId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'parentId',
        allowNull: false
    },
    comment: {
        type: Sequelize.TEXT,
        field: 'comment',
        allowNull: false
    }
}, {
    updatedAt: false,
    createdAt: false,
    freezeTableName: true // Model tableName will be the same as the model name
});

homeworkcomment.belongsTo(homeworkModel, { foreignKey: 'homeworkId' });
homeworkModel.hasMany(homeworkcomment, { foreignKey: 'homeworkId' });
homeworkcomment.belongsTo(parentModel, { foreignKey: 'parentId' });
parentModel.hasMany(homeworkcomment, { foreignKey: 'parentId' });


homeworkcomment.createhomeworkcommentMulti = function(createData, success, error) {
    this.bulkCreate(createData).then(success).catch(error);
}

homeworkcomment.createhomeworkcomment = function(homeworkcommentData, success, error) {
    this.create(homeworkcommentData).then(success).catch(error);
}

homeworkcomment.updatehomeworkcomment = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

homeworkcomment.gethomeworkcomment = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter
    }).then(success).catch(error);
};
homeworkcomment.gethomeworkcommentById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

homeworkcomment.gethomeworkcommentList = function(filter, searchName, pg, limit, callback, error) {
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

        currentObject.findAll(nextQuery).then(function(homeworkcommentIds) {
            let ids = homeworkcommentIds.map(obj => obj.id);
            currentObject.gethomeworkcomment({ id: { $in: ids } }, function(homeworkcomments) {
                callback(count, homeworkcomments);
            }, error);
        });
    }).catch(error);
}

module.exports = homeworkcomment;