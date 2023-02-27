const db = require("../../config/database");
const utils = require("../../helper/utils");
const classModel = require("../class/classModel");
const userModel = require("./userModel");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let userClass = sequelize.define('userclass', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'userId',
        references: {
            model: userModel,
            key: 'id'
        }
    },
    classId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'classId',
        references: {
            model: classModel,
            key: 'id'
        },
    }
}, {
    updatedAt: false,
    createdAt: false,
    freezeTableName: true
});

userClass.belongsTo(classModel, { foreignKey: 'classId' });
classModel.hasMany(userClass, { foreignKey: 'classId' });
userClass.belongsTo(userModel, { foreignKey: 'userId' });
userModel.hasMany(userClass, { foreignKey: 'userId' });


userClass.createUserClassMulti = function(createData, success, error) {
    this.bulkCreate(createData).then(success).catch(error);
}

userClass.createuserClass = function(userClassData, success, error) {
    this.create(userClassData).then(success).catch(error);
}

userClass.updateuserClass = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

userClass.getuserClass = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter
    }).then(success).catch(error);
};
userClass.getuserClassById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

userClass.getuserClassList = function(filter, searchName, pg, limit, callback, error) {
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

        currentObject.findAll(nextQuery).then(function(userClassIds) {
            let ids = userClassIds.map(obj => obj.id);
            currentObject.getuserClass({ id: { $in: ids } }, function(userClasss) {
                callback(count, userClasss);
            }, error);
        });
    }).catch(error);
}

module.exports = userClass;