const db = require("../../config/database");
const utils = require("../../helper/utils");
const subjectModel = require("../subject/subjectModel");
const studentModel = require("./studentModel");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let studentSubject = sequelize.define('studentSubjects', {
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
    subjectId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'subjectId',
        allowNull: false
    }
}, {
    updatedAt: false,
    createdAt: false,
    freezeTableName: true // Model tableName will be the same as the model name
});

studentSubject.belongsTo(subjectModel, { foreignKey: 'subjectId' });
subjectModel.hasMany(studentSubject, { foreignKey: 'subjectId' });
studentSubject.belongsTo(studentModel, { foreignKey: 'studentId' });
studentModel.hasMany(studentSubject, { foreignKey: 'studentId' });


studentSubject.createStudentSubjectMulti = function(createData, success, error) {
    this.bulkCreate(createData).then(success).catch(error);
}

studentSubject.createstudentSubject = function(studentSubjectData, success, error) {
    this.create(studentSubjectData).then(success).catch(error);
}

studentSubject.updatestudentSubject = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

studentSubject.getstudentSubject = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter
    }).then(success).catch(error);
};
studentSubject.getstudentSubjectById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

studentSubject.getstudentSubjectList = function(filter, searchName, pg, limit, callback, error) {
    let currentObject = this;

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

        currentObject.findAll(nextQuery).then(function(studentSubjectIds) {
            let ids = studentSubjectIds.map(obj => obj.id);
            currentObject.getstudentSubject({ id: { $in: ids } }, function(studentSubjects) {
                callback(count, studentSubjects);
            }, error);
        });
    }).catch(error);
}

module.exports = studentSubject;