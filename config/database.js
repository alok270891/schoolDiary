let Sequelize = require('sequelize');
let db = {};
let sequelize = new Sequelize(process.env.DATABASE, process.env.DBUSER, process.env.DBPASSWORD, {
    host: process.env.DBHOST,
    dialect: 'mysql',
    pool: {
        max: 100,
        min: 0,
        idle: 10000
    },
    logging: true,
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
});
sequelize.authenticate().then((sucess) => {
    console.log('Connection has been established successfully.');
}).catch((err) => {
    console.log('Unable to connect to the database:', err);
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;