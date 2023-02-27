let jwt = require('../../helper/jwt');
let utils = require('../../helper/utils');
let userUtil = {}

userUtil.userDetail = (data, selectData) => {
    let user = {};
    if (utils.empty(selectData)) {
        selectData = ["id", "firstName", "lastName", "mobileNo", "email"];
    }
    _(selectData).forEach((val) => {
        if (data[val] || data[val] === 0) {
            user[val] = data[val];
        }
    });
    return user;
};

userUtil.sendWelcomeEmail = (userData) => {
    let welcomeContentPath = "./mail_content/welcome.html";
    utils.getHtmlContent(welcomeContentPath, (err, content) => {
        let subject = "Welcome to email";
        content = content.replace("{USERNAME}", utils.capitalizeFirstLetter(userData.email));
        content = content.replace(new RegExp("{BASEPATH}", 'g'), process.env.BASE_URL);
        content = content.replace("{NAME}", utils.capitalizeFirstLetter(userData.firstName));
        let _password = '';
        if (!utils.empty(userData.password)) {
            _password = utils.dataDecrypt(userData.password);
        }
        content = content.replace("{PASSWORD}", _password);
        content = content.replace("{SCHOOLNAME}", userData.school.schoolName);
        // content = content.replace("{VERIFY_LINK}", process.env.SITE_URL + "verify/" + utils.dataEncrypt(userData.email));
        utils.sendEmail(userData.email, subject, content, () => {});
    });
};


userUtil.sendForgotPasswordEmail = (user, cb) => {
    let forgotPasswordContentPath = "./mail_content/forgot_password.html";
    utils.getHtmlContent(forgotPasswordContentPath, (err, content) => {
        let subject = "Forgot Password";
        let now = new Date();
        let now_utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        content = content.replace("{NAME}", utils.capitalizeFirstLetter(user.firstName));
        let _password = '';
        if (!utils.empty(user.password)) {
            _password = utils.dataDecrypt(user.password);
        }
        content = content.replace("{USERNAME}", user.email);
        content = content.replace("{PASSWORD}", _password);
        content = content.replace(new RegExp("{BASEPATH}", 'g'), process.env.BASE_URL);
        utils.sendEmail(user.email, subject, content, cb);
    });
};

userUtil.saveUserImage = (file, old_path, cb) => {
    if (!utils.empty(file) && !utils.empty(file.profilePic) && file.profilePic) {
        utils.uploadImageInServer(file.profilePic, config.USER_IMAGE_PATH, old_path, cb);
    } else {
        cb(null, null);
    }
};

module.exports = userUtil