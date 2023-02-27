let jwt = require('../../helper/jwt');
let utils = require('../../helper/utils');
let studentUtil = {}

studentUtil.sendWelcomeEmail = (studentData) => {
    let welcomeContentPath = "./mail_content/welcome.html";
    utils.getHtmlContent(welcomeContentPath, (err, content) => {
        let subject = "Welcome to email";
        content = content.replace("{studentNAME}", utils.capitalizeFirstLetter(studentData.email));
        content = content.replace(new RegExp("{BASEPATH}", 'g'), process.env.BASE_URL);
        let _password = '';
        if (!utils.empty(studentData.password)) {
            _password = utils.dataDecrypt(studentData.password);
        }
        content = content.replace("{PASSWORD}", _password);
        // content = content.replace("{VERIFY_LINK}", process.env.SITE_URL + "verify/" + utils.dataEncrypt(studentData.email));
        utils.sendEmail(studentData.email, subject, content, () => {});
    });
};


studentUtil.sendForgotPasswordEmail = (student, cb) => {
    let forgotPasswordContentPath = "./mail_content/forgot_password.html";
    utils.getHtmlContent(forgotPasswordContentPath, (err, content) => {
        let subject = "Forgot Password";
        let now = new Date();
        let now_utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        content = content.replace("{NAME}", utils.capitalizeFirstLetter(student.firstName));
        let _password = '';
        if (!utils.empty(student.password)) {
            _password = utils.dataDecrypt(student.password);
        }
        content = content.replace("{studentNAME}", student.email);
        content = content.replace("{PASSWORD}", _password);
        content = content.replace(new RegExp("{BASEPATH}", 'g'), process.env.BASE_URL);
        utils.sendEmail(student.email, subject, content, cb);
    });
};

studentUtil.savestudentImage = (file, old_path, cb) => {
    if (!utils.empty(file) && !utils.empty(file.profilePic) && file.profilePic) {
        utils.uploadImageInServer(file.profilePic, config.STUDENT_IMAGE_PATH, old_path, cb);
    } else {
        cb(null, null);
    }
};

module.exports = studentUtil