const db = require("../../config/database");
const utils = require("../../helper/utils");
const studentModel = require("../student/studentModel");
const userModel = require("../user/userModel");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let leave = sequelize.define('leaves', {
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
    studentId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'studentId',
        allowNull: true
    },
    teacherId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'teacherId',
        allowNull: true
    },
    classId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'classId',
        allowNull: false
    },
    startDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'startDate'
    },
    endDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'endDate'
    },
    reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'reason'
    },
    status: {
        type: Sequelize.ENUM,
        field: 'status',
        values: ['Pending', 'Approve', 'Reject', 'Cancel'],
        defaultValue: "Pending",
    }
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

leave.belongsTo(studentModel, { foreignKey: 'studentId' });
studentModel.hasMany(leave, { foreignKey: 'studentId' });
leave.belongsTo(userModel, { foreignKey: 'teacherId' });
userModel.hasMany(leave, { foreignKey: 'teacherId' });

leave.createleave = function(leaveData, success, error) {
    this.create(leaveData).then(success).catch(error);
}

leave.updateleave = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

leave.getleave = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter,
        include: [{
            model: sequelize.model("students"),
            where: {},
            attributes: ["profilePic", "id", "parentId", "firstName", "lastName", "schoolId", "classId", "grNumber", "rollNumber", "joiningDate", "status"],
            required: false,
            include: [{
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
            }]
        }, {
            model: sequelize.model("users"),
            where: {},
            attributes: ["profilePic", "id", "schoolId", "firstName", "lastName", "email", "mobileNo", "userRole", "birthOfDate", "address", "experience", "gender", "status"],
            required: false
        }],
        order: [
            ['createdAt', 'DESC'],
        ]
    }).then(success).catch(error);
};
leave.getleaveById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

leave.getleaveList = function(filter, searchName, pg, limit, callback, error) {
    let currentObject = this;
    if (!utils.empty(searchName)) {
        filter['$or'] = [{ "leaveName": { "$like": '%' + searchName + '%' } }];
    }

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
    currentObject.count(query).then(function(count) {
        let nextQuery = _.extend(query, {
            attributes: ["id"],
            group: [
                ["id"]
            ]
        });

        currentObject.findAll(nextQuery).then(function(leaveIds) {
            let ids = leaveIds.map(obj => obj.id);
            currentObject.getleave({ id: { $in: ids } }, function(leaves) {
                callback(count, leaves);
            }, error);
        });
    }).catch(error);
}

module.exports = leave;