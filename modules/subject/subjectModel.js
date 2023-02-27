const db = require("../../config/database");
const utils = require("../../helper/utils");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let subject = sequelize.define('subjects', {
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
    subjectName: {
        type: Sequelize.STRING(255),
        field: 'subjectName',
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

subject.createsubject = function(subjectData, success, error) {
    this.create(subjectData).then(success).catch(error);
}

subject.updatesubject = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

subject.getsubject = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter
    }).then(success).catch(error);
};
subject.getsubjectById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

subject.getsubjectList = function(filter, searchName, pg, limit, callback, error) {
    let currentObject = this;
    if (!utils.empty(searchName)) {
        filter['$or'] = [{ "subjectName": { "$like": '%' + searchName + '%' } }];
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

        currentObject.findAll(nextQuery).then(function(subjectIds) {
            let ids = subjectIds.map(obj => obj.id);
            currentObject.getsubject({ id: { $in: ids } }, function(subjects) {
                callback(count, subjects);
            }, error);
        });
    }).catch(error);
}

module.exports = subject;