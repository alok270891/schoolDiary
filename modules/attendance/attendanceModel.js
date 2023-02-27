const db = require("../../config/database");
const utils = require("../../helper/utils");
const studentModel = require('../student/studentModel');
const classModel = require('../class/classModel');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let attendance = sequelize.define('attendances', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    studentId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'studentId',
        allowNull: false
    },
    classId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'classId',
        allowNull: false
    },
    attendanceDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'attendanceDate'
    },
    status: {
        type: Sequelize.ENUM,
        field: 'status',
        values: ["P", "A", "L"],
        defaultValue: "A",
    }
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

attendance.belongsTo(studentModel, { foreignKey: 'studentId' });
studentModel.hasMany(attendance, { foreignKey: 'studentId' });
attendance.belongsTo(classModel, { foreignKey: 'classId' });
classModel.hasMany(attendance, { foreignKey: 'classId' });

attendance.createattendance = function(attendanceData, success, error) {
    this.create(attendanceData).then(success).catch(error);
}

attendance.createattendanceMulti = function(createData, success, error) {
    this.bulkCreate(createData).then(success).catch(error);
}

attendance.updateattendance = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

attendance.getattendance = function(ids, success, error) {
    this.findAll({
        where: { id: { $in: ids } },
        include: [{
            model: sequelize.model("students"),
            where: {},
            attributes: ['id', 'firstName', "lastName", "rollNumber", "grNumber", "profilePic"],
            required: false
        }, {
            model: sequelize.model("classes"),
            where: {},
            attributes: ['id', 'standardId', "className", "medium", "status"],
            required: false,
            include: [{
                model: sequelize.model("standards"),
                where: {},
                attributes: ['id', 'standardName'],
                required: false
            }]
        }],
        order: [
            ['createdAt', 'DESC'],
        ]
    }).then(success).catch(error);
};
attendance.getattendanceById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};
attendance.loadhomework = function(filter, callback, error) {
    this.findAll({
        where: filter,
    }).then(callback).catch(error);
}


attendance.getAttendanceList = function(loginUser, filter, searchName, pg, limit, callback, error) {
    let currentObject = this;

    let query = {
        subQuery: false,
        where: filter,
        attributes: [],
        offset: pg,
        limit: limit,
        order: [
            ['createdAt', 'DESC'],
        ]
    }
    let schoolFilter = {};
    if (loginUser && loginUser.userRole && loginUser.userRole === 1) {
        if (!utils.empty(input.schoolId)) {
            schoolFilter["schoolId"] = input.schoolId;
        }
    } else {
        schoolFilter["schoolId"] = loginUser.schoolId;
    }


    if (schoolFilter) {
        query.include = [{
            model: sequelize.model("classes"),
            where: schoolFilter,
            attributes: ['id'],
            required: true,
        }];
    }

    if (!utils.empty(searchName)) {
        console.log("safasfasdfsafasdf======")
        query.include = [{
            model: sequelize.model("students"),
            where: { '$or': [{ "firstName": { "$like": '%' + searchName + '%' } }, { "lastName": { "$like": '%' + searchName + '%' } }] },
            attributes: ['id', 'firstName', "lastName", "rollNumber", "grNumber"],
            required: true
        }];

        console.log("query====", query)
    }
    currentObject.count(query).then(function(count) {
        let nextQuery = _.extend(query, {
            attributes: ["id"],
            group: [
                ["id"]
            ]
        });

        currentObject.findAll(nextQuery).then(function(attendanceIds) {
            let ids = attendanceIds.map(obj => obj.id);
            currentObject.getattendance(ids, function(attendances) {
                callback(count, attendances);
            }, error);
        });
    }).catch(error);
}

module.exports = attendance;