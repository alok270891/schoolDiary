const db = require("../../config/database");
const utils = require("../../helper/utils");
const classModel = require('../class/classModel');
const examTimeTableModel = require('../exam-time-table/examTimeTableModel');
const studentModel = require('./studentModel');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let result = sequelize.define('results', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    studentId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'studentId',
    },
    schoolId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'schoolId',
        allowNull: true
    },
    examTimeTableId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'examTimeTableId',
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM,
        field: 'status',
        values: ['ACTIVE', 'INACTIVE'],
        defaultValue: "ACTIVE",
    }
}, {
    updatedAt: false,
    createdAt: false,
    freezeTableName: true // Model tableName will be the same as the model name
});

result.belongsTo(studentModel, { foreignKey: 'studentId' });
studentModel.hasMany(result, { foreignKey: 'studentId' });
result.belongsTo(examTimeTableModel, { foreignKey: 'examTimeTableId' });
examTimeTableModel.hasMany(result, { foreignKey: 'examTimeTableId' });

result.createresult = function(resultData, success, error) {
    this.create(resultData).then(success).catch(error);
}

result.updateresult = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

result.getresult = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter,
        attributes: ["id", "parentId", "profilePic", "firstName", "lastName", "classId", "grNumber", "rollNumber", "joiningDate", "status"],
        include: [{
            model: sequelize.model("parents"),
            where: {},
            attributes: ["firstName", "lastName", "email", "mobileNo", "address", "status"],
            required: false,
        }, {
            model: sequelize.model("classes"),
            where: {},
            attributes: ['id', 'className', 'medium'],
            required: false,
            include: [{
                model: sequelize.model("standards"),
                where: {},
                attributes: ['id', 'standardName'],
                required: false
            }]
        }, {
            model: sequelize.model("resultSubjects"),
            where: {},
            attributes: ["resultId", "subjectId"],
            required: false,
            include: [{
                model: sequelize.model("subjects"),
                where: {},
                attributes: ["subjectName", "status", 'id'],
                required: false,
            }]
        }],
    }).then(success).catch(error);
};
result.getresultById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};
result.loaduser = function(filter, callback, error) {
    this.findAll({
        where: filter,
    }).then(callback).catch(error);
}

result.getresultsIds = function(filter, callback, error) {
    this.findAll({
        where: filter,
        attributes: ['id']
    }).then(callback).catch(error);
}


result.getresultList = function(filter, searchName, pg, limit, callback, error) {
    let currentObject = this;
    if (!utils.empty(searchName)) {
        filter['$or'] = [{ "firstName": { "$like": '%' + searchName + '%' } }, { "lastName": { "$like": '%' + searchName + '%' } }];
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

        currentObject.findAll(nextQuery).then(function(resultIds) {
            let ids = resultIds.map(obj => obj.id);
            currentObject.getresult({ id: { $in: ids } }, function(results) {
                callback(count, results);
            }, error);
        });
    }).catch(error);
}

module.exports = result;