//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const userCtr = require('./userController');
const userMiddleware = require('./userMiddleware');
let userRouter = express.Router();
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();


let loginMiddleware = [
    multipartMiddleware,
    userMiddleware.validateInput("login"),
    userCtr.login
];
userRouter.post('/login', loginMiddleware);


let adminLoginMiddleware = [
    multipartMiddleware,
    userMiddleware.validateInput("adminLogin"),
    userCtr.login
];
userRouter.post('/adminLogin', adminLoginMiddleware);



let adduserMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    userMiddleware.validateInput("register"),
    userMiddleware.emailExists,
    userMiddleware.mobileNOExists,
    userMiddleware.checkImage,
    userMiddleware.checkUserRole,
    userCtr.addUser
];
userRouter.post('/create', adduserMiddleware);

let exceladduserMiddleware = [
    multipartMiddleware,
    // auth.isAuthenticatedUser,
    // userMiddleware.validateInput("register"),
    userMiddleware.emailExists,
    userMiddleware.mobileNOExists,
    userMiddleware.checkImage,
    userMiddleware.checkUserRole,
    userCtr.exceladdUser
];
userRouter.post('/excelcreate', exceladduserMiddleware);

/**
 * @api {post} /user/update Update user
 * @apiName Update user profile
 * @apiGroup user
 * @apiUse TokenHeader
 * @apiParam {String} [fullName] user's full name.
 * @apiParam {String} [email] user's unique email address.
 * @apiParam {String} [mobileNo] user's mobile Number.
 * @apiParam {String} [profilePic] user's profilePic.
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Success response
 *     HTTP/1.1 200 OK
 *      {
 *           "data":[{
 *               "id": 5,
 *               "fullName": "vashram berani",
 *               "email": "vashramberani+3@gmail.com",
 *               "lastLoggedIn": "2018-02-11T09:59:13.000Z",
 *               "status": "ACTIVE",
 *               "profilePic": "http://localhost:6400/upload/user/11435525931656g080412_newlibrary05.jpg"
 *           }],
 *           "message": "User profile successfully updated",
 *           "status": true
 *       }
 * @apiError 400 Bad user Input
 * @apiUse ErrorAllRequired
 * @apiUse ServerError
 */

let updateusersMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    userMiddleware.emailExists,
    userMiddleware.mobileNOExists,
    userMiddleware.checkImage,
    userMiddleware.checkUserRole,
    userCtr.updateUser
];
userRouter.post('/update', updateusersMiddleware);

/**
 * @api {post} /user/profile Get user Profile
 * @apiName Get user Profile
 * @apiGroup user
 * @apiUse TokenHeader
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Success response
 *     HTTP/1.1 200 OK
 * 
 * @apiError 400 Bad user Input
 * @apiUse ErrorAllRequired
 * @apiUse ServerError
 */

let profileMiddleware = [auth.isAuthenticatedUser, userCtr.getuserProfile];
userRouter.post('/profile', profileMiddleware);

/**
 * @api {get} /user/userList/:pg? Get userList
 * @apiName Get user
 * @apiGroup user
 * @apiUse TokenHeader
 * @apiVersion 1.0.0
 * @apiParam {Number} roleId role id.
 * @apiParam {Number} [pg] page number.
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 * 
 * @apiUse ServerError
 */

let getusersMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    // userMiddleware.validateInput("userlist"), 
    userCtr.getUserList
];
userRouter.post('/userList', getusersMiddleware);

/**
 * @api {post} /customer/statusChange Change status of customer
 * @apiName Change status of customer
 * @apiGroup customer
 * @apiVersion 1.0.0
 * @apiUse TokenHeader
 * @apiParam {Number} userId user id.
 * @apiParam {Number} status status like ["ACTIVE", "INACTIVE"].
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 *    "Status has been changed."
 * @apiUse ServerError
 */

let statusChangeMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    userMiddleware.validateInput('statusChange'),
    userCtr.statusChange
];
userRouter.post('/statusChange', statusChangeMiddleware);


/**
 * @api {post} /user/installation installation
 * @apiName installation
 * @apiGroup user
 * @apiVersion 1.0.0
 * @apiParam {String} fullName user's full name.
 * @apiParam {String} email user's email.
 * @apiParam {String} fbid user's facebook id.  
 * @apiError 400 Bad User Input
 * @apiUse ErrorAllRequired
 * @apiErrorExample 400 Full name required
 *     HTTP/1.1 400 Bad Input
 *         {
 *            "data":[],
 *            "message": "Full name is required",
 *            "status": false
 *         }
 * @apiErrorExample 400 email required
 *     HTTP/1.1 400 Bad Input
 *         {
 *              "data":[],
 *              "message": "Please enter email",
 *              "status": false
 *          }
 * @apiErrorExample 400 fbid required
 *     HTTP/1.1 400 Bad Input
 *         {
 *              "data":[],
 *              "message": "fbid is required",
 *              "status": false
 *          }
 * @apiUse ServerError  
 */

let installationMiddleware = [
    multipartMiddleware,
    userCtr.installation
];
userRouter.post('/installation', installationMiddleware);


/**
 * @api {post} /user/notification push notification
 * @apiName notification
 * @apiGroup user
 * @apiVersion 1.0.0
 * @apiParam {String} deviceToken deviceToken.
 * @apiParam {String} message send message.
 * @apiError 400 Bad User Input
 * @apiUse ErrorAllRequired
 * @apiErrorExample 400 Full name required
 *     HTTP/1.1 400 Bad Input
 *         {
 *            "data":[],
 *            "message": "deviceToken is required",
 *            "status": false
 *         }
 * @apiUse ServerError  
 */

let notificationMiddleware = [
    multipartMiddleware,
    userCtr.notification
];
userRouter.post('/notification', notificationMiddleware);

let dashboardMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    userCtr.dashboard
];
userRouter.post('/dashboard', dashboardMiddleware);




let sendNotificationMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    userMiddleware.validateInput("notification"),
    // userMiddleware.checkUserid,
    userCtr.sendNotification
];
userRouter.post('/sendNotification', sendNotificationMiddleware);

let forgotPasswordMiddleware = [userMiddleware.validateInput("forgotPassword"), userCtr.forgotPassword];
userRouter.post('/forgot-password', forgotPasswordMiddleware);

let resetpasswordMiddleware = [
    auth.isAuthenticatedUser,
    userMiddleware.validateInput("resetpassword"),
    userCtr.resetPassword
];
userRouter.post('/resetpassword', resetpasswordMiddleware);

let userexportMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    userCtr.exportdata
];
userRouter.get('/exportdata', userexportMiddleware);

let download = [userCtr.download];
userRouter.get('/download', download)



module.exports = userRouter;