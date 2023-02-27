const db = require("../../config/database");
const utils = require("../../helper/utils");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let breakfast = sequelize.define('breakfasts', {
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
    breakfastName: {
        type: Sequelize.STRING(255),
        field: 'breakfastName',
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'description'
    },
    day: {
        type: Sequelize.ENUM,
        field: 'day',
        values: utils.days
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

breakfast.createbreakfast = function(breakfastData, success, error) {
    this.create(breakfastData).then(success).catch(error);
}

breakfast.deletebreakfast = function(filter, success, error) {
    this.destroy({ where: filter }).then(success).catch(error);
}
breakfast.updatebreakfast = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

breakfast.getbreakfast = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter
    }).then(success).catch(error);
};
breakfast.getbreakfastById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

breakfast.getbreakfastList = function(filter, searchName, pg, limit, callback, error) {
    let currentObject = this;
    if (!utils.empty(searchName)) {
        filter['$or'] = [{ "breakfastName": { "$like": '%' + searchName + '%' } }];
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

        currentObject.findAll(nextQuery).then(function(breakfastIds) {
            let ids = breakfastIds.map(obj => obj.id);
            currentObject.getbreakfast({ id: { $in: ids } }, function(breakfasts) {
                callback(count, breakfasts);
            }, error);
        });
    }).catch(error);
}

module.exports = breakfast;