const db = require("../../config/database");
const utils = require("../../helper/utils");
const schoolModel = require('../school/schoolModel');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

let parent = sequelize.define('parents', {
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
        field: 'firstName'
    },
    lastName: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'lastName'
    },
    email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: 'email'
    },
    password: {
        type: Sequelize.STRING(100),
        field: 'password',
        allowNull: true
    },
    mobileNo: {
        type: Sequelize.STRING(20),
        allowNull: false,
        field: 'mobileNo'
    },
    address: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'address'
    },
    grNumber: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: ' grNumber',
        allowNull: true
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
    status: {
        type: Sequelize.ENUM,
        field: 'status',
        values: ['ACTIVE', 'INACTIVE'],
        defaultValue: "ACTIVE",
    },
    lastLoggedIn: {
        type: Sequelize.DATE,
        field: 'lastLoggedIn'
    },
}, {
    instanceMethods: {
        /**
         * Authenticate - check if the passwords are the same
         *
         * @param {String} plainText
         * @return {Boolean}
         */
        authenticate: function(plainText) {
            if (utils.empty(this.password)) {
                return false;
            }
            return utils.isDefined(plainText) && (this.decryptPassword(this.password) === plainText);
        },
        /**
         * Encrypt password
         *
         * @param {String} password
         * @return {String}
         */
        encryptPassword: function(password) {
            return utils.dataEncrypt(password);
        },
        /**
         * Encrypt password
         *
         * @param {String} password
         * @return {String}
         */
        decryptPassword: function(password) {
            return utils.dataDecrypt(this.password);
        }
    },
    hooks: {
        beforeCreate: function(user) {
            if (!utils.empty(user.password))
                user.password = utils.dataEncrypt(user.password);
        },
        beforeUpdate: function(user) {
            if (!utils.empty(user.password))
                user.password = utils.dataEncrypt(user.password);
        }
    }
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

parent.belongsTo(schoolModel, { foreignKey: 'schoolId' });
schoolModel.hasMany(parent, { foreignKey: 'schoolId' });

parent.createparent = function(parentData, success, error) {
    this.create(parentData).then(success).catch(error);
}

parent.updateparent = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}
parent.updateuser = function(details, filter, success, error) {
    this.update(details, { where: filter }).then(success).catch(error);
}

parent.getparent = function(filter, success, error) {
    this.findAll({
        subQuery: false,
        where: filter,
        attributes: ["id", "firstName", "profilePic", "lastName", "email", "password", "mobileNo", "address", "grNumber", "status", "lastLoggedIn"]
    }).then(success).catch(error);
};

parent.getparentById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};
parent.getUserById = function(id, callback, error) {
    this.findOne({
        where: { "id": id },
    }).then(callback).catch(error);
};

parent.loaduser = function(filter, callback, error) {
    this.findAll({
        where: filter,
        include: [{
            model: sequelize.model("schools"),
            where: {},
            attributes: ['id', 'schoolName', 'city', 'address'],
            required: false
        }]
    }).then(callback).catch(error);
}

parent.loadparent = function(filter, callback, error) {
    this.findAll({
        where: filter,
        include: [{
            model: sequelize.model("students"),
            where: {},
            required: true,
            include: [{
                model: sequelize.model("classes"),
                where: {},
                attributes: ['id', 'className', 'medium', 'standardId'],
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
            }]
        }, {
            model: sequelize.model("schools"),
            where: {},
            attributes: ['id', 'schoolName', 'city', 'address'],
            required: false
        }]
    }).then(callback).catch(error);
};

parent.getparentList = function(filter, searchName, pg, limit, callback, error) {
    let currentObject = this;
    if (!utils.empty(searchName)) {
        filter['$or'] = [{ "firstName": { "$like": '%' + input.searchName + '%' } }, { "lastName": { "$like": '%' + searchName + '%' } }, { "mobileNo": { "$like": '%' + searchName + '%' } }];
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

        currentObject.findAll(nextQuery).then(function(parentIds) {
            let ids = parentIds.map(obj => obj.id);
            currentObject.getparent({ id: { $in: ids } }, function(parents) {
                callback(count, parents);
            }, error);
        });
    }).catch(error);
}

module.exports = parent;