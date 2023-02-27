const db = require("../../config/database");
const utils = require("../../helper/utils");
const parentModel = require('../parent/parentModel');
const homeWorkModel = require('../home-work/homeWorkModel');
const subjectModel = require('../subject/subjectModel');
const classModel = require('../class/classModel');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let parentHomework = sequelize.define('parentHomeworks', {
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
    parentId: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {
            // This is a reference to another model
            model: parentModel,
            // This is the column name of the referenced model
            key: 'id'
        },
    },
    homeworkId: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {
            // This is a reference to another model
            model: homeWorkModel,
            // This is the column name of the referenced model
            key: 'id'
        },
    },
    status: {
        type: Sequelize.ENUM,
        field: 'status',
        values: ["Pending", "Completed", "Reopen", "Accepted", "InReview"],
        defaultValue: "InReview",
    }
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

parentHomework.belongsTo(parentModel, { foreignKey: 'parentId' });
parentModel.hasMany(parentHomework, { foreignKey: 'parentId' });
parentHomework.belongsTo(classModel, { foreignKey: 'classId' });
classModel.hasMany(parentHomework, { foreignKey: 'classId' });
parentHomework.belongsTo(subjectModel, { foreignKey: 'subjectId' });
subjectModel.hasMany(parentHomework, { foreignKey: 'subjectId' });

parentHomework.createhomwWork = function(homwWorkData, success, error) {
    this.create(homwWorkData).then(success).catch(error);
}

parentHomework.gethomwWork = function(filter, success, error) {
    this.findAll({
        where: filter,
        attributes: ["id", "subjectId", "classId", "parentId","homeworkId", "status", "createdAt", "updatedAt"],
        // include: [{
        //     model: sequelize.model("classes"),
        //     where: {},
        //     attributes: ['id', 'className', 'medium'],
        //     required: false,
        //     include: [{
        //         model: sequelize.model("standards"),
        //         where: {},
        //         attributes: ['id', 'standardName'],
        //         required: false
        //     }]
        // }, {
        //     model: sequelize.model("subjects"),
        //     where: {},
        //     attributes: ['id', 'subjectName'],
        //     required: false
        // }, 
        // {
        //     model: sequelize.model("users"),
        //     where: {},
        //     attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic'],
        //     required: false
        // }, {
        //     model: sequelize.model("homeworkcomments"),
        //     where: {},
        //     attributes: ['id', 'comment', 'parentId'],
        //     required: false,
        //     include: [{
        //         model: sequelize.model("parents"),
        //         where: {},
        //         attributes: ['id', 'firstName', 'lastName', 'email'],
        //         required: false
        //     }]
        // }, 
        // {
        //     model: sequelize.model("parentHomeworkDocuments"),
        //     where: {},
        //     attributes: ['id', 'documentFile', 'mimetype', 'size'],
        //     required: false
        // }, 
        // {
        //     model: sequelize.model("homeworkstatuses"),
        //     where: {},
        //     attributes: ['id', 'status'],
        //     required: false,
        //     include: [{
        //         model: sequelize.model("students"),
        //         where: {},
        //         attributes: ['id', 'firstName', 'lastName', 'profilePic', 'rollNumber'],
        //         required: false
        //     }]
        // }],
        order: [
            ['createdAt', 'DESC'],
        ]
    }).then(success).catch(error);
};

module.exports = parentHomework;