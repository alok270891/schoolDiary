var config = function() {};
config.SECRET = 'schooldiry@123#^5sd34sdf989dkhk21weqksdf{52}{2eghvasaxfj';
config.MAX_RECORDS = 10;
config.MAX_RECORDS_SPECIFIC_MODULE = 200;
config.USER_IMAGE_PATH = "uploads/user/";
config.STUDENT_IMAGE_PATH = "uploads/student/";
config.EVENT_IMAGE_PATH = "uploads/event/";
config.SCHOOL_IMAGE_PATH = "uploads/school/";
config.HOMEWORK_IMAGE_PATH = "uploads/homework/";
config.SYSTEM_IMAGE_PATH = "https://shielded-river-37979.herokuapp.com/";
config.FULL_IMAGE_SIZE = 500;
config.THUMB_IMAGE_SIZE = 50;
config.allowedImageFiles = ["jpg", "png", "jpeg", "JPG", "JPEG", "PNG"];
config.allowedPdfFiles = ["pdf", "PDF"];
config.allowedVideoFiles = ["mp4"];
config.MAX_FILE_UPLOAD_SIZE = 5242880; //5mb
// config.MAX_FILE_UPLOAD_SIZE = 1048576;
config.MAX_DIGIT = 10;
config.AWS_CONFIG = {
    "accessKeyId": process.env.AWS_ACCESS_KEY,
    "secretAccessKey": process.env.AWS_SECRET_KEY,
    "region": process.env.AWS_REGION
};
config.NOTIFICATION_OPTIONS = {
    token: {
        key: process.env.APPLE_KEY, // Path to the key p8 file
        keyId: process.env.keyId, // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
        teamId: process.env.teamId, // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
    },
    production: false // Set to true if sending a notification to a production iOS app
}
config.NO_REPLY = 'donotreply@school.com';
config.timeSlote = 30;
module.exports = config;