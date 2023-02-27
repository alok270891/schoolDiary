const db = require("../../config/database");
const utils = require("../../helper/utils");
const subjectModel = require("../subject/subjectModel");
const userModel = require("./userModel");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let userSubject = sequelize.define('userSubjects', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'userId',
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
    freezeTableName: true
});

userSubject.belongsTo(subjectModel, { foreignKey: 'subjectId' });
subjectModel.hasMany(userSubject, { foreignKey: 'subjectId' });
userSubject.belongsTo(userModel, { foreignKey: 'userId' });
userModel.hasMany(userSubject, { foreignKey: 'userId' });


userSubject.createUserSubjectMulti = function(createData, success, error) {
    this.bulkCreate(createData).then(success).catch(error);
}

userSubject.createuserSubject = function(userSubjectData, success, error) {
    this.create(userSubjectData).then(success).catch(error);
}

userSubject.updateuserSubject = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

userSubject.getuserSubject = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter
    }).then(success).catch(error);
};
userSubject.getuserSubjectById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

userSubject.getuserSubjectList = function(filter, searchName, pg, limit, callback, error) {
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

        currentObject.findAll(nextQuery).then(function(userSubjectIds) {
            let ids = userSubjectIds.map(obj => obj.id);
            currentObject.getuserSubject({ id: { $in: ids } }, function(userSubjects) {
                callback(count, userSubjects);
            }, error);
        });
    }).catch(error);
}

module.exports = userSubject;