let jwt = require('../../helper/jwt');
let utils = require('../../helper/utils');
let parentUtil = {}

parentUtil.sendWelcomeEmail = (parentData) => {
    let welcomeContentPath = "./mail_content/welcome.html";
    utils.getHtmlContent(welcomeContentPath, (err, content) => {
        let subject = "Welcome to email";
        content = content.replace("{USERNAME}", utils.capitalizeFirstLetter(parentData.email));
        content = content.replace(new RegExp("{BASEPATH}", 'g'), process.env.BASE_URL);
        content = content.replace("{NAME}", utils.capitalizeFirstLetter(parentData.firstName));
        let _password = '';
        if (!utils.empty(parentData.password)) {
            _password = utils.dataDecrypt(parentData.password);
        }
        content = content.replace("{PASSWORD}", _password);
        content = content.replace("{SCHOOLNAME}", parentData.school.schoolName);
        utils.sendEmail(parentData.email, subject, content, () => {});
    });
};


parentUtil.sendForgotPasswordEmail = (parent, cb) => {
    let forgotPasswordContentPath = "./mail_content/forgot_password.html";
    utils.getHtmlContent(forgotPasswordContentPath, (err, content) => {
        let subject = "Forgot Password";
        let now = new Date();
        let now_utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        content = content.replace("{NAME}", utils.capitalizeFirstLetter(parent.firstName));
        let _password = '';
        if (!utils.empty(parent.password)) {
            _password = utils.dataDecrypt(parent.password);
        }
        content = content.replace("{parentNAME}", parent.email);
        content = content.replace("{PASSWORD}", _password);
        content = content.replace(new RegExp("{BASEPATH}", 'g'), process.env.BASE_URL);
        utils.sendEmail(parent.email, subject, content, cb);
    });
};

parentUtil.savestudentImage = (file, old_path, cb) => {
    if (!utils.empty(file) && !utils.empty(file.profilePic) && file.profilePic) {
        utils.uploadImageInServer(file.profilePic, config.STUDENT_IMAGE_PATH, old_path, cb);
    } else {
        cb(null, null);
    }
};


module.exports = parentUtil