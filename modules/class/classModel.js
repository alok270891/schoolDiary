const db = require("../../config/database");
const utils = require("../../helper/utils");
const standardModel = require('../standard/standardModel');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let classes = sequelize.define('classes', {
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
    standardId: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'standardId',
        allowNull: false
    },
    className: {
        type: Sequelize.STRING(255),
        field: 'className',
        allowNull: false
    },
    medium: {
        type: Sequelize.ENUM,
        field: 'medium',
        values: ['GUJ', 'ENG'],
        defaultValue: "GUJ"
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

classes.belongsTo(standardModel, { foreignKey: 'standardId' });
standardModel.hasMany(classes, { foreignKey: 'standardId' });

classes.createclasses = function(classesData, success, error) {
    this.create(classesData).then(success).catch(error);
}

classes.updateclasses = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

classes.getclasses = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter,
        include: [{
            model: sequelize.model("standards"),
            where: {},
            attributes: ['id', 'standardName'],
            required: false
        }]
    }).then(success).catch(error);
};
classes.getclassesById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

classes.getclassesList = function(filter, searchName, pg, limit, callback, error) {
    let currentObject = this;
    if (!utils.empty(searchName)) {
        filter['$or'] = [{ "className": { "$like": '%' + searchName + '%' } }];
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

        currentObject.findAll(nextQuery).then(function(classesIds) {
            let ids = classesIds.map(obj => obj.id);
            currentObject.getclasses({ id: { $in: ids } }, function(classess) {
                callback(count, classess);
            }, error);
        });
    }).catch(error);
}

module.exports = classes;