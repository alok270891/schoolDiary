const db = require("../../config/database");
const utils = require("../../helper/utils");
const subjectModel = require('../subject/subjectModel');
const classModel = require('../class/classModel');
const userModel = require('../user/userModel');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let homwWork = sequelize.define('homwWorks', {
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
    subjectId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'subjectId',
        allowNull: false
    },
    classId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'classId',
        allowNull: false
    },
    title: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'title'
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'description'
    },
    deadlineDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'deadlineDate'
    },
    startDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'startDate'
    },
    teacherId: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {
            // This is a reference to another model
            model: userModel,
            // This is the column name of the referenced model
            key: 'id'
        },
    },
    status: {
        type: Sequelize.ENUM,
        field: 'status',
        values: ["Pending", "Completed", "Reopen", "Accepted", "InReview"],
        defaultValue: "Pending",
    }
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

homwWork.belongsTo(userModel, { foreignKey: 'teacherId' });
userModel.hasMany(homwWork, { foreignKey: 'teacherId' });
homwWork.belongsTo(classModel, { foreignKey: 'classId' });
classModel.hasMany(homwWork, { foreignKey: 'classId' });
homwWork.belongsTo(subjectModel, { foreignKey: 'subjectId' });
subjectModel.hasMany(homwWork, { foreignKey: 'subjectId' });

homwWork.createhomwWork = function(homwWorkData, success, error) {
    this.create(homwWorkData).then(success).catch(error);
}

homwWork.updatehomeWork = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

homwWork.gethomwWork = function(filter, success, error) {
    this.findAll({
        where: filter,
        attributes: ['startDate', "id", "subjectId", "classId", "title", "description", "deadlineDate", "teacherId", "status", "createdAt", "updatedAt"],
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
        }, {
            model: sequelize.model("subjects"),
            where: {},
            attributes: ['id', 'subjectName'],
            required: false
        }, {
            model: sequelize.model("users"),
            where: {},
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic'],
            required: false
        }, {
            model: sequelize.model("homeworkcomments"),
            where: {},
            attributes: ['id', 'comment', 'parentId'],
            required: false,
            include: [{
                model: sequelize.model("parents"),
                where: {},
                attributes: ['id', 'firstName', 'lastName', 'email'],
                required: false
            }]
        }, {
            model: sequelize.model("homeworkdocuments"),
            where: {},
            attributes: ['id', 'documentFile', 'mimetype', 'size'],
            required: false
        }, {
            model: sequelize.model("homeworkstatuses"),
            where: {},
            attributes: ['id', 'status'],
            required: false,
            include: [{
                model: sequelize.model("students"),
                where: {},
                attributes: ['id', 'firstName', 'lastName', 'profilePic', 'rollNumber'],
                required: false
            }]
        }],
        order: [
            ['createdAt', 'DESC'],
        ]
    }).then(success).catch(error);
};


homwWork.gethomwWorkForNoti = function(input, success, error) {
    this.findAll({
        where: { id: { $in: [input.homeworkId] } },
        attributes: ['startDate', "id", "subjectId", "classId", "title", "description", "deadlineDate", "teacherId", "status", "createdAt", "updatedAt"],
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
        }, {
            model: sequelize.model("subjects"),
            where: {},
            attributes: ['id', 'subjectName'],
            required: false
        }, {
            model: sequelize.model("users"),
            where: {},
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic'],
            required: false
        }, {
            model: sequelize.model("homeworkcomments"),
            where: {},
            attributes: ['id', 'comment', 'parentId'],
            required: false,
            include: [{
                model: sequelize.model("parents"),
                where: {},
                attributes: ['id', 'firstName', 'lastName', 'email'],
                required: false
            }]
        }, {
            model: sequelize.model("homeworkdocuments"),
            where: {},
            attributes: ['id', 'documentFile', 'mimetype', 'size'],
            required: false
        }, {
            model: sequelize.model("homeworkstatuses"),
            where: { studentId: input.studentId },
            attributes: ['id', 'status'],
            required: false,
            include: [{
                model: sequelize.model("students"),
                where: {},
                attributes: ['id', 'parentId', 'firstName', 'lastName', 'profilePic', 'rollNumber'],
                required: false
            }]
        }],
        order: [
            ['createdAt', 'DESC'],
        ]
    }).then(success).catch(error);
};

homwWork.gethomwWorkById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};
homwWork.loadhomework = function(filter, callback, error) {
    this.findAll({
        where: filter,
    }).then(callback).catch(error);
}

homwWork.gethomeWorkList = function(input, filter, searchName, pg, limit, callback, error) {
    let currentObject = this;
    if (!utils.empty(searchName)) {
        filter['$or'] = [{ "title": { "$like": '%' + searchName + '%' } }];
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
        },
        queryObject = {
            attributes: ["id"],
            group: [
                ["id"]
            ]
        }
    if (!utils.empty(input.status)) {
        queryObject.include = [{
            model: sequelize.model("homeworkstatuses"),
            where: { studentId: input.studentId, status: input.status },
            attributes: ['id', 'status'],
            required: true,
        }]
        query.include = [{
            model: sequelize.model("homeworkstatuses"),
            where: { studentId: input.studentId, status: input.status },
            attributes: ['id', 'status'],
            required: true,
        }]
    }


    currentObject.count(query).then(function(count) {
        let nextQuery = _.extend(query, queryObject);

        currentObject.findAll(nextQuery).then(function(homwWorkIds) {
            let ids = homwWorkIds.map(obj => obj.id);
            currentObject.gethomwWork({ id: { $in: ids } }, function(homwWorks) {
                callback(count, homwWorks);
            }, error);
        });
    }).catch(error);
}

module.exports = homwWork;