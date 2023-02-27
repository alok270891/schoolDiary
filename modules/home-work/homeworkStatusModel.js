const db = require("../../config/database");
const utils = require("../../helper/utils");
const homeworkModel = require("./homeWorkModel");
const studentModel = require("../student/studentModel");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let homeworkstatus = sequelize.define('homeworkstatuses', {
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
    studentId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'studentId',
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM,
        field: 'status',
        values: ["Pending", "Completed", "Reopen", "Accepted", "inReview"],
        defaultValue: "Pending",
    }
}, {
    updatedAt: false,
    createdAt: false,
    freezeTableName: true // Model tableName will be the same as the model name
});

homeworkstatus.belongsTo(homeworkModel, { foreignKey: 'homeworkId' });
homeworkModel.hasMany(homeworkstatus, { foreignKey: 'homeworkId' });
homeworkstatus.belongsTo(studentModel, { foreignKey: 'studentId' });
studentModel.hasMany(homeworkstatus, { foreignKey: 'studentId' });


homeworkstatus.createhomeworkstatusMulti = function(createData, success, error) {
    this.bulkCreate(createData).then(success).catch(error);
}

homeworkstatus.createhomeworkstatus = function(homeworkstatusData, success, error) {
    this.create(homeworkstatusData).then(success).catch(error);
}

homeworkstatus.updatehomeworkstatus = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

homeworkstatus.gethomeworkstatus = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter
    }).then(success).catch(error);
};
homeworkstatus.gethomeworkstatusById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

homeworkstatus.gethomeworkstatusList = function(filter, searchName, pg, limit, callback, error) {
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

        currentObject.findAll(nextQuery).then(function(homeworkstatusIds) {
            let ids = homeworkstatusIds.map(obj => obj.id);
            currentObject.gethomeworkstatus({ id: { $in: ids } }, function(homeworkstatuss) {
                callback(count, homeworkstatuss);
            }, error);
        });
    }).catch(error);
}

module.exports = homeworkstatus;