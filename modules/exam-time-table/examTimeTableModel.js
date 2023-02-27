const db = require("../../config/database");
const utils = require("../../helper/utils");
const schoolModel = require("../school/schoolModel");
const examTypeModel = require('../exam-type/examTypeModel');
const subjectModel = require("../subject/subjectModel");
const classModel = require("../class/classModel");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let examTimeTable = sequelize.define('examTimeTables', {
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
    examTypeId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'examTypeId',
        allowNull: true
    },
    subjectId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'subjectId',
        allowNull: true
    },
    classId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'classId',
        allowNull: true
    },
    name: {
        type: Sequelize.STRING(255),
        field: 'name',
        allowNull: true
    },
    totalmarks: {
        type: Sequelize.INTEGER,
        field: 'totalmarks',
        allowNull: false,
        defaultValue: 100,
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
    examDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'examDate'
    },
    examTime: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'examTime'
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

examTimeTable.belongsTo(schoolModel, { foreignKey: 'schoolId' });
schoolModel.hasMany(examTimeTable, { foreignKey: 'schoolId' });
examTimeTable.belongsTo(examTypeModel, { foreignKey: 'examTypeId' });
examTypeModel.hasMany(examTimeTable, { foreignKey: 'examTypeId' });
examTimeTable.belongsTo(subjectModel, { foreignKey: 'subjectId' });
subjectModel.hasMany(examTimeTable, { foreignKey: 'subjectId' });
examTimeTable.belongsTo(classModel, { foreignKey: 'classId' });
classModel.hasMany(examTimeTable, { foreignKey: 'classId' });

examTimeTable.createexamTimeTable = function(examTimeTableData, success, error) {
    this.create(examTimeTableData).then(success).catch(error);
}
examTimeTable.createexamTimeTablemulti = function(createData, success, error) {
    this.bulkCreate(createData, { individualHooks: true }).then(success).catch(error);
}

examTimeTable.deleteexamTimeTable = function(filter, success, error) {
    this.destroy({ where: filter }).then(success).catch(error);
}
examTimeTable.updateexamTimeTable = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

examTimeTable.getexamTimeTable = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter,
        include: [{
            model: sequelize.model("examTypes"),
            where: {},
            attributes: ['id', 'name', 'status'],
            required: false
        }, {
            model: sequelize.model("subjects"),
            where: {},
            attributes: ['id', 'subjectName'],
            required: false
        }],
        order: [
            ['createdAt', 'DESC'],
        ]
    }).then(success).catch(error);
};
examTimeTable.getexamTimeTableById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

examTimeTable.getexamTimeTableList = function(action, filter, searchName, pg, limit, callback, error) {
    let currentObject = this;
    if (!utils.empty(searchName)) {
        filter['$or'] = [{ "examTimeTableName": { "$like": '%' + searchName + '%' } }];
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

        currentObject.findAll(nextQuery).then(function(examTimeTableIds) {
            let ids = examTimeTableIds.map(obj => obj.id);
            if (action === 'result') {
                currentObject.getexamTimeTableResult({ id: { $in: ids } }, function(examTimeTables) {
                    callback(count, examTimeTables);
                }, error);
            } else {
                currentObject.getexamTimeTable({ id: { $in: ids } }, function(examTimeTables) {
                    callback(count, examTimeTables);
                }, error);
            }
        });
    }).catch(error);
}

examTimeTable.getexamTimeTableResult = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter,
        include: [{
            model: sequelize.model("examTypes"),
            where: {},
            attributes: ['id', 'name', 'status'],
            required: false
        }, {
            model: sequelize.model("subjects"),
            where: {},
            attributes: ['id', 'subjectName'],
            required: false
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
            model: sequelize.model("results"),
            where: {},
            attributes: ['id', 'studentId'],
            required: false,
            include: [{
                model: sequelize.model("subjectresults"),
                where: {},
                attributes: ['id', 'marks'],
                required: false
            }, {
                model: sequelize.model("students"),
                where: {},
                attributes: ['id', 'firstName', 'lastName', 'profilePic'],
                required: false
            }],
        }],
        order: [
            ['createdAt', 'DESC'],
        ]
    }).then(success).catch(error);
};

examTimeTable.getexamTimeTableResultList = function(filter, studentId, success, error) {
    this.findAll({
        subQuery: false,
        where: filter,
        include: [{
            model: sequelize.model("examTypes"),
            where: {},
            attributes: ['id', 'name', 'status'],
            required: false
        }, {
            model: sequelize.model("subjects"),
            where: {},
            attributes: ['id', 'subjectName'],
            required: false
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
            model: sequelize.model("results"),
            where: { studentId: studentId },
            attributes: ['id', 'studentId'],
            required: false,
            include: [{
                model: sequelize.model("subjectresults"),
                where: {},
                attributes: ['id', 'marks'],
                required: false
            }, {
                model: sequelize.model("students"),
                where: {},
                attributes: ['id', 'firstName', 'lastName', 'profilePic'],
                required: false
            }],
        }],
        order: [
            ['createdAt', 'DESC'],
        ]
    }).then(success).catch(error);
};

module.exports = examTimeTable;