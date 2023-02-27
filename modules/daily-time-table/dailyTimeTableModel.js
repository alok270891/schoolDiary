const db = require("../../config/database");
const utils = require("../../helper/utils");
const userModel = require('../user/userModel');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let dailyTimeTable = sequelize.define('dailyTimeTables', {
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
    teacherId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'teacherId',
        allowNull: true
    },
    subject: {
        type: Sequelize.STRING(255),
        field: 'subject',
        allowNull: false
    },
    day: {
        type: Sequelize.ENUM,
        field: 'day',
        values: utils.days
    },
    duration: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'duration'
    },
    status: {
        type: Sequelize.ENUM,
        field: 'status',
        values: ['ACTIVE', 'INACTIVE'],
        defaultValue: "ACTIVE",
    }
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

dailyTimeTable.belongsTo(userModel, { foreignKey: 'teacherId' });
userModel.hasMany(dailyTimeTable, { foreignKey: 'teacherId' });

dailyTimeTable.createdailyTimeTable = function(dailyTimeTableData, success, error) {
    this.create(dailyTimeTableData).then(success).catch(error);
}

dailyTimeTable.deletedailyTimeTable = function(filter, success, error) {
    this.destroy({ where: filter }).then(success).catch(error);
}
dailyTimeTable.updatedailyTimeTable = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

dailyTimeTable.getdailyTimeTable = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter,
        include: [{
            model: sequelize.model("users"),
            where: {},
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic'],
            required: false
        }],
        order: [
            ['createdAt', 'DESC'],
        ]
    }).then(success).catch(error);
};
dailyTimeTable.getdailyTimeTableById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

dailyTimeTable.getdailyTimeTableList = function(filter, searchName, pg, limit, callback, error) {
    let currentObject = this;
    if (!utils.empty(searchName)) {
        filter['$or'] = [{ "dailyTimeTableName": { "$like": '%' + searchName + '%' } }];
    }

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

        currentObject.findAll(nextQuery).then(function(dailyTimeTableIds) {
            let ids = dailyTimeTableIds.map(obj => obj.id);
            currentObject.getdailyTimeTable({ id: { $in: ids } }, function(dailyTimeTables) {
                callback(count, dailyTimeTables);
            }, error);
        });
    }).catch(error);
}

module.exports = dailyTimeTable;