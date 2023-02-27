global.mysql = require('mysql');
global._ = require("lodash")
global.errorUtil = require('../helper/error');
global.config = require('../config/config');
require('../config/database');
require('../helper/cloudnary')
global.l10n = require('jm-ez-l10n');
l10n.setTranslationsFile('en', './language/translation.en.json');
let express = require('express');
let bodyParser = require('body-parser');
let fileUpload = require('express-fileupload')
let cors = require('cors');
let app = express();
app.use(cors());
app.set('port', process.env.PORT);
app.use(l10n.enableL10NExpress);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '1gb' }));
app.use(express.static('./apidoc'));
app.use('/images', express.static('./images'));
app.use('/uploads', express.static('./uploads'));

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Request-Headers", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content-Type, Accept,Access-Control-Allow-Headers,auth-token,x-l10n-locale");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

app.use(require('../route'));
app.use(fileUpload({useTempFiles:true}))
let db = require("./database");
db.sequelize.sync({ force: false }).then(() => {
   console.log('database Sync Successfully')
}).catch((err)=>{
    console.log(err)
});
module.exports = app;