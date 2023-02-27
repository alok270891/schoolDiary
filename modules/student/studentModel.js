const db = require("../../config/database");
const utils = require("../../helper/utils");
const parentModel = require('../parent/parentModel');
const classModel = require('../class/classModel');
const schoolModel = require('../school/schoolModel');
const standardModel = require('../standard/standardModel');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let student = sequelize.define('students', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    parentId: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {
            // This is a reference to another model
            model: parentModel,
            // This is the column name of the referenced model
            key: 'id'
        },
        // field: 'parentId',
        // allowNull: true
    },
    profilePic: {
        type: Sequelize.STRING(255),
        field: 'profilePic',
        allowNull: true,
        get: function() {
            // 'this' allows you to access attributes of the instance
            var image = this.getDataValue('profilePic');
            if (!utils.empty(image) && !utils.empty(image.match(/https:/gi))) {
                return image;
            } else {
                return (utils.empty(image)) ? "" : process.env.S3_BASE_URL + config.STUDENT_IMAGE_PATH + image;
            }
        }
    },
    firstName: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'firstName'
    },
    lastName: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'lastName'
    },
    schoolId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: ' schoolId',
        allowNull: true
    },
    classId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'classId',
        allowNull: false
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
    gender: {
        type: Sequelize.ENUM,
        field: 'gender',
        values: ['Male', 'Female'],
        defaultValue: "Male",
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

// student.belongsTo(schoolModel, { foreignKey: 'schoolId' });
// schoolModel.hasMany(student, { foreignKey: 'schoolId' });
student.belongsTo(parentModel, { foreignKey: 'parentId' });
parentModel.hasMany(student, { foreignKey: 'parentId' });
student.belongsTo(classModel, { foreignKey: 'classId' });
classModel.hasMany(student, { foreignKey: 'classId' });

student.createstudent = function(studentData, success, error) {
    this.create(studentData).then(success).catch(error);
}

student.updatestudent = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

student.getstudent = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter,
        attributes: ["id", "parentId", "profilePic", "firstName", "lastName", "classId", "grNumber", "rollNumber", "joiningDate", "gender", "status"],
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
            model: sequelize.model("studentSubjects"),
            where: {},
            attributes: ["studentId", "subjectId"],
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
student.getstudentById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};
student.loaduser = function(filter, callback, error) {
    this.findAll({
        where: filter,
    }).then(callback).catch(error);
}

student.getStudentsIds = function(filter, callback, error) {
    this.findAll({
        where: filter,
        attributes: ['id']
    }).then(callback).catch(error);
}


student.getstudentList = function(filter, searchName, pg, limit, callback, error) {
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

        currentObject.findAll(nextQuery).then(function(studentIds) {
            let ids = studentIds.map(obj => obj.id);
            currentObject.getstudent({ id: { $in: ids } }, function(students) {
                callback(count, students);
            }, error);
        });
    }).catch(error);
}

module.exports = student;