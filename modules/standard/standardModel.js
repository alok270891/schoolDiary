const db = require("../../config/database");
const utils = require("../../helper/utils");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let standard = sequelize.define('standards', {
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
    standardName: {
        type: Sequelize.STRING(255),
        field: 'standardName',
        allowNull: false
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

standard.createstandard = function(standardData, success, error) {
    this.create(standardData).then(success).catch(error);
}

standard.updatestandard = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

standard.getstandard = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter
    }).then(success).catch(error);
};
standard.getstandardById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

standard.getstandardList = function(filter, searchName, pg, limit, callback, error) {
    let currentObject = this;
    if (!utils.empty(searchName)) {
        filter['$or'] = [{ "standardName": { "$like": '%' + searchName + '%' } }];
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

        currentObject.findAll(nextQuery).then(function(standardIds) {
            let ids = standardIds.map(obj => obj.id);
            currentObject.getstandard({ id: { $in: ids } }, function(standards) {
                callback(count, standards);
            }, error);
        });
    }).catch(error);
}

module.exports = standard;