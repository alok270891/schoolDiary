const db = require("../../config/database");
const utils = require("../../helper/utils");
const classModel = require('../class/classModel');
const resultModel = require('./resultModel');
const subjectModel = require('../subject/subjectModel');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let subjectResult = sequelize.define('subjectresults', {
    id: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    resultId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: ' resultId',
        allowNull: true
    },
    subjectId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: ' subjectId',
        allowNull: true
    },
    marks: {
        type: Sequelize.INTEGER,
        field: 'marks',
        allowNull: false
    }
}, {
    updatedAt: false,
    createdAt: false,
    freezeTableName: true // Model tableName will be the same as the model name
});

subjectResult.belongsTo(resultModel, { foreignKey: 'resultId' });
resultModel.hasMany(subjectResult, { foreignKey: 'resultId' });
subjectResult.belongsTo(subjectModel, { foreignKey: 'subjectId' });
subjectModel.hasMany(subjectResult, { foreignKey: 'subjectId' });

subjectResult.createsubjectResult = function(subjectResultData, success, error) {
    this.create(subjectResultData).then(success).catch(error);
}

subjectResult.updatesubjectResult = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

module.exports = subjectResult;