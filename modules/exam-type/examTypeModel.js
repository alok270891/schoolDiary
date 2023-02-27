const db = require("../../config/database");
const utils = require("../../helper/utils");
const schoolModel = require('../school/schoolModel');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let examTypes = sequelize.define('examTypes', {
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
    name: {
        type: Sequelize.STRING(255),
        field: 'name',
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

examTypes.belongsTo(schoolModel, { foreignKey: 'schoolId' });
schoolModel.hasMany(examTypes, { foreignKey: 'schoolId' });

examTypes.createexamTypes = function(examTypesData, success, error) {
    this.create(examTypesData).then(success).catch(error);
}

examTypes.updateexamTypes = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

examTypes.getexamTypes = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter,
        // include: [{
        //     model: sequelize.model("schools"),
        //     where: {},
        //     attributes: ['id', 'schoolName'],
        //     required: false
        // }]
    }).then(success).catch(error);
};
examTypes.getexamTypesById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

examTypes.getexamTypesList = function(filter, searchName, pg, limit, callback, error) {
    let currentObject = this;
    if (!utils.empty(searchName)) {
        filter['$or'] = [{ "name": { "$like": '%' + searchName + '%' } }];
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

        currentObject.findAll(nextQuery).then(function(examTypesIds) {
            let ids = examTypesIds.map(obj => obj.id);
            currentObject.getexamTypes({ id: { $in: ids } }, function(examTypess) {
                callback(count, examTypess);
            }, error);
        });
    }).catch(error);
}

module.exports = examTypes;