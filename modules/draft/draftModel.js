const db = require("../../config/database");
const utils = require("../../helper/utils");
const parentModel = require('../parent/parentModel');
const classModel = require('../class/classModel');
const schoolModel = require('../school/schoolModel');
const standardModel = require('../standard/standardModel');
const subjectModel = require('../subject/subjectModel');
const studentModel = require('../student/studentModel');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let draft = sequelize.define('draft', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    schoolId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: ' schoolId',
        allowNull: true
    },
    firstName: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'firstName',
    },
    lastName: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'lastName',
    },
    parentFirstName: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'parentFirstName',
        // references: {
        //     model: parentModel,
        //     key: 'firstName'
        // },
    },
    parentLastName: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'parentLastName',
        // references: {
        //     model: parentModel,
        //     key: 'lastName'
        // },
    },
    parentEmail: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'parentEmail',
        // references: {
        //     model: parentModel,
        //     key: 'email'
        // },
    },
    parentMobileNo: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'parentMobileNo',
        // references: {
        //     model: parentModel,
        //     key: 'mobileNo'
        // },
    },
    parentAddress: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'parentAddress',
        // references: {
        //     model: parentModel,
        //     key: 'address'
        // },
    },
    gender: {
        type: Sequelize.ENUM,
        field: 'gender',
        values: ['Male', 'Female'],
        defaultValue: "Male",
    },
    standardName: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'standardName',
        // references: {
        //     model: standardModel,
        //     key: 'standardName'
        // },
    },
    className: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'className',
        // references: {
        //     model: classModel,
        //     key: 'className'
        // },
    },
    subjectName: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'subjectName',
        // references: {
        //     model: subjectModel,
        //     key: 'subjectName'
        // },
    },
    medium: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'medium'
    },
    grNumber: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: ' grNumber',
        allowNull: true
    },
    rollNumber: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: ' rollNumber',
        allowNull: true
    },
    joiningDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'joiningDate'
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

draft.createdraft = function(draftData, success, error) {
    this.create(draftData).then(success).catch(error);
}

module.exports = draft;