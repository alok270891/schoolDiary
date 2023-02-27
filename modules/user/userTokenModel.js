const db = require("../../config/database");
const utils = require('../../helper/utils');
const userModel = require('./userModel');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let userTokens = sequelize.define('usertokens', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {
            // This is a reference to another model
            model: userModel,
            // This is the column name of the referenced model
            key: 'id'
        },
        allowNull: true
    },
    parentId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: "parentId",
        allowNull: true
    },
    token: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: 'token'
    },
}, {
    updatedAt: false,
    createdAt: false,
    freezeTableName: true // Model tableName will be the same as the model name
});

/**
 * static function
 */
userTokens.belongsTo(userModel, { foreignKey: 'userId' });
userModel.hasMany(userTokens, { foreignKey: 'userId' });

userTokens.createuserTokens = function(createData, success, error) {
    this.create(createData).then(success).catch(error);
}

userTokens.deleteuserTokens = function(filter, success, error) {
    this.destroy({ where: filter }).then(success).catch(error);
}

userTokens.loadData = function(filter, callback, error) {
    this.findAll({ where: filter }).then(callback).catch(error);
}

module.exports = userTokens;