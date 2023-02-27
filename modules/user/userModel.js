const db = require("../../config/database");
const utils = require('../../helper/utils');
const schoolModel = require('../school/schoolModel');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;
const selectuserFields = [
    'schoolId', 'lastName', 'email', 'password', "mobileNo", "id", "firstName", "address",
    "userRole", "lastLoggedIn", "status", 'profilePic', 'birthOfDate', 'experience',
    'gender'
];

let user = sequelize.define('users', {
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
                // return (utils.empty(image)) ? "" : process.env.S3_BASE_URL + process.env.BUCKET_NAME + "/" + config.USER_IMAGE_PATH + image;
                return (utils.empty(image)) ? "" : process.env.S3_BASE_URL + config.USER_IMAGE_PATH + image;
            }
        }
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
    userRole: {
        type: Sequelize.INTEGER(2).UNSIGNED,
        field: 'userRole',
        defaultValue: 3
    },
    birthOfDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'birthOfDate'
    },
    address: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'address'
    },
    experience: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'experience'
    },
    gender: {
        type: Sequelize.ENUM,
        field: 'gender',
        values: ['Male', 'Female'],
        defaultValue: "Male",
    },
    lastLoggedIn: {
        type: Sequelize.DATE,
        field: 'lastLoggedIn'
    },
    status: {
        type: Sequelize.ENUM,
        field: 'status',
        values: ['ACTIVE', 'INACTIVE'],
        defaultValue: "ACTIVE",
    }
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

user.belongsTo(schoolModel, { foreignKey: 'schoolId' });
schoolModel.hasMany(user, { foreignKey: 'schoolId' });
// user.belongsTo(ccountryModel, { foreignKey: 'countryId' });
// ccountryModel.hasMany(user, { foreignKey: 'countryId' });

user.getuserByEmail = function(email, callback) {
    this.findOne({
        where: { "email": email }
    }).then(function(user) {
        callback(user);
    });
}

user.getUserById = function(id, callback) {
    this.findOne({
        where: { "id": id },
    }).then(callback);
};

user.getuserByMobileNo = function(mobileNo, callback) {
    this.findOne({
        where: {
            $or: [{
                "mobileNo": { $eq: mobileNo }
            }]
        }
    }).then(callback)
}

user.getusers = function(filter, input, pg, limit, callback) {
    let select = [
        'schoolId',
        'email',
        "mobileNo",
        "id",
        "firstName",
        "lastName",
        "userRole",
        "lastLoggedIn",
        "status",
        'birthOfDate',
        'experience',
        'gender',
        "address",
        "profilePic"
        // [Sequelize.literal("(IFNULL((SELECT  count(*)  from orders), 0))"), `orders`],
    ];
    if (!utils.empty(input.searchName)) {
        filter['$or'] = [{ "firstName": { "$like": '%' + input.searchName + '%' } }, { "lastName": { "$like": '%' + input.searchName + '%' } }, { "mobileNo": { "$like": '%' + input.searchName + '%' } }];
    }
    let currentObject = this;
    let query = {
        subQuery: false,
        where: filter,
        attributes: [],
        offset: pg,
        limit: limit,
        // distinct: true,
        order: [
            ['createdAt', 'DESC'],
        ]
    }
    currentObject.count(query).then(function(count) {
        let nextQuery = _.extend(query, {
            attributes: ["id"],
            group: [
                ["id"]
            ]
        });
        currentObject.findAll(nextQuery).then(function(userdetails) {
            let userIds = userdetails.map(obj => obj.id);
            currentObject.getuserDetails(userIds, select, function(userDetail) {
                callback(count, userDetail);
            });
        });
    });
};

user.getuserDetails = function(ids, select, callback) {
    this.findAll({
        where: { id: { $in: ids } },
        attributes: select,
        include: [{
            model: sequelize.model("userclass"),
            where: {},
            attributes: ['id', 'userId', 'classId'],
            required: false,
            include: [{
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
            }]
        }, {
            model: sequelize.model("userSubjects"),
            where: {},
            attributes: ['id', 'userId', 'subjectId'],
            required: false,
            include: [{
                model: sequelize.model("subjects"),
                where: {},
                attributes: ['id', 'subjectName'],
                required: false
            }]
        }],
        order: [
            ['createdAt', 'DESC'],
        ]
    }).then(function(users) {
        callback(users);
    });
}

user.adduser = function(user, success, error) {
    this.create(user).then(success).catch(error);
}

user.deleteUser = function(user, success, error) {
    this.destroy({ where: user }).then(success).catch(error);
}

user.isRegistered = function(email, success) {
    this.getuserByEmail(email, (user) => {
        if (user)
            success(true, null);
        else
            success(false, null);
    });
}

user.updateuser = function(updateData, filter, success, error) {
    this.update(updateData, {
        where: filter
    }).then(success).catch(error);
}

user.loaduser = function(filter, callback, error) {
    this.findAll({
        where: filter,
        attributes: selectuserFields,
        include: [{
            model: sequelize.model("userclass"),
            where: {},
            attributes: ['id', 'userId', 'classId'],
            required: false,
            include: [{
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
            }]
        }, {
            model: sequelize.model("userSubjects"),
            where: {},
            attributes: ['id', 'userId', 'subjectId'],
            required: false,
            include: [{
                model: sequelize.model("subjects"),
                where: {},
                attributes: ['id', 'subjectName'],
                required: false
            }]
        }, {
            model: sequelize.model("schools"),
            where: {},
            attributes: ['id', 'schoolName', 'city', 'address'],
            required: false
        }],
    }).then(callback).catch(error);
}

user.dashboard = function(callback, error) {
    totalAttribute = [
        [Sequelize.literal("(IFNULL((SELECT  count(*)  from users WHERE `users`.`userRole` = 2 and `users`.`status` = 'ACTIVE'), 0))"), `users`],
        [Sequelize.literal("(IFNULL((SELECT  count(*)  from business WHERE `business`.`status` = 'ACTIVE'), 0))"), `business`],
        [Sequelize.literal("(IFNULL((SELECT  count(*)  from dishes ds WHERE `ds`.`status` = 'ACTIVE'), 0))"), `dishes`],
        [Sequelize.literal("(IFNULL((SELECT  count(*)  from instanceDishes), 0))"), `instanceDishes`],
        [Sequelize.literal("(IFNULL((SELECT  count(*)  from orders), 0))"), `orders`],
        [Sequelize.literal("(IFNULL((SELECT  count(*)  from orders WHERE `orders`.`status` = 'pending'), 0))"), `pendingOrders`],
        [Sequelize.literal("(IFNULL((SELECT  count(*)  from orders WHERE `orders`.`status` = 'cancelled'), 0))"), `cancelledOrders`],
        [Sequelize.literal("(IFNULL((SELECT  count(*)  from orders WHERE `orders`.`status` = 'accepted'), 0))"), `acceptedOrders`],
        [Sequelize.literal("(IFNULL((SELECT  count(*)  from orders WHERE `orders`.`status` = 'rejected'), 0))"), `rejectedOrders`],
        [Sequelize.literal("(IFNULL((SELECT  count(*)  from orders WHERE `orders`.`status` = 'completed'), 0))"), `completedOrders`]

    ];
    this.findOne({
        where: {},
        attributes: totalAttribute,
    }).then(callback).catch(error);
}

user.getUsersForNotification = function(filter, success, error) {
    this.findAll({
        where: filter,
        attributes: ['id'],
    }).then(success).catch(error);
}

module.exports = user;