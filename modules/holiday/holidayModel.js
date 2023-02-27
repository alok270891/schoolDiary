const db = require("../../config/database");
const utils = require("../../helper/utils");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let holiday = sequelize.define('holidays', {
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
    holidayName: {
        type: Sequelize.STRING(255),
        field: 'holidayName',
        allowNull: false
    },
    holidayDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'holidayDate'
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

holiday.createholiday = function(holidayData, success, error) {
    this.create(holidayData).then(success).catch(error);
}

holiday.deleteholiday = function(filter, success, error) {
    this.destroy({ where: filter }).then(success).catch(error);
}
holiday.updateholiday = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

holiday.getholiday = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter
    }).then(success).catch(error);
};
holiday.getholidayById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

holiday.getholidayList = function(filter, searchName, pg, limit, callback, error) {
    let currentObject = this;
    if (!utils.empty(searchName)) {
        filter['$or'] = [{ "holidayName": { "$like": '%' + searchName + '%' } }];
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

        currentObject.findAll(nextQuery).then(function(holidayIds) {
            let ids = holidayIds.map(obj => obj.id);
            currentObject.getholiday({ id: { $in: ids } }, function(holidays) {
                callback(count, holidays);
            }, error);
        });
    }).catch(error);
}

module.exports = holiday;