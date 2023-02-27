const db = require("../../config/database");
const utils = require("../../helper/utils");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let school = sequelize.define('schools', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    schoolName: {
        type: Sequelize.STRING(255),
        field: 'schoolName',
        allowNull: false
    },
    city: {
        type: Sequelize.STRING(255),
        field: 'city',
        allowNull: false
    },
    address: {
        type: Sequelize.TEXT,
        field: 'address',
        allowNull: false
    },
    logo: {
        type: Sequelize.STRING(255),
        field: 'logo',
        allowNull: true
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

school.createschool = function(schoolData, success, error) {
    this.create(schoolData).then(success).catch(error);
}

school.updateschool = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

school.getschool = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter
    }).then(success).catch(error);
};
school.getschoolById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

school.getschoolList = function(filter, searchName, pg, limit, callback, error) {
    let currentObject = this;
    if (!utils.empty(searchName)) {
        filter['$or'] = [{ "schoolName": { "$like": '%' + searchName + '%' } }, { "address": { "$like": '%' + searchName + '%' } }, { "city": { "$like": '%' + searchName + '%' } }];
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

        currentObject.findAll(nextQuery).then(function(schoolIds) {
            let ids = schoolIds.map(obj => obj.id);
            currentObject.getschool({ id: { $in: ids } }, function(schools) {
                callback(count, schools);
            }, error);
        });
    }).catch(error);
}

module.exports = school;