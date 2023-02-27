let jwt = require('../../helper/jwt');
let utils = require('../../helper/utils');
let homeWorkUtil = {}

homeWorkUtil.sendWelcomeEmail = (homeWorkData) => {
    let welcomeContentPath = "./mail_content/welcome.html";
    utils.getHtmlContent(welcomeContentPath, (err, content) => {
        let subject = "Welcome to email";
        content = content.replace("{homeWorkNAME}", utils.capitalizeFirstLetter(homeWorkData.email));
        content = content.replace(new RegExp("{BASEPATH}", 'g'), process.env.BASE_URL);
        let _password = '';
        if (!utils.empty(homeWorkData.password)) {
            _password = utils.dataDecrypt(homeWorkData.password);
        }
        content = content.replace("{PASSWORD}", _password);
        // content = content.replace("{VERIFY_LINK}", process.env.SITE_URL + "verify/" + utils.dataEncrypt(homeWorkData.email));
        utils.sendEmail(homeWorkData.email, subject, content, () => {});
    });
};


homeWorkUtil.sendForgotPasswordEmail = (homeWork, cb) => {
    let forgotPasswordContentPath = "./mail_content/forgot_password.html";
    utils.getHtmlContent(forgotPasswordContentPath, (err, content) => {
        let subject = "Forgot Password";
        let now = new Date();
        let now_utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        content = content.replace("{NAME}", utils.capitalizeFirstLetter(homeWork.firstName));
        let _password = '';
        if (!utils.empty(homeWork.password)) {
            _password = utils.dataDecrypt(homeWork.password);
        }
        content = content.replace("{homeWorkNAME}", homeWork.email);
        content = content.replace("{PASSWORD}", _password);
        content = content.replace(new RegExp("{BASEPATH}", 'g'), process.env.BASE_URL);
        utils.sendEmail(homeWork.email, subject, content, cb);
    });
};

homeWorkUtil.savehomeWorkImage = (file, old_path, cb) => {
    if (!utils.empty(file) && !utils.empty(file.document) && file.document) {
        utils.uploadImageInServer(file.document, config.HOMEWORK_IMAGE_PATH, old_path, cb);
    } else {
        cb(null, null);
    }
};

module.exports = homeWorkUtil